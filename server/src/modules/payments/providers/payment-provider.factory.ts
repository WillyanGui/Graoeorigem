import { DomainValidationError } from '../../shared/domain-error';
import { AsaasPaymentProvider } from './asaas-payment.provider';
import { MockPaymentProvider } from './mock-payment.provider';

export function createPaymentProvider() {
  const provider = (process.env.PAYMENT_PROVIDER ?? 'mock').toLowerCase();
  if (provider === 'mock') {
    return new MockPaymentProvider();
  }

  if (provider !== 'asaas') {
    throw new DomainValidationError(`Unsupported payment provider: ${provider}`);
  }

  const apiKey = process.env.ASAAS_API_KEY ?? '';
  const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN ?? '';
  if (!apiKey || !webhookToken || webhookToken.length < 32) {
    throw new DomainValidationError('ASAAS_API_KEY and a 32-character ASAAS_WEBHOOK_TOKEN are required.');
  }

  return new AsaasPaymentProvider(
    process.env.ASAAS_BASE_URL ?? 'https://api-sandbox.asaas.com/v3',
    apiKey,
    webhookToken,
  );
}
