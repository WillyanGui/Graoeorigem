export interface ShippingAddress {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  companyDocument?: string;
  stateRegister?: string;
  postalCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement?: string;
  country: string;
}

export interface ShippingPackage {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightGrams: number;
}

export interface ShippingQuoteRequest {
  origin: ShippingAddress;
  destination: ShippingAddress;
  packages: ShippingPackage[];
  allowedServiceIds?: string[];
}

export interface ShippingQuoteResult {
  serviceId: string;
  carrier: string;
  serviceName: string;
  priceCents: number;
  deliveryDays: number;
  rawResponse: unknown;
}

export interface CreateShipmentRequest {
  quote: ShippingQuoteResult;
  sender: ShippingAddress;
  recipient: ShippingAddress;
  packages: ShippingPackage[];
  products: Array<{ name: string; quantity: number; unitValueCents: number }>;
  invoiceKey?: string;
  dceKey?: string;
  externalReference: string;
}

export interface ShippingProviderContract {
  readonly name: 'mock' | 'melhor_envio';
  quote(request: ShippingQuoteRequest): Promise<ShippingQuoteResult[]>;
  createShipment(request: CreateShipmentRequest): Promise<{ providerOrderIds: string[] }>;
  purchaseLabels(providerOrderIds: string[]): Promise<void>;
  generateLabel(providerOrderId: string): Promise<void>;
  getLabel(providerOrderId: string): Promise<{ labelUrl: string }>;
  cancelShipment(providerOrderId: string): Promise<void>;
  trackShipment(providerOrderId: string): Promise<unknown>;
  validateWebhook(headers: Record<string, string | string[] | undefined>, rawBody: Buffer): boolean;
}
