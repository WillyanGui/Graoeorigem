import assert from 'node:assert/strict';
import test from 'node:test';
import { groupOrderItemsByProducer } from './orders/group-order-items';
import { calculateSellerPayable } from './shared/money';
import { idempotencyKey, payloadHash } from './shared/idempotency';
import { selectSmallestPackaging } from './shipping/packaging';
import { assertSellerOrderTransition, isPayoutEligibleState } from './shipping/seller-order-status';
import { canPrepareOrder } from './payments/payment-status';
import { MockShippingProvider } from './shipping/providers/mock-shipping.provider';
import { calculateOperationalDays, calculateTotalPromiseDays } from './shipping/promise-date';
import { selectCustomerFacingQuotes } from './shipping/quote-selection';
import { MockPaymentProvider } from './payments/providers/mock-payment.provider';
import { validateWebhookToken } from './payments/providers/webhook-token';
import { paymentStateFromAsaasEvent } from './payments/asaas-events';

test('groups order items by producer and calculates server totals', () => {
  const products = new Map([
    ['coffee-a', { id: 'coffee-a', producerId: 'producer-a', name: 'Cafe A', type: 'COFFEE', priceCents: 2500 }],
    ['coffee-b', { id: 'coffee-b', producerId: 'producer-b', name: 'Cafe B', type: 'COFFEE', priceCents: 3100 }],
  ]);

  const groups = groupOrderItemsByProducer(
    [
      { productId: 'coffee-a', quantity: 2 },
      { productId: 'coffee-b', quantity: 1 },
    ],
    products,
  );

  assert.equal(groups.length, 2);
  assert.equal(groups.find((group) => group.producerId === 'producer-a')?.subtotalCents, 5000);
  assert.equal(groups.find((group) => group.producerId === 'producer-b')?.subtotalCents, 3100);
});

test('rejects products without a fulfillment producer', () => {
  const products = new Map([
    ['orphan', { id: 'orphan', producerId: null, name: 'Orphan', type: 'KIT', priceCents: 1000 }],
  ]);

  assert.throws(
    () => groupOrderItemsByProducer([{ productId: 'orphan', quantity: 1 }], products),
    /no fulfillment producer/,
  );
});

test('calculates seller payable in cents without including shipping', () => {
  assert.deepEqual(
    calculateSellerPayable({ productSubtotalCents: 15_000, commissionBasisPoints: 1500, adjustmentsCents: -500 }),
    {
      productSubtotalCents: 15_000,
      commissionCents: 2250,
      adjustmentsCents: -500,
      payableValueCents: 12_250,
    },
  );
});

test('selects the smallest compatible packaging template', () => {
  const selected = selectSmallestPackaging(
    [{ quantity: 2, unitWeightGrams: 300, lengthCm: 16, widthCm: 11, heightCm: 4 }],
    [
      { id: 'p', code: 'CX-P', lengthCm: 20, widthCm: 15, heightCm: 10, emptyWeightGrams: 180, maxWeightGrams: 1000, active: true },
      { id: 'm', code: 'CX-M', lengthCm: 30, widthCm: 22, heightCm: 15, emptyWeightGrams: 280, maxWeightGrams: 3000, active: true },
    ],
  );

  assert.equal(selected.templateCode, 'CX-P');
  assert.equal(selected.weightGrams, 780);
});

test('rejects an invalid seller order transition and protects payout eligibility', () => {
  assert.doesNotThrow(() => assertSellerOrderTransition('AWAITING_POSTING', 'POSTED'));
  assert.throws(() => assertSellerOrderTransition('READY_FOR_LABEL', 'POSTED'), /Invalid seller order state transition/);
  assert.equal(isPayoutEligibleState('AWAITING_POSTING'), false);
  assert.equal(isPayoutEligibleState('POSTED'), true);
});

test('distinguishes preparation rules for Pix and card', () => {
  assert.equal(canPrepareOrder('PIX', 'CONFIRMED'), false);
  assert.equal(canPrepareOrder('PIX', 'RECEIVED'), true);
  assert.equal(canPrepareOrder('CREDIT_CARD', 'CONFIRMED'), true);
});

