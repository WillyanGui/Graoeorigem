import { PaymentBillingType, PaymentProvider, PaymentStatus, Prisma, PrismaClient } from '@prisma/client';
import { DomainValidationError } from '../shared/domain-error';
import { payloadHash } from '../shared/idempotency';
import {
  isPaymentReversalState,
  paymentStateFromAsaasEvent,
  paymentStateFromProviderStatus,
} from './asaas-events';
import { canPrepareOrder, canTransitionPayment, PaymentState } from './payment-status';
import { PaymentProviderContract } from './providers/payment-provider';

function dueDate(days: number) {
  const date = new Date(Date.now() + days * 86_400_000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: process.env.BUSINESS_TIME_ZONE ?? 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function providerInvoiceUrl(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;
  const value = (payload as Record<string, unknown>).invoiceUrl;
  return typeof value === 'string' ? value : null;
}

function sanitizedProviderPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizedProviderPayload);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
    key,
    /(access.?token|api.?key|authorization|credit.?card|card.?number|cvv|encoded.?image|pix.?payload)/i.test(key)
      ? '[REDACTED]'
      : sanitizedProviderPayload(entry),
  ]));
}

async function paymentResponse(
  provider: PaymentProviderContract,
  payment: {
    id: string;
    providerPaymentId: string | null;
    status: PaymentStatus;
    billingType: PaymentBillingType | null;
    amountCents: number;
    metadata: unknown;
  },
  providerPayload?: unknown,
) {
  if (!payment.providerPaymentId || !payment.billingType) {
    throw new DomainValidationError('Payment provider data is incomplete.');
  }

  const storedInvoiceUrl = providerInvoiceUrl(payment.metadata);
  const invoiceUrl = providerInvoiceUrl(providerPayload) ?? storedInvoiceUrl;
  const pixQrCode = payment.billingType === 'PIX'
    ? await provider.getPixQrCode(payment.providerPaymentId)
    : null;

  return {
    paymentId: payment.id,
    provider: provider.name,
    providerPaymentId: payment.providerPaymentId,
    status: payment.status,
    billingType: payment.billingType,
    amountCents: payment.amountCents,
    invoiceUrl,
    pixQrCode: pixQrCode
      ? {
          imageDataUrl: `data:${pixQrCode.mimeType};base64,${pixQrCode.encodedImage}`,
          payload: pixQrCode.payload,
          expirationDate: pixQrCode.expirationDate,
        }
      : null,
    sandboxMock: provider.name === 'mock',
  };
}

