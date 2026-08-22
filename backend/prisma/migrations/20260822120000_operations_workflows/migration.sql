-- Configurable approvals, auditability, matching exceptions, supplier portal,
-- sourcing scores and inventory execution primitives.
CREATE TABLE "ApprovalRule" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "module" TEXT NOT NULL DEFAULT 'requisitions',
  "minAmount" DOUBLE PRECISION, "maxAmount" DOUBLE PRECISION, "department" TEXT,
  "category" TEXT, "costCenter" TEXT, "levels" JSONB NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApprovalRule_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ApprovalTask" (
  "id" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "level" INTEGER NOT NULL,
  "approverRole" TEXT NOT NULL, "approverId" TEXT, "status" TEXT NOT NULL DEFAULT 'Pending',
  "decision" TEXT, "notes" TEXT, "dueAt" TIMESTAMP(3), "decidedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApprovalTask_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ApprovalTask_entity_idx" ON "ApprovalTask" ("entityType", "entityId");
CREATE INDEX "ApprovalTask_approver_idx" ON "ApprovalTask" ("approverId", "status");
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL, "actorId" TEXT, "actorName" TEXT NOT NULL, "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "beforeData" JSONB, "afterData" JSONB,
  "reason" TEXT, "ipAddress" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog" ("entityType", "entityId");
CREATE INDEX "AuditLog_created_idx" ON "AuditLog" ("createdAt");
CREATE TABLE "MatchException" (
  "id" TEXT NOT NULL, "invoiceId" TEXT NOT NULL, "type" TEXT NOT NULL, "severity" TEXT NOT NULL DEFAULT 'High',
  "message" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'Open', "resolution" TEXT, "resolvedBy" TEXT,
  "resolvedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MatchException_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MatchException_invoice_idx" ON "MatchException" ("invoiceId", "status");
CREATE TABLE "MatchHistory" (
  "id" TEXT NOT NULL, "invoiceId" TEXT NOT NULL, "matchStatus" TEXT NOT NULL, "report" JSONB NOT NULL,
  "runBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MatchHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MatchHistory_invoice_idx" ON "MatchHistory" ("invoiceId", "createdAt");
CREATE TABLE "SupplierPortalInvitation" (
  "id" TEXT NOT NULL, "supplierId" TEXT, "supplier" TEXT NOT NULL, "email" TEXT NOT NULL,
  "token" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'Invited', "expiresAt" TIMESTAMP(3) NOT NULL,
  "lastLoginAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupplierPortalInvitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SupplierPortalInvitation_token_key" ON "SupplierPortalInvitation" ("token");
CREATE TABLE "RFQInvitation" (
  "id" TEXT NOT NULL, "rfqId" TEXT NOT NULL, "supplier" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'Invited',
  "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "respondedAt" TIMESTAMP(3),
  CONSTRAINT "RFQInvitation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "RFQInvitation_rfq_supplier_key" ON "RFQInvitation" ("rfqId", "supplier");
CREATE TABLE "QuoteScore" (
  "id" TEXT NOT NULL, "quoteId" TEXT NOT NULL, "priceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "deliveryScore" DOUBLE PRECISION NOT NULL DEFAULT 0, "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "supplierScore" DOUBLE PRECISION NOT NULL DEFAULT 0, "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuoteScore_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "QuoteScore_quote_key" ON "QuoteScore" ("quoteId");
CREATE TABLE "InventoryReservation" (
  "id" TEXT NOT NULL, "inventoryId" TEXT NOT NULL, "quantity" DOUBLE PRECISION NOT NULL,
  "referenceType" TEXT NOT NULL, "referenceId" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'Reserved',
  "expiresAt" TIMESTAMP(3), "createdBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "InventoryReservation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "InventoryReservation_inventory_idx" ON "InventoryReservation" ("inventoryId", "status");
CREATE TABLE "InventoryTransfer" (
  "id" TEXT NOT NULL, "transferId" TEXT NOT NULL, "item" TEXT NOT NULL, "sku" TEXT,
  "quantity" DOUBLE PRECISION NOT NULL, "fromWarehouseId" TEXT NOT NULL, "toWarehouseId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Requested', "requestedBy" TEXT NOT NULL, "approvedBy" TEXT,
  "completedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InventoryTransfer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InventoryTransfer_transferId_key" ON "InventoryTransfer" ("transferId");
CREATE TABLE "InventoryBatch" (
  "id" TEXT NOT NULL, "inventoryId" TEXT NOT NULL, "batchNumber" TEXT NOT NULL, "serialNumber" TEXT,
  "quantity" DOUBLE PRECISION NOT NULL, "expiryDate" TIMESTAMP(3), "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "InventoryBatch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "InventoryBatch_inventory_batch_serial_key" ON "InventoryBatch" ("inventoryId", "batchNumber", "serialNumber");
