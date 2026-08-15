import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface QuoteData {
  quoteId?: string;
  rfqId: string;
  supplier: string;
  amount: number;
  deliveryDate: string;
  status?: string;
  items: any;
}

export class QuoteRepository {
  async getAll(): Promise<any[]> {
    try {
      return await (prisma as any).quote.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch {
      return [];
    }
  }

  async getById(id: string): Promise<any | null> {
    try {
      return await (prisma as any).quote.findUnique({
        where: { id },
      });
    } catch {
      return null;
    }
  }

  async getByRfqId(rfqId: string): Promise<any[]> {
    try {
      return await (prisma as any).quote.findMany({
        where: { rfqId },
        orderBy: { amount: "asc" },
      });
    } catch {
      return [];
    }
  }

  async create(data: QuoteData): Promise<any> {
    return (prisma as any).quote.create({
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

  async updateStatus(id: string, status: string): Promise<any> {
    return (prisma as any).quote.update({
      where: { id },
      data: { status },
    });
  }

  async rejectOthersForRfq(rfqId: string, acceptedId: string): Promise<any> {
    try {
      return await (prisma as any).quote.updateMany({
        where: {
          rfqId,
          id: { not: acceptedId },
        },
        data: { status: "Rejected" },
      });
    } catch {
      return null;
    }
  }
}
