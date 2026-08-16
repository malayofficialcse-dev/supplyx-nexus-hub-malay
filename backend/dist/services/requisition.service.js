import { RequisitionRepository } from "../repositories/requisition.repo.js";
import { RFQRepository } from "../repositories/rfq.repo.js";
import { OrderRepository } from "../repositories/order.repo.js";
import { deleteCache } from "../lib/redis.js";
const requisitionRepo = new RequisitionRepository();
const rfqRepo = new RFQRepository();
const orderRepo = new OrderRepository();
export class RequisitionService {
    async getRequisitions() {
        return requisitionRepo.getAll();
    }
    async createRequisition(data) {
        const count = await requisitionRepo.getAll();
        const reqId = `REQ-${2042 + count.length}`;
        const newReq = await requisitionRepo.create({
            reqId,
            requester: data.requester,
            department: data.department,
            costCenter: "Unassigned",
            item: data.item,
            items: { requestedItem: data.item, total: data.total },
            total: data.total,
            status: "Pending Approval",
            justification: null,
        });
        // Invalidate dashboard analytics cache
        await deleteCache("scm:dashboard:analytics");
        return newReq;
    }
    async approveRequisition(id, approverName) {
        const existing = await requisitionRepo.getById(id);
        if (!existing)
            throw new Error("Requisition not found");
        let targetStatus = `Approved by ${approverName}`;
        if (existing.total > 10000 && existing.status === "Pending Approval") {
            targetStatus = `Approved L1 by ${approverName} (Needs Finance L2)`;
        }
        const updated = await requisitionRepo.updateStatus(id, targetStatus);
        await deleteCache("scm:dashboard:analytics");
        return updated;
    }
    async createRFQFromRequisition(id, userName) {
        const req = await requisitionRepo.getById(id);
        if (!req)
            throw new Error("Requisition not found");
        const rfqId = `RFQ-REF-${req.reqId}`;
        const newRfq = await rfqRepo.create({
            rfqId,
            title: `RFQ for ${req.item}`,
            department: req.department,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toDateString(),
            status: "Open",
            vendorCount: 0,
            items: { requestedItem: req.item, total: req.total },
        });
        await requisitionRepo.updateStatus(id, `Converted by ${userName}`);
        await deleteCache("scm:dashboard:analytics");
        return newRfq;
    }
    async createOrderFromRequisition(id, supplier, deliveryDate, userName) {
        const req = await requisitionRepo.getById(id);
        if (!req)
            throw new Error("Requisition not found");
        const count = await orderRepo.getAll();
        const orderId = `PO-${1094 + count.length}`;
        const date = deliveryDate || new Date().toISOString().split("T")[0];
        const items = Array.isArray(req.items) ? req.items : [{ item: req.item, quantity: 1, amount: req.total }];
        const newOrder = await orderRepo.create({
            orderId,
            supplier,
            amount: req.total,
            deliveryDate: date,
            status: "Ordered",
            description: `Created from Requisition ${req.reqId}`,
            items,
        });
        await requisitionRepo.updateStatus(id, `Converted by ${userName || "System"}`);
        await deleteCache("scm:dashboard:analytics");
        return newOrder;
    }
}
