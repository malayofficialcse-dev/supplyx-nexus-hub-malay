import { prisma } from "../repositories/scm.repo.js";

export type MatchStatus =
  | "PERFECT_MATCH"
  | "QUANTITY_MISMATCH"
  | "PRICE_MISMATCH"
  | "GRN_PENDING"
  | "QA_REJECTED"
  | "UNLINKED_PO";

export interface LineItemMatch {
  item: string;
  poQuantity: number;
  grnReceivedQuantity: number;
  grnPassedQuantity: number;
  invoicedQuantity: number;
  poUnitPrice: number;
  invoicedUnitPrice: number;
  quantityVariance: number;
  priceVariance: number;
  amountVariance: number;
  status: "MATCHED" | "QTY_MISMATCH" | "PRICE_MISMATCH" | "QA_FAIL" | "NO_GRN";
}

export interface MatchReport {
  invoiceId: string;
  invoiceNumber: string;
  supplier: string;
  invoiceAmount: number;
  invoiceDate: string;
  poNumber: string | null;
  poAmount: number | null;
  grnNumber: string | null;
  grnDate: string | null;
  matchStatus: MatchStatus;
  toleranceApplied: boolean;
  totalQuantityVariance: number;
  totalPriceVariance: number;
  totalAmountVariance: number;
  flags: string[];
  recommendedAction: "AUTO_APPROVE" | "HOLD_FOR_GRN" | "REQUEST_CREDIT_NOTE" | "PRICE_OVERRIDE_REVIEW";
  lineItems: LineItemMatch[];
}

