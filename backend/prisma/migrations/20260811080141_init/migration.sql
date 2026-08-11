/*
  Warnings:

  - You are about to drop the column `amount` on the `Requisition` table. All the data in the column will be lost.
  - Added the required column `costCenter` to the `Requisition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `items` to the `Requisition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requester` to the `Requisition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Requisition` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GoodsReceipt" ADD COLUMN     "warehouseId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "receivedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Requisition" DROP COLUMN "amount",
ADD COLUMN     "approvalNotes" TEXT,
ADD COLUMN     "costCenter" TEXT NOT NULL,
ADD COLUMN     "items" JSONB NOT NULL,
ADD COLUMN     "justification" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "requester" TEXT NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "sku" TEXT,
    "unit" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "goodsReceiptId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_warehouseId_item_sku_key" ON "Inventory"("warehouseId", "item", "sku");
