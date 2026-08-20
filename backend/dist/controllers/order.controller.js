import { OrderService } from "../services/order.service.js";
const orderService = new OrderService();
export class OrderController {
    async getOrders(req, res) {
        try {
            const orders = await orderService.getOrders();
            return res.json(orders);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await orderService.getById(id);
            if (!order)
                return res.status(404).json({ error: "Purchase Order not found" });
            return res.json(order);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async createOrder(req, res) {
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
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    async downloadPdf(req, res) {
        try {
            const { id } = req.params;
            const pdfBuffer = await orderService.getOrderPdf(id);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=PurchaseOrder-${id}.pdf`);
            return res.send(pdfBuffer);
        }
        catch (error) {
            return res.status(404).json({ error: error.message });
        }
    }
    async threeWayMatch(req, res) {
        try {
            const { id } = req.params;
            const { invoiceId, goodsReceiptId } = req.body || {};
            if (!id)
                return res.status(400).json({ error: "Missing order ID" });
            const result = await orderService.threeWayMatch(id, invoiceId, goodsReceiptId);
            return res.json(result);
        }
        catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
}
