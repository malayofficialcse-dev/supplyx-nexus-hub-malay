import { prisma } from "./repositories/scm.repo.js";

async function check() {
  const [orders, invoices, payments, requisitions, rfqs, quotes, contracts, suppliers, budgets, warehouses] = await Promise.all([
    prisma.order.findMany(),
    prisma.invoice.findMany(),
    prisma.payment.findMany(),
    prisma.requisition.findMany(),
    prisma.rFQ.findMany(),
    prisma.quote.findMany(),
    prisma.contract.findMany(),
    prisma.supplier.findMany(),
    prisma.budgetCategory.findMany(),
    prisma.warehouse.findMany(),
  ]);

  console.log("=== DB DATA DIAGNOSTIC ===");
  console.log("Orders count:", orders.length, orders.map(o => ({ id: o.orderId, amount: o.amount, date: o.createdAt })));
  console.log("Invoices count:", invoices.length, invoices.map(i => ({ id: i.invoiceId, amount: i.amount, date: i.date, createdAt: i.createdAt })));
  console.log("Payments count:", payments.length);
  console.log("Requisitions count:", requisitions.length, requisitions.map(r => ({ id: r.reqId, dept: r.department, total: r.total })));
  console.log("RFQs count:", rfqs.length);
  console.log("Contracts count:", contracts.length, contracts.map(c => ({ id: c.conId, end: c.end, status: c.status })));
  console.log("Suppliers count:", suppliers.length);
  console.log("Budgets count:", budgets.length, budgets.map(b => ({ cat: b.category, alloc: b.allocated, spent: b.spent })));
  console.log("Warehouses count:", warehouses.length, warehouses.map(w => ({ name: w.name, fill: w.fillLevel, cap: w.capacity })));
}

check().catch(console.error).finally(() => prisma.$disconnect());
