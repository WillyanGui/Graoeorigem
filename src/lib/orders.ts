import { CartItem } from '../types';
import { cartToApiItems } from './shipping';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
const tenantSlug = 'grao-origem';

export interface CreateOrderInput {
  cart: CartItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  shippingAddress: {
    postalCode: string;
    street: string;
    number: string;
    district: string;
    city: string;
    state: string;
    complement?: string;
    country: 'BR';
  };
  shippingQuoteSelections: Array<{
    producerId: string;
    quoteId: string;
  }>;
}

export interface CreatedOrder {
  id: string;
  code: string;
  status: 'PAYMENT_PENDING';
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;
  sellerOrders: Array<{
    id: string;
    code: string;
    producer: { id: string; name: string };
  }>;
}

export async function createOrder(input: CreateOrderInput) {
  const response = await fetch(`${apiUrl}/api/orders?tenant=${tenantSlug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: cartToApiItems(input.cart),
      customer: input.customer,
      shippingAddress: input.shippingAddress,
      shippingQuoteSelections: input.shippingQuoteSelections,
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? 'Não foi possível criar o pedido.');
  }

  return payload as CreatedOrder;
}
