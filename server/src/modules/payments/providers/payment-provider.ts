export interface PaymentCustomerInput {
  name: string;
  document: string;
  email?: string;
  phone?: string;
  externalReference: string;
}

export interface PaymentCreationInput {
  customerProviderId: string;
  orderId: string;
  billingType: 'PIX' | 'CREDIT_CARD';
  amountCents: number;
  dueDate: string;
  description: string;
  externalReference: string;
}

export interface PaymentCreationResult {
  providerPaymentId: string;
  status: string;
  invoiceUrl?: string | null;
  rawResponse: unknown;
}

export interface PixQrCodeResult {
  encodedImage: string;
  mimeType: string;
  payload: string;
  expirationDate: string;
}

export interface PaymentProviderContract {
  readonly name: 'mock' | 'asaas';
  readonly databaseProvider: 'MOCK' | 'ASAAS';
  createOrReuseCustomer(customer: PaymentCustomerInput): Promise<{ providerCustomerId: string }>;
  createPayment(input: PaymentCreationInput): Promise<PaymentCreationResult>;
  findPaymentByExternalReference(externalReference: string): Promise<PaymentCreationResult | null>;
  getPixQrCode(providerPaymentId: string): Promise<PixQrCodeResult>;
  getPayment(providerPaymentId: string): Promise<unknown>;
  refundPayment(providerPaymentId: string, amountCents?: number): Promise<unknown>;
  validateWebhook(headers: Record<string, string | string[] | undefined>): boolean;
}

export interface PayoutInput {
  sellerPayableId: string;
  amountCents: number;
  externalReference: string;
}

export interface PayoutProviderContract {
  getAvailableBalanceCents(): Promise<number | null>;
  transferPix(input: PayoutInput): Promise<{ providerTransferId?: string; status: string }>;
  getTransfer(providerTransferId: string): Promise<unknown>;
}