test('produces stable idempotency hashes regardless of object key order', () => {
  assert.equal(payloadHash({ b: 2, a: 1 }), payloadHash({ a: 1, b: 2 }));
  assert.match(idempotencyKey('asaas-payment', { orderId: 'order-1' }), /^asaas-payment:[a-f0-9]{64}$/);
});

test('calculates preparation, posting schedule and carrier promise', () => {
  const mondayMorningInSaoPaulo = new Date('2026-08-24T13:00:00.000Z');

  assert.equal(
    calculateOperationalDays({
      preparationDays: 0,
      postingDays: [2, 5],
      cutoffTime: '12:00',
      now: mondayMorningInSaoPaulo,
    }),
    1,
  );
  assert.equal(
    calculateTotalPromiseDays({
      carrierDeliveryDays: 4,
      preparationDays: 0,
      postingDays: [2, 5],
      cutoffTime: '12:00',
      marginDays: 1,
      now: mondayMorningInSaoPaulo,
    }),
    6,
  );
});

test('selects only economic and fastest customer-facing services', () => {
  const selected = selectCustomerFacingQuotes([
    { serviceId: 'a', carrier: 'A', serviceName: 'A', priceCents: 1200, deliveryDays: 7, rawResponse: {} },
    { serviceId: 'b', carrier: 'B', serviceName: 'B', priceCents: 1800, deliveryDays: 3, rawResponse: {} },
    { serviceId: 'c', carrier: 'C', serviceName: 'C', priceCents: 1600, deliveryDays: 5, rawResponse: {} },
  ]);

  assert.deepEqual(selected.map((quote) => [quote.serviceId, quote.label]), [
    ['a', 'ECONOMIC'],
    ['b', 'FAST'],
  ]);
});

test('mock shipping quotes are deterministic and contain no external calls', async () => {
  const provider = new MockShippingProvider();
  const request = {
    origin: { name: 'Origem', postalCode: '35300000', state: 'MG', city: 'Caratinga', district: 'Centro', street: 'Rua', number: '1', country: 'BR' },
    destination: { name: 'Destino', postalCode: '01001000', state: 'SP', city: 'Sao Paulo', district: 'Centro', street: 'Rua', number: '1', country: 'BR' },
    packages: [{ lengthCm: 20, widthCm: 15, heightCm: 10, weightGrams: 780 }],
  };

  assert.deepEqual(await provider.quote(request), await provider.quote(request));
  assert.equal((await provider.quote(request)).length, 2);
});

test('maps Asaas events conservatively before releasing fulfillment', () => {
  assert.equal(paymentStateFromAsaasEvent('PAYMENT_CONFIRMED'), 'CONFIRMED');
  assert.equal(paymentStateFromAsaasEvent('PAYMENT_RECEIVED'), 'RECEIVED');
  assert.equal(paymentStateFromAsaasEvent('PAYMENT_APPROVED_BY_RISK_ANALYSIS'), 'RISK_ANALYSIS');
  assert.equal(paymentStateFromAsaasEvent('PAYMENT_PARTIALLY_REFUNDED'), 'MANUAL_REVIEW');
  assert.equal(paymentStateFromAsaasEvent('UNKNOWN_FUTURE_EVENT'), null);
});

test('validates the Asaas webhook token using an exact comparison', () => {
  const expected = 'sandbox-webhook-token-at-least-32-characters';
  assert.equal(validateWebhookToken(expected, { 'asaas-access-token': expected }), true);
  assert.equal(validateWebhookToken(expected, { 'asaas-access-token': `${expected}-wrong` }), false);
  assert.equal(validateWebhookToken(expected, {}), false);
});

test('mock payment creation and Pix QR Code are deterministic', async () => {
  const provider = new MockPaymentProvider();
  const input = {
    customerProviderId: 'mock-customer',
    orderId: 'order-1',
    billingType: 'PIX' as const,
    amountCents: 13_270,
    dueDate: '2026-08-25',
    description: 'Pedido GO-1',
    externalReference: 'GO-1',
  };
  const first = await provider.createPayment(input);
  const second = await provider.createPayment(input);
  const qrCode = await provider.getPixQrCode(first.providerPaymentId);

  assert.equal(first.providerPaymentId, second.providerPaymentId);
  assert.match(qrCode.payload, /^PIX-SANDBOX-MOCK:/);
  assert.equal(qrCode.mimeType, 'image/svg+xml');
});
