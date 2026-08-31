import { DomainValidationError } from '../shared/domain-error';
import { ShippingQuoteResult } from './providers/shipping-provider';

export interface DisplayShippingQuote extends ShippingQuoteResult {
  label: 'ECONOMIC' | 'FAST';
}

export function selectCustomerFacingQuotes(quotes: ShippingQuoteResult[]): DisplayShippingQuote[] {
  const validQuotes = quotes.filter(
    (quote) =>
      Number.isSafeInteger(quote.priceCents) &&
      quote.priceCents >= 0 &&
      Number.isSafeInteger(quote.deliveryDays) &&
      quote.deliveryDays >= 0,
  );

  if (validQuotes.length === 0) {
    throw new DomainValidationError('Shipping provider returned no valid services.');
  }

  const economic = [...validQuotes].sort(
    (left, right) => left.priceCents - right.priceCents || left.deliveryDays - right.deliveryDays,
  )[0];
  const fastest = [...validQuotes].sort(
    (left, right) => left.deliveryDays - right.deliveryDays || left.priceCents - right.priceCents,
  )[0];

  const selected: DisplayShippingQuote[] = [{ ...economic, label: 'ECONOMIC' }];
  if (fastest.serviceId !== economic.serviceId) {
    selected.push({ ...fastest, label: 'FAST' });
  }

  return selected;
}
