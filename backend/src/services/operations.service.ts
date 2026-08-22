import crypto from "node:crypto";
import { prisma } from "../repositories/scm.repo.js";
import { ThreeWayMatchService } from "./threeWayMatch.service.js";

const db = prisma as any;

export class OperationsService {
  async listApprovalRules() { return db.approvalRule.findMany({ orderBy: { createdAt: "desc" } }); }
  async createApprovalRule(data: any) {
    return db.approvalRule.create({ data: {
      name: data.name, module: data.module || "requisitions", minAmount: data.minAmount == null ? null : Number(data.minAmount),
      maxAmount: data.maxAmount == null ? null : Number(data.maxAmount), department: data.department || null,
      category: data.category || null, costCenter: data.costCenter || null,
      levels: Array.isArray(data.levels) && data.levels.length ? data.levels : [{ level: 1, role: "Manager", slaHours: 48 }],
      active: data.active !== false,
    } });
  }
  async updateApprovalRule(id: string, data: any) { return db.approvalRule.update({ where: { id }, data }); }
  async deleteApprovalRule(id: string) { return db.approvalRule.delete({ where: { id } }); }

  async createApprovalTasks(entityType: string, entityId: string, context: any) {
    const rules = await db.approvalRule.findMany({ where: { module: entityType, active: true }, orderBy: { minAmount: "desc" } });
    const rule = rules.find((r: any) =>
      (r.minAmount == null || Number(context.amount) >= r.minAmount) &&
      (r.maxAmount == null || Number(context.amount) <= r.maxAmount) &&
      (!r.department || r.department === context.department) &&
      (!r.category || r.category === context.category) &&
      (!r.costCenter || r.costCenter === context.costCenter)
    );
    const levels = Array.isArray(rule?.levels) ? rule.levels : [{ level: 1, role: "Manager", slaHours: 48 }];
    await db.approvalTask.deleteMany({ where: { entityType, entityId, status: "Pending" } });
    return Promise.all(levels.map((level: any, index: number) => db.approvalTask.create({ data: {
      entityType, entityId, level: Number(level.level || index + 1), approverRole: String(level.role || "Manager"),
      dueAt: new Date(Date.now() + Number(level.slaHours || 48) * 3600000),
    } })));
  }
  async approvalInbox(user: any) {
    return db.approvalTask.findMany({ where: { status: "Pending", OR: [{ approverId: user?.id }, { approverId: null }] }, orderBy: { dueAt: "asc" } });
  }
  async decideApproval(id: string, actor: any, decision: string, notes?: string) {
    const task = await db.approvalTask.findUnique({ where: { id } });
    if (!task || task.status !== "Pending") throw new Error("Approval task is not pending");
    const approved = /^approve/i.test(decision);
    const updated = await db.approvalTask.update({ where: { id }, data: { status: approved ? "Approved" : "Rejected", decision, notes, approverId: actor?.id, decidedAt: new Date() } });
    await this.audit(actor, approved ? "APPROVAL_APPROVED" : "APPROVAL_REJECTED", task.entityType, task.entityId, undefined, updated, notes);
    return updated;
  }

