import crypto from 'node:crypto';

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entryValue]) => [key, stableValue(entryValue)]),
    );
  }

  return value;
}

export function stableJson(value: unknown) {
  return JSON.stringify(stableValue(value));
}

export function payloadHash(value: unknown) {
  return crypto.createHash('sha256').update(stableJson(value)).digest('hex');
}

export function idempotencyKey(namespace: string, value: unknown) {
  return `${namespace}:${payloadHash(value)}`;
}
