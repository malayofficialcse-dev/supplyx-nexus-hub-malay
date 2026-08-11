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
      const { department, item, amount } = req.body;
      if (!department || !item || !amount) {
        return res.status(400).json({ error: "Missing required fields (department, item, amount)" });
      }
      const newReq = await requisitionService.createRequisition({ department, item, amount: parseFloat(amount) });
      return res.status(201).json(newReq);
    } catch (error: any) {
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