  async runMatch(invoiceId: string, actorName: string) {
    const report = await new ThreeWayMatchService().evaluateInvoiceMatch(invoiceId);
    const invoice = await db.invoice.findFirst({ where: { OR: [{ id: invoiceId }, { invoiceId }] } });
    if (!invoice) throw new Error("Invoice not found");
    const openTypes = new Set<string>();
    for (const flag of report.flags) openTypes.add(flag.toLowerCase().includes("quantity") ? "QUANTITY" : flag.toLowerCase().includes("price") ? "PRICE" : "RECEIPT");
    await db.matchException.deleteMany({ where: { invoiceId: invoice.id, status: "Open" } });
    for (const type of openTypes) await db.matchException.create({ data: { invoiceId: invoice.id, type, message: report.flags.find((f: string) => f.toLowerCase().includes(type.toLowerCase().replace("RECEIPT", "goods receipt"))) || `Three-way match exception: ${type}` } });
    const history = await db.matchHistory.create({ data: { invoiceId: invoice.id, matchStatus: report.matchStatus, report, runBy: actorName } });
    return { report, historyId: history.id };
  }
  async listExceptions(status?: string) { return db.matchException.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" } }); }
  async resolveException(id: string, actor: any, resolution: string) {
    const result = await db.matchException.update({ where: { id }, data: { status: "Resolved", resolution, resolvedBy: actor?.name || "System", resolvedAt: new Date() } });
    await this.audit(actor, "MATCH_EXCEPTION_RESOLVED", "MatchException", id, undefined, result, resolution);
    return result;
  }

  async inviteSupplier(data: any) {
    return db.supplierPortalInvitation.create({ data: { supplierId: data.supplierId || null, supplier: data.supplier, email: data.email, token: crypto.randomBytes(24).toString("hex"), expiresAt: new Date(Date.now() + Number(data.expiresInDays || 14) * 86400000) } });
  }
  async listInvitations() { return db.supplierPortalInvitation.findMany({ orderBy: { createdAt: "desc" } }); }
  async listPortalRfqs(supplier: string) {
    const invitations = await db.rfqInvitation.findMany({ where: { supplier }, orderBy: { invitedAt: "desc" } });
    return Promise.all(invitations.map(async (i: any) => ({ ...i, rfq: await db.rFQ.findFirst({ where: { OR: [{ rfqId: i.rfqId }, { id: i.rfqId }] } }) })));
  }
  async inviteToRfq(rfqId: string, supplier: string) { return db.rFQInvitation.upsert({ where: { rfqId_supplier: { rfqId, supplier } }, update: { status: "Invited" }, create: { rfqId, supplier } }); }
  async scoreQuote(quoteId: string, data: any) {
    const price = Number(data.priceScore || 0), delivery = Number(data.deliveryScore || 0), quality = Number(data.qualityScore || 0), supplier = Number(data.supplierScore || 0);
    const total = price * 0.4 + delivery * 0.2 + quality * 0.2 + supplier * 0.2;
    return db.quoteScore.upsert({ where: { quoteId }, update: { priceScore: price, deliveryScore: delivery, qualityScore: quality, supplierScore: supplier, totalScore: total, notes: data.notes }, create: { quoteId, priceScore: price, deliveryScore: delivery, qualityScore: quality, supplierScore: supplier, totalScore: total, notes: data.notes } });
  }
  async quoteComparison(rfqId: string) {
    const quotes = await db.quote.findMany({ where: { rfqId }, orderBy: { amount: "asc" } });
    return Promise.all(quotes.map(async (q: any) => ({ ...q, score: await db.quoteScore.findUnique({ where: { quoteId: q.id } }) })));
  }

  async replenishment() {
    const items = await db.inventory.findMany({ orderBy: { quantity: "asc" } });
    const reservations = await db.inventoryReservation.findMany({ where: { status: "Reserved" } });
    return items.filter((i: any) => Number(i.quantity) - reservations.filter((r: any) => r.inventoryId === i.id).reduce((s: number, r: any) => s + Number(r.quantity), 0) <= Number(i.reorderPoint || 0)).map((i: any) => ({ ...i, available: Number(i.quantity) - reservations.filter((r: any) => r.inventoryId === i.id).reduce((s: number, r: any) => s + Number(r.quantity), 0), suggestedQuantity: Number(i.reorderQty || i.reorderPoint || 0) }));
  }
  async reserveInventory(data: any, actorName: string) {
    const inventory = await db.inventory.findUnique({ where: { id: data.inventoryId } });
    if (!inventory) throw new Error("Inventory item not found");
    const active = await db.inventoryReservation.aggregate({ where: { inventoryId: inventory.id, status: "Reserved" }, _sum: { quantity: true } });
    const available = Number(inventory.quantity) - Number(active._sum.quantity || 0);
    if (Number(data.quantity) <= 0 || Number(data.quantity) > available) throw new Error(`Insufficient available stock. Available: ${available}`);
    return db.inventoryReservation.create({ data: { inventoryId: inventory.id, quantity: Number(data.quantity), referenceType: data.referenceType || "Order", referenceId: data.referenceId, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null, createdBy: actorName } });
  }
  async releaseReservation(id: string) { return db.inventoryReservation.update({ where: { id }, data: { status: "Released" } }); }
  async transferInventory(data: any, actorName: string) {
    if (data.fromWarehouseId === data.toWarehouseId) throw new Error("Source and destination warehouses must differ");
    const count = await db.inventoryTransfer.count();
    return db.inventoryTransfer.create({ data: { transferId: `TRF-${String(1000 + count).padStart(5, "0")}`, item: data.item, sku: data.sku || null, quantity: Number(data.quantity), fromWarehouseId: data.fromWarehouseId, toWarehouseId: data.toWarehouseId, requestedBy: actorName } });
  }
  async listTransfers() { return db.inventoryTransfer.findMany({ orderBy: { createdAt: "desc" } }); }
  async listBins(warehouseId?: string) { return db.warehouseBin.findMany({ where: warehouseId ? { warehouseId } : undefined, orderBy: { code: "asc" } }); }
  async createBin(data: any) {
    return db.warehouseBin.create({ data: { warehouseId: data.warehouseId, code: data.code, name: data.name || data.code, capacity: Number(data.capacity || 0), status: data.status || "Available" } });
  }
  async createPutaway(data: any, actorName: string) {
    const count = await db.putawayTask.count();
    return db.putawayTask.create({ data: { taskId: `PUT-${String(1000 + count).padStart(5, "0")}`, goodsReceiptId: data.goodsReceiptId, inventoryId: data.inventoryId || null, binId: data.binId, quantity: Number(data.quantity), assignedTo: data.assignedTo || actorName } });
  }
  async listPutaway(status?: string) { return db.putawayTask.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" } }); }
  async completePutaway(id: string, actor: any) {
    const task = await db.putawayTask.findUnique({ where: { id } });
    if (!task || task.status === "Completed") throw new Error("Put-away task is not available");
    const result = await db.putawayTask.update({ where: { id }, data: { status: "Completed", completedAt: new Date() } });
    await this.audit(actor, "PUTAWAY_COMPLETED", "PutawayTask", id, task, result);
    return result;
  }
  async createFulfillment(data: any) { return db.fulfillmentTask.upsert({ where: { orderId: data.orderId }, update: { lines: data.lines || [], status: "Pick Pending" }, create: { orderId: data.orderId, lines: data.lines || [] } }); }
  async listFulfillment(status?: string) { return db.fulfillmentTask.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" } }); }
  async advanceFulfillment(id: string, status: string, actor: any) {
    const allowed = ["Pick Pending", "Picked", "Packed", "Shipped"];
    if (!allowed.includes(status)) throw new Error("Invalid fulfillment status");
    const data: any = { status };
    if (status === "Picked") data.pickedAt = new Date();
    if (status === "Packed") data.packedAt = new Date();
    if (status === "Shipped") data.shippedAt = new Date();
    const result = await db.fulfillmentTask.update({ where: { id }, data });
    await this.audit(actor, `FULFILLMENT_${status.toUpperCase().replace(" ", "_")}`, "FulfillmentTask", id, undefined, result);
    return result;
  }
  async createCycleCount(data: any, actorName: string) {
    const inventory = data.inventoryId ? await db.inventory.findUnique({ where: { id: data.inventoryId } }) : null;
    const count = await db.cycleCount.count();
    return db.cycleCount.create({ data: { countId: `CNT-${String(1000 + count).padStart(5, "0")}`, warehouseId: data.warehouseId, binId: data.binId || null, inventoryId: data.inventoryId || null, expectedQty: Number(inventory?.quantity || data.expectedQty || 0), countedBy: actorName } });
  }
  async listCycleCounts(status?: string) { return db.cycleCount.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" } }); }
  async submitCycleCount(id: string, countedQty: number, actor: any) {
    const count = await db.cycleCount.findUnique({ where: { id } });
    if (!count) throw new Error("Cycle count not found");
    return db.cycleCount.update({ where: { id }, data: { countedQty: Number(countedQty), variance: Number(countedQty) - Number(count.expectedQty), countedBy: actor?.name, countedAt: new Date(), status: "Pending Approval" } });
  }
  async approveCycleCount(id: string, actor: any) {
    const count = await db.cycleCount.findUnique({ where: { id } });
    if (!count || count.status !== "Pending Approval") throw new Error("Cycle count is not awaiting approval");
    const result = await db.$transaction(async (tx: any) => {
      if (count.inventoryId && count.countedQty != null) await tx.inventory.update({ where: { id: count.inventoryId }, data: { quantity: count.countedQty } });
      return tx.cycleCount.update({ where: { id }, data: { status: "Approved", approvedBy: actor?.name, approvedAt: new Date() } });
    });
    await this.audit(actor, "CYCLE_COUNT_APPROVED", "CycleCount", id, count, result);
    return result;
  }
  async createStockAdjustment(data: any, actorName: string) { const count = await db.stockAdjustment.count(); return db.stockAdjustment.create({ data: { adjustmentId: `ADJ-${String(1000 + count).padStart(5, "0")}`, inventoryId: data.inventoryId, quantity: Number(data.quantity), reason: data.reason, createdBy: actorName } }); }
  async listStockAdjustments(status?: string) { return db.stockAdjustment.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" } }); }
  async approveStockAdjustment(id: string, actor: any) {
    const adjustment = await db.stockAdjustment.findUnique({ where: { id } });
    if (!adjustment || adjustment.status !== "Pending Approval") throw new Error("Stock adjustment is not awaiting approval");
    const result = await db.$transaction(async (tx: any) => {
      const inventory = await tx.inventory.update({ where: { id: adjustment.inventoryId }, data: { quantity: { increment: adjustment.quantity } } });
      const updated = await tx.stockAdjustment.update({ where: { id }, data: { status: "Approved", approvedBy: actor?.name, approvedAt: new Date() } });
      return { adjustment: updated, inventory };
    });
    await this.audit(actor, "STOCK_ADJUSTMENT_APPROVED", "StockAdjustment", id, adjustment, result, adjustment.reason);
    return result;
  }
  async contractOverview(contractId: string) {
    const contract = await db.contract.findFirst({ where: { OR: [{ id: contractId }, { conId: contractId }] } });
    if (!contract) throw new Error("Contract not found");
    const [versions, obligations, documents, orders] = await Promise.all([
      db.contractVersion.findMany({ where: { contractId: contract.id }, orderBy: { version: "desc" } }),
      db.contractObligation.findMany({ where: { contractId: contract.id }, orderBy: { dueDate: "asc" } }),
      db.contractComplianceDocument.findMany({ where: { contractId: contract.id }, orderBy: { expiresAt: "asc" } }),
      db.order.findMany({ where: { supplier: contract.supplier } }),
    ]);
    const committedSpend = orders.reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);
    return { contract, versions, obligations, documents, committedSpend, spendLimit: contract.spendLimit, utilization: contract.spendLimit ? Math.round((committedSpend / Number(contract.spendLimit)) * 100) : null, orderCount: orders.length };
  }
  async createContractVersion(contractId: string, data: any, actorName: string) { const last = await db.contractVersion.findFirst({ where: { contractId }, orderBy: { version: "desc" } }); return db.contractVersion.create({ data: { contractId, version: Number(last?.version || 0) + 1, summary: data.summary, documentUrl: data.documentUrl, effectiveFrom: new Date(data.effectiveFrom || new Date()), effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null, status: data.status || "Draft", createdBy: actorName } }); }
  async createObligation(contractId: string, data: any) { return db.contractObligation.create({ data: { contractId, title: data.title, description: data.description, dueDate: new Date(data.dueDate), owner: data.owner || null } }); }
  async listContractAlerts() {
    const now = new Date(); const horizon = new Date(Date.now() + 90 * 86400000);
    const [documents, obligations] = await Promise.all([db.contractComplianceDocument.findMany({ where: { expiresAt: { lte: horizon } }, orderBy: { expiresAt: "asc" } }), db.contractObligation.findMany({ where: { status: "Open", dueDate: { lte: horizon } }, orderBy: { dueDate: "asc" } })]);
    return { documents: documents.map((d: any) => ({ ...d, alert: d.expiresAt < now ? "Expired" : "Expiring" })), obligations };
  }
  async budgetAvailability(budgetId: string) { const budget = await db.budgetCategory.findUnique({ where: { id: budgetId } }); if (!budget) throw new Error("Budget not found"); const reserved = await db.budgetReservation.aggregate({ where: { budgetId, status: "Reserved" }, _sum: { amount: true } }); return { ...budget, reserved: Number(reserved._sum.amount || 0), available: Number(budget.allocated) - Number(budget.spent) - Number(reserved._sum.amount || 0) }; }
  async reserveBudget(data: any, actorName: string) { const availability = await this.budgetAvailability(data.budgetId); if (Number(data.amount) > availability.available) throw new Error(`Insufficient budget availability: ${availability.available}`); return db.budgetReservation.create({ data: { budgetId: data.budgetId, requisitionId: data.requisitionId, amount: Number(data.amount), createdBy: actorName } }); }
  async listBudgetReservations(status?: string) { return db.budgetReservation.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" } }); }
  async createBudgetTransfer(data: any, actorName: string) { const count = await db.budgetTransferRequest.count(); return db.budgetTransferRequest.create({ data: { transferId: `BTR-${String(1000 + count).padStart(5, "0")}`, fromBudgetId: data.fromBudgetId, toBudgetId: data.toBudgetId, amount: Number(data.amount), reason: data.reason, requestedBy: actorName } }); }
  async listBudgetTransfers(status?: string) { return db.budgetTransferRequest.findMany({ where: status ? { status } : undefined, orderBy: { createdAt: "desc" } }); }
  async approveBudgetTransfer(id: string, actor: any) { const transfer = await db.budgetTransferRequest.findUnique({ where: { id } }); if (!transfer || transfer.status !== "Pending Approval") throw new Error("Budget transfer is not awaiting approval"); const result = await db.$transaction(async (tx: any) => { await tx.budgetCategory.update({ where: { id: transfer.fromBudgetId }, data: { allocated: { decrement: transfer.amount } } }); await tx.budgetCategory.update({ where: { id: transfer.toBudgetId }, data: { allocated: { increment: transfer.amount } } }); return tx.budgetTransferRequest.update({ where: { id }, data: { status: "Approved", approvedBy: actor?.name, approvedAt: new Date() } }); }); await this.audit(actor, "BUDGET_TRANSFER_APPROVED", "BudgetTransferRequest", id, transfer, result, transfer.reason); return result; }
  async budgetAlerts(year?: number) {
    const budgets = await db.budgetCategory.findMany({ where: year ? { year } : undefined });
    const reservations = await db.budgetReservation.findMany({ where: { status: "Reserved" } });
    return budgets.map((b: any) => { const reserved = reservations.filter((r: any) => r.budgetId === b.id).reduce((s: number, r: any) => s + Number(r.amount || 0), 0); const utilization = Number(b.allocated) ? ((Number(b.spent) + reserved) / Number(b.allocated)) * 100 : 0; return { ...b, reserved, available: Number(b.allocated) - Number(b.spent) - reserved, utilization: Math.round(utilization * 10) / 10, alert: utilization >= Number(b.alertThreshold || 80) ? utilization > 100 ? "Over Budget" : "Near Limit" : "On Track" }; }).filter((b: any) => b.alert !== "On Track");
  }
  async rolloverBudgets(fromYear: number, toYear: number, actor: any) {
    const source = await db.budgetCategory.findMany({ where: { year: fromYear, carryForward: true } });
    const result = await Promise.all(source.map((b: any) => db.budgetCategory.upsert({ where: { category: `${b.category}-${toYear}` }, update: {}, create: { category: `${b.category}-${toYear}`, allocated: Math.max(0, Number(b.allocated) - Number(b.spent)), spent: 0, year: toYear, alertThreshold: b.alertThreshold, carryForward: b.carryForward } })));
    await this.audit(actor, "BUDGET_FISCAL_ROLLOVER", "BudgetCategory", String(toYear), undefined, result, `Rolled budgets from ${fromYear}`);
    return result;
  }
  async supplierRisk(supplierId: string, actorName: string) {
    const supplier = await db.supplier.findUnique({ where: { id: supplierId } }); if (!supplier) throw new Error("Supplier not found");
    const [compliance, suppliers, orders] = await Promise.all([db.supplierComplianceCheck.findMany({ where: { supplierId } }), db.supplier.findMany(), db.order.findMany()]);
    const supplierSpend = orders.filter((o: any) => o.supplier === supplier.name).reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);
    const totalSpend = orders.reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);
    const concentrationScore = totalSpend ? Math.round((supplierSpend / totalSpend) * 100) : 0;
    const expiredDocs = compliance.filter((c: any) => c.expiresAt && new Date(c.expiresAt) < new Date()).length;
    const sanctionsStatus = compliance.some((c: any) => c.documentType.toLowerCase().includes("sanction") && c.status === "Blocked") ? "Blocked" : compliance.some((c: any) => c.documentType.toLowerCase().includes("sanction")) ? "Clear" : "Not Checked";
    const riskScore = Math.min(100, Math.round((100 - Number(supplier.onTimeDeliveryRate || 0)) * 0.25 + Number(supplier.defectRate || 0) * 0.25 + concentrationScore * 0.25 + expiredDocs * 15 + (sanctionsStatus === "Not Checked" ? 15 : sanctionsStatus === "Blocked" ? 40 : 0)));
    const financialHealth = Number(supplier.totalOrderValue || 0) > 1000000 ? "Review Required" : "Stable";
    return db.supplierRiskAssessment.create({ data: { supplierId, riskScore, sanctionsStatus, financialHealth, concentrationScore, notes: `${expiredDocs} expired compliance document(s). ${suppliers.length} suppliers assessed.`, assessedBy: actorName } });
  }
  async supplierRiskSummary() {
    const suppliers = await db.supplier.findMany();
    return Promise.all(suppliers.map(async (s: any) => await db.supplierRiskAssessment.findFirst({ where: { supplierId: s.id }, orderBy: { assessedAt: "desc" } }) || this.supplierRisk(s.id, "System")));
  }
  async supplierCompliance(supplierId?: string) { return db.supplierComplianceCheck.findMany({ where: supplierId ? { supplierId } : undefined, orderBy: { expiresAt: "asc" } }); }
  async createSupplierCompliance(data: any, actorName: string) { return db.supplierComplianceCheck.create({ data: { supplierId: data.supplierId, documentType: data.documentType, documentUrl: data.documentUrl, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null, status: data.status || "Pending", checkedBy: actorName, checkedAt: new Date() } }); }
  async audit(actor: any, action: string, entityType: string, entityId: string, beforeData?: any, afterData?: any, reason?: string) { return db.auditLog.create({ data: { actorId: actor?.id, actorName: actor?.name || "System", action, entityType, entityId, beforeData, afterData, reason } }); }
  async auditLogs(entityType?: string, entityId?: string) { return db.auditLog.findMany({ where: entityType ? { entityType, ...(entityId ? { entityId } : {}) } : undefined, orderBy: { createdAt: "desc" }, take: 500 }); }
}
