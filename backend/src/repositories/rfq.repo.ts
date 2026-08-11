import { PrismaClient, RFQ } from "@prisma/client";

const prisma = new PrismaClient();

export class RFQRepository {
  async getAll(): Promise<RFQ[]> {
    return prisma.rFQ.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    rfqId: string;
    title: string;
    department: string;
    deadline: string;
    status: string;
    vendorCount: number;
    items: any;
  }): Promise<RFQ> {
    return prisma.rFQ.create({
      data,
    });
  }

  async getById(id: string): Promise<RFQ | null> {
    return prisma.rFQ.findUnique({ where: { id } });
  }

  async addSupplierQuote(id: string, quote: any): Promise<RFQ> {
    const existing = await prisma.rFQ.findUnique({ where: { id } });
    const rawItems = (existing?.items as any) || {};
    const baseItems = typeof rawItems === "object" && !Array.isArray(rawItems) ? rawItems : {};
    const existingQuotes = Array.isArray((baseItems as any).quotes) ? (baseItems as any).quotes : [];
    const updatedItems = {
      ...baseItems,
      quotes: [...existingQuotes, quote],
    };
    return prisma.rFQ.update({ where: { id }, data: { items: updatedItems, vendorCount: (existing?.vendorCount || 0) + 1 } });
  }

  async countOpen(): Promise<number> {
    return prisma.rFQ.count({
      where: { status: "Open" },
    });
  }
}
