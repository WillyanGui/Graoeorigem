export class DomainValidationError extends Error {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

export class InvalidStateTransitionError extends Error {
  readonly statusCode = 409;

  constructor(entity: string, from: string, to: string) {
    super(`Invalid ${entity} state transition: ${from} -> ${to}`);
    this.name = 'InvalidStateTransitionError';
  }
}
