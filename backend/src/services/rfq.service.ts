import { RFQ } from "@prisma/client";
import { RFQRepository } from "../repositories/rfq.repo.js";
import { deleteCache } from "../lib/redis.js";

const rfqRepo = new RFQRepository();

export class RFQService {
  async getRFQs(): Promise<RFQ[]> {
    return rfqRepo.getAll();
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
}
