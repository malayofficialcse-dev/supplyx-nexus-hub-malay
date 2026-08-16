import { RequisitionService } from "../services/requisition.service.js";
const requisitionService = new RequisitionService();
export class RequisitionController {
    async getRequisitions(req, res) {
        try {
            const requisitions = await requisitionService.getRequisitions();
            return res.json(requisitions);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createRequisition(req, res) {
        try {
            const { department, item, total, amount } = req.body;
            const resolvedTotal = total ?? amount;
            console.log("[requisition.create] body:", req.body);
            if (!department || !item || resolvedTotal === undefined) {
                return res.status(400).json({ error: "Missing required fields (department, item, total or amount)" });
            }
            const numericTotal = typeof resolvedTotal === "string" ? parseFloat(resolvedTotal) : Number(resolvedTotal);
            if (Number.isNaN(numericTotal)) {
                return res.status(400).json({ error: "Invalid total value" });
            }
            const requester = req.user?.name || "System";
            const newReq = await requisitionService.createRequisition({
                department,
                item,
                total: numericTotal,
                requester,
            });
            return res.status(201).json(newReq);
        }
        catch (error) {
            console.error("[requisition.create] error:", error);
            return res.status(500).json({ error: error.message });
        }
    }
    async approveRequisition(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ error: "Missing requisition id" });
            const approverName = req.user?.name || "System";
            const updated = await requisitionService.approveRequisition(id, approverName);
            return res.json(updated);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createRFQFromRequisition(req, res) {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ error: "Missing requisition id" });
            const userName = req.user?.name || "System";
            const newRfq = await requisitionService.createRFQFromRequisition(id, userName);
            return res.status(201).json(newRfq);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createOrderFromRequisition(req, res) {
        try {
            const { id } = req.params;
            const { supplier, deliveryDate } = req.body || {};
            if (!id || !supplier)
                return res.status(400).json({ error: "Missing required fields (id, supplier)" });
            const userName = req.user?.name || "System";
            const newOrder = await requisitionService.createOrderFromRequisition(id, supplier, deliveryDate, userName);
            return res.status(201).json(newOrder);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
