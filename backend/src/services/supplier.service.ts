import { SupplierRepository, SupplierData } from "../repositories/supplier.repo.js";
import { OrderRepository } from "../repositories/order.repo.js";
import { deleteCache } from "../lib/redis.js";
import { prisma } from "../repositories/scm.repo.js";

const supplierRepo = new SupplierRepository();
const orderRepo = new OrderRepository();

const DEFAULT_SUPPLIERS = [
  { supId: "SUP-1001", name: "brb", contact: "BRB Procurement", category: "Raw Materials", status: "Active" },
  { supId: "SUP-1002", name: "twe", contact: "TWE Industrial", category: "Hardware & Tools", status: "Active" },
  { supId: "SUP-1003", name: "BTENE", contact: "BTENE Enterprise", category: "Packaging & Supplies", status: "Active" },
  { supId: "SUP-1004", name: "Acme Corporation", contact: "John Doe", category: "Electronics & Tech", status: "Active" },
  { supId: "SUP-1005", name: "Apex Logistics", contact: "Sarah Jenkins", category: "Freight & Carrier", status: "Active" },
];

export class SupplierService {
  async getSuppliers(): Promise<any[]> {
    let list = await supplierRepo.getAll();
    if (!list || list.length === 0) {
      for (const sup of DEFAULT_SUPPLIERS) {
        try { await supplierRepo.create(sup); } catch { /* ignore dupes */ }
      }
      list = await supplierRepo.getAll();
    }
    if (!list || list.length === 0) {
      return DEFAULT_SUPPLIERS.map((s, idx) => ({ id: `sup-default-${idx}`, ...s }));
    }
    return list;
  }

  async getSupplierById(id: string): Promise<any | null> {
    return supplierRepo.getById(id);
  }

  async computeSupplierScorecard(supplierId: string): Promise<any> {
    const supplier = await supplierRepo.getById(supplierId);
    if (!supplier) throw new Error("Supplier not found");

    const allOrders = await orderRepo.getAll();
    const supplierOrders = allOrders.filter((o: any) => o.supplier === supplier.name);
    const grList = await (prisma as any).goodsReceipt
      .findMany({ where: { supplier: supplier.name } })
      .catch(() => []);

    const totalOrderValue = supplierOrders.reduce((s: number, o: any) => s + Number(o.amount ?? 0), 0);

    let onTimeCount = 0;
    let deliveredCount = 0;
    const leadTimes: number[] = [];
    for (const gr of grList) {
      const order = supplierOrders.find((o: any) => o.orderId === gr.orderId);
      if (!order) continue;
      const delivDate = new Date(gr.deliveryDate);
      const expectedDate = new Date(order.deliveryDate);
      const createdAt = new Date(order.createdAt);
      if (!isNaN(delivDate.getTime()) && !isNaN(expectedDate.getTime())) {
        deliveredCount++;
        if (delivDate <= expectedDate) onTimeCount++;
        const days = Math.ceil((delivDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
        if (days >= 0) leadTimes.push(days);
      }
    }

    const onTimeDeliveryRate = deliveredCount > 0 ? Math.round((onTimeCount / deliveredCount) * 100) : 0;
    const disputedCount = supplierOrders.filter((o: any) => /disputed|returned|rejected/i.test(o.status ?? "")).length;
    const defectRate = supplierOrders.length > 0 ? Math.round((disputedCount / supplierOrders.length) * 100) : 0;
    const avgLeadTimeDays = leadTimes.length > 0 ? Math.round(leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length) : 0;

    const leadTimeScore = Math.max(0, 100 - avgLeadTimeDays * 2);
    const overallScore = Math.round(onTimeDeliveryRate * 0.5 + (100 - defectRate) * 0.3 + leadTimeScore * 0.2);
    const rating =
      overallScore >= 85 ? "Excellent"
      : overallScore >= 70 ? "Good"
      : overallScore >= 50 ? "Satisfactory"
      : "Needs Improvement";

    try {
      await supplierRepo.update(supplierId, {
        onTimeDeliveryRate,
        defectRate,
        avgLeadTimeDays,
        totalOrderValue,
        lastScoreUpdated: new Date() as any,
      });
    } catch { /* ignore */ }

    return {
      supplier,
      scorecard: {
        onTimeDeliveryRate,
        defectRate,
        avgLeadTimeDays,
        totalOrderValue,
        overallScore,
        rating,
        totalOrders: supplierOrders.length,
        totalDeliveries: grList.length,
        lastUpdated: new Date().toISOString(),
      },
    };
  }

  async createSupplier(data: { name: string; contact?: string; email?: string; phone?: string; category?: string; status?: string }): Promise<any> {
    const existing = await supplierRepo.getAll();
    const supId = `SUP-${1001 + (existing ? existing.length : 0)}`;
    const newSupplier = await supplierRepo.create({ supId, name: data.name, contact: data.contact, email: data.email, phone: data.phone, category: data.category, status: data.status || "Active" });
    await deleteCache("scm:dashboard:analytics");
    return newSupplier;
  }

  async updateSupplier(id: string, data: Partial<SupplierData>): Promise<any> {
    const updated = await supplierRepo.update(id, data);
    await deleteCache("scm:dashboard:analytics");
    return updated;
  }

  async deleteSupplier(id: string): Promise<any> {
    const deleted = await supplierRepo.delete(id);
    await deleteCache("scm:dashboard:analytics");
    return deleted;
  }
}

// ─── Budget Service ───────────────────────────────────────────────────────────
export class BudgetService {
  async getBudgets(): Promise<any[]> {
    try {
      const list = await (prisma as any).budgetCategory.findMany({ orderBy: { category: "asc" } });
      return list.map((b: any) => ({
        ...b,
        utilization: b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0,
        remaining: Math.max(0, b.allocated - b.spent),
        status: b.spent > b.allocated ? "Over Budget" : b.spent / b.allocated >= 0.9 ? "Near Limit" : "On Track",
      }));
    } catch { return []; }
  }

  async createBudget(data: { category: string; allocated: number; spent?: number; year?: number }): Promise<any> {
    return (prisma as any).budgetCategory.create({
      data: { category: data.category, allocated: data.allocated, spent: data.spent ?? 0, year: data.year ?? new Date().getFullYear() },
    });
  }

  async updateBudget(id: string, data: Partial<{ allocated: number; spent: number; category: string }>): Promise<any> {
    return (prisma as any).budgetCategory.update({ where: { id }, data });
  }

  async deleteBudget(id: string): Promise<any> {
    return (prisma as any).budgetCategory.delete({ where: { id } });
  }

  async getBudgetSummary(): Promise<any> {
    const list = await this.getBudgets();
    const totalAllocated = list.reduce((s: number, b: any) => s + b.allocated, 0);
    const totalSpent = list.reduce((s: number, b: any) => s + b.spent, 0);
    const overBudget = list.filter((b: any) => b.spent > b.allocated).length;
    return { totalAllocated, totalSpent, remaining: totalAllocated - totalSpent, overBudget, categories: list };
  }
}