export async function createOrderPayment(
  prisma: PrismaClient,
  provider: PaymentProviderContract,
  tenantId: string,
  orderId: string,
  orderCode: string,
  billingType: PaymentBillingType,
) {
  if (billingType !== 'PIX' && billingType !== 'CREDIT_CARD') {
    throw new DomainValidationError('Only PIX and CREDIT_CARD are supported.');
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, tenantId, code: orderCode },
    include: { customer: true, payments: { orderBy: { createdAt: 'desc' } } },
  });
  if (!order) throw Object.assign(new Error('Order not found.'), { statusCode: 404 });
  if (order.status !== 'PAYMENT_PENDING' && order.status !== 'PAID') {
    throw Object.assign(new Error(`Order cannot be paid in status ${order.status}.`), { statusCode: 409 });
  }
  if (!order.customer) throw new DomainValidationError('Order customer is required for payment.');

  const document = order.customer.document?.replace(/\D/g, '') ?? '';
  if (document.length !== 11 && document.length !== 14) {
    throw new DomainValidationError('Customer CPF/CNPJ must have 11 or 14 digits.');
  }

  const existingPayment = order.payments.find((payment) => payment.providerPaymentId);
  if (existingPayment) {
    if (existingPayment.billingType !== billingType) {
      throw Object.assign(new Error('An active charge already exists with another payment method.'), { statusCode: 409 });
    }
    if (existingPayment.provider !== provider.databaseProvider) {
      throw Object.assign(new Error('The existing charge belongs to another configured provider.'), { statusCode: 409 });
    }
    const providerPayload = await provider.getPayment(existingPayment.providerPaymentId!);
    return paymentResponse(provider, existingPayment, providerPayload);
  }

  let customerProfile = await prisma.paymentCustomerProfile.findUnique({
    where: {
      customerId_provider: {
        customerId: order.customer.id,
        provider: provider.databaseProvider as PaymentProvider,
      },
    },
  });
  if (!customerProfile) {
    const createdCustomer = await provider.createOrReuseCustomer({
      name: order.customer.name,
      document,
      email: order.customer.email ?? undefined,
      phone: order.customer.phone ?? undefined,
      externalReference: order.customer.id,
    });
    customerProfile = await prisma.paymentCustomerProfile.upsert({
      where: {
        customerId_provider: {
          customerId: order.customer.id,
          provider: provider.databaseProvider as PaymentProvider,
        },
      },
      create: {
        tenantId,
        customerId: order.customer.id,
        provider: provider.databaseProvider as PaymentProvider,
        providerCustomerId: createdCustomer.providerCustomerId,
      },
      update: {},
    });
  }

  const externalReference = order.code;
  const providerPayment = await provider.findPaymentByExternalReference(externalReference)
    ?? await provider.createPayment({
      customerProviderId: customerProfile.providerCustomerId,
      orderId: order.id,
      billingType,
      amountCents: order.totalCents,
      dueDate: dueDate(Number(process.env.ASAAS_PAYMENT_DUE_DAYS ?? 1)),
      description: `Pedido ${order.code} - Grao e Origem`,
      externalReference,
    });
  const internalStatus = paymentStateFromProviderStatus(providerPayment.status) as PaymentStatus;
  const pendingPayment = order.payments.find((payment) => !payment.providerPaymentId);
  const payment = pendingPayment
    ? await prisma.payment.update({
        where: { id: pendingPayment.id },
        data: {
          provider: provider.databaseProvider as PaymentProvider,
          providerPaymentId: providerPayment.providerPaymentId,
          billingType,
          status: internalStatus,
          metadata: {
            providerStatus: providerPayment.status,
            invoiceUrl: providerPayment.invoiceUrl ?? null,
            externalReference,
            sandboxMock: provider.name === 'mock',
          },
        },
      })
    : await prisma.payment.create({
        data: {
          tenantId,
          orderId: order.id,
          provider: provider.databaseProvider as PaymentProvider,
          providerPaymentId: providerPayment.providerPaymentId,
          billingType,
          status: internalStatus,
          amountCents: order.totalCents,
          metadata: {
            providerStatus: providerPayment.status,
            invoiceUrl: providerPayment.invoiceUrl ?? null,
            externalReference,
            sandboxMock: provider.name === 'mock',
          },
        },
      });

  return paymentResponse(provider, payment, providerPayment.rawResponse);
}

interface AsaasWebhookPayload {
  id?: unknown;
  event?: unknown;
  payment?: {
    id?: unknown;
    status?: unknown;
    value?: unknown;
    netValue?: unknown;
  };
}