export class ThreeWayMatchService {
  /**
   * Run 3-Way & 4-Way Matching Engine for a single invoice
   */
  async evaluateInvoiceMatch(invoiceId: string): Promise<MatchReport> {
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [{ id: invoiceId }, { invoiceId: invoiceId }],
      },
    });

    if (!invoice) {
      throw new Error(`Invoice with ID "${invoiceId}" not found.`);
    }

    const rawInvoiceItems = Array.isArray(invoice.items) ? (invoice.items as any[]) : [];
    const invoiceItems = rawInvoiceItems.map((item) => ({
      item: String(item.item || item.description || item.name || "Item"),
      quantity: Number(item.quantity || 1),
      price: Number(item.price || item.unitPrice || item.amount || invoice.amount),
      amount: Number(item.amount || (item.quantity ? item.quantity * item.price : invoice.amount)),
    }));

    // 1. Locate Associated Purchase Order
    // In our system, invoices can reference orderId in metadata or match by supplier and items
    const orders = await prisma.order.findMany({
      where: {
        supplier: invoice.supplier,
      },
      orderBy: { createdAt: "desc" },
    });

    let matchedOrder = orders.find((o) => {
      const orderItems = Array.isArray(o.items) ? (o.items as any[]) : [];
      return (
        orderItems.some((oi) => invoiceItems.some((ii) => ii.item.toLowerCase().includes(String(oi.item).toLowerCase()))) ||
        Math.abs(Number(o.amount) - Number(invoice.amount)) < 1
      );
    });

    if (!matchedOrder && orders.length > 0) {
      matchedOrder = orders[0];
    }

    if (!matchedOrder) {
      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceId,
        supplier: invoice.supplier,
        invoiceAmount: Number(invoice.amount),
        invoiceDate: invoice.date || invoice.createdAt.toISOString().slice(0, 10),
        poNumber: null,
        poAmount: null,
        grnNumber: null,
        grnDate: null,
        matchStatus: "UNLINKED_PO",
        toleranceApplied: false,
        totalQuantityVariance: 0,
        totalPriceVariance: 0,
        totalAmountVariance: Number(invoice.amount),
        flags: ["No authorized Purchase Order found matching supplier invoice. Rogue spend flagged."],
        recommendedAction: "PRICE_OVERRIDE_REVIEW",
        lineItems: [],
      };
    }

    const rawPoItems = Array.isArray(matchedOrder.items) ? (matchedOrder.items as any[]) : [];
    const poItems = rawPoItems.map((p) => ({
      item: String(p.item || "Item"),
      quantity: Number(p.quantity || 1),
      price: Number(p.price || p.unitPrice || (matchedOrder!.amount / (p.quantity || 1))),
      amount: Number(p.amount || (p.quantity && p.price ? p.quantity * p.price : matchedOrder!.amount)),
    }));

    // 2. Locate Goods Receipt Notes (GRN) for the PO
    const goodsReceipts = await prisma.goodsReceipt.findMany({
      where: {
        OR: [{ orderId: matchedOrder.orderId }, { orderId: matchedOrder.id }],
      },
      orderBy: { createdAt: "desc" },
    });

    const latestGrn = goodsReceipts[0] ?? null;
    const rawGrnItems = latestGrn && Array.isArray(latestGrn.items) ? (latestGrn.items as any[]) : [];

    // 3. Line-Item Comparison Matrix
    const lineItemMatches: LineItemMatch[] = [];
    const flags: string[] = [];
    let hasQtyMismatch = false;
    let hasPriceMismatch = false;
    let hasQaFail = false;
    let totalQtyVar = 0;
    let totalPriceVar = 0;
    let totalAmtVar = 0;

    for (const invItem of invoiceItems) {
      // Match with PO line item
      const poItem = poItems.find(
        (p) => p.item.toLowerCase().includes(invItem.item.toLowerCase()) || invItem.item.toLowerCase().includes(p.item.toLowerCase())
      ) || poItems[0] || { item: invItem.item, quantity: invItem.quantity, price: invItem.price, amount: invItem.amount };

      // Match with GRN line item
      const grnItem = rawGrnItems.find(
        (g: any) => String(g.item || "").toLowerCase().includes(invItem.item.toLowerCase())
      ) || rawGrnItems[0] || null;

      const poQty = Number(poItem.quantity || 1);
      const poPrice = Number(poItem.price || invItem.price);
      const invQty = Number(invItem.quantity || 1);
      const invPrice = Number(invItem.price || (invItem.amount / invQty));

      const grnReceived = grnItem ? Number(grnItem.received ?? grnItem.quantity ?? poQty) : 0;
      const grnPassed = grnItem ? Number(grnItem.passed ?? grnItem.received ?? poQty) : 0;

      const qtyVar = invQty - (latestGrn ? grnPassed : 0);
      const priceVar = invPrice - poPrice;
      const expectedLineAmount = (latestGrn ? grnPassed : poQty) * poPrice;
      const amtVar = Number(invItem.amount) - expectedLineAmount;

      totalQtyVar += qtyVar;
      totalPriceVar += priceVar;
      totalAmtVar += amtVar;

      let itemStatus: LineItemMatch["status"] = "MATCHED";

      if (!latestGrn) {
        itemStatus = "NO_GRN";
      } else if (grnPassed < grnReceived) {
        itemStatus = "QA_FAIL";
        hasQaFail = true;
        flags.push(`Quality defect: ${grnReceived - grnPassed} units of "${invItem.item}" failed QA inspection.`);
      } else if (invQty > grnPassed) {
        itemStatus = "QTY_MISMATCH";
        hasQtyMismatch = true;
        flags.push(`Billed quantity (${invQty}) exceeds warehouse accepted quantity (${grnPassed}) for "${invItem.item}".`);
      } else if (Math.abs(priceVar) > 0.05 && invPrice > poPrice) {
        itemStatus = "PRICE_MISMATCH";
        hasPriceMismatch = true;
        flags.push(`Billed unit price ($${invPrice.toFixed(2)}) exceeds PO contracted rate ($${poPrice.toFixed(2)}) for "${invItem.item}".`);
      }

      lineItemMatches.push({
        item: invItem.item,
        poQuantity: poQty,
        grnReceivedQuantity: grnReceived,
        grnPassedQuantity: grnPassed,
        invoicedQuantity: invQty,
        poUnitPrice: poPrice,
        invoicedUnitPrice: invPrice,
        quantityVariance: qtyVar,
        priceVariance: priceVar,
        amountVariance: amtVar,
        status: itemStatus,
      });
    }

    // 4. Overall Match Status Calculation
    let matchStatus: MatchStatus = "PERFECT_MATCH";
    let recommendedAction: MatchReport["recommendedAction"] = "AUTO_APPROVE";
    let toleranceApplied = false;

    // Financial tolerance: ±1.5% or ±$5.00
    const variancePct = matchedOrder.amount > 0 ? (Math.abs(totalAmtVar) / matchedOrder.amount) * 100 : 0;
    const isWithinTolerance = Math.abs(totalAmtVar) <= 5.0 || variancePct <= 1.5;

    if (!latestGrn) {
      matchStatus = "GRN_PENDING";
      recommendedAction = "HOLD_FOR_GRN";
      flags.push("Invoice received before warehouse Goods Receipt Note has been logged.");
    } else if (hasQaFail) {
      matchStatus = "QA_REJECTED";
      recommendedAction = "REQUEST_CREDIT_NOTE";
      flags.push("QA inspection rejection detected. Payment blocked until credit memo issuance.");
    } else if (hasQtyMismatch) {
      if (isWithinTolerance) {
        matchStatus = "PERFECT_MATCH";
        toleranceApplied = true;
        recommendedAction = "AUTO_APPROVE";
        flags.push("Minor quantity variance accepted within corporate ±1.5% tolerance threshold.");
      } else {
        matchStatus = "QUANTITY_MISMATCH";
        recommendedAction = "REQUEST_CREDIT_NOTE";
      }
    } else if (hasPriceMismatch) {
      if (isWithinTolerance) {
        matchStatus = "PERFECT_MATCH";
        toleranceApplied = true;
        recommendedAction = "AUTO_APPROVE";
        flags.push("Minor price variance accepted within corporate ±1.5% tolerance threshold.");
      } else {
        matchStatus = "PRICE_MISMATCH";
        recommendedAction = "PRICE_OVERRIDE_REVIEW";
      }
    }

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceId,
      supplier: invoice.supplier,
      invoiceAmount: Number(invoice.amount),
      invoiceDate: invoice.date || invoice.createdAt.toISOString().slice(0, 10),
      poNumber: matchedOrder.orderId,
      poAmount: Number(matchedOrder.amount),
      grnNumber: latestGrn ? latestGrn.receiptId : null,
      grnDate: latestGrn ? (latestGrn.deliveryDate || latestGrn.createdAt.toISOString().slice(0, 10)) : null,
      matchStatus,
      toleranceApplied,
      totalQuantityVariance: totalQtyVar,
      totalPriceVariance: totalPriceVar,
      totalAmountVariance: totalAmtVar,
      flags,
      recommendedAction,
      lineItems: lineItemMatches,
    };
  }

  /**
   * System-wide matching dashboard summary
   */
  async getMatchingSummary() {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
    });

    const reports: MatchReport[] = [];
    for (const inv of invoices) {
      try {
        const rep = await this.evaluateInvoiceMatch(inv.id);
        reports.push(rep);
      } catch {
        // Continue
      }
    }

    const perfectMatches = reports.filter((r) => r.matchStatus === "PERFECT_MATCH");
    const qtyMismatches = reports.filter((r) => r.matchStatus === "QUANTITY_MISMATCH");
    const priceMismatches = reports.filter((r) => r.matchStatus === "PRICE_MISMATCH");
    const grnPending = reports.filter((r) => r.matchStatus === "GRN_PENDING");
    const qaRejections = reports.filter((r) => r.matchStatus === "QA_REJECTED");
    const unlinked = reports.filter((r) => r.matchStatus === "UNLINKED_PO");

    const totalBlockedAmount = reports
      .filter((r) => r.matchStatus !== "PERFECT_MATCH")
      .reduce((sum, r) => sum + r.invoiceAmount, 0);

    const matchRatePct = reports.length > 0 ? Math.round((perfectMatches.length / reports.length) * 100) : 100;

    return {
      totalEvaluated: reports.length,
      matchRatePct,
      totalBlockedAmount,
      breakdown: {
        perfectMatchCount: perfectMatches.length,
        qtyMismatchCount: qtyMismatches.length,
        priceMismatchCount: priceMismatches.length,
        grnPendingCount: grnPending.length,
        qaRejectedCount: qaRejections.length,
        unlinkedCount: unlinked.length,
      },
      reports,
    };
  }

  /**
   * Discrepancy Resolution Action
   */
  async resolveDiscrepancy(invoiceId: string, resolution: { action: string; note?: string; overrideAmount?: number }) {
    const invoice = await prisma.invoice.findFirst({
      where: { OR: [{ id: invoiceId }, { invoiceId: invoiceId }] },
    });

    if (!invoice) {
      throw new Error(`Invoice "${invoiceId}" not found.`);
    }

    if (resolution.action === "APPROVE_OVERRIDE") {
      const updated = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "Approved",
          amount: resolution.overrideAmount !== undefined ? resolution.overrideAmount : invoice.amount,
        },
      });
      return { success: true, message: "Invoice approved with price override authorization.", invoice: updated };
    }

    if (resolution.action === "CREDIT_NOTE_REQUESTED") {
      const updated = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "Credit Note Requested",
        },
      });
      return { success: true, message: "Debit Memo / Credit Note deduction ticket created.", invoice: updated };
    }

    return { success: true, message: `Discrepancy marked as ${resolution.action}.` };
  }
}
