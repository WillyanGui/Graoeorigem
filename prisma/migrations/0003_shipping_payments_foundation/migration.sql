-- CreateEnum
CREATE TYPE "PaymentBillingType" AS ENUM ('PIX', 'CREDIT_CARD');

-- CreateEnum
CREATE TYPE "ShippingProvider" AS ENUM ('MELHOR_ENVIO');

-- CreateEnum
CREATE TYPE "ShippingQuoteLabel" AS ENUM ('ECONOMIC', 'FAST', 'RECOMMENDED');

-- CreateEnum
CREATE TYPE "SellerOrderStatus" AS ENUM ('AWAITING_PAYMENT', 'PAID', 'PREPARING', 'READY_FOR_LABEL', 'LABEL_CREATED', 'LABEL_PAID', 'LABEL_GENERATED', 'AWAITING_POSTING', 'POSTED', 'IN_TRANSIT', 'DELIVERED', 'UNDELIVERED', 'PAUSED', 'SUSPENDED', 'LABEL_EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('QUOTED', 'LABEL_CREATED', 'LABEL_PAID', 'LABEL_GENERATED', 'AWAITING_POSTING', 'POSTED', 'IN_TRANSIT', 'DELIVERED', 'UNDELIVERED', 'PAUSED', 'SUSPENDED', 'EXPIRED', 'CANCELED');

-- CreateEnum
CREATE TYPE "SellerPayableStatus" AS ENUM ('PENDING', 'ELIGIBLE', 'BLOCKED', 'PAID', 'CANCELED');

-- CreateEnum
CREATE TYPE "PayoutProvider" AS ENUM ('MANUAL', 'ASAAS');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('CUSTOMER_PAYMENT_GROSS', 'PAYMENT_PROCESSOR_FEE', 'PRODUCT_GROSS', 'SELLER_PAYABLE', 'PLATFORM_COMMISSION', 'SHIPPING_COLLECTED', 'SHIPPING_PURCHASED', 'SHIPPING_VARIANCE', 'SELLER_PAYOUT', 'REFUND', 'CHARGEBACK', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('MELHOR_ENVIO', 'ASAAS');

-- Extend existing enums without removing legacy values.
ALTER TYPE "PaymentStatus" ADD VALUE 'RISK_ANALYSIS';
ALTER TYPE "PaymentStatus" ADD VALUE 'CONFIRMED';
ALTER TYPE "PaymentStatus" ADD VALUE 'RECEIVED';
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUND_IN_PROGRESS';
ALTER TYPE "PaymentStatus" ADD VALUE 'CHARGEBACK';
ALTER TYPE "PaymentProvider" ADD VALUE 'ASAAS';

-- Preserve legacy records while new application rules require producer grouping.
ALTER TABLE "Product" ADD COLUMN "producerId" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "sellerOrderId" TEXT;

ALTER TABLE "Payment"
ADD COLUMN "billingType" "PaymentBillingType",
ADD COLUMN "confirmedAt" TIMESTAMP(3),
ADD COLUMN "feeAmountCents" INTEGER,
ADD COLUMN "netAmountCents" INTEGER,
ADD COLUMN "providerPaymentId" TEXT,
ADD COLUMN "receivedAt" TIMESTAMP(3);

CREATE TABLE "ProducerLogisticsProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'BR',
    "postalCode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "postingDays" INTEGER[],
    "cutoffTime" TEXT NOT NULL,
    "preparationDays" INTEGER NOT NULL DEFAULT 2,
    "acceptedServiceIds" INTEGER[],
    "printCapability" BOOLEAN NOT NULL DEFAULT false,
    "defaultDropoffPoint" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProducerLogisticsProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PackagingTemplate" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lengthCm" INTEGER NOT NULL,
    "widthCm" INTEGER NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "emptyWeightGrams" INTEGER NOT NULL,
    "maxWeightGrams" INTEGER NOT NULL,
    "material" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PackagingTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductShippingProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "defaultPackagingTemplateId" TEXT,
    "unitWeightGrams" INTEGER NOT NULL,
    "lengthCm" INTEGER NOT NULL,
    "widthCm" INTEGER NOT NULL,
    "heightCm" INTEGER NOT NULL,
    "unitsPerPackage" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductShippingProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SellerOrder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "SellerOrderStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "subtotalCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL DEFAULT 0,
    "discountCents" INTEGER NOT NULL DEFAULT 0,
    "totalCents" INTEGER NOT NULL,
    "payoutEligibleAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SellerOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShippingQuote" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sellerOrderId" TEXT,
    "producerId" TEXT NOT NULL,
    "provider" "ShippingProvider" NOT NULL DEFAULT 'MELHOR_ENVIO',
    "serviceId" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "label" "ShippingQuoteLabel" NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "deliveryDays" INTEGER NOT NULL,
    "totalPromiseDays" INTEGER NOT NULL,
    "destinationPostalCode" TEXT NOT NULL,
    "itemsHash" TEXT NOT NULL,
    "packages" JSONB NOT NULL,
    "rawResponse" JSONB,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShippingQuote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sellerOrderId" TEXT NOT NULL,
    "quoteId" TEXT,
    "provider" "ShippingProvider" NOT NULL DEFAULT 'MELHOR_ENVIO',
    "providerOrderId" TEXT,
    "labelUrl" TEXT,
    "trackingCode" TEXT,
    "quotedCostCents" INTEGER NOT NULL,
    "finalCostCents" INTEGER,
    "status" "ShipmentStatus" NOT NULL DEFAULT 'QUOTED',
    "postedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ShippingWebhookEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "provider" "WebhookProvider" NOT NULL DEFAULT 'MELHOR_ENVIO',
    "deduplicationKey" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "signatureValid" BOOLEAN NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processingError" TEXT,
    CONSTRAINT "ShippingWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "paymentId" TEXT,
    "provider" "WebhookProvider" NOT NULL DEFAULT 'ASAAS',
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "providerPaymentId" TEXT,
    "tokenValid" BOOLEAN NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processingError" TEXT,
    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProducerPaymentProfile" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "pixKeyEncrypted" TEXT NOT NULL,
    "keyType" TEXT NOT NULL,
    "holderName" TEXT NOT NULL,
    "holderDocument" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProducerPaymentProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SellerPayable" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sellerOrderId" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "productSubtotalCents" INTEGER NOT NULL,
    "commissionCents" INTEGER NOT NULL,
    "adjustmentsCents" INTEGER NOT NULL DEFAULT 0,
    "payableValueCents" INTEGER NOT NULL,
    "status" "SellerPayableStatus" NOT NULL DEFAULT 'PENDING',
    "eligibleAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SellerPayable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sellerPayableId" TEXT NOT NULL,
    "recordedByUserId" TEXT,
    "provider" "PayoutProvider" NOT NULL DEFAULT 'MANUAL',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "pixKeyMasked" TEXT NOT NULL,
    "recipientDocument" TEXT NOT NULL,
    "providerTransferId" TEXT,
    "proofUrl" TEXT,
    "externalReference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sellerOrderId" TEXT,
    "paymentId" TEXT,
    "type" "LedgerEntryType" NOT NULL,
    "debitCents" INTEGER NOT NULL DEFAULT 0,
    "creditCents" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "reference" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProducerLogisticsProfile_producerId_key" ON "ProducerLogisticsProfile"("producerId");
CREATE INDEX "ProducerLogisticsProfile_tenantId_idx" ON "ProducerLogisticsProfile"("tenantId");
CREATE INDEX "PackagingTemplate_tenantId_active_idx" ON "PackagingTemplate"("tenantId", "active");
CREATE UNIQUE INDEX "PackagingTemplate_tenantId_code_key" ON "PackagingTemplate"("tenantId", "code");
CREATE UNIQUE INDEX "ProductShippingProfile_productId_key" ON "ProductShippingProfile"("productId");
CREATE INDEX "ProductShippingProfile_tenantId_idx" ON "ProductShippingProfile"("tenantId");
CREATE INDEX "ProductShippingProfile_defaultPackagingTemplateId_idx" ON "ProductShippingProfile"("defaultPackagingTemplateId");
CREATE INDEX "SellerOrder_tenantId_status_idx" ON "SellerOrder"("tenantId", "status");
CREATE INDEX "SellerOrder_producerId_status_idx" ON "SellerOrder"("producerId", "status");
CREATE UNIQUE INDEX "SellerOrder_orderId_producerId_key" ON "SellerOrder"("orderId", "producerId");
CREATE UNIQUE INDEX "SellerOrder_tenantId_code_key" ON "SellerOrder"("tenantId", "code");
CREATE INDEX "ShippingQuote_tenantId_producerId_expiresAt_idx" ON "ShippingQuote"("tenantId", "producerId", "expiresAt");
CREATE INDEX "ShippingQuote_sellerOrderId_idx" ON "ShippingQuote"("sellerOrderId");
CREATE INDEX "Shipment_tenantId_status_idx" ON "Shipment"("tenantId", "status");
CREATE INDEX "Shipment_sellerOrderId_idx" ON "Shipment"("sellerOrderId");
CREATE INDEX "Shipment_trackingCode_idx" ON "Shipment"("trackingCode");
CREATE UNIQUE INDEX "Shipment_provider_providerOrderId_key" ON "Shipment"("provider", "providerOrderId");
CREATE INDEX "ShippingWebhookEvent_providerOrderId_idx" ON "ShippingWebhookEvent"("providerOrderId");
CREATE INDEX "ShippingWebhookEvent_tenantId_processedAt_idx" ON "ShippingWebhookEvent"("tenantId", "processedAt");
CREATE UNIQUE INDEX "ShippingWebhookEvent_provider_deduplicationKey_key" ON "ShippingWebhookEvent"("provider", "deduplicationKey");
CREATE INDEX "PaymentWebhookEvent_providerPaymentId_idx" ON "PaymentWebhookEvent"("providerPaymentId");
CREATE INDEX "PaymentWebhookEvent_tenantId_processedAt_idx" ON "PaymentWebhookEvent"("tenantId", "processedAt");
CREATE UNIQUE INDEX "PaymentWebhookEvent_provider_eventId_key" ON "PaymentWebhookEvent"("provider", "eventId");
CREATE INDEX "ProducerPaymentProfile_tenantId_producerId_active_idx" ON "ProducerPaymentProfile"("tenantId", "producerId", "active");
CREATE UNIQUE INDEX "SellerPayable_sellerOrderId_key" ON "SellerPayable"("sellerOrderId");
CREATE INDEX "SellerPayable_tenantId_status_idx" ON "SellerPayable"("tenantId", "status");
CREATE INDEX "SellerPayable_producerId_status_idx" ON "SellerPayable"("producerId", "status");
CREATE INDEX "Payout_tenantId_status_idx" ON "Payout"("tenantId", "status");
CREATE INDEX "Payout_sellerPayableId_idx" ON "Payout"("sellerPayableId");
CREATE UNIQUE INDEX "Payout_tenantId_externalReference_key" ON "Payout"("tenantId", "externalReference");
CREATE INDEX "LedgerEntry_tenantId_createdAt_idx" ON "LedgerEntry"("tenantId", "createdAt");
CREATE INDEX "LedgerEntry_orderId_idx" ON "LedgerEntry"("orderId");
CREATE INDEX "LedgerEntry_sellerOrderId_idx" ON "LedgerEntry"("sellerOrderId");
CREATE INDEX "Product_tenantId_producerId_idx" ON "Product"("tenantId", "producerId");
CREATE INDEX "OrderItem_sellerOrderId_idx" ON "OrderItem"("sellerOrderId");
CREATE UNIQUE INDEX "Payment_provider_providerPaymentId_key" ON "Payment"("provider", "providerPaymentId");

ALTER TABLE "Product" ADD CONSTRAINT "Product_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "SellerOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProducerLogisticsProfile" ADD CONSTRAINT "ProducerLogisticsProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProducerLogisticsProfile" ADD CONSTRAINT "ProducerLogisticsProfile_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PackagingTemplate" ADD CONSTRAINT "PackagingTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductShippingProfile" ADD CONSTRAINT "ProductShippingProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductShippingProfile" ADD CONSTRAINT "ProductShippingProfile_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductShippingProfile" ADD CONSTRAINT "ProductShippingProfile_defaultPackagingTemplateId_fkey" FOREIGN KEY ("defaultPackagingTemplateId") REFERENCES "PackagingTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SellerOrder" ADD CONSTRAINT "SellerOrder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerOrder" ADD CONSTRAINT "SellerOrder_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerOrder" ADD CONSTRAINT "SellerOrder_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShippingQuote" ADD CONSTRAINT "ShippingQuote_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ShippingQuote" ADD CONSTRAINT "ShippingQuote_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "SellerOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShippingQuote" ADD CONSTRAINT "ShippingQuote_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "SellerOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "ShippingQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShippingWebhookEvent" ADD CONSTRAINT "ShippingWebhookEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentWebhookEvent" ADD CONSTRAINT "PaymentWebhookEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PaymentWebhookEvent" ADD CONSTRAINT "PaymentWebhookEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProducerPaymentProfile" ADD CONSTRAINT "ProducerPaymentProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProducerPaymentProfile" ADD CONSTRAINT "ProducerPaymentProfile_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerPayable" ADD CONSTRAINT "SellerPayable_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerPayable" ADD CONSTRAINT "SellerPayable_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "SellerOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SellerPayable" ADD CONSTRAINT "SellerPayable_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "Producer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_sellerPayableId_fkey" FOREIGN KEY ("sellerPayableId") REFERENCES "SellerPayable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_sellerOrderId_fkey" FOREIGN KEY ("sellerOrderId") REFERENCES "SellerOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
