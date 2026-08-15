import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export class OrderRepository {
    async getAll() {
        return prisma.order.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    async create(data) {
        return prisma.order.create({
            data,
        });
    }
    async sumTotalAmount() {
        const orders = await prisma.order.findMany({
            select: { amount: true },
        });
        return orders.reduce((sum, o) => sum + o.amount, 0);
    }
    async getById(id) {
        return prisma.order.findUnique({ where: { id } });
    }
    async getByOrderId(orderId) {
        return prisma.order.findUnique({ where: { orderId } });
    }
    async update(id, data) {
        return prisma.order.update({ where: { id }, data });
    }
    async countSubmitted() {
        return prisma.order.count({
            where: { status: "Submitted" },
        });
    }
}
