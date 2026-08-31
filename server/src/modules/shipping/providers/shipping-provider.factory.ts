import { DomainValidationError } from '../../shared/domain-error';
import { MelhorEnvioShippingProvider } from './melhor-envio.provider';
import { MockShippingProvider } from './mock-shipping.provider';
import { ShippingProviderContract } from './shipping-provider';

export function createShippingProvider(environment = process.env): ShippingProviderContract {
  const providerName = environment.SHIPPING_PROVIDER?.toLowerCase() ?? 'mock';

  if (providerName === 'mock') {
    return new MockShippingProvider();
  }

  if (providerName !== 'melhor_envio') {
    throw new DomainValidationError(`Unsupported shipping provider: ${providerName}`);
  }

  const accessToken = environment.MELHOR_ENVIO_ACCESS_TOKEN;
  const appSecret = environment.MELHOR_ENVIO_APP_SECRET;
  const userAgent = environment.MELHOR_ENVIO_USER_AGENT;

  if (!accessToken || !appSecret || !userAgent) {
    throw new DomainValidationError(
      'MELHOR_ENVIO_ACCESS_TOKEN, MELHOR_ENVIO_APP_SECRET and MELHOR_ENVIO_USER_AGENT are required.',
    );
  }

  return new MelhorEnvioShippingProvider({
    baseUrl: environment.MELHOR_ENVIO_BASE_URL ?? 'https://sandbox.melhorenvio.com.br',
    accessToken,
    appSecret,
    userAgent,
  });
}
