import {
  PaymentCreationInput,
  PaymentCreationResult,
  PaymentCustomerInput,
  PaymentProviderContract,
  PixQrCodeResult,
} from './payment-provider';
import { validateWebhookToken } from './webhook-token';

interface AsaasPaymentResponse {
  id: string;
  status: string;
  invoiceUrl?: string;
  [key: string]: unknown;
}

interface AsaasListResponse<T> {
  data?: T[];
}

export class AsaasPaymentProvider implements PaymentProviderContract {
  readonly name = 'asaas' as const;
  readonly databaseProvider = 'ASAAS' as const;

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly webhookToken: string,
  ) {}

  private async request<T>(path: string, init: RequestInit = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.ASAAS_TIMEOUT_MS ?? 12_000));
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          accept: 'application/json',
          access_token: this.apiKey,
          ...(init.body ? { 'content-type': 'application/json' } : {}),
          ...init.headers,
        },
      });
      const payload = await response.json().catch(() => null) as Record<string, unknown> | null;
      if (!response.ok) {
        const errors = Array.isArray(payload?.errors) ? payload.errors : [];
        const description = errors
          .map((error) => (error && typeof error === 'object' ? String((error as Record<string, unknown>).description ?? '') : ''))
          .filter(Boolean)
          .join('; ');
        throw Object.assign(new Error(description || `Asaas request failed with HTTP ${response.status}.`), {
          statusCode: response.status >= 500 ? 502 : 400,
        });
      }

      return payload as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  async createOrReuseCustomer(customer: PaymentCustomerInput) {
    const response = await this.request<{ id: string }>('/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: customer.name,
        cpfCnpj: customer.document.replace(/\D/g, ''),
        email: customer.email,
        mobilePhone: customer.phone?.replace(/\D/g, ''),
        externalReference: customer.externalReference,
        notificationDisabled: true,
      }),
    });
    return { providerCustomerId: response.id };
  }

  private normalizePayment(payment: AsaasPaymentResponse): PaymentCreationResult {
    return {
      providerPaymentId: payment.id,
      status: payment.status,
      invoiceUrl: payment.invoiceUrl ?? null,
      rawResponse: payment,
    };
  }

  async createPayment(input: PaymentCreationInput) {
    const payment = await this.request<AsaasPaymentResponse>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        customer: input.customerProviderId,
        billingType: input.billingType,
        value: input.amountCents / 100,
        dueDate: input.dueDate,
        description: input.description,
        externalReference: input.externalReference,
      }),
    });
    return this.normalizePayment(payment);
  }

  async findPaymentByExternalReference(externalReference: string) {
    const result = await this.request<AsaasListResponse<AsaasPaymentResponse>>(
      `/payments?externalReference=${encodeURIComponent(externalReference)}&limit=1`,
    );
    return result.data?.[0] ? this.normalizePayment(result.data[0]) : null;
  }

  async getPixQrCode(providerPaymentId: string) {
    const qrCode = await this.request<{ encodedImage: string; payload: string; expirationDate: string }>(
      `/payments/${encodeURIComponent(providerPaymentId)}/pixQrCode`,
    );
    return { ...qrCode, mimeType: 'image/png' } satisfies PixQrCodeResult;
  }

  async getPayment(providerPaymentId: string) {
    return this.request<AsaasPaymentResponse>(`/payments/${encodeURIComponent(providerPaymentId)}`);
  }

  async refundPayment(providerPaymentId: string, amountCents?: number) {
    return this.request<unknown>(`/payments/${encodeURIComponent(providerPaymentId)}/refund`, {
      method: 'POST',
      body: JSON.stringify(amountCents ? { value: amountCents / 100 } : {}),
    });
  }

  validateWebhook(headers: Record<string, string | string[] | undefined>) {
    return validateWebhookToken(this.webhookToken, headers);
  }
}
