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
  async audit(actor: any, action: string, entityType: string, entityId: string, beforeData?: any, afterData?: any, reason?: string) { return db.auditLog.create({ data: { actorId: actor?.id, actorName: actor?.name || "System", action, entityType, entityId, beforeData, afterData, reason } }); }
  async auditLogs(entityType?: string, entityId?: string) { return db.auditLog.findMany({ where: entityType ? { entityType, ...(entityId ? { entityId } : {}) } : undefined, orderBy: { createdAt: "desc" }, take: 500 }); }
}