export async function processAsaasWebhook(
  prisma: PrismaClient,
  provider: PaymentProviderContract,
  headers: Record<string, string | string[] | undefined>,
  payload: AsaasWebhookPayload,
) {
  if (!provider.validateWebhook(headers)) {
    throw Object.assign(new Error('Invalid Asaas webhook token.'), { statusCode: 401 });
  }

  const eventId = typeof payload.id === 'string' ? payload.id : '';
  const eventType = typeof payload.event === 'string' ? payload.event : '';
  const providerPaymentId = typeof payload.payment?.id === 'string' ? payload.payment.id : '';
  if (!eventId || !eventType || !providerPaymentId) {
    throw new DomainValidationError('Asaas webhook id, event and payment.id are required.');
  }

  const duplicate = await prisma.paymentWebhookEvent.findUnique({
    where: { provider_eventId: { provider: 'ASAAS', eventId } },
  });
  if (duplicate) return { received: true, duplicate: true, processed: Boolean(duplicate.processedAt) };

  const payment = await prisma.payment.findFirst({
    where: { providerPaymentId },
    include: { order: true },
  });
  const eventHash = payloadHash(payload);
  const auditPayload = sanitizedProviderPayload(payload) as Prisma.InputJsonValue;
  if (!payment || !payment.order) {
    await prisma.paymentWebhookEvent.create({
      data: {
        provider: 'ASAAS',
        eventId,
        eventType,
        providerPaymentId,
        tokenValid: true,
        payloadHash: eventHash,
        payload: auditPayload,
        processedAt: new Date(),
        processingError: 'Payment not found for provider event.',
      },
    });
    return { received: true, duplicate: false, processed: false, matched: false };
  }

  const mappedStatus = paymentStateFromAsaasEvent(eventType);
  const currentStatus = payment.status as PaymentState;
  const providerValueCents = Math.round(Number(payload.payment?.value ?? payment.amountCents / 100) * 100);
  const amountMismatch = providerValueCents !== payment.amountCents;
  const targetStatus: PaymentState | null = amountMismatch && mappedStatus && canPrepareOrder(payment.billingType ?? 'PIX', mappedStatus)
    ? 'MANUAL_REVIEW'
    : mappedStatus;
  const transitionValid = !targetStatus || canTransitionPayment(currentStatus, targetStatus);
  const processingError = amountMismatch
    ? `Provider amount mismatch: expected ${payment.amountCents}, received ${providerValueCents}.`
    : !transitionValid
      ? `Invalid payment transition: ${currentStatus} -> ${targetStatus}.`
      : null;

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.paymentWebhookEvent.create({
        data: {
          tenantId: payment.tenantId,
          paymentId: payment.id,
          provider: 'ASAAS',
          eventId,
          eventType,
          providerPaymentId,
          tokenValid: true,
          payloadHash: eventHash,
          payload: auditPayload,
          processedAt: new Date(),
          processingError,
        },
      });

      if (!targetStatus || !transitionValid) return;
      const netValueCents = Number.isFinite(Number(payload.payment?.netValue))
        ? Math.round(Number(payload.payment?.netValue) * 100)
        : null;
      await transaction.payment.update({
        where: { id: payment.id },
        data: {
          status: targetStatus as PaymentStatus,
          ...(targetStatus === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
          ...(targetStatus === 'RECEIVED' ? { receivedAt: new Date() } : {}),
          ...(netValueCents !== null
            ? { netAmountCents: netValueCents, feeAmountCents: Math.max(0, payment.amountCents - netValueCents) }
            : {}),
        },
      });

      if (payment.billingType && canPrepareOrder(payment.billingType, targetStatus)) {
        await transaction.order.updateMany({
          where: { id: payment.orderId!, status: 'PAYMENT_PENDING' },
          data: { status: 'PAID' },
        });
        await transaction.sellerOrder.updateMany({
          where: { orderId: payment.orderId!, status: { in: ['AWAITING_PAYMENT', 'SUSPENDED'] } },
          data: { status: 'PAID' },
        });
        await transaction.sellerPayable.updateMany({
          where: { sellerOrder: { orderId: payment.orderId! }, status: 'BLOCKED' },
          data: { status: 'PENDING' },
        });
        const grossReference = `payment:${payment.id}:gross`;
        const existingGross = await transaction.ledgerEntry.findFirst({
          where: { paymentId: payment.id, reference: grossReference },
        });
        if (!existingGross) {
          await transaction.ledgerEntry.create({
            data: {
              tenantId: payment.tenantId,
              orderId: payment.orderId!,
              paymentId: payment.id,
              type: 'CUSTOMER_PAYMENT_GROSS',
              creditCents: payment.amountCents,
              reference: grossReference,
              metadata: { eventId, eventType },
            },
          });
        }
      }

      if (targetStatus === 'MANUAL_REVIEW') {
        await transaction.sellerOrder.updateMany({
          where: { orderId: payment.orderId!, status: { notIn: ['DELIVERED', 'CANCELED'] } },
          data: { status: 'SUSPENDED' },
        });
        await transaction.sellerPayable.updateMany({
          where: { sellerOrder: { orderId: payment.orderId! }, status: { notIn: ['PAID', 'CANCELED'] } },
          data: { status: 'BLOCKED' },
        });
      }

      if (isPaymentReversalState(targetStatus)) {
        await transaction.order.updateMany({
          where: { id: payment.orderId!, status: { notIn: ['SHIPPED', 'DELIVERED'] } },
          data: { status: 'CANCELED' },
        });
        await transaction.sellerOrder.updateMany({
          where: { orderId: payment.orderId!, status: { notIn: ['DELIVERED', 'CANCELED'] } },
          data: { status: 'SUSPENDED' },
        });
        await transaction.sellerPayable.updateMany({
          where: { sellerOrder: { orderId: payment.orderId! }, status: { notIn: ['PAID', 'CANCELED'] } },
          data: { status: 'BLOCKED' },
        });
        const ledgerType = targetStatus === 'CHARGEBACK' ? 'CHARGEBACK' : 'REFUND';
        const reversalReference = `payment:${payment.id}:${ledgerType.toLowerCase()}`;
        const existingReversal = await transaction.ledgerEntry.findFirst({
          where: { paymentId: payment.id, reference: reversalReference },
        });
        if (!existingReversal) {
          await transaction.ledgerEntry.create({
            data: {
              tenantId: payment.tenantId,
              orderId: payment.orderId!,
              paymentId: payment.id,
              type: ledgerType,
              debitCents: payment.amountCents,
              reference: reversalReference,
              metadata: { eventId, eventType },
            },
          });
        }
      }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { received: true, duplicate: true, processed: true };
    }
    throw error;
  }

  return { received: true, duplicate: false, processed: !processingError, matched: true, status: targetStatus };
}
