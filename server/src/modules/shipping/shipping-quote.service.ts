import { Prisma, PrismaClient, ShippingQuoteLabel } from '@prisma/client';
import { groupOrderItemsByProducer, RequestedOrderItem } from '../orders/group-order-items';
import { DomainValidationError } from '../shared/domain-error';
import { payloadHash } from '../shared/idempotency';
import { selectSmallestPackaging } from './packaging';
import { calculateTotalPromiseDays } from './promise-date';
import { selectCustomerFacingQuotes } from './quote-selection';
import { ShippingProviderContract } from './providers/shipping-provider';

export interface CreateShippingQuotesInput {
  destinationPostalCode: string;
  items: RequestedOrderItem[];
}

export function shippingQuoteItemsHash(
  destinationPostalCode: string,
  producerId: string,
  items: Array<{ productId: string; quantity: number; metadata?: unknown }>,
) {
  return payloadHash({
    destinationPostalCode: normalizePostalCode(destinationPostalCode),
    producerId,
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      metadata: item.metadata,
    })),
  });
}

function normalizePostalCode(value: string) {
  const normalized = value.replace(/\D/g, '');
  if (normalized.length !== 8) {
    throw new DomainValidationError('destinationPostalCode must have 8 digits.');
  }

  return normalized;
}

function shippingWeightFromMetadata(
  productType: string,
  defaultWeightGrams: number,
  metadata: unknown,
) {
  if (productType !== 'COFFEE' || !metadata || typeof metadata !== 'object') {
    return defaultWeightGrams;
  }

  const selectedWeight = Number((metadata as Record<string, unknown>).weight);
  if (![250, 500, 1000].includes(selectedWeight)) {
    return defaultWeightGrams;
  }

  return selectedWeight + 50;
}

export async function createShippingQuotes(
  prisma: PrismaClient,
  provider: ShippingProviderContract,
  tenantId: string,
  input: CreateShippingQuotesInput,
) {
  const destinationPostalCode = normalizePostalCode(input.destinationPostalCode);
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new DomainValidationError('At least one item is required for a shipping quote.');
  }

  const productIds = input.items
    .map((item) => item.productId)
    .filter((productId): productId is string => typeof productId === 'string' && productId.length > 0);
  const products = await prisma.product.findMany({
    where: {
      tenantId,
      id: { in: productIds },
      status: 'ACTIVE',
    },
    include: {
      shippingProfile: true,
      producer: {
        include: { logisticsProfile: true },
      },
    },
  });
  const productById = new Map(products.map((product) => [product.id, product]));
  const groups = groupOrderItemsByProducer(input.items, productById);
  const packagingTemplates = await prisma.packagingTemplate.findMany({
    where: { tenantId, active: true },
  });

  if (packagingTemplates.length === 0) {
    throw new DomainValidationError('No active packaging templates are configured.');
  }

  const expiresAt = new Date(Date.now() + Number(process.env.SHIPPING_QUOTE_TTL_SECONDS ?? 900) * 1000);
  const marginDays = Number(process.env.SHIPPING_PROMISE_MARGIN_DAYS ?? 1);
  const responseGroups = [];

  for (const group of groups) {
    const producer = productById.get(group.items[0].productId)?.producer;
    const logistics = producer?.logisticsProfile;
    if (!producer || !logistics) {
      throw new DomainValidationError(`Producer logistics profile is missing: ${group.producerId}`);
    }

    const shippingItems = group.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product?.shippingProfile) {
        throw new DomainValidationError(`Product shipping profile is missing: ${item.productId}`);
      }

      return {
        quantity: item.quantity,
        unitWeightGrams: shippingWeightFromMetadata(
          item.productType,
          product.shippingProfile.unitWeightGrams,
          item.metadata,
        ),
        lengthCm: product.shippingProfile.lengthCm,
        widthCm: product.shippingProfile.widthCm,
        heightCm: product.shippingProfile.heightCm,
      };
    });
    const selectedPackage = selectSmallestPackaging(shippingItems, packagingTemplates);
    const providerQuotes = await provider.quote({
      origin: {
        name: producer.name,
        postalCode: logistics.postalCode,
        state: logistics.state,
        city: logistics.city,
        district: logistics.district,
        street: logistics.street,
        number: logistics.number,
        complement: logistics.complement ?? undefined,
        country: logistics.country,
      },
      destination: {
        name: 'Comprador',
        postalCode: destinationPostalCode,
        state: '',
        city: '',
        district: '',
        street: '',
        number: '',
        country: 'BR',
      },
      packages: [{
        lengthCm: selectedPackage.lengthCm,
        widthCm: selectedPackage.widthCm,
        heightCm: selectedPackage.heightCm,
        weightGrams: selectedPackage.weightGrams,
      }],
      allowedServiceIds: logistics.acceptedServiceIds.map(String),
    });
    const displayQuotes = selectCustomerFacingQuotes(providerQuotes);
    const itemsHash = shippingQuoteItemsHash(destinationPostalCode, group.producerId, group.items);

    const persistedQuotes = [];
    for (const quote of displayQuotes) {
      const totalPromiseDays = calculateTotalPromiseDays({
        carrierDeliveryDays: quote.deliveryDays,
        preparationDays: logistics.preparationDays,
        postingDays: logistics.postingDays,
        cutoffTime: logistics.cutoffTime,
        marginDays,
      });
      const persisted = await prisma.shippingQuote.create({
        data: {
          tenantId,
          producerId: group.producerId,
          serviceId: quote.serviceId,
          carrier: quote.carrier,
          serviceName: quote.serviceName,
          label: quote.label as ShippingQuoteLabel,
          priceCents: quote.priceCents,
          deliveryDays: quote.deliveryDays,
          totalPromiseDays,
          destinationPostalCode,
          itemsHash,
          packages: [selectedPackage] as unknown as Prisma.InputJsonValue,
          rawResponse: quote.rawResponse as Prisma.InputJsonValue,
          expiresAt,
        },
      });
      persistedQuotes.push({
        quoteId: persisted.id,
        label: persisted.label,
        carrier: persisted.carrier,
        serviceName: persisted.serviceName,
        priceCents: persisted.priceCents,
        deliveryDays: persisted.deliveryDays,
        totalPromiseDays: persisted.totalPromiseDays,
        expiresAt: persisted.expiresAt,
      });
    }

    responseGroups.push({
      producerId: group.producerId,
      producerName: producer.name,
      package: selectedPackage,
      options: persistedQuotes,
    });
  }

  return {
    provider: provider.name,
    destinationPostalCode,
    expiresAt,
    groups: responseGroups,
  };
}
