import { Request, Response } from "express";
import { QuoteService } from "../services/quote.service.js";

const quoteService = new QuoteService();

export class QuoteController {
  async getQuotes(req: Request, res: Response) {
    try {
      const list = await quoteService.getQuotes();
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getQuotesByRfq(req: Request, res: Response) {
    try {
      const { rfqId } = req.params;
      const list = await quoteService.getQuotesByRfq(rfqId);
      return res.json(list);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createQuote(req: Request, res: Response) {
    try {
      const { rfqId, supplier, amount, deliveryDate, items } = req.body;
      if (!rfqId || !supplier || !amount) {
        return res.status(400).json({ error: "Missing required fields (rfqId, supplier, amount)" });
      }
      const created = await quoteService.createQuote({
        rfqId,
        supplier,
        amount: parseFloat(amount),
        deliveryDate: deliveryDate || new Date().toISOString().split("T")[0],
        items: items || [],
      });
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async acceptQuote(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const accepted = await quoteService.acceptQuote(id);
      return res.json(accepted);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
