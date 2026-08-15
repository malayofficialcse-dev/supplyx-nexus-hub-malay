import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  AlertTriangle,
  ArrowUp,
  BarChart2,
  Clock,
  DollarSign,
  FileWarning,
  ShieldAlert,
  TrendingUp,
  Zap,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics Intelligence Hub — SupplyX SCM" },
      {
        name: "description",
        content:
          "Tier 3 spend analytics: monthly trends, supplier concentration risk, invoice aging, procurement cycle time and category breakdowns.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
];

function AnalyticsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/analytics/advanced"],
    queryFn: () => api.get("/analytics/advanced"),
    retry: 1,
  });

  const summary = data?.summary ?? {};
  const monthlyTrend = data?.monthlyTrend ?? [];
  const topSuppliers = data?.topSuppliers ?? [];
  const spendByCategory = data?.spendByCategory ?? [];
  const invoiceAging = data?.invoiceAging ?? [];
  const cycleStages = data?.cycleStages ?? [];
  const supplierRisk = data?.supplierRisk ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        <Zap className="mr-2 h-4 w-4 animate-pulse text-primary" />
        Please don't close the window until it gets the data
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Could not load analytics: {(error as Error).message}. Ensure the backend is running.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Analytics Intelligence Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time procurement & supply chain performance intelligence
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">
          <Zap className="h-3.5 w-3.5" /> Tier 3 Intelligence
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        <KpiCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Total PO Spend"
          value={formatCurrency(summary.totalPOSpend ?? 0)}
          color="text-primary"
          bg="bg-primary/10"
        />
        <KpiCard
          icon={<BarChart2 className="h-4 w-4" />}
          label="Invoiced"
          value={formatCurrency(summary.totalInvoiced ?? 0)}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <KpiCard
          icon={<FileWarning className="h-4 w-4" />}
          label="Overdue Bills"
          value={String(summary.overdueCount ?? 0)}
          sub={formatCurrency(summary.overdueAmount ?? 0)}
          color="text-rose-500"
          bg="bg-rose-500/10"
          urgent={summary.overdueCount > 0}
        />
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Avg Cycle Time"
          value={`${summary.avgCycleTimeDays ?? 0} days`}
          sub="Req → Payment"
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <KpiCard
          icon={<ShieldAlert className="h-4 w-4" />}
          label="Top-3 Concentration"
          value={`${summary.top3ConcentrationPct ?? 0}%`}
          sub="of total spend"
          color={(summary.top3ConcentrationPct ?? 0) > 60 ? "text-rose-500" : "text-emerald-500"}
          bg={(summary.top3ConcentrationPct ?? 0) > 60 ? "bg-rose-500/10" : "bg-emerald-500/10"}
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Active Suppliers"
          value={String(summary.activeSuppliers ?? 0)}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <KpiCard
          icon={<ArrowUp className="h-4 w-4" />}
          label="Active Contracts"
          value={String(summary.activeContracts ?? 0)}
          color="text-indigo-500"
          bg="bg-indigo-500/10"
        />
      </div>

      {/* Monthly Trend + Spend by Category */}
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Monthly PO Volume & Value" subtitle="12-month rolling window" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} />
              <YAxis yAxisId="value" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
              <YAxis yAxisId="count" orientation="right" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 4, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                formatter={(val: number, name: string) => name === "value" ? formatCurrency(val) : val}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="value" type="monotone" dataKey="value" name="Spend" stroke="var(--chart-1)" fill="url(#spendGrad)" strokeWidth={2} dot={false} />
              <Area yAxisId="count" type="monotone" dataKey="orders" name="Orders" stroke="var(--chart-2)" fill="url(#ordersGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Spend by Category" subtitle="Distribution of committed spend">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={spendByCategory.slice(0, 8)}
                dataKey="value"
                nameKey="category"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {spendByCategory.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 4, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Suppliers + Invoice Aging */}
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Top 10 Suppliers by PO Spend" subtitle="Ranked by committed purchase value" className="xl:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topSuppliers} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis type="category" dataKey="supplier" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={90} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 4, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Bar dataKey="spend" name="PO Spend" fill="var(--chart-1)" radius={[0, 3, 3, 0]} maxBarSize={18}>
                {topSuppliers.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Invoice Aging Analysis" subtitle="Outstanding payables by overdue bucket">
          <div className="space-y-2 pt-2">
            {invoiceAging.map((bucket: any, i: number) => {
              const maxAmount = Math.max(...invoiceAging.map((b: any) => b.amount), 1);
              const pct = Math.round((bucket.amount / maxAmount) * 100);
              const isOverdue = i > 0;
              return (
                <div key={bucket.bucket}>
                  <div className="flex justify-between text-[10px] font-semibold text-foreground mb-0.5">
                    <span className={isOverdue ? "text-rose-500" : "text-emerald-500"}>{bucket.bucket}</span>
                    <span className="text-muted-foreground">{bucket.count} inv · {formatCurrency(bucket.amount)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isOverdue ? "bg-rose-500" : "bg-emerald-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Procurement Cycle Time + Supplier Risk */}
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Procurement Cycle Time" subtitle="Average processing days per workflow stage">
          <div className="flex items-end gap-2 pt-4">
            {cycleStages.map((stage: any, i: number) => {
              const maxDays = Math.max(...cycleStages.map((s: any) => s.avgDays), 1);
              const heightPct = Math.round((stage.avgDays / maxDays) * 160);
              return (
                <div key={stage.stage} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-foreground">{stage.avgDays}d</span>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${heightPct}px`,
                      backgroundColor: COLORS[i % COLORS.length],
                      opacity: 0.85,
                    }}
                  />
                  <span className="text-center text-[9px] text-muted-foreground leading-tight">{stage.stage}</span>
                  <span className="text-[8px] text-muted-foreground">{stage.count} docs</span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-1.5 rounded bg-muted/30 p-2 text-[10px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            Total avg cycle: <strong className="text-foreground">{cycleStages.reduce((s: number, c: any) => s + c.avgDays, 0)} days</strong> from requisition to payment
          </div>
        </ChartCard>

        <ChartCard title="Supplier Concentration Risk" subtitle="Supply chain dependency exposure matrix">
          <div className="space-y-1.5 pt-1">
            {supplierRisk.slice(0, 8).map((s: any, i: number) => {
              const riskColor =
                s.riskScore === "High"
                  ? "text-rose-600 bg-rose-500/10 border-rose-500/20"
                  : s.riskScore === "Medium"
                    ? "text-amber-600 bg-amber-500/10 border-amber-500/20"
                    : "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
              return (
                <div key={s.supplier} className="flex items-center gap-2 rounded border border-border bg-card/50 px-2.5 py-1.5">
                  <span className="w-5 text-[10px] font-bold text-muted-foreground">#{s.rank}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-[11px] font-semibold text-foreground">{s.supplier}</div>
                    <div className="text-[9px] text-muted-foreground">{formatCurrency(s.spend)} · {s.concentration}% of spend</div>
                  </div>
                  <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.concentration}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                  <span className={`rounded-sm border px-1.5 py-0.5 text-[9px] font-bold ${riskColor}`}>
                    {s.riskScore}
                  </span>
                </div>
              );
            })}
          </div>
          {summary.top3ConcentrationPct > 60 && (
            <div className="mt-3 flex items-center gap-1.5 rounded border border-rose-500/20 bg-rose-500/10 p-2 text-[10px] text-rose-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Top-3 suppliers account for <strong>{summary.top3ConcentrationPct}%</strong> of spend — high concentration risk.</span>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Procurement Funnel Visualization */}
      <ChartCard title="Procure-to-Pay Process Funnel" subtitle="Volume conversion across the full procurement lifecycle">
        <div className="flex items-stretch gap-2 py-4 min-h-[120px]">
          {[
            { label: "Requisitions", count: cycleStages[0]?.count ?? 0, icon: "📋", color: "from-primary/80 to-primary/40" },
            { label: "RFQs Issued", count: cycleStages[1]?.count ?? 0, icon: "📑", color: "from-blue-500/80 to-blue-500/40" },
            { label: "POs Created", count: cycleStages[2]?.count ?? 0, icon: "🛒", color: "from-amber-500/80 to-amber-500/40" },
            { label: "Invoices Received", count: cycleStages[3]?.count ?? 0, icon: "🧾", color: "from-emerald-500/80 to-emerald-500/40" },
          ].map((stage, i, arr) => {
            const maxCount = Math.max(...arr.map((s) => s.count), 1);
            const heightPct = Math.round((stage.count / maxCount) * 100);
            const conversionRate = i > 0 ? (arr[i - 1].count > 0 ? Math.round((stage.count / arr[i - 1].count) * 100) : 0) : 100;
            return (
              <div key={stage.label} className="flex flex-1 flex-col items-center gap-2">
                {i > 0 && (
                  <div className="absolute mt-10 text-[9px] font-bold text-muted-foreground">
                    <ChevronRight className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={`w-full rounded bg-gradient-to-b ${stage.color} flex items-center justify-center transition-all`}
                  style={{ height: `${Math.max(heightPct, 20)}px`, minHeight: "24px" }}
                >
                  <span className="text-[11px] font-black text-white/90">{stage.count}</span>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-semibold text-foreground">{stage.icon} {stage.label}</div>
                  {i > 0 && (
                    <div className={`text-[9px] font-semibold ${conversionRate < 50 ? "text-rose-500" : conversionRate < 80 ? "text-amber-500" : "text-emerald-500"}`}>
                      {conversionRate}% conversion
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
  bg,
  urgent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
  urgent?: boolean;
}) {
  return (
    <div className={`rounded-sm border bg-card p-3 ${urgent ? "border-rose-500/30" : "border-border"}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className={`rounded p-1 ${bg} ${color}`}>{icon}</div>
        <span className="text-[10px] text-muted-foreground font-medium leading-tight">{label}</span>
      </div>
      <div className={`text-base font-extrabold ${color}`}>{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

import * as React from "react";
function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-sm border border-border bg-card p-4 ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
