import { OrderRepository } from "../repositories/order.repo.js";
import { deleteCache } from "../lib/redis.js";
import { InvoiceRepository, GoodsReceiptRepository } from "../repositories/scm.repo.js";
const orderRepo = new OrderRepository();
const invoiceRepo = new InvoiceRepository();
const goodsReceiptRepo = new GoodsReceiptRepository();
export class OrderService {
    async getOrders() {
        return orderRepo.getAll();
    }
    async getById(id) {
        return orderRepo.getById(id);
    }
    async createOrder(data) {
        const count = await orderRepo.getAll();
        const orderId = `PO-${1094 + count.length}`;
        const newOrder = await orderRepo.create({
            orderId,
            supplier: data.supplier,
            amount: data.amount,
            deliveryDate: data.deliveryDate,
            description: data.description,
            status: "Draft",
            items: data.items,
        });
        // Invalidate dashboard analytics cache
        await deleteCache("scm:dashboard:analytics");
        return newOrder;
    }
    async threeWayMatch(orderIdOrId, invoiceId, goodsReceiptId) {
        const order = (await orderRepo.getById(orderIdOrId)) ||
            (await orderRepo.getByOrderId(orderIdOrId));
        if (!order) {
            return {
                matched: false,
                status: "NOT_FOUND",
                discrepancies: [`Purchase Order '${orderIdOrId}' not found.`],
                details: { order: null, selectedGoodsReceipt: null, selectedInvoice: null },
            };
        }
        // Fetch candidate Goods Receipts
        const allGRs = await goodsReceiptRepo.getAll();
        const candidateGRs = allGRs.filter((gr) => gr.orderId === order.orderId ||
            gr.orderId === order.id ||
            (gr.supplier && gr.supplier.toLowerCase() === order.supplier.toLowerCase()));
        let selectedGR = null;
        if (goodsReceiptId) {
            selectedGR = candidateGRs.find((g) => g.id === goodsReceiptId || g.receiptId === goodsReceiptId) || null;
        }
        if (!selectedGR) {
            selectedGR =
                candidateGRs.find((g) => g.orderId === order.orderId || g.orderId === order.id) ||
                    candidateGRs[0] ||
                    null;
        }
        // Fetch candidate Invoices
        const allInvoices = await invoiceRepo.getAll();
        const candidateInvoices = allInvoices.filter((inv) => inv.supplier.toLowerCase() === order.supplier.toLowerCase());
        let selectedInvoice = null;
        if (invoiceId) {
            selectedInvoice = candidateInvoices.find((i) => i.id === invoiceId || i.invoiceId === invoiceId) || null;
        }
        if (!selectedInvoice) {
            selectedInvoice =
                candidateInvoices.find((i) => Math.abs(i.amount - order.amount) < 0.01) ||
                    candidateInvoices[0] ||
                    null;
        }
        // Calculate metrics & items
        const orderItems = Array.isArray(order.items) ? order.items : [];
        const grItems = selectedGR && Array.isArray(selectedGR.items) ? selectedGR.items : [];
        const invItems = selectedInvoice && Array.isArray(selectedInvoice.items) ? selectedInvoice.items : [];
        const orderTotalQty = orderItems.reduce((s, it) => s + (Number(it.quantity || it.qty) || 0), 0);
        const grTotalQty = grItems.reduce((s, it) => s + (Number(it.quantity || it.qty) || 0), 0);
        const grTotalAmount = grItems.reduce((s, it) => s + (Number(it.amount || it.total) || (Number(it.quantity || it.qty || 0) * Number(it.price || it.unitPrice || 0))), 0) || (selectedGR ? order.amount : 0);
        const orderAmount = order.amount || 0;
        const invoicedAmount = selectedInvoice ? selectedInvoice.amount : 0;
        const amountVariance = Number((invoicedAmount - orderAmount).toFixed(2));
        const qtyVariance = orderTotalQty - grTotalQty;
        const discrepancies = [];
        if (!selectedGR) {
            discrepancies.push(`No Goods Receipt (GR) registered for PO ${order.orderId}.`);
        }
        else {
            if (selectedGR.status === "Pending" || selectedGR.status === "Draft") {
                discrepancies.push(`Goods Receipt ${selectedGR.receiptId} is still in ${selectedGR.status} state.`);
            }
            if (qtyVariance !== 0 && orderTotalQty > 0) {
                discrepancies.push(`Quantity discrepancy: Ordered ${orderTotalQty} units vs Received ${grTotalQty} units.`);
            }
        }
        if (!selectedInvoice) {
            discrepancies.push(`No Invoice registered for supplier ${order.supplier}.`);
        }
        else {
            if (Math.abs(amountVariance) > 0.01) {
                discrepancies.push(`Financial discrepancy: Invoice amount ($${invoicedAmount.toFixed(2)}) differs from PO amount ($${orderAmount.toFixed(2)}) by $${Math.abs(amountVariance).toFixed(2)}.`);
            }
            if (selectedInvoice.status === "Draft" || selectedInvoice.status === "Rejected") {
                discrepancies.push(`Invoice ${selectedInvoice.invoiceId} is currently ${selectedInvoice.status}.`);
            }
        }
        let status = "MATCHED";
        if (!selectedGR && !selectedInvoice) {
            status = "PENDING_BOTH";
        }
        else if (!selectedGR) {
            status = "PENDING_RECEIPT";
        }
        else if (!selectedInvoice) {
            status = "PENDING_INVOICE";
        }
        else if (discrepancies.length > 0) {
            status = "DISCREPANCY";
        }
        else {
            status = "MATCHED";
        }
        return {
            matched: status === "MATCHED",
            status,
            discrepancies,
            summary: {
                orderAmount,
                receivedTotal: grTotalAmount,
                invoicedAmount,
                amountVariance,
                quantityVariance: qtyVariance,
                orderTotalQty,
                grTotalQty,
            },
            order,
            selectedGoodsReceipt: selectedGR,
            availableGoodsReceipts: candidateGRs.map((g) => ({
                id: g.id,
                receiptId: g.receiptId,
                deliveryDate: g.deliveryDate,
                status: g.status,
            })),
            selectedInvoice,
            availableInvoices: candidateInvoices.map((i) => ({
                id: i.id,
                invoiceId: i.invoiceId,
                date: i.date,
                amount: i.amount,
                status: i.status,
            })),
            itemsBreakdown: orderItems.map((item, idx) => {
                const grItem = grItems[idx] || {};
                const invItem = invItems[idx] || {};
                const orderedQty = Number(item.quantity || item.qty) || 0;
                const receivedQty = Number(grItem.quantity || grItem.qty) || (selectedGR ? orderedQty : 0);
                const unitPrice = Number(item.price || item.unitPrice) || (item.amount ? item.amount / (orderedQty || 1) : 0);
                return {
                    description: item.description || item.item || item.name || `Line item #${idx + 1}`,
                    orderedQty,
                    receivedQty,
                    unitPrice,
                    poTotal: Number((orderedQty * unitPrice).toFixed(2)) || Number(item.amount) || 0,
                    invTotal: Number(invItem.amount) || (selectedInvoice ? Number((orderedQty * unitPrice).toFixed(2)) : 0),
                    isQtyMatched: orderedQty === receivedQty,
                };
            }),
        };
    }
}
