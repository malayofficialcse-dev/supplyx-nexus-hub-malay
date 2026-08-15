import { PrismaClient, } from "@prisma/client";
export const prisma = new PrismaClient();
const normalizePagination = ({ page = 1, limit = 10 }) => ({
    page: page < 1 ? 1 : page,
    limit: limit < 1 ? 10 : limit,
});
export class WarehouseRepository {
    async getAll() {
        return this.findMany({}).then((result) => result.data);
    }
    async findMany(params = {}) {
        const { search, status, page, limit, sortBy, sortOrder } = params;
        const { page: normalizedPage, limit: normalizedLimit } = normalizePagination({ page, limit });
        const where = {};
        if (search) {
            where.OR = [
                { whId: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const orderBy = {};
        const allowed = ["name", "whId", "createdAt", "fillLevel", "capacity", "status"];
        if (sortBy && allowed.includes(sortBy)) {
            orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
        }
        else {
            orderBy.createdAt = "desc";
        }
        const data = await prisma.warehouse.findMany({
            where,
            orderBy,
            skip: (normalizedPage - 1) * normalizedLimit,
            take: normalizedLimit,
        });
        const total = await prisma.warehouse.count({ where });
        return { data, total, page: normalizedPage, limit: normalizedLimit };
    }
    async getById(id) {
        return prisma.warehouse.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.warehouse.create({ data });
    }
    async update(id, data) {
        return prisma.warehouse.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.warehouse.delete({ where: { id } });
    }
    async updateFillLevel(id, fillLevel) {
        return prisma.warehouse.update({ where: { id }, data: { fillLevel } });
    }
}
export class ShipmentRepository {
    async getAll() {
        return prisma.shipment.findMany({
            orderBy: { estDelivery: "asc" },
        });
    }
    async create(data) {
        return prisma.shipment.create({ data });
    }
}
export class LogisticsRepository {
    async getAll() {
        return prisma.logisticsRoute.findMany({
            orderBy: { routeName: "asc" },
        });
    }
}
export class CustomerRepository {
    async getAll() {
        return this.findMany({}).then((result) => result.data);
    }
    async findMany(params = {}) {
        const { search, status, page, limit, sortBy, sortOrder } = params;
        const { page: normalizedPage, limit: normalizedLimit } = normalizePagination({ page, limit });
        const where = {};
        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: "insensitive" } },
                { contact: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const orderBy = {};
        const allowed = ["companyName", "createdAt", "status", "salesYTD"];
        if (sortBy && allowed.includes(sortBy)) {
            orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
        }
        else {
            orderBy.companyName = "asc";
        }
        const data = await prisma.customer.findMany({
            where,
            orderBy,
            skip: (normalizedPage - 1) * normalizedLimit,
            take: normalizedLimit,
        });
        const total = await prisma.customer.count({ where });
        return { data, total, page: normalizedPage, limit: normalizedLimit };
    }
    async getById(id) {
        return prisma.customer.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.customer.create({ data });
    }
    async update(id, data) {
        return prisma.customer.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.customer.delete({ where: { id } });
    }
}
export class CarrierRepository {
    async getAll() {
        return this.findMany({}).then((result) => result.data);
    }
    async findMany(params = {}) {
        const { search, type, page, limit, sortBy, sortOrder } = params;
        const { page: normalizedPage, limit: normalizedLimit } = normalizePagination({ page, limit });
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { type: { contains: search, mode: "insensitive" } },
                { contact: { contains: search, mode: "insensitive" } },
            ];
        }
        if (type) {
            where.type = type;
        }
        const orderBy = {};
        const allowed = ["name", "rating", "activeVehicles", "createdAt"];
        if (sortBy && allowed.includes(sortBy)) {
            orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
        }
        else {
            orderBy.rating = "desc";
        }
        const data = await prisma.carrier.findMany({
            where,
            orderBy,
            skip: (normalizedPage - 1) * normalizedLimit,
            take: normalizedLimit,
        });
        const total = await prisma.carrier.count({ where });
        return { data, total, page: normalizedPage, limit: normalizedLimit };
    }
    async getById(id) {
        return prisma.carrier.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.carrier.create({ data });
    }
    async update(id, data) {
        return prisma.carrier.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.carrier.delete({ where: { id } });
    }
}
export class ContractRepository {
    async getAll() {
        return this.findMany({}).then((result) => result.data);
    }
    async findMany(params = {}) {
        const { search, status, page, limit, sortBy, sortOrder } = params;
        const { page: normalizedPage, limit: normalizedLimit } = normalizePagination({ page, limit });
        const where = {};
        if (search) {
            where.OR = [
                { supplier: { contains: search, mode: "insensitive" } },
                { conId: { contains: search, mode: "insensitive" } },
                { initials: { contains: search, mode: "insensitive" } },
            ];
        }
        if (status) {
            where.status = status;
        }
        const orderBy = {};
        const allowed = ["supplier", "start", "createdAt", "status", "conId"];
        if (sortBy && allowed.includes(sortBy)) {
            orderBy[sortBy] = sortOrder === "desc" ? "desc" : "asc";
        }
        else {
            orderBy.createdAt = "desc";
        }
        const data = await prisma.contract.findMany({
            where,
            orderBy,
            skip: (normalizedPage - 1) * normalizedLimit,
            take: normalizedLimit,
        });
        const total = await prisma.contract.count({ where });
        return { data, total, page: normalizedPage, limit: normalizedLimit };
    }
    async getById(id) {
        return prisma.contract.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.contract.create({ data });
    }
    async update(id, data) {
        return prisma.contract.update({ where: { id }, data: data });
    }
    async delete(id) {
        return prisma.contract.delete({ where: { id } });
    }
}
export class InvoiceRepository {
    async getAll() {
        return prisma.invoice.findMany({
            orderBy: { date: "desc" },
        });
    }
    async getById(id) {
        return prisma.invoice.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return prisma.invoice.create({ data });
    }
    async update(id, data) {
        return prisma.invoice.update({ where: { id }, data });
    }
}
export class PaymentRepository {
    async getAll() {
        return prisma.payment.findMany({
            orderBy: { paymentId: "desc" },
        });
    }
    async getById(id) {
        return prisma.payment.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return prisma.payment.create({ data });
    }
}
export class GoodsReceiptRepository {
    async getAll() {
        return prisma.goodsReceipt.findMany({
            orderBy: { deliveryDate: "desc" },
        });
    }
    async getById(id) {
        return prisma.goodsReceipt.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return prisma.goodsReceipt.create({
            data,
        });
    }
}
export class InventoryRepository {
    async getAll() {
        return prisma.inventory.findMany({
            orderBy: { updatedAt: "desc" },
        });
    }
    async getById(id) {
        return prisma.inventory.findUnique({
            where: { id },
        });
    }
    async getByWarehouseId(warehouseId) {
        return prisma.inventory.findMany({
            where: { warehouseId },
            orderBy: { item: "asc" },
        });
    }
    async upsertByWarehouseItem(data) {
        const skuValue = data.sku ?? "";
        return prisma.inventory.upsert({
            where: { warehouseId_item_sku: { warehouseId: data.warehouseId, item: data.item, sku: skuValue } },
            create: {
                warehouseId: data.warehouseId,
                item: data.item,
                sku: data.sku,
                unit: data.unit,
                quantity: data.delta,
                metadata: data.metadata || {},
            },
            update: {
                quantity: {
                    increment: data.delta,
                },
                metadata: data.metadata || {},
            },
        });
    }
}
export class InventoryMovementRepository {
    async create(data) {
        return prisma.inventoryMovement.create({ data });
    }
}
export class BudgetRepository {
    async getAll() {
        return prisma.budgetCategory.findMany({
            orderBy: { category: "asc" },
        });
    }
}
