import { payloadHash } from '../../shared/idempotency';
import {
  PaymentCreationInput,
  PaymentCreationResult,
  PaymentCustomerInput,
  PaymentProviderContract,
  PixQrCodeResult,
} from './payment-provider';
import { validateWebhookToken } from './webhook-token';

export class MockPaymentProvider implements PaymentProviderContract {
  readonly name = 'mock' as const;
  readonly databaseProvider = 'MOCK' as const;
  private readonly payments = new Map<string, PaymentCreationResult>();

  async createOrReuseCustomer(customer: PaymentCustomerInput) {
    return {
      providerCustomerId: `mock_cus_${payloadHash({ document: customer.document, externalReference: customer.externalReference }).slice(0, 20)}`,
    };
  }

  async createPayment(input: PaymentCreationInput) {
    const providerPaymentId = `mock_pay_${payloadHash({ orderId: input.orderId, billingType: input.billingType }).slice(0, 20)}`;
    const existing = this.payments.get(providerPaymentId);
    if (existing) {
      return existing;
    }

    const result: PaymentCreationResult = {
      providerPaymentId,
      status: 'PENDING',
      invoiceUrl: input.billingType === 'CREDIT_CARD' ? null : undefined,
      rawResponse: {
        id: providerPaymentId,
        status: 'PENDING',
        billingType: input.billingType,
        value: input.amountCents / 100,
        externalReference: input.externalReference,
        sandboxMock: true,
      },
    };
    this.payments.set(providerPaymentId, result);
    return result;
  }

  async findPaymentByExternalReference(externalReference: string) {
    return [...this.payments.values()].find((payment) => {
      const raw = payment.rawResponse as Record<string, unknown>;
      return raw.externalReference === externalReference;
    }) ?? null;
  }

  async getPixQrCode(providerPaymentId: string): Promise<PixQrCodeResult> {
    const payload = `PIX-SANDBOX-MOCK:${providerPaymentId}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><rect width="240" height="240" fill="white"/><rect x="20" y="20" width="60" height="60" fill="#24130e"/><rect x="160" y="20" width="60" height="60" fill="#24130e"/><rect x="20" y="160" width="60" height="60" fill="#24130e"/><path d="M100 100h20v20h-20zm40 0h20v40h-20zm-40 40h40v20h-40zm20 40h20v40h-20zm40-20h60v20h-60zm20 40h40v20h-40z" fill="#24130e"/><text x="120" y="132" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#c5a059">MOCK</text></svg>`;
    return {
      encodedImage: Buffer.from(svg).toString('base64'),
      mimeType: 'image/svg+xml',
      payload,
      expirationDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }

  async getPayment(providerPaymentId: string) {
    return this.payments.get(providerPaymentId)?.rawResponse ?? null;
  }

  async refundPayment(providerPaymentId: string, amountCents?: number) {
    return { id: providerPaymentId, status: 'REFUNDED', value: amountCents ? amountCents / 100 : undefined, sandboxMock: true };
  }

  validateWebhook(headers: Record<string, string | string[] | undefined>) {
    return validateWebhookToken(process.env.ASAAS_WEBHOOK_TOKEN ?? '', headers);
  }
}
