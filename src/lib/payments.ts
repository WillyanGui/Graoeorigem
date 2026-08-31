const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';
const tenantSlug = 'grao-origem';

export type CheckoutPaymentMethod = 'PIX' | 'CREDIT_CARD';

export interface CreatedPayment {
  paymentId: string;
  provider: 'mock' | 'asaas';
  providerPaymentId: string;
  status: string;
  billingType: CheckoutPaymentMethod;
  amountCents: number;
  invoiceUrl: string | null;
  pixQrCode: {
    imageDataUrl: string;
    payload: string;
    expirationDate: string;
  } | null;
  sandboxMock: boolean;
}

export async function createOrderPayment(orderId: string, orderCode: string, billingType: CheckoutPaymentMethod) {
  const response = await fetch(`${apiUrl}/api/orders/${orderId}/payment?tenant=${tenantSlug}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderCode, billingType }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? 'Não foi possível gerar a cobrança.');
  }
  return payload as CreatedPayment;
}
