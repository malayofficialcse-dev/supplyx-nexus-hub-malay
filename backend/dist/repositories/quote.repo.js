import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export class QuoteRepository {
    async getAll() {
        try {
            return await prisma.quote.findMany({
                orderBy: { createdAt: "desc" },
            });
        }
        catch {
            return [];
        }
    }
    async getById(id) {
        try {
            return await prisma.quote.findUnique({
                where: { id },
            });
        }
        catch {
            return null;
        }
    }
    async getByRfqId(rfqId) {
        try {
            return await prisma.quote.findMany({
                where: { rfqId },
                orderBy: { amount: "asc" },
            });
        }
        catch {
            return [];
        }
    }
    async create(data) {
        return prisma.quote.create({
            data: {
                quoteId: data.quoteId ?? `QT-${Date.now().toString().slice(-4)}`,
                rfqId: data.rfqId,
                supplier: data.supplier,
                amount: Number(data.amount),
                deliveryDate: data.deliveryDate,
                status: data.status ?? "Submitted",
                items: data.items ?? {},
            },
        });
    }
    async updateStatus(id, status) {
        return prisma.quote.update({
            where: { id },
            data: { status },
        });
    }
    async rejectOthersForRfq(rfqId, acceptedId) {
        try {
            return await prisma.quote.updateMany({
                where: {
                    rfqId,
                    id: { not: acceptedId },
                },
                data: { status: "Rejected" },
            });
        }
        catch {
            return null;
        }
    }
}
