import { DomainValidationError } from '../../shared/domain-error';
import {
  CreateShipmentRequest,
  ShippingProviderContract,
  ShippingQuoteRequest,
  ShippingQuoteResult,
} from './shipping-provider';

function numericPostalCode(value: string) {
  const normalized = value.replace(/\D/g, '');
  if (normalized.length !== 8) {
    throw new DomainValidationError('Postal code must have 8 digits.');
  }

  return Number(normalized);
}

export class MockShippingProvider implements ShippingProviderContract {
  readonly name = 'mock' as const;

  async quote(request: ShippingQuoteRequest): Promise<ShippingQuoteResult[]> {
    const origin = numericPostalCode(request.origin.postalCode);
    const destination = numericPostalCode(request.destination.postalCode);
    const weightGrams = request.packages.reduce((total, shippingPackage) => total + shippingPackage.weightGrams, 0);
    const distanceBand = Math.min(16, Math.floor(Math.abs(origin - destination) / 500_000));
    const weightBand = Math.max(1, Math.ceil(weightGrams / 500));
    const economicPriceCents = 900 + distanceBand * 85 + weightBand * 240;
    const economicDays = Math.min(12, 4 + Math.ceil(distanceBand / 2));

    return [
      {
        serviceId: 'sandbox-economic',
        carrier: 'Sandbox Logistica',
        serviceName: 'Economico',
        priceCents: economicPriceCents,
        deliveryDays: economicDays,
        rawResponse: { mode: 'mock', distanceBand, weightBand },
      },
      {
        serviceId: 'sandbox-fast',
        carrier: 'Sandbox Logistica',
        serviceName: 'Rapido',
        priceCents: economicPriceCents + 900,
        deliveryDays: Math.max(2, economicDays - 3),
        rawResponse: { mode: 'mock', distanceBand, weightBand },
      },
    ];
  }

  async createShipment(_request: CreateShipmentRequest): Promise<{ providerOrderIds: string[] }> {
    throw new Error('Shipment creation is not available in the quote-only mock provider.');
  }

  async purchaseLabels(_providerOrderIds: string[]): Promise<void> {
    throw new Error('Label purchase is not implemented in Cut 2.');
  }

  async generateLabel(_providerOrderId: string): Promise<void> {
    throw new Error('Label generation is not implemented in Cut 2.');
  }

  async getLabel(_providerOrderId: string): Promise<{ labelUrl: string }> {
    throw new Error('Label retrieval is not implemented in Cut 2.');
  }

  async cancelShipment(_providerOrderId: string): Promise<void> {
    throw new Error('Shipment cancellation is not implemented in Cut 2.');
  }

  async trackShipment(_providerOrderId: string): Promise<unknown> {
    throw new Error('Tracking is not implemented in Cut 2.');
  }

  validateWebhook(_headers: Record<string, string | string[] | undefined>, _rawBody: Buffer) {
    return false;
  }
}
