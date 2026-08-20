import { Response } from "express";
import { RequisitionService } from "../services/requisition.service.js";
import { CustomRequest } from "../middleware/auth.js";

const requisitionService = new RequisitionService();

export class RequisitionController {
  async getRequisitions(req: CustomRequest, res: Response) {
    try {
      const requisitions = await requisitionService.getRequisitions();
      return res.json(requisitions);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createRequisition(req: CustomRequest, res: Response) {
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
    } catch (error: any) {
      console.error("[requisition.create] error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async approveRequisition(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;
      const { decision, notes, approved } = req.body || {};
      if (!id) return res.status(400).json({ error: "Missing requisition id" });
      const approverName = req.user?.name || "System";
      const approverRole = req.user?.role || "Manager";
      const resolvedDecision = decision || (approved === false ? "reject" : "approve");

      const updated = await requisitionService.approveRequisition(id, {
        name: approverName,
        role: approverRole,
        decision: resolvedDecision,
        notes,
      });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createRFQFromRequisition(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Missing requisition id" });
      const userName = req.user?.name || "System";
      const newRfq = await requisitionService.createRFQFromRequisition(id, userName);
      return res.status(201).json(newRfq);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createOrderFromRequisition(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;
      const { supplier, deliveryDate } = req.body || {};
      if (!id || !supplier) return res.status(400).json({ error: "Missing required fields (id, supplier)" });
      const userName = req.user?.name || "System";
      const newOrder = await requisitionService.createOrderFromRequisition(id, supplier, deliveryDate, userName);
      return res.status(201).json(newOrder);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
