import { Requisition } from "@prisma/client";
import { RequisitionRepository } from "../repositories/requisition.repo.js";
import { RFQRepository } from "../repositories/rfq.repo.js";
import { deleteCache } from "../lib/redis.js";

const requisitionRepo = new RequisitionRepository();
const rfqRepo = new RFQRepository();

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

  async approveRequisition(id: string): Promise<Requisition> {
    const existing = await requisitionRepo.getById(id);
    if (!existing) throw new Error("Requisition not found");
    const updated = await requisitionRepo.updateStatus(id, "Approved");
    await deleteCache("scm:dashboard:analytics");
    return updated;
  }

  async createRFQFromRequisition(id: string): Promise<any> {
    const req = await requisitionRepo.getById(id);
    if (!req) throw new Error("Requisition not found");
    const rfqId = `RFQ-REF-${req.reqId}`;
    const newRfq = await rfqRepo.create({
      rfqId,
      title: `RFQ for ${req.item}`,
      department: req.department,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toDateString(),
      status: "Open",
      vendorCount: 0,
      items: { requestedItem: req.item, amount: req.amount },
    });
    return newRfq;
  }
}
