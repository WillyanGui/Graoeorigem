import { PaymentState } from './payment-status';

const eventStatuses: Record<string, PaymentState | null> = {
  PAYMENT_CREATED: 'PENDING',
  PAYMENT_UPDATED: 'PENDING',
  PAYMENT_OVERDUE: 'PENDING',
  PAYMENT_AWAITING_RISK_ANALYSIS: 'RISK_ANALYSIS',
  PAYMENT_APPROVED_BY_RISK_ANALYSIS: 'RISK_ANALYSIS',
  PAYMENT_REPROVED_BY_RISK_ANALYSIS: 'FAILED',
  PAYMENT_AUTHORIZED: 'AUTHORIZED',
  PAYMENT_CONFIRMED: 'CONFIRMED',
  PAYMENT_RECEIVED: 'RECEIVED',
  PAYMENT_CREDIT_CARD_CAPTURE_REFUSED: 'FAILED',
  PAYMENT_REFUND_IN_PROGRESS: 'REFUND_IN_PROGRESS',
  PAYMENT_REFUNDED: 'REFUNDED',
  PAYMENT_PARTIALLY_REFUNDED: 'MANUAL_REVIEW',
  PAYMENT_DELETED: 'CANCELED',
  PAYMENT_BANK_SLIP_CANCELLED: 'CANCELED',
  PAYMENT_CHARGEBACK_REQUESTED: 'CHARGEBACK',
  PAYMENT_CHARGEBACK_DISPUTE: 'CHARGEBACK',
};

export function paymentStateFromProviderStatus(status: string): PaymentState {
  const normalized = status.toUpperCase();
  if (normalized === 'RECEIVED' || normalized === 'RECEIVED_IN_CASH') return 'RECEIVED';
  if (normalized === 'CONFIRMED') return 'CONFIRMED';
  if (normalized === 'AUTHORIZED') return 'AUTHORIZED';
  if (normalized === 'PENDING' || normalized === 'OVERDUE') return 'PENDING';
  if (normalized === 'REFUND_IN_PROGRESS') return 'REFUND_IN_PROGRESS';
  if (normalized === 'REFUNDED') return 'REFUNDED';
  if (normalized === 'CHARGEBACK_REQUESTED' || normalized === 'CHARGEBACK_DISPUTE') return 'CHARGEBACK';
  return 'PENDING';
}

export function paymentStateFromAsaasEvent(eventType: string) {
  return eventStatuses[eventType] ?? null;
}

export function isPaymentReversalState(status: PaymentState) {
  return status === 'REFUND_IN_PROGRESS'
    || status === 'REFUNDED'
    || status === 'CHARGEBACK';
}
