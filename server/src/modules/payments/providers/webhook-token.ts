import crypto from 'node:crypto';

export function validateWebhookToken(
  expectedToken: string,
  headers: Record<string, string | string[] | undefined>,
) {
  const received = headers['asaas-access-token'];
  if (!expectedToken || typeof received !== 'string') {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedToken);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
