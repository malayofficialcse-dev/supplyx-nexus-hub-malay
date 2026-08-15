import { createFileRoute } from "@tanstack/react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertCircle, AlertTriangle, CheckCircle2, DollarSign, Wallet } from "lucide-react";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import type { Row } from "@/components/kit/DataTable";
import { formatCurrency, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Corporate Budgets — SupplyX SCM" },
      { name: "description", content: "Track spend utilization by category, allocations, and compliance alerts." },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  const budgetsQuery = useResourceList("/suppliers/budget");
  const budgetRows = (budgetsQuery.data ?? []) as Row[];

  const totalAllocated = budgetRows.reduce((s, r) => s + Number(r['allocated'] ?? 0), 0);
  const totalSpent = budgetRows.reduce((s, r) => s + Number(r['spent'] ?? 0), 0);
  const overBudgetCount = budgetRows.filter((r) => Number(r['spent']) > Number(r['allocated'])).length;

  const chartData = budgetRows.map((r) => ({
    name: String(r['category']),
    Allocated: Number(r['allocated']),
    Spent: Number(r['spent']),
  }));

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <DollarSign className="h-3.5 w-3.5 text-primary" /> Total Budget Allocation
          </div>
          <div className="mt-1 text-lg font-bold text-foreground">{formatCurrency(totalAllocated)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Approved fiscal limits</div>
        </div>

        <div className="rounded-sm border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Wallet className="h-3.5 w-3.5 text-emerald-500" /> Outgoing Expenditures
          </div>
          <div className="mt-1 text-lg font-bold text-foreground">{formatCurrency(totalSpent)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}% utilization rate
          </div>
        </div>

        <div className="rounded-sm border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Over Budget Categories
          </div>
          <div className="mt-1 text-lg font-bold text-foreground">{overBudgetCount} departments</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Requires audit & approvals</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="mb-4 rounded-sm border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Allocation vs Spend Analysis</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${formatNumber(v)}`} />
                <Tooltip formatter={(v) => `$${formatNumber(Number(v))}`} />
                <Bar dataKey="Allocated" fill="var(--primary)" radius={[2, 2, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Spent" fill="#e11d48" radius={[2, 2, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <CrudPage
        title="Department Budgets"
        description="Configure department ledger accounts and track spent vs allocated ceilings."
        endpoint="/suppliers/budget"
        exportName="budgets"
        labelKey="category"
        createLabel="Configure budget"
        filters={[]}
        searchKeys={["category", "year"]}
        columns={[
          { key: "category", label: "Ledger Account / Category" },
          { key: "allocated", label: "Allocated", align: "right", render: (r) => formatCurrency(r['allocated']) },
          { key: "spent", label: "Spent", align: "right", render: (r) => formatCurrency(r['spent']) },
          {
            key: "utilization",
            label: "Utilization",
            align: "right",
            render: (r) => {
              const u = Number(r['utilization'] ?? 0);
              const color = u > 100 ? "text-rose-600 font-semibold" : u >= 90 ? "text-amber-500 font-semibold" : "text-emerald-500 font-semibold";
              return <span className={color}>{u}%</span>;
            },
          },
          {
            key: "status",
            label: "Budget Compliance",
            render: (r) => {
              const status = String(r['status'] ?? "On Track");
              const bg = status === "Over Budget" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : status === "Near Limit" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
              return (
                <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold ${bg}`}>
                  {status === "Over Budget" ? <AlertCircle className="h-3 w-3" /> : status === "Near Limit" ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  {status}
                </span>
              );
            },
          },
        ]}
        fields={[
          { name: "category", label: "Department / Account Category", required: true, placeholder: "e.g. IT & Software" },
          { name: "allocated", label: "Allocated limit", type: "number", required: true, placeholder: "50000" },
          { name: "spent", label: "Spent to date", type: "number", required: false, defaultValue: 0 },
          { name: "year", label: "Fiscal year", type: "number", required: true, defaultValue: new Date().getFullYear() },
        ]}
      />
    </>
  );
}
