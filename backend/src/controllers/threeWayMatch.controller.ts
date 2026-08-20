import { Request, Response } from "express";
import { ThreeWayMatchService } from "../services/threeWayMatch.service.js";

const matchService = new ThreeWayMatchService();

export class ThreeWayMatchController {
  async getInvoiceMatchReport(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await matchService.evaluateInvoiceMatch(id);
      return res.json(report);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getMatchingSummary(req: Request, res: Response) {
    try {
      const summary = await matchService.getMatchingSummary();
      return res.json(summary);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async resolveMatch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resolution = req.body;
      const result = await matchService.resolveDiscrepancy(id, resolution);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
