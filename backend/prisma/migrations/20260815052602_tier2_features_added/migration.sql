-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "GoodsReceipt" ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "dueDate" TEXT,
ADD COLUMN     "paymentTerms" TEXT DEFAULT 'NET_30';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "attachments" JSONB;

-- AlterTable
ALTER TABLE "Requisition" ADD COLUMN     "approvals" JSONB;

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "deliveryDate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quote_quoteId_key" ON "Quote"("quoteId");
