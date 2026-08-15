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

  async addSupplierQuote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const quote = req.body;
      if (!id || !quote) return res.status(400).json({ error: "Missing rfq id or quote payload" });
      const updated = await rfqService.addSupplierQuote(id, quote);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getRFQById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const rfq = await rfqService.getById(id);
      if (!rfq) return res.status(404).json({ error: "RFQ not found" });
      return res.json(rfq);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async updateRFQ(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, department, deadline, status, items } = req.body;
      if (!id) return res.status(400).json({ error: "Missing rfq id" });
      const updated = await rfqService.updateRFQ(id, { title, department, deadline, status, items });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteRFQ(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Missing rfq id" });
      const deleted = await rfqService.deleteRFQ(id);
      return res.json(deleted);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async awardRFQ(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { vendor, supplierQuote } = req.body;
      const targetVendor = vendor || (supplierQuote ? (supplierQuote.vendor || supplierQuote.supplier) : null);
      if (!id || !targetVendor) return res.status(400).json({ error: "Missing rfq id or vendor name" });
      const order = await rfqService.awardRFQ(id, targetVendor);
      return res.status(201).json(order);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
