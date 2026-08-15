import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export class RFQRepository {
    async getAll() {
        return prisma.rFQ.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async create(data) {
        return prisma.rFQ.create({
            data,
        });
    }
    async getById(id) {
        return prisma.rFQ.findUnique({ where: { id } });
    }
    async update(id, data) {
        const { items, ...rest } = data;
        return prisma.rFQ.update({
            where: { id },
            data: { ...rest, ...(items !== undefined ? { items: items } : {}) },
        });
    }
    async delete(id) {
        return prisma.rFQ.delete({ where: { id } });
    }
    async addSupplierQuote(id, quote) {
        const existing = await prisma.rFQ.findUnique({ where: { id } });
        const rawItems = existing?.items || {};
        const baseItems = typeof rawItems === "object" && !Array.isArray(rawItems) ? rawItems : {};
        const existingQuotes = Array.isArray(baseItems.quotes) ? baseItems.quotes : [];
        const updatedItems = {
            ...baseItems,
            quotes: [...existingQuotes, quote],
        };
        return prisma.rFQ.update({ where: { id }, data: { items: updatedItems, vendorCount: (existing?.vendorCount || 0) + 1 } });
    }
    async countOpen() {
        return prisma.rFQ.count({
            where: { status: "Open" },
        });
    }
}
