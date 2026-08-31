import { DomainValidationError } from './domain-error';

export function assertCents(value: number, fieldName = 'amount') {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new DomainValidationError(`${fieldName} must be a non-negative integer in cents.`);
  }

  return value;
}

export function sumCents(values: number[]) {
  return values.reduce((total, value) => total + assertCents(value), 0);
}

export function calculateCommissionCents(subtotalCents: number, commissionBasisPoints: number) {
  assertCents(subtotalCents, 'subtotalCents');

  if (!Number.isInteger(commissionBasisPoints) || commissionBasisPoints < 0 || commissionBasisPoints > 10_000) {
    throw new DomainValidationError('commissionBasisPoints must be between 0 and 10000.');
  }

  return Math.round((subtotalCents * commissionBasisPoints) / 10_000);
}

export function calculateSellerPayable(input: {
  productSubtotalCents: number;
  commissionBasisPoints: number;
  adjustmentsCents?: number;
}) {
  const productSubtotalCents = assertCents(input.productSubtotalCents, 'productSubtotalCents');
  const commissionCents = calculateCommissionCents(productSubtotalCents, input.commissionBasisPoints);
  const adjustmentsCents = input.adjustmentsCents ?? 0;

  if (!Number.isSafeInteger(adjustmentsCents)) {
    throw new DomainValidationError('adjustmentsCents must be an integer in cents.');
  }

  return {
    productSubtotalCents,
    commissionCents,
    adjustmentsCents,
    payableValueCents: Math.max(0, productSubtotalCents - commissionCents + adjustmentsCents),
  };
}
