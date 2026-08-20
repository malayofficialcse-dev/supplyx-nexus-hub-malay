import { Order } from "@prisma/client";
import { OrderRepository } from "../repositories/order.repo.js";
import { deleteCache } from "../lib/redis.js";
import { InvoiceRepository, GoodsReceiptRepository } from "../repositories/scm.repo.js";

const orderRepo = new OrderRepository();
const invoiceRepo = new InvoiceRepository();
const goodsReceiptRepo = new GoodsReceiptRepository();

export class OrderService {
  async getOrders(): Promise<Order[]> {
    return orderRepo.getAll();
  }

  async getById(id: string): Promise<Order | null> {
    return orderRepo.getById(id);
  }

  async createOrder(data: {
    supplier: string;
    amount: number;
    deliveryDate: string;
    description?: string;
    items: any;
  }): Promise<Order> {
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
    await deleteCache("scm:analytics:advanced");

    // Feature 10: Budget Auto-Tracking
    // Asynchronously match supplier's category and increment BudgetCategory.spent
    setTimeout(async () => {
      try {
        const { prisma } = await import("../repositories/scm.repo.js");
        const sup = await (prisma as any).supplier.findFirst({
          where: { name: { equals: data.supplier, mode: "insensitive" } },
        });
        const categoryName = sup?.category || data.description || "General";
        const budgetCat = await (prisma as any).budgetCategory.findFirst({
          where: { category: { equals: categoryName, mode: "insensitive" } },
        });
        if (budgetCat) {
          await (prisma as any).budgetCategory.update({
            where: { id: budgetCat.id },
            data: { spent: budgetCat.spent + Number(data.amount) },
          });
          console.log(`📊 Auto-incremented budget for '${budgetCat.category}' by $${data.amount}`);
        }

        // Feature 7: Supplier Scorecard Auto-Recomputation
        if (sup) {
          const { SupplierService } = await import("./supplier.service.js");
          const supplierService = new SupplierService();
          await supplierService.computeSupplierScorecard(sup.id);
        }
      } catch (err) {
        console.error("Budget auto-tracking / scorecard update error:", err);
      }
    }, 100);

    return newOrder;
  }

  async updateOrder(id: string, data: any): Promise<Order> {
    const updateData: any = {};
    if (data.orderId !== undefined) updateData.orderId = data.orderId;
    if (data.supplier !== undefined) updateData.supplier = data.supplier;
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
    if (data.deliveryDate !== undefined) updateData.deliveryDate = data.deliveryDate;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.items !== undefined) updateData.items = data.items;
    if (data.receivedQuantity !== undefined) updateData.receivedQuantity = parseFloat(data.receivedQuantity);

    const updated = await orderRepo.update(id, updateData);

    // Invalidate dashboard analytics cache
    await deleteCache("scm:dashboard:analytics");
    await deleteCache("scm:analytics:advanced");

    // Recalculate supplier scorecard if needed
    if (data.supplier) {
      setTimeout(async () => {
        try {
          const { prisma } = await import("../repositories/scm.repo.js");
          const sup = await (prisma as any).supplier.findFirst({
            where: { name: { equals: data.supplier, mode: "insensitive" } },
          });
          if (sup) {
            const { SupplierService } = await import("./supplier.service.js");
            const supplierService = new SupplierService();
            await supplierService.computeSupplierScorecard(sup.id);
          }
        } catch (err) {
          console.error("Scorecard recomputation error on order update:", err);
        }
      }, 100);
    }

