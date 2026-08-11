import { Order } from "@prisma/client";
import { OrderRepository } from "../repositories/order.repo.js";
import { deleteCache } from "../lib/redis.js";
import { InvoiceRepository, GoodsReceiptRepository } from "../repositories/scm.repo.js";

const orderRepo = new OrderRepository();
const invoiceRepo = new InvoiceRepository();
const goodsReceiptRepo = new GoodsReceiptRepository();

export class OrderService {
  async getOrders(): Promise<Order[]> {
    return orderRepo.getAll();
  }

  async getById(id: string): Promise<Order | null> {
    return orderRepo.getById(id);
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

  async threeWayMatch(orderId: string, invoiceId: string, goodsReceiptId: string): Promise<{ matched: boolean; details: any }>
  {
    const order = await orderRepo.getById(orderId);
    const invoice = await invoiceRepo.getById(invoiceId);
    const gr = await goodsReceiptRepo.getById(goodsReceiptId);
    if (!order || !invoice || !gr) return { matched: false, details: { order, invoice, goodsReceipt: gr } };

    const orderAmount = order.amount;
    const invoiceAmount = invoice.amount;
    const grItems = Array.isArray(gr.items) ? (gr.items as any[]) : [];
    const grTotal = grItems.reduce((s: number, it: any) => s + (it?.amount || 0), 0) || 0;

    const matched = orderAmount === invoiceAmount && Math.abs(orderAmount - grTotal) < 0.01;
    return { matched, details: { orderAmount, invoiceAmount, goodsReceiptTotal: grTotal } };
  }
}
