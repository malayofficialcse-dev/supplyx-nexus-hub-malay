import { deleteCache } from "../lib/redis.js";
import { OrderRepository } from "../repositories/order.repo.js";
import { WarehouseRepository, ShipmentRepository, LogisticsRepository, CustomerRepository, CarrierRepository, ContractRepository, InvoiceRepository, PaymentRepository, GoodsReceiptRepository, InventoryRepository, InventoryMovementRepository, prisma, } from "../repositories/scm.repo.js";
const warehouseRepo = new WarehouseRepository();
const shipmentRepo = new ShipmentRepository();
const logisticsRepo = new LogisticsRepository();
const customerRepo = new CustomerRepository();
const carrierRepo = new CarrierRepository();
const contractRepo = new ContractRepository();
const invoiceRepo = new InvoiceRepository();
const paymentRepo = new PaymentRepository();
const goodsReceiptRepo = new GoodsReceiptRepository();
const orderRepo = new OrderRepository();
const inventoryRepo = new InventoryRepository();
const inventoryMovementRepo = new InventoryMovementRepository();
export class WarehouseService {
    async getWarehouses(params = {}) {
        return warehouseRepo.findMany(params);
    }
    async getWarehouseById(id) {
        return warehouseRepo.getById(id);
    }
    async createWarehouse(data) {
        return warehouseRepo.create(data);
    }
    async updateWarehouse(id, data) {
        return warehouseRepo.update(id, data);
    }
    async deleteWarehouse(id) {
        return warehouseRepo.delete(id);
    }
}
export class ShipmentService {
    async getShipments() {
        return shipmentRepo.getAll();
    }
    async createShipment(data) {
        return shipmentRepo.create(data);
    }
}
export class LogisticsService {
    async getLogistics() {
        return logisticsRepo.getAll();
    }
}
export class CustomerService {
    async getCustomers(params = {}) {
        return customerRepo.findMany(params);
    }
    async getCustomerById(id) {
        return customerRepo.getById(id);
    }
    async createCustomer(data) {
        return customerRepo.create(data);
    }
    async updateCustomer(id, data) {
        return customerRepo.update(id, data);
    }
    async deleteCustomer(id) {
        return customerRepo.delete(id);
    }
}
export class CarrierService {
    async getCarriers(params = {}) {
        return carrierRepo.findMany(params);
    }
    async getCarrierById(id) {
        return carrierRepo.getById(id);
    }
    async createCarrier(data) {
        return carrierRepo.create(data);
    }
    async updateCarrier(id, data) {
        return carrierRepo.update(id, data);
    }
    async deleteCarrier(id) {
        return carrierRepo.delete(id);
    }
}
export class ContractService {
    async getContracts(params = {}) {
        return contractRepo.findMany(params);
    }
    async getContractById(id) {
        return contractRepo.getById(id);
    }
    async createContract(data) {
        return contractRepo.create(data);
    }
    async updateContract(id, data) {
        return contractRepo.update(id, data);
    }
    async deleteContract(id) {
        return contractRepo.delete(id);
    }
    async getExpiringContracts(withinDays = 90) {
        const all = await contractRepo.findMany({});
        const contracts = all.data ?? [];
        const now = new Date();
        const threshold = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
        return contracts
            .map((c) => {
            const endDate = new Date(c.end);
            const isValid = !isNaN(endDate.getTime());
            const daysUntilExpiry = isValid
                ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : null;
            const urgency = daysUntilExpiry === null ? "unknown"
                : daysUntilExpiry < 0 ? "expired"
                    : daysUntilExpiry <= 30 ? "critical"
                        : daysUntilExpiry <= 60 ? "warning"
                            : "notice";
            return { ...c, daysUntilExpiry, urgency, endDate: isValid ? endDate.toISOString() : null };
        })
            .filter((c) => c.daysUntilExpiry !== null && c.daysUntilExpiry <= withinDays)
            .sort((a, b) => (a.daysUntilExpiry ?? 999) - (b.daysUntilExpiry ?? 999));
    }
    async autoExpireContracts() {
        const all = await contractRepo.findMany({});
        const contracts = all.data ?? [];
        const now = new Date();
        const updatedIds = [];
        for (const c of contracts) {
            if (c.status !== "Expired") {
                const endDate = new Date(c.end);
                if (!isNaN(endDate.getTime()) && endDate.getTime() < now.getTime()) {
                    try {
                        await contractRepo.update(c.id, { status: "Expired" });
                        updatedIds.push(c.id);
                    }
                    catch (err) {
                        console.error(`Failed to auto-expire contract ${c.conId || c.id}:`, err);
                    }
                }
            }
        }
        if (updatedIds.length > 0) {
            await deleteCache("scm:dashboard:analytics");
            console.log(`⏱️ Auto-expired ${updatedIds.length} contracts.`);
        }
        return { expiredCount: updatedIds.length, updatedIds };
    }
}
export class InvoiceService {
    async getInvoices() {
        const list = await invoiceRepo.getAll();
        const now = new Date();
        return list.map((inv) => {
            const terms = inv.paymentTerms || "NET_30";
            let dueDate = inv.dueDate;
            if (!dueDate && inv.date) {
                const invDate = new Date(inv.date);
                if (!isNaN(invDate.getTime())) {
                    let netDays = 30;
                    if (terms.includes("NET_")) {
                        netDays = parseInt(terms.replace(/.*?NET_/, ""), 10) || 30;
                    }
                    else if (terms === "IMMEDIATE" || terms === "COD") {
                        netDays = 0;
                    }
                    dueDate = new Date(invDate.getTime() + netDays * 86400000).toISOString().split("T")[0];
                }
            }
            let daysOverdue = 0;
            let isOverdue = false;
            let daysUntilDue = 0;
            if (dueDate && inv.status !== "Paid") {
                const dDate = new Date(dueDate);
                if (!isNaN(dDate.getTime())) {
                    const diffDays = Math.ceil((now.getTime() - dDate.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays > 0) {
                        daysOverdue = diffDays;
                        isOverdue = true;
                    }
                    else {
                        daysUntilDue = Math.abs(diffDays);
                    }
                }
            }
            const is210Terms = terms.includes("2/10") || terms.includes("DISCOUNT");
            let earlyPayDiscountAmount = 0;
            let earlyPayDeadline = null;
            let isEarlyPayEligible = false;
            if (is210Terms && inv.date) {
                const invDate = new Date(inv.date);
                if (!isNaN(invDate.getTime())) {
                    const discountEnd = new Date(invDate.getTime() + 10 * 86400000);
                    earlyPayDeadline = discountEnd.toISOString().split("T")[0];
                    earlyPayDiscountAmount = Number((inv.amount * 0.02).toFixed(2));
                    isEarlyPayEligible = now.getTime() <= discountEnd.getTime() && inv.status !== "Paid";
                }
            }
            return {
                ...inv,
                paymentTerms: terms,
                dueDate: dueDate || inv.date,
                daysOverdue,
                isOverdue,
                daysUntilDue,
                earlyPayDiscountAmount,
                earlyPayDeadline,
                isEarlyPayEligible,
            };
        });
    }
    async getInvoiceById(id) {
        return invoiceRepo.getById(id);
    }
    async checkDuplicate(supplier, amount, date) {
        const all = await invoiceRepo.getAll();
        const tolerance = 0.01;
        return all.find((inv) => inv.supplier === supplier &&
            Math.abs(inv.amount - amount) < tolerance &&
            inv.date === date) ?? null;
    }
    async createInvoice(data) {
        // Duplicate detection: same supplier + amount (±0.01) + date
        const existing = await this.checkDuplicate(data.supplier, data.amount, data.date);
        if (existing) {
            const err = new Error(`Potential duplicate invoice detected — ${existing.invoiceId} from ${existing.supplier} on ${existing.date} for the same amount.`);
            err.code = "DUPLICATE_INVOICE";
            err.duplicate = existing;
            throw err;
        }
        const count = await invoiceRepo.getAll();
        const invoiceId = `INV-${3000 + count.length}`;
        return invoiceRepo.create({ invoiceId, supplier: data.supplier, date: data.date, amount: data.amount, status: data.status || "Pending", items: data.items });
    }
    async updateInvoice(id, data) {
        return invoiceRepo.update(id, data);
    }
    async payInvoice(id, paymentData) {
        const invoice = (await invoiceRepo.getById(id)) || (await prisma.invoice.findUnique({ where: { invoiceId: id } }));
        if (!invoice) {
            throw new Error("Invoice not found");
        }
        if (invoice.status === "Paid") {
            throw new Error("Invoice is already marked as Paid");
        }
        const method = paymentData.method || "Bank Transfer";
        const actor = paymentData.actor || "Procurement Specialist";
        const allPayments = await paymentRepo.getAll();
        const paymentId = `PAY-${9000 + allPayments.length}`;
        const auditTrail = [
            {
                action: "created_from_invoice",
                actor,
                invoiceId: invoice.invoiceId,
                amount: invoice.amount,
                method,
                timestamp: new Date().toISOString(),
                notes: paymentData.notes || "Auto-settlement processed via 1-Click Pay",
            },
        ];
        const result = await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    paymentId,
                    invoiceId: invoice.invoiceId,
                    supplier: invoice.supplier,
                    amount: invoice.amount,
                    status: "Processed",
                    method,
                    auditTrail: auditTrail,
                },
            });
            const updatedInvoice = await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: "Paid" },
            });
            return { invoice: updatedInvoice, payment };
        });
        await deleteCache("scm:dashboard:analytics");
        await deleteCache("scm:analytics:advanced");
        return result;
    }
    async getInvoicePdf(id) {
        const invoice = (await invoiceRepo.getById(id)) || (await prisma.invoice.findUnique({ where: { invoiceId: id } }));
        if (!invoice) {
            throw new Error("Invoice not found");
        }
        const { PDFService } = await import("./pdf.service.js");
        return PDFService.generateInvoicePDF(invoice);
    }
}
export class PaymentService {
    async getPayments() {
        return paymentRepo.getAll();
    }
    async getPaymentById(id) {
        return paymentRepo.getById(id);
    }
    async createPayment(data) {
        const count = await paymentRepo.getAll();
        const paymentId = `PAY-${9000 + count.length}`;
        return paymentRepo.create({ paymentId, invoiceId: data.invoiceId, supplier: data.supplier, amount: data.amount, status: "Processed", method: data.method, auditTrail: data.auditTrail || [] });
    }
}
export class InventoryService {
    async getInventories() {
        return inventoryRepo.getAll();
    }
    async getInventoriesByWarehouse(warehouseId) {
        return inventoryRepo.getByWarehouseId(warehouseId);
    }
    async getStockAlerts() {
        const all = await inventoryRepo.getAll();
        return all
            .filter((item) => {
            const rp = Number(item.reorderPoint ?? 0);
            return rp > 0 && Number(item.quantity) <= rp;
        })
            .map((item) => ({
            ...item,
            reorderPoint: Number(item.reorderPoint ?? 0),
            reorderQty: Number(item.reorderQty ?? 0),
            shortage: Math.max(0, Number(item.reorderPoint ?? 0) - Number(item.quantity)),
            alertLevel: Number(item.quantity) <= 0 ? "out_of_stock" : "low_stock",
        }));
    }
}
export class GoodsReceiptService {
    async getGoodsReceipts() {
        return goodsReceiptRepo.getAll();
    }
    async getGoodsReceiptById(id) {
        return goodsReceiptRepo.getById(id);
    }
    async createGoodsReceipt(data) {
        const order = (await orderRepo.getByOrderId(data.orderId)) ||
            (await orderRepo.getById(data.orderId));
        if (!order) {
            throw new Error(`Purchase order ${data.orderId} not found`);
        }
        const normalizedItems = Array.isArray(data.items) ? data.items : [];
        if (normalizedItems.length === 0) {
            throw new Error("Goods receipt must include at least one item");
        }
        const orderItems = Array.isArray(order.items) ? order.items : [];
        const totalOrdered = orderItems.reduce((sum, item) => sum + (Number(item?.quantity || item?.qty) || 0), 0);
        const receiptQuantity = normalizedItems.reduce((sum, item) => sum + (Number(item?.quantity || item?.receivedQty || item?.qty || item?.receivedQuantity) || 0), 0);
        if (receiptQuantity <= 0) {
            throw new Error("Received quantity must be greater than zero");
        }
        const projectedReceived = order.receivedQuantity + receiptQuantity;
        if (totalOrdered > 0 && projectedReceived > totalOrdered) {
            throw new Error("Received quantity exceeds ordered quantity for this purchase order");
        }
        const warehouses = await warehouseRepo.getAll();
        const warehouse = warehouses.find((w) => w.id === data.warehouseId || w.whId === data.warehouseId) || warehouses?.[0];
        const warehouseId = warehouse?.id;
        if (!warehouseId) {
            throw new Error("Warehouse is required to record inventory receipt");
        }
        const receiptId = `GRN-${5522 + (await goodsReceiptRepo.getAll()).length}`;
        const deliveryDate = data.deliveryDate || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
        const status = data.status || (totalOrdered > 0 && projectedReceived >= totalOrdered ? "Fully Received" : "Partially Received");
        const createdReceipt = await prisma.$transaction(async (tx) => {
            const gr = await tx.goodsReceipt.create({
                data: {
                    receiptId,
                    orderId: order.orderId,
                    supplier: data.supplier,
                    warehouseId,
                    deliveryDate,
                    status,
                    items: normalizedItems,
                },
            });
            await tx.order.update({
                where: { id: order.id },
                data: {
                    receivedQuantity: projectedReceived,
                    status: projectedReceived >= totalOrdered && totalOrdered > 0 ? "Received" : "Partial",
                },
            });
            for (const item of normalizedItems) {
                const itemName = String(item.item || item.name || item.description || "Unknown Item");
                const receivedQty = Number(item.quantity || item.receivedQty || item.qty || item.receivedQuantity || 0);
                if (receivedQty <= 0)
                    continue;
                const matchedOrderItem = orderItems.find((oi) => (oi.item || oi.name || oi.description) === itemName);
                const unit = item.unit || matchedOrderItem?.unit || "pcs";
                const skuValue = item.sku ?? "";
                const inventory = await tx.inventory.upsert({
                    where: { warehouseId_item_sku: { warehouseId, item: itemName, sku: skuValue } },
                    create: {
                        warehouseId,
                        item: itemName,
                        sku: item.sku,
                        unit,
                        quantity: receivedQty,
                        metadata: item.metadata || {},
                    },
                    update: {
                        quantity: {
                            increment: receivedQty,
                        },
                        metadata: item.metadata || {},
                    },
                });
                await tx.inventoryMovement.create({
                    data: {
                        inventoryId: inventory.id,
                        goodsReceiptId: gr.id,
                        orderId: order.id,
                        warehouseId,
                        type: "GoodsReceipt",
                        quantity: receivedQty,
                        balanceAfter: inventory.quantity,
                        notes: `Received for ${order.orderId}`,
                    },
                });
            }
            const warehouse = await tx.warehouse.findUnique({ where: { id: warehouseId } });
            if (warehouse) {
                const delta = Math.round(receiptQuantity / 10);
                await tx.warehouse.update({
                    where: { id: warehouseId },
                    data: { fillLevel: Math.min(100, Math.max(0, warehouse.fillLevel + delta)) },
                });
            }
            return gr;
        });
        // Auto-recalculate supplier scorecard asynchronously in background
        setTimeout(async () => {
            try {
                const { SupplierService } = await import("./supplier.service.js");
                const supplierService = new SupplierService();
                const sup = await prisma.supplier.findFirst({
                    where: { name: { equals: data.supplier, mode: "insensitive" } },
                });
                if (sup) {
                    await supplierService.computeSupplierScorecard(sup.id);
                }
            }
            catch (err) {
                console.error("Scorecard auto-recomputation background error:", err);
            }
        }, 100);
        return createdReceipt;
    }
}
export class AttachmentService {
    async addAttachment(entityType, id, fileData) {
        const rawType = entityType.toLowerCase();
        const modelName = rawType.includes("invoice") ? "invoice"
            : rawType.includes("contract") ? "contract"
                : rawType.includes("order") ? "order"
                    : "goodsReceipt";
        const record = await prisma[modelName].findUnique({ where: { id } });
        if (!record)
            throw new Error(`${modelName} with id ${id} not found`);
        const existingAttachments = Array.isArray(record.attachments) ? record.attachments : [];
        const attachmentId = `ATT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const newAttachment = {
            id: attachmentId,
            name: fileData.name || "document.pdf",
            size: fileData.size || 0,
            type: fileData.type || "application/pdf",
            dataUrl: fileData.dataUrl || "",
            uploader: fileData.uploader || "System",
            uploadedAt: new Date().toISOString(),
        };
        const updated = await prisma[modelName].update({
            where: { id },
            data: { attachments: [...existingAttachments, newAttachment] },
        });
        await deleteCache("scm:dashboard:analytics");
        return { attachment: newAttachment, record: updated };
    }
    async deleteAttachment(entityType, id, attachmentId) {
        const rawType = entityType.toLowerCase();
        const modelName = rawType.includes("invoice") ? "invoice"
            : rawType.includes("contract") ? "contract"
                : rawType.includes("order") ? "order"
                    : "goodsReceipt";
        const record = await prisma[modelName].findUnique({ where: { id } });
        if (!record)
            throw new Error(`${modelName} with id ${id} not found`);
        const existingAttachments = Array.isArray(record.attachments) ? record.attachments : [];
        const filtered = existingAttachments.filter((a) => a.id !== attachmentId && a.name !== attachmentId);
        const updated = await prisma[modelName].update({
            where: { id },
            data: { attachments: filtered },
        });
        await deleteCache("scm:dashboard:analytics");
        return { success: true, record: updated };
    }
}
