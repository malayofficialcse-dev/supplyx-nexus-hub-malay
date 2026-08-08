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

  async countOpen(): Promise<number> {
    return prisma.rFQ.count({
      where: { status: "Open" },
    });
  }
}
