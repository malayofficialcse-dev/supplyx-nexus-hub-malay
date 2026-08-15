import { QuoteRepository, QuoteData } from "../repositories/quote.repo.js";
import { OrderRepository } from "../repositories/order.repo.js";
import { prisma } from "../repositories/scm.repo.js";
import { deleteCache } from "../lib/redis.js";

const quoteRepo = new QuoteRepository();
const orderRepo = new OrderRepository();

export class QuoteService {
  async getQuotes(): Promise<any[]> {
    return quoteRepo.getAll();
  }

  async getQuotesByRfq(rfqId: string): Promise<any[]> {
    return quoteRepo.getByRfqId(rfqId);
  }

  async createQuote(data: QuoteData): Promise<any> {
    const quote = await quoteRepo.create(data);
    
    // Invalidate dashboard/analytics cache
    await deleteCache("scm:dashboard:analytics");
    return quote;
  }

  async acceptQuote(id: string): Promise<any> {
    const quote = await quoteRepo.getById(id);
    if (!quote) throw new Error("Quote not found");

    // 1. Update quote status to Accepted
    const accepted = await quoteRepo.updateStatus(id, "Accepted");

    // 2. Reject other quotes for the same RFQ
    await quoteRepo.rejectOthersForRfq(quote.rfqId, id);

    // 3. Create Purchase Order from accepted quote
    const count = await orderRepo.getAll();
    const orderId = `PO-${1094 + count.length}`;
    
    // Coerce items into standard format
    const items = quote.items && typeof quote.items === "object" ? quote.items : { item: "RFQ Materials", quantity: 1, amount: quote.amount };
    const itemsList = Array.isArray(items) ? items : [items];

    await orderRepo.create({
      orderId,
      supplier: quote.supplier,
      amount: quote.amount,
      deliveryDate: quote.deliveryDate,
      status: "Ordered",
      description: `Auto-generated from Accepted Quote ${quote.quoteId} for RFQ ${quote.rfqId}`,
      items: itemsList,
    });

    // 4. Update RFQ status to Closed
    try {
      await (prisma as any).rFQ.update({
        where: { rfqId: quote.rfqId },
        data: { status: "Closed" },
      });
    } catch {
      // If RFQ is identified by id uuid or different field
      try {
        await (prisma as any).rFQ.updateMany({
          where: { rfqId: quote.rfqId },
          data: { status: "Closed" },
        });
      } catch {
        // ignore
      }
    }

    await deleteCache("scm:dashboard:analytics");
    return accepted;
  }
}
