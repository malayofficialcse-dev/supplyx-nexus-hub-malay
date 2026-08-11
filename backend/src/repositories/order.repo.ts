import { PrismaClient, Order } from "@prisma/client";

const prisma = new PrismaClient();

export class OrderRepository {
  async getAll(): Promise<Order[]> {
    return prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    orderId: string;
    supplier: string;
    amount: number;
    deliveryDate: string;
    status: string;
    description?: string;
    items: any;
  }): Promise<Order> {
    return prisma.order.create({
      data,
    });
  }

  async sumTotalAmount(): Promise<number> {
    const orders = await prisma.order.findMany({
      select: { amount: true },
    });
    return orders.reduce((sum, o) => sum + o.amount, 0);
  }

  async getById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { id } });
  }

  async countSubmitted(): Promise<number> {
    return prisma.order.count({
      where: { status: "Submitted" },
    });
  }
}
