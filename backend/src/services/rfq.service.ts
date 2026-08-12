import { RFQ } from "@prisma/client";
import { RFQRepository } from "../repositories/rfq.repo.js";
import { deleteCache } from "../lib/redis.js";
import { OrderService } from "./order.service.js";

const rfqRepo = new RFQRepository();
const orderService = new OrderService();

export class RFQService {
  async getRFQs(): Promise<RFQ[]> {
    return rfqRepo.getAll();
  }

  async getById(id: string): Promise<RFQ | null> {
    return rfqRepo.getById(id);
  }

  async createRFQ(data: {
    title: string;
    department: string;
    deadline: string;
    items: any;
  }): Promise<RFQ> {
    const count = await rfqRepo.getAll();
    const rfqId = `RFQ-2026-${String(3 + count.length).padStart(3, "0")}`;

    const newRfq = await rfqRepo.create({
      rfqId,
      title: data.title,
      department: data.department,
      deadline: data.deadline,
      status: "Draft",
      vendorCount: 0,
      items: data.items,
    });

    // Invalidate dashboard analytics cache
    await deleteCache("scm:dashboard:analytics");

    return newRfq;
  }

  async addSupplierQuote(rfqId: string, quote: any): Promise<RFQ> {
    const updated = await rfqRepo.addSupplierQuote(rfqId, quote);
    await deleteCache("scm:dashboard:analytics");
    return updated;
  }

  async updateRFQ(id: string, data: Partial<Omit<RFQ, "id" | "rfqId">>): Promise<RFQ> {
    const updated = await rfqRepo.update(id, data);
    await deleteCache("scm:dashboard:analytics");
    return updated;
  }

  async deleteRFQ(id: string): Promise<RFQ> {
    const deleted = await rfqRepo.delete(id);
    await deleteCache("scm:dashboard:analytics");
    return deleted;
  }

  async awardRFQ(rfqId: string, supplierQuote: any): Promise<any> {
    // create order based on supplierQuote
    const newOrder = await orderService.createOrder({
      supplier: supplierQuote.supplier,
      amount: supplierQuote.amount,
      deliveryDate: supplierQuote.deliveryDate || new Date().toDateString(),
      description: `Awarded from RFQ ${rfqId}`,
      items: supplierQuote.items || [],
    });
    return newOrder;
  }
}
