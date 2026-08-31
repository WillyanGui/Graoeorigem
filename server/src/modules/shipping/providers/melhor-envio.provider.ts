import crypto from 'node:crypto';
import { DomainValidationError } from '../../shared/domain-error';
import {
  CreateShipmentRequest,
  ShippingProviderContract,
  ShippingQuoteRequest,
  ShippingQuoteResult,
} from './shipping-provider';

interface MelhorEnvioConfig {
  baseUrl: string;
  accessToken: string;
  appSecret: string;
  userAgent: string;
}

interface MelhorEnvioQuoteResponse {
  id?: number | string;
  name?: string;
  price?: string | number;
  custom_price?: string | number;
  delivery_time?: number;
  custom_delivery_time?: number;
  company?: { name?: string };
  error?: string;
}

function toCents(value: string | number | undefined) {
  const amount = typeof value === 'string' ? Number(value.replace(',', '.')) : Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new DomainValidationError('Melhor Envio returned an invalid quote price.');
  }

  return Math.round(amount * 100);
}

export class MelhorEnvioShippingProvider implements ShippingProviderContract {
  readonly name = 'melhor_envio' as const;

  constructor(private readonly config: MelhorEnvioConfig) {}

  async quote(request: ShippingQuoteRequest): Promise<ShippingQuoteResult[]> {
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.accessToken}`,
        'User-Agent': this.config.userAgent,
      },
      body: JSON.stringify({
        from: { postal_code: request.origin.postalCode.replace(/\D/g, '') },
        to: { postal_code: request.destination.postalCode.replace(/\D/g, '') },
        volumes: request.packages.map((shippingPackage) => ({
          length: shippingPackage.lengthCm,
          width: shippingPackage.widthCm,
          height: shippingPackage.heightCm,
          weight: shippingPackage.weightGrams / 1000,
        })),
        ...(request.allowedServiceIds?.length ? { services: request.allowedServiceIds.join(',') } : {}),
      }),
      signal: AbortSignal.timeout(12_000),
    });

    const payload = (await response.json()) as MelhorEnvioQuoteResponse[] | { message?: string };
    if (!response.ok || !Array.isArray(payload)) {
      const message = !Array.isArray(payload) && payload.message ? payload.message : `HTTP ${response.status}`;
      throw new Error(`Melhor Envio quote failed: ${message}`);
    }

    return payload
      .filter((quote) => !quote.error && quote.id != null)
      .map((quote) => ({
        serviceId: String(quote.id),
        carrier: quote.company?.name ?? 'Transportadora',
        serviceName: quote.name ?? `Servico ${quote.id}`,
        priceCents: toCents(quote.custom_price ?? quote.price),
        deliveryDays: Number(quote.custom_delivery_time ?? quote.delivery_time ?? 0),
        rawResponse: quote,
      }));
  }

  async createShipment(_request: CreateShipmentRequest): Promise<{ providerOrderIds: string[] }> {
    throw new Error('Melhor Envio shipment creation is planned for Cut 4.');
  }

  async purchaseLabels(_providerOrderIds: string[]): Promise<void> {
    throw new Error('Melhor Envio label purchase is planned for Cut 4.');
  }

  async generateLabel(_providerOrderId: string): Promise<void> {
    throw new Error('Melhor Envio label generation is planned for Cut 4.');
  }

  async getLabel(_providerOrderId: string): Promise<{ labelUrl: string }> {
    throw new Error('Melhor Envio label retrieval is planned for Cut 4.');
  }

  async cancelShipment(_providerOrderId: string): Promise<void> {
    throw new Error('Melhor Envio cancellation is planned for Cut 4.');
  }

  async trackShipment(_providerOrderId: string): Promise<unknown> {
    throw new Error('Melhor Envio tracking is planned for Cut 4.');
  }

  validateWebhook(headers: Record<string, string | string[] | undefined>, rawBody: Buffer) {
    const header = headers['x-me-signature'];
    const signature = Array.isArray(header) ? header[0] : header;
    if (!signature || !this.config.appSecret) {
      return false;
    }

    const expected = crypto.createHmac('sha256', this.config.appSecret).update(rawBody).digest('base64');
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    return signatureBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  }
}