    return updated;
  }

  async deleteOrder(id: string): Promise<Order> {
    const deleted = await orderRepo.delete(id);
    await deleteCache("scm:dashboard:analytics");
    await deleteCache("scm:analytics:advanced");
    return deleted;
  }

  async getOrderPdf(id: string): Promise<Buffer> {
    const order =
      (await orderRepo.getById(id)) ||
      (await orderRepo.getByOrderId(id));
    if (!order) {
      throw new Error("Purchase Order not found");
    }
    const { PDFService } = await import("./pdf.service.js");
    return PDFService.generatePurchaseOrderPDF(order);
  }

  async threeWayMatch(
    orderIdOrId: string,
    invoiceId?: string,
    goodsReceiptId?: string
  ): Promise<any> {
    const order =
      (await orderRepo.getById(orderIdOrId)) ||
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
    const candidateGRs = allGRs.filter(
      (gr) =>
        gr.orderId === order.orderId ||
        gr.orderId === order.id ||
        (gr.supplier && gr.supplier.toLowerCase() === order.supplier.toLowerCase())
    );

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
    const candidateInvoices = allInvoices.filter(
      (inv) => inv.supplier.toLowerCase() === order.supplier.toLowerCase()
    );

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
    const orderItems = Array.isArray(order.items) ? (order.items as any[]) : [];
    const grItems = selectedGR && Array.isArray(selectedGR.items) ? (selectedGR.items as any[]) : [];
    const invItems = selectedInvoice && Array.isArray(selectedInvoice.items) ? (selectedInvoice.items as any[]) : [];

    const orderTotalQty = orderItems.reduce((s, it) => s + (Number(it.quantity || it.qty) || 0), 0);
    const grTotalQty = grItems.reduce((s, it) => s + (Number(it.quantity || it.qty) || 0), 0);

    const grTotalAmount = grItems.reduce(
      (s, it) => s + (Number(it.amount || it.total) || (Number(it.quantity || it.qty || 0) * Number(it.price || it.unitPrice || 0))),
      0
    ) || (selectedGR ? order.amount : 0);

    const orderAmount = order.amount || 0;
    const invoicedAmount = selectedInvoice ? selectedInvoice.amount : 0;

    const amountVariance = Number((invoicedAmount - orderAmount).toFixed(2));
    const qtyVariance = orderTotalQty - grTotalQty;

    const discrepancies: string[] = [];

    if (!selectedGR) {
      discrepancies.push(`No Goods Receipt (GR) registered for PO ${order.orderId}.`);
    } else {
      if (selectedGR.status === "Pending" || selectedGR.status === "Draft") {
        discrepancies.push(`Goods Receipt ${selectedGR.receiptId} is still in ${selectedGR.status} state.`);
      }
      if (qtyVariance !== 0 && orderTotalQty > 0) {
        discrepancies.push(`Quantity discrepancy: Ordered ${orderTotalQty} units vs Received ${grTotalQty} units.`);
      }
    }

    if (!selectedInvoice) {
      discrepancies.push(`No Invoice registered for supplier ${order.supplier}.`);
    } else {
      if (Math.abs(amountVariance) > 0.01) {
        discrepancies.push(
          `Financial discrepancy: Invoice amount ($${invoicedAmount.toFixed(2)}) differs from PO amount ($${orderAmount.toFixed(2)}) by $${Math.abs(amountVariance).toFixed(2)}.`
        );
      }
      if (selectedInvoice.status === "Draft" || selectedInvoice.status === "Rejected") {
        discrepancies.push(`Invoice ${selectedInvoice.invoiceId} is currently ${selectedInvoice.status}.`);
      }
    }

    let status: "MATCHED" | "DISCREPANCY" | "PENDING_RECEIPT" | "PENDING_INVOICE" | "PENDING_BOTH" = "MATCHED";

    if (!selectedGR && !selectedInvoice) {
      status = "PENDING_BOTH";
    } else if (!selectedGR) {
      status = "PENDING_RECEIPT";
    } else if (!selectedInvoice) {
      status = "PENDING_INVOICE";
    } else if (discrepancies.length > 0) {
      status = "DISCREPANCY";
    } else {
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

  async getQuantityVarianceReport(): Promise<any> {
    const orders = await orderRepo.getAll();
    const allGRs = await goodsReceiptRepo.getAll();
    const allInvoices = await invoiceRepo.getAll();

    const reportItems = orders.map((order) => {
      const orderItems = Array.isArray(order.items) ? (order.items as any[]) : [];
      const orderedQty = orderItems.reduce((sum, it) => sum + (Number(it.quantity || it.qty) || 0), 0) || 1;

      // Find matching Goods Receipts
      const matchingGRs = allGRs.filter((gr) => gr.orderId === order.orderId || gr.orderId === order.id);
      let receivedQty = matchingGRs.reduce((sum, gr) => {
        const grItems = Array.isArray(gr.items) ? (gr.items as any[]) : [];
        return sum + grItems.reduce((s, it) => s + (Number(it.quantity || it.qty) || 0), 0);
      }, 0);

      if (receivedQty === 0 && (order.receivedQuantity || 0) > 0) {
        receivedQty = order.receivedQuantity;
      }
      if (receivedQty === 0 && order.status === "Received") {
        receivedQty = orderedQty;
      }

      // Find matching Invoices
      const matchingInvoices = allInvoices.filter(
        (inv) => inv.supplier && inv.supplier.toLowerCase() === order.supplier.toLowerCase()
      );
      const invoicedQty = matchingInvoices.reduce((sum, inv) => {
        const invItems = Array.isArray(inv.items) ? (inv.items as any[]) : [];
        return sum + invItems.reduce((s, it) => s + (Number(it.quantity || it.qty) || 0), 0);
      }, 0) || orderedQty;

      const varianceQty = Number((orderedQty - receivedQty).toFixed(2));
      const fulfillmentRate = orderedQty > 0 ? Math.min(100, Math.round((receivedQty / orderedQty) * 100)) : 100;
      const isShortfall = receivedQty > 0 && fulfillmentRate < 95;
      const isPending = receivedQty === 0 && order.status !== "Received";
      const isComplete = fulfillmentRate >= 100 || order.status === "Received";

      let status = "Complete";
      if (isPending) status = "Pending Delivery";
      else if (isShortfall) status = "Shortfall";
      else if (receivedQty > orderedQty) status = "Over-delivered";
      else if (fulfillmentRate < 100) status = "Partial Delivery";

      const unitPrice = order.amount / (orderedQty || 1);
      const varianceValue = Number((varianceQty * unitPrice).toFixed(2));

      return {
        id: order.id,
        orderId: order.orderId,
        supplier: order.supplier,
        deliveryDate: order.deliveryDate,
        amount: order.amount,
        orderedQty,
        receivedQty,
        invoicedQty,
        varianceQty,
        varianceValue: Math.max(0, varianceValue),
        fulfillmentRate,
        status,
        hasDiscrepancy: isShortfall || (receivedQty > orderedQty),
        matchingGRCount: matchingGRs.length,
        matchingInvoiceCount: matchingInvoices.length,
        createdAt: order.createdAt,
      };
    });

    const totalOrdered = reportItems.reduce((s, r) => s + r.orderedQty, 0);
    const totalReceived = reportItems.reduce((s, r) => s + r.receivedQty, 0);
    const shortfallCount = reportItems.filter((r) => r.status === "Shortfall" || (r.hasDiscrepancy && r.varianceQty > 0)).length;
    const totalShortfallValue = reportItems.reduce((s, r) => s + (r.hasDiscrepancy ? r.varianceValue : 0), 0);

    return {
      summary: {
        totalOrders: orders.length,
        totalOrdered,
        totalReceived,
        overallFulfillmentRate: totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 100,
        shortfallCount,
        totalShortfallValue,
      },
      data: reportItems,
    };
  }
}
