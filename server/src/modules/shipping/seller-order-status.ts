import { InvalidStateTransitionError } from '../shared/domain-error';

export type SellerOrderState =
  | 'AWAITING_PAYMENT'
  | 'PAID'
  | 'PREPARING'
  | 'READY_FOR_LABEL'
  | 'LABEL_CREATED'
  | 'LABEL_PAID'
  | 'LABEL_GENERATED'
  | 'AWAITING_POSTING'
  | 'POSTED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'UNDELIVERED'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'LABEL_EXPIRED'
  | 'CANCELED';

const transitions: Record<SellerOrderState, SellerOrderState[]> = {
  AWAITING_PAYMENT: ['PAID', 'CANCELED'],
  PAID: ['PREPARING', 'CANCELED'],
  PREPARING: ['READY_FOR_LABEL', 'CANCELED'],
  READY_FOR_LABEL: ['LABEL_CREATED', 'CANCELED'],
  LABEL_CREATED: ['LABEL_PAID', 'LABEL_EXPIRED', 'CANCELED'],
  LABEL_PAID: ['LABEL_GENERATED', 'LABEL_EXPIRED', 'CANCELED'],
  LABEL_GENERATED: ['AWAITING_POSTING', 'LABEL_EXPIRED', 'CANCELED'],
  AWAITING_POSTING: ['POSTED', 'LABEL_EXPIRED', 'CANCELED'],
  POSTED: ['IN_TRANSIT', 'DELIVERED', 'UNDELIVERED', 'PAUSED', 'SUSPENDED'],
  IN_TRANSIT: ['DELIVERED', 'UNDELIVERED', 'PAUSED', 'SUSPENDED'],
  DELIVERED: [],
  UNDELIVERED: ['IN_TRANSIT', 'CANCELED'],
  PAUSED: ['IN_TRANSIT', 'SUSPENDED', 'CANCELED'],
  SUSPENDED: ['IN_TRANSIT', 'CANCELED'],
  LABEL_EXPIRED: ['READY_FOR_LABEL', 'CANCELED'],
  CANCELED: [],
};

export function canTransitionSellerOrder(from: SellerOrderState, to: SellerOrderState) {
  return from === to || transitions[from].includes(to);
}

export function assertSellerOrderTransition(from: SellerOrderState, to: SellerOrderState) {
  if (!canTransitionSellerOrder(from, to)) {
    throw new InvalidStateTransitionError('seller order', from, to);
  }
}

export function isPayoutEligibleState(status: SellerOrderState) {
  return ['POSTED', 'IN_TRANSIT', 'DELIVERED'].includes(status);
}
