import { InvalidStateTransitionError } from '../shared/domain-error';

export type PaymentState =
  | 'PENDING'
  | 'RISK_ANALYSIS'
  | 'MANUAL_REVIEW'
  | 'AUTHORIZED'
  | 'CONFIRMED'
  | 'RECEIVED'
  | 'PAID'
  | 'FAILED'
  | 'REFUND_IN_PROGRESS'
  | 'REFUNDED'
  | 'CHARGEBACK'
  | 'CANCELED';

const transitions: Record<PaymentState, PaymentState[]> = {
  PENDING: ['RISK_ANALYSIS', 'MANUAL_REVIEW', 'AUTHORIZED', 'CONFIRMED', 'RECEIVED', 'PAID', 'FAILED', 'CANCELED'],
  RISK_ANALYSIS: ['MANUAL_REVIEW', 'AUTHORIZED', 'CONFIRMED', 'RECEIVED', 'FAILED', 'CANCELED'],
  MANUAL_REVIEW: ['CONFIRMED', 'RECEIVED', 'FAILED', 'REFUND_IN_PROGRESS', 'REFUNDED', 'CHARGEBACK', 'CANCELED'],
  AUTHORIZED: ['CONFIRMED', 'RECEIVED', 'FAILED', 'CANCELED'],
  CONFIRMED: ['RECEIVED', 'REFUND_IN_PROGRESS', 'CHARGEBACK', 'CANCELED'],
  RECEIVED: ['REFUND_IN_PROGRESS', 'CHARGEBACK'],
  PAID: ['REFUND_IN_PROGRESS', 'CHARGEBACK'],
  FAILED: [],
  REFUND_IN_PROGRESS: ['REFUNDED'],
  REFUNDED: [],
  CHARGEBACK: [],
  CANCELED: [],
};

export function canTransitionPayment(from: PaymentState, to: PaymentState) {
  return from === to || transitions[from].includes(to);
}

export function assertPaymentTransition(from: PaymentState, to: PaymentState) {
  if (!canTransitionPayment(from, to)) {
    throw new InvalidStateTransitionError('payment', from, to);
  }
}

export function canPrepareOrder(billingType: 'PIX' | 'CREDIT_CARD', status: PaymentState) {
  return billingType === 'PIX'
    ? status === 'RECEIVED' || status === 'PAID'
    : status === 'CONFIRMED' || status === 'RECEIVED' || status === 'PAID';
}
