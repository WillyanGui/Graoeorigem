import { CartItem } from '../types';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
const tenantSlug = 'grao-origem';

export interface ShippingOption {
  quoteId: string;
  label: 'ECONOMIC' | 'FAST' | 'RECOMMENDED';
  carrier: string;
  serviceName: string;
  priceCents: number;
  deliveryDays: number;
  totalPromiseDays: number;
  expiresAt: string;
}

export interface ShippingQuoteGroup {
  producerId: string;
  producerName: string;
  options: ShippingOption[];
}

export interface ShippingQuoteResponse {
  provider: 'mock' | 'melhor_envio';
  destinationPostalCode: string;
  expiresAt: string;
  groups: ShippingQuoteGroup[];
}

export function cartProductId(item: CartItem) {
  return item.productType === 'cafe'
    ? item.cafeDetails?.productId
    : item.equipamentoDetails?.productId;
}

export function cartToApiItems(cart: CartItem[]) {
  return cart.map((item) => {
    const productId = cartProductId(item);
    if (!productId) {
      throw new Error('Atualize o catálogo com a API ativa antes de continuar.');
    }

    return {
      productId,
      quantity: item.quantity,
      metadata: item.productType === 'cafe'
        ? {
            weight: item.cafeDetails?.weight,
            type: item.cafeDetails?.type,
            roast: item.cafeDetails?.roast,
          }
        : undefined,
    };
  });
}

export async function requestShippingQuotes(postalCode: string, cart: CartItem[]) {
  const items = cartToApiItems(cart);

  const response = await fetch(`${apiUrl}/api/shipping/quotes?tenant=${tenantSlug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      destinationPostalCode: postalCode,
      items,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? 'Não foi possível calcular o frete.');
  }

  return payload as ShippingQuoteResponse;
}
