ALTER TYPE "PaymentProvider" ADD VALUE IF NOT EXISTS 'MOCK';

CREATE TABLE "PaymentCustomerProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerCustomerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentCustomerProfile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentCustomerProfile_customerId_provider_key"
ON "PaymentCustomerProfile"("customerId", "provider");

CREATE UNIQUE INDEX "PaymentCustomerProfile_provider_providerCustomerId_key"
ON "PaymentCustomerProfile"("provider", "providerCustomerId");

CREATE INDEX "PaymentCustomerProfile_tenantId_provider_idx"
ON "PaymentCustomerProfile"("tenantId", "provider");

ALTER TABLE "PaymentCustomerProfile"
ADD CONSTRAINT "PaymentCustomerProfile_tenantId_fkey"
FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PaymentCustomerProfile"
ADD CONSTRAINT "PaymentCustomerProfile_customerId_fkey"
FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
