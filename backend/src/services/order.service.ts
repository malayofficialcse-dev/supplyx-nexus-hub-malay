import { Order } from "@prisma/client";
import { OrderRepository } from "../repositories/order.repo.js";
import { deleteCache } from "../lib/redis.js";

const orderRepo = new OrderRepository();

export class OrderService {
  async getOrders(): Promise<Order[]> {
    return orderRepo.getAll();
  }

  async createOrder(data: {
    supplier: string;
    amount: number;
    deliveryDate: string;
    description?: string;
    items: any;
  }): Promise<Order> {
    const count = await orderRepo.getAll();
    const orderId = `PO-${1094 + count.length}`;

    const newOrder = await orderRepo.create({
      orderId,
      supplier: data.supplier,
      amount: data.amount,
      deliveryDate: data.deliveryDate,
      description: data.description,
      status: "Draft",
      items: data.items,
    });

    // Invalidate dashboard analytics cache
    await deleteCache("scm:dashboard:analytics");

    return newOrder;
  }
}
