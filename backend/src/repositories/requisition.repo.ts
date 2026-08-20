import { PrismaClient, Requisition } from "@prisma/client";

const prisma = new PrismaClient();

export class RequisitionRepository {
  async getAll(): Promise<Requisition[]> {
    return prisma.requisition.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async create(data: {
    reqId: string;
    requester: string;
    department: string;
    costCenter: string;
    item: string;
    items: any;
    total: number;
    status: string;
    justification?: string | null;
  }): Promise<Requisition> {
    return prisma.requisition.create({
      data,
    });
  }

  async getById(id: string): Promise<Requisition | null> {
    return prisma.requisition.findUnique({ where: { id } });
  }

  async updateStatus(id: string, status: string): Promise<Requisition> {
    return prisma.requisition.update({ where: { id }, data: { status } });
  }

  async updateApproval(id: string, data: { status: string; approvalNotes?: string | null; rejectionReason?: string | null; approvals?: any }): Promise<Requisition> {
    return prisma.requisition.update({ where: { id }, data });
  }

  async countPending(): Promise<number> {
    return prisma.requisition.count({
      where: { status: "Pending Approval" },
    });
  }
}
