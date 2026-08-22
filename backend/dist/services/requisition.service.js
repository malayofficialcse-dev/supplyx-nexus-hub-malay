import { RequisitionRepository } from "../repositories/requisition.repo.js";
import { RFQRepository } from "../repositories/rfq.repo.js";
import { OrderRepository } from "../repositories/order.repo.js";
import { deleteCache } from "../lib/redis.js";
import { OperationsService } from "./operations.service.js";
const requisitionRepo = new RequisitionRepository();
const rfqRepo = new RFQRepository();
const orderRepo = new OrderRepository();
const operationsService = new OperationsService();
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
        // Create durable approval work items from the active policy. The legacy
        // status field remains for compatibility with existing clients.
        await operationsService.createApprovalTasks("requisitions", newReq.id, {
            amount: data.total,
            department: data.department,
            costCenter: "Unassigned",
        });
        // Invalidate dashboard analytics cache
        await deleteCache("scm:dashboard:analytics");
        return newReq;
    }
    async approveRequisition(id, approverData) {
        const existing = await requisitionRepo.getById(id);
        if (!existing)
            throw new Error("Requisition not found");
        const decision = (approverData.decision || "approve").toLowerCase();
        const isReject = decision === "reject" || decision === "rejected";
        const approverName = approverData.name || "Manager";
        const approverRole = approverData.role || (existing.total > 10000 && existing.status.includes("L1") ? "Finance Director" : "Manager");
        const isL2Required = existing.total > 10000;
        const isCurrentlyL1Approved = existing.status.includes("Approved L1") || existing.status.includes("Finance");
        let targetStatus = "Approved";
        let level = "L1";
        if (isReject) {
            targetStatus = isL2Required && isCurrentlyL1Approved ? `Rejected L2 by ${approverName} (Finance)` : `Rejected by ${approverName}`;
            level = isL2Required && isCurrentlyL1Approved ? "L2" : "L1";
        }
        else {
            if (isL2Required) {
                if (!isCurrentlyL1Approved) {
                    targetStatus = `Approved L1 by ${approverName} (Awaiting L2 Finance)`;
                    level = "L1";
                }
                else {
                    targetStatus = `Approved L2 by ${approverName} (Final Approved)`;
                    level = "L2";
                }
            }
            else {
                targetStatus = `Approved by ${approverName}`;
                level = "L1";
            }
        }
        const existingApprovals = Array.isArray(existing.approvals) ? existing.approvals : [];
        const newApprovalEntry = {
            level,
            approver: approverName,
            role: approverRole,
            decision: isReject ? "Rejected" : "Approved",
            notes: approverData.notes || "",
            timestamp: new Date().toISOString(),
        };
        const updated = await requisitionRepo.updateApproval(id, {
            status: targetStatus,
            approvalNotes: isReject ? null : approverData.notes || existing.approvalNotes,
            rejectionReason: isReject ? approverData.notes || "Rejected by reviewer" : null,
            approvals: [...existingApprovals, newApprovalEntry],
        });
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
