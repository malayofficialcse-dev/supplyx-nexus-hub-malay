import { Request, Response } from "express";
import { OrderService } from "../services/order.service.js";

const orderService = new OrderService();

export class OrderController {
  async getOrders(req: Request, res: Response) {
    try {
      const orders = await orderService.getOrders();
      return res.json(orders);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async createOrder(req: Request, res: Response) {
    try {
      const { supplier, amount, deliveryDate, description, items } = req.body;
      if (!supplier || !amount || !deliveryDate) {
        return res.status(400).json({ error: "Missing required fields (supplier, amount, deliveryDate)" });
      }
      const newOrder = await orderService.createOrder({
        supplier,
        amount: parseFloat(amount),
        deliveryDate,
        description,
        items,
      });
      return res.status(201).json(newOrder);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async threeWayMatch(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { invoiceId, goodsReceiptId } = req.body;
      if (!id || !invoiceId || !goodsReceiptId) return res.status(400).json({ error: "Missing required identifiers" });
      const result = await orderService.threeWayMatch(id, invoiceId, goodsReceiptId);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
