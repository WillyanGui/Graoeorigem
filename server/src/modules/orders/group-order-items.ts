import { DomainValidationError } from '../shared/domain-error';
import { sumCents } from '../shared/money';

export interface RequestedOrderItem {
  productId?: unknown;
  quantity?: unknown;
  metadata?: unknown;
}

export interface PurchasableProduct {
  id: string;
  producerId: string | null;
  name: string;
  type: string;
  priceCents: number;
}

export interface PreparedOrderItem {
  productId: string;
  producerId: string;
  name: string;
  productType: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  metadata?: unknown;
}

export interface SellerOrderGroup {
  producerId: string;
  subtotalCents: number;
  items: PreparedOrderItem[];
}

export function groupOrderItemsByProducer(
  requestedItems: RequestedOrderItem[],
  productById: Map<string, PurchasableProduct>,
) {
  if (requestedItems.length === 0) {
    throw new DomainValidationError('Order must include at least one item.');
  }

  const groups = new Map<string, PreparedOrderItem[]>();

  for (const requestedItem of requestedItems) {
    if (typeof requestedItem.productId !== 'string' || !requestedItem.productId) {
      throw new DomainValidationError('Every order item must have a productId.');
    }

    const product = productById.get(requestedItem.productId);
    if (!product) {
      throw new DomainValidationError(`Product not found: ${requestedItem.productId}`);
    }

    if (!product.producerId) {
      throw new DomainValidationError(`Product has no fulfillment producer: ${product.id}`);
    }

    const quantity = Number(requestedItem.quantity ?? 1);
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw new DomainValidationError(`Invalid quantity for product: ${product.id}`);
    }

    const item: PreparedOrderItem = {
      productId: product.id,
      producerId: product.producerId,
      name: product.name,
      productType: product.type,
      quantity,
      unitPriceCents: product.priceCents,
      totalCents: product.priceCents * quantity,
      metadata: requestedItem.metadata,
    };

    const producerItems = groups.get(product.producerId) ?? [];
    producerItems.push(item);
    groups.set(product.producerId, producerItems);
  }

  return [...groups.entries()].map(([producerId, items]): SellerOrderGroup => ({
    producerId,
    subtotalCents: sumCents(items.map((item) => item.totalCents)),
    items,
  }));
}
