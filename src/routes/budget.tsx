import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics, getOrders, getInvoices, getContracts } from "@/lib/api";

export const Route = createFileRoute("/budget")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Budget & Spend Analysis | SupplyX" },
      { name: "description", content: "Procurement financial overview and variance tracking across categories and vendors." },
      { property: "og:title", content: "Budget & Spend Analysis | SupplyX" },
      { property: "og:description", content: "Procurement financial overview and variance tracking across categories and vendors." },
    ],
  }),
});

function Page() {
  const [selectedYear, setSelectedYear] = useState("FY2026");

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["dashboardAnalytics"],
    queryFn: getDashboardAnalytics,
  });

  const { data: orders } = useQuery({ queryKey: ["orders"], queryFn: getOrders });
  const { data: invoices } = useQuery({ queryKey: ["invoices"], queryFn: getInvoices });
  const { data: contracts } = useQuery({ queryKey: ["contracts"], queryFn: getContracts });

  const categories = analytics?.categories ?? [];
  const monthlyTrend = analytics?.monthlySpendTrend ?? [];

  const totalBudget = categories.reduce((sum, c) => sum + c.allocated, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const utilizationPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const activeOrders = (orders ?? []).filter((o) => o.status !== "Delivered" && o.status !== "Cancelled");
  const overdueInvoices = (invoices ?? []).filter((inv) => inv.status === "Overdue");
  const overdueValue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Build monthly spend bar chart data
  const maxMonthlySpend = Math.max(...monthlyTrend.map((m) => m.spend), 1);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">Budget &amp; Spend Analysis</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Procurement financial overview and variance tracking.</p>
          </div>
          <div className="flex gap-3 items-center">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border border-outline-variant rounded font-body-sm text-body-sm bg-surface outline-none focus:border-primary"
            >
              <option>FY2026</option>
              <option>FY2025</option>
              <option>FY2024</option>
            </select>
            <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md font-medium rounded hover:bg-surface-container transition-colors flex items-center gap-2">
              <Icon name="download" className="text-[18px]" /> Export Report
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-md text-body-md text-on-surface-variant">Total Budget</span>
              <Icon name="account_balance_wallet" className="text-outline" />
            </div>
            <div className="font-page-title text-page-title text-on-surface mb-1">
              {isLoading ? "..." : `$${(totalBudget / 1_000_000).toFixed(1)}M`}
            </div>
            <div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> Allocated ({selectedYear})
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-md text-body-md text-on-surface-variant">YTD Actual Spend</span>
              <Icon name="payments" className="text-outline" />
            </div>
            <div className="font-page-title text-page-title text-on-surface mb-1">
              {isLoading ? "..." : `$${(totalSpent / 1_000_000).toFixed(1)}M`}
            </div>
            <div className="flex items-center gap-1 font-body-sm text-body-sm">
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-medium text-[11px]">
                {utilizationPct}% of Budget
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-md text-body-md text-on-surface-variant">Remaining Budget</span>
              <Icon name="savings" className="text-outline" />
            </div>
            <div className="font-page-title text-page-title text-on-surface mb-1">
              {isLoading ? "..." : `$${(totalRemaining / 1_000_000).toFixed(1)}M`}
            </div>
            <div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span> Available to Commit
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-md text-body-md text-on-surface-variant">Overdue Invoices</span>
              <Icon name="warning" className="text-error" />
            </div>
            <div className="font-page-title text-page-title text-error mb-1">
              {isLoading ? "..." : `$${overdueValue.toLocaleString()}`}
            </div>
            <div className="flex items-center gap-1 font-body-sm text-body-sm text-error">
              <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
              {overdueInvoices.length} invoices overdue
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Monthly Spend Trend */}
          <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-xl p-container-padding shadow-sm">
            <h3 className="font-section-heading text-section-heading text-on-surface mb-4">Monthly Spend Trend</h3>
            {monthlyTrend.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-on-surface-variant font-body-sm">Loading chart data...</div>
            ) : (
              <div className="flex items-end gap-2 h-48">
                {monthlyTrend.map((m, idx) => {
                  const pct = maxMonthlySpend > 0 ? (m.spend / maxMonthlySpend) * 100 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="relative w-full">
                        <div
                          className="w-full bg-primary rounded-t transition-all duration-500 group-hover:bg-primary/80"
                          style={{ height: `${Math.max(pct * 1.6, 4)}px` }}
                        />
                      </div>
                      <span className="text-[10px] font-data-mono text-on-surface-variant">{m.month.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-4 bg-surface border border-outline-variant rounded-xl p-container-padding shadow-sm">
            <h3 className="font-section-heading text-section-heading text-on-surface mb-4">Spend by Category</h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-on-surface-variant font-body-sm text-body-sm">Loading...</div>
              ) : (
                categories.slice(0, 5).map((cat, idx) => {
                  const pct = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
                  const colors = ["bg-primary", "bg-secondary", "bg-tertiary-container", "bg-[#F59E0B]", "bg-[#EF4444]"];
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-body-sm mb-1">
                        <span className="text-on-surface font-medium">{cat.category}</span>
                        <span className="font-data-mono text-on-surface-variant">{pct}%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${colors[idx % colors.length]} transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-on-surface-variant mt-0.5">
                        <span>${cat.spent.toLocaleString()} spent</span>
                        <span>of ${cat.allocated.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Supplier Contract Spend Table */}
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-section-heading text-section-heading text-on-surface">Active Contract Commitments</h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{(contracts ?? []).length} contracts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-outline-variant">
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Supplier</th>
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Contract ID</th>
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Start</th>
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Expires</th>
                  <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {(contracts ?? []).map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-10">
                    <td className="px-4 py-2 font-body-sm text-body-sm font-medium text-on-surface">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {c.initials}
                        </div>
                        {c.supplier}
                      </div>
                    </td>
                    <td className="px-4 py-2 font-data-mono text-data-mono text-on-surface-variant">{c.conId}</td>
                    <td className="px-4 py-2 font-body-sm text-body-sm text-on-surface-variant">{c.start}</td>
                    <td className="px-4 py-2 font-body-sm text-body-sm text-on-surface-variant">{c.end}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        c.status === "Active"
                          ? "bg-[#DCFCE7] text-[#16A34A]"
                          : c.status === "Expiring"
                            ? "bg-[#FEF9C3] text-[#CA8A04]"
                            : "bg-[#F1F5F9] text-[#475569]"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
