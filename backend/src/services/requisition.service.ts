import { Requisition } from "@prisma/client";
import { RequisitionRepository } from "../repositories/requisition.repo.js";
import { deleteCache } from "../lib/redis.js";

const requisitionRepo = new RequisitionRepository();

export class RequisitionService {
  async getRequisitions(): Promise<Requisition[]> {
    return requisitionRepo.getAll();
  }

  async createRequisition(data: {
    department: string;
    item: string;
    amount: number;
  }): Promise<Requisition> {
    const count = await requisitionRepo.getAll();
    const reqId = `REQ-${2042 + count.length}`;

    const newReq = await requisitionRepo.create({
      reqId,
      department: data.department,
      item: data.item,
      amount: data.amount,
      status: "Pending Approval",
    });

    // Invalidate dashboard analytics cache
    await deleteCache("scm:dashboard:analytics");

    return newReq;
  }
}
