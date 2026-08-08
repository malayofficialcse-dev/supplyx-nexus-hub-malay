import { Request, Response } from "express";
import { RFQService } from "../services/rfq.service.js";

const rfqService = new RFQService();

export class RFQController {
  async getRFQs(req: Request, res: Response) {
    try {
      const rfqs = await rfqService.getRFQs();
      return res.json(rfqs);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createRFQ(req: Request, res: Response) {
    try {
      const { title, department, deadline, items } = req.body;
      if (!title || !department || !deadline) {
        return res.status(400).json({ error: "Missing required fields (title, department, deadline)" });
      }
      const newRfq = await rfqService.createRFQ({
        title,
        department,
        deadline,
        items,
      });
      return res.status(201).json(newRfq);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
