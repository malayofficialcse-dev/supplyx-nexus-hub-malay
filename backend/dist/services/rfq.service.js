import { RFQRepository } from "../repositories/rfq.repo.js";
import { deleteCache } from "../lib/redis.js";
import { OrderService } from "./order.service.js";
const rfqRepo = new RFQRepository();
const orderService = new OrderService();
export class RFQService {
    async getRFQs() {
        return rfqRepo.getAll();
    }
    async getById(id) {
        return rfqRepo.getById(id);
    }
    async createRFQ(data) {
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
    async addSupplierQuote(rfqId, quote) {
        const updated = await rfqRepo.addSupplierQuote(rfqId, quote);
        await deleteCache("scm:dashboard:analytics");
        return updated;
    }
    async updateRFQ(id, data) {
        const updated = await rfqRepo.update(id, data);
        await deleteCache("scm:dashboard:analytics");
        return updated;
    }
    async deleteRFQ(id) {
        const deleted = await rfqRepo.delete(id);
        await deleteCache("scm:dashboard:analytics");
        return deleted;
    }
    async awardRFQ(id, vendor) {
        const rfq = await rfqRepo.getById(id);
        if (!rfq)
            throw new Error("RFQ not found");
        const rawItems = rfq.items || {};
        const quotes = Array.isArray(rawItems.quotes) ? rawItems.quotes : [];
        const quote = quotes.find((q) => String(q.vendor || q.supplier).toLowerCase() === vendor.toLowerCase());
        const amount = quote ? Number(quote.amount || 0) : 0;
        const items = quote && Array.isArray(quote.items) ? quote.items : [{ item: rfq.title, quantity: 1, amount }];
        const newOrder = await orderService.createOrder({
            supplier: quote ? (quote.vendor || quote.supplier) : vendor,
            amount,
            deliveryDate: quote ? (quote.deliveryDate || new Date().toDateString()) : new Date().toDateString(),
            description: `Awarded from RFQ ${rfq.rfqId}`,
            items,
        });
        await rfqRepo.update(id, { status: "Closed" });
        await deleteCache("scm:dashboard:analytics");
        return newOrder;
    }
}
