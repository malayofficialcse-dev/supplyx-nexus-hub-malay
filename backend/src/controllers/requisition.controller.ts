import { Request, Response } from "express";
import { RequisitionService } from "../services/requisition.service.js";

const requisitionService = new RequisitionService();

export class RequisitionController {
  async getRequisitions(req: Request, res: Response) {
    try {
      const requisitions = await requisitionService.getRequisitions();
      return res.json(requisitions);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createRequisition(req: Request, res: Response) {
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

      const newReq = await requisitionService.createRequisition({ department, item, total: numericTotal });
      return res.status(201).json(newReq);
    } catch (error: any) {
      console.error("[requisition.create] error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async approveRequisition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Missing requisition id" });
      const updated = await requisitionService.approveRequisition(id);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createRFQFromRequisition(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Missing requisition id" });
      const newRfq = await requisitionService.createRFQFromRequisition(id);
      return res.status(201).json(newRfq);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
