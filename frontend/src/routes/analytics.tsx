import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
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
  LineChart,
  Line,
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
  Filter,
  Layers,
  FileText,
  FileSpreadsheet,
  ShoppingCart,
  Truck,
  CreditCard,
  Building2,
  FileSignature,
  Percent,
  RefreshCw,
  Warehouse,
  Download,
  Award,
  CheckCircle2,
  PackageX,
  ExternalLink,
  Boxes,
} from "lucide-react";
import * as React from "react";
import { api } from "@/lib/api";
import { downloadExcelMatrix, formatCurrency } from "@/lib/format";
import { Button } from "@/components/kit/Button";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics Intelligence Hub — SupplyX SCM" },
      {
        name: "description",
        content:
          "End-to-end supply chain analytics across requisitions, RFQs, purchase orders, logistics, invoices, payments, and budgets.",
      },
    ],
  }),
  component: AnalyticsPage,
});

const PALETTE = [
  "#3b82f6", // Sky blue
  "#10b981", // Emerald green
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#6366f1", // Indigo
];

type ModuleTab = "all" | "s2p" | "orders" | "financials" | "logistics" | "savings";

function AnalyticsPage() {
  const [activeTab, setActiveTab] = React.useState<ModuleTab>("all");
  const [timeframe, setTimeframe] = React.useState<"all" | "12m" | "90d" | "30d" | "ytd">("12m");
  const [selectedDept, setSelectedDept] = React.useState<string>("all");

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["/analytics/advanced", timeframe, selectedDept],
    queryFn: () =>
      api.get(
        `/analytics/advanced?timeframe=${timeframe}&department=${encodeURIComponent(selectedDept)}`
      ),
    retry: 1,
  });

  const summary = data?.summary ?? {};
  const monthlyTrend = data?.monthlyTrend ?? [];
  const budgetVsSpend = data?.budgetVsSpend ?? [];
  const topSuppliers = data?.topSuppliers ?? [];
  const spendByCategory = data?.spendByCategory ?? [];
  const requisitionDeptData = data?.requisitionDeptData ?? [];
  const reqStatusBreakdown = data?.reqStatusBreakdown ?? [];
  const rfqStatusData = data?.rfqStatusData ?? [];
  const orderStatusDistribution = data?.orderStatusDistribution ?? [];
  const invoiceAging = data?.invoiceAging ?? [];
  const paymentTermsData = data?.paymentTermsData ?? [];
  const paymentMethodsData = data?.paymentMethodsData ?? [];
  const warehouseAnalytics = data?.warehouseAnalytics ?? [];
  const cycleStages = data?.cycleStages ?? [];
  const supplierRisk = data?.supplierRisk ?? [];
  const contractStats = data?.contractStats ?? {};
  const logisticsStats = data?.logisticsStats ?? {};
  const savingsMetrics = data?.savingsMetrics ?? {};
  const inventoryHealth = data?.inventoryHealth ?? {};
  const carrierPerformance = data?.carrierPerformance ?? [];

  // Filter department data locally if needed
  const filteredBudgetVsSpend =
    selectedDept === "all"
      ? budgetVsSpend
      : budgetVsSpend.filter(
          (b: any) => String(b.department).toLowerCase() === selectedDept.toLowerCase()
        );

  const filteredReqDeptData =
    selectedDept === "all"
      ? requisitionDeptData
      : requisitionDeptData.filter(
          (r: any) => String(r.department).toLowerCase() === selectedDept.toLowerCase()
        );

  // Excel report generator
  const handleExportExcel = () => {
    const rows = [
      ["SupplyX SCM Analytics Executive Report"],
      [`Generated at: ${new Date().toISOString()}`, `Timeframe: ${timeframe}`, `Department: ${selectedDept}`],
      [],
      ["--- EXECUTIVE KPI SUMMARY ---"],
      ["Metric", "Value"],
      ["Total PO Spend", summary.totalPOSpend ?? 0],
      ["Total Invoiced", summary.totalInvoiced ?? 0],
      ["Total Settled Cash Paid", summary.totalPaid ?? 0],
      ["Total Budget Allocated", summary.totalBudgetAllocated ?? 0],
      ["Total Budget Spent", summary.totalBudgetSpent ?? 0],
      ["Total Realized Savings", savingsMetrics.totalRealizedSavings ?? 0],
      ["Overdue Invoices Count", summary.overdueCount ?? 0],
      ["Overdue Invoices Amount", summary.overdueAmount ?? 0],
      ["Average S2P Cycle Time (Days)", summary.avgCycleTimeDays ?? 0],
      [],
      ["--- MONTHLY PROCUREMENT TREND ---"],
      ["Period", "Committed Spend ($)", "Invoiced ($)", "Cash Paid ($)", "POs Count", "RFQs Count"],
      ...monthlyTrend.map((m: any) => [m.month, m.spend, m.invoiced, m.paid, m.orders, m.rfqs]),
      [],
      ["--- DEPARTMENT BUDGETS ---"],
      ["Department", "Allocated ($)", "Spent ($)", "Remaining ($)", "Utilization (%)"],
      ...filteredBudgetVsSpend.map((b: any) => [b.department, b.allocated, b.spent, b.remaining, `${b.utilization}%`]),
      [],
      ["--- TOP SUPPLIERS & RISK ---"],
      ["Supplier", "Spend ($)", "Concentration (%)", "OTIF Rate (%)", "Risk Score"],
      ...supplierRisk.map((s: any) => [s.supplier, s.spend, `${s.concentration}%`, `${s.otifRate ?? 95}%`, s.riskScore]),
    ];

    downloadExcelMatrix(`SupplyX_Analytics_${timeframe}`, rows, "Analytics Report");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Zap className="h-6 w-6 animate-bounce text-primary" />
        <span className="font-semibold text-foreground">Compiling Cross-Module Analytics Hub…</span>
        <span className="text-xs text-muted-foreground">
          Calculating KPIs across Requisitions, RFQs, POs, Invoices, Contracts & Logistics
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        Could not load analytics: {(error as Error).message}. Ensure the backend is operational.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Analytics Intelligence Hub</h1>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
              Live SCM Intelligence
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cross-module operational and financial performance intelligence across all Source-to-Pay pipelines.
          </p>
        </div>

        {/* Global Filters & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded bg-muted/60 p-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground ml-1" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="operations">Operations</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="logistics">Logistics</option>
              <option value="it">IT & Infrastructure</option>
              <option value="finance">Finance</option>
            </select>
          </div>

          <div className="flex items-center gap-1 rounded bg-muted/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => setTimeframe("30d")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                timeframe === "30d" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30D
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("90d")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                timeframe === "90d" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              90D
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("12m")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                timeframe === "12m" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              12M
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("ytd")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                timeframe === "ytd" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              YTD
            </button>
            <button
              type="button"
              onClick={() => setTimeframe("all")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                timeframe === "all" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
          </div>

          <Button
            variant="subtle"
            size="sm"
            onClick={handleExportExcel}
            title="Download Excel Analytics Report"
            className="flex items-center gap-1 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export Excel</span>
          </Button>

          <Button
            variant="subtle"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            title="Refresh analytics data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-primary" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "bg-primary text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" /> Executive Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("s2p")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === "s2p"
              ? "bg-primary text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> Requisitions & Sourcing (RFQs)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === "orders"
              ? "bg-primary text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          <ShoppingCart className="h-3.5 w-3.5" /> Purchase Orders & Vendors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("financials")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === "financials"
              ? "bg-primary text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" /> Invoices, Payments & Budgets
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logistics")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === "logistics"
              ? "bg-primary text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          <Truck className="h-3.5 w-3.5" /> Logistics, Warehouses & Inventory
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("savings")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
            activeTab === "savings"
              ? "bg-primary text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          <Award className="h-3.5 w-3.5" /> SCM Savings & Performance
        </button>
      </div>

      {/* Global Executive KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        <KpiCard
          icon={<DollarSign className="h-4 w-4" />}
          label="Total PO Spend"
          value={formatCurrency(summary.totalPOSpend ?? 0)}
          sub={`${summary.totalRequisitions ?? 0} reqs raised`}
          color="text-primary"
          bg="bg-primary/10"
          linkTo="/orders"
        />
        <KpiCard
          icon={<BarChart2 className="h-4 w-4" />}
          label="Invoiced Total"
          value={formatCurrency(summary.totalInvoiced ?? 0)}
          sub={`Paid: ${formatCurrency(summary.totalPaid ?? 0)}`}
          color="text-blue-500"
          bg="bg-blue-500/10"
          linkTo="/invoices"
        />
        <KpiCard
          icon={<Award className="h-4 w-4" />}
          label="Realized Savings"
          value={formatCurrency(savingsMetrics.totalRealizedSavings ?? 0)}
          sub={`${savingsMetrics.savingsPctOfSpend ?? 0}% cost reduction`}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <KpiCard
          icon={<Building2 className="h-4 w-4" />}
          label="Budget Utilization"
          value={`${
            summary.totalBudgetAllocated > 0
              ? Math.round((summary.totalBudgetSpent / summary.totalBudgetAllocated) * 100)
              : 0
          }%`}
          sub={`${formatCurrency(summary.totalBudgetSpent ?? 0)} spent`}
          color="text-indigo-500"
          bg="bg-indigo-500/10"
          linkTo="/budget"
        />
        <KpiCard
          icon={<FileWarning className="h-4 w-4" />}
          label="Overdue Invoices"
          value={String(summary.overdueCount ?? 0)}
          sub={formatCurrency(summary.overdueAmount ?? 0)}
          color="text-rose-500"
          bg="bg-rose-500/10"
          urgent={summary.overdueCount > 0}
          linkTo="/invoices"
        />
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Procurement Cycle"
          value={`${summary.avgCycleTimeDays ?? 0} days`}
          sub="Req → Payment"
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
        <KpiCard
          icon={<FileSignature className="h-4 w-4" />}
          label="Active Contracts"
          value={String(summary.activeContracts ?? 0)}
          sub={`${contractStats.expiringCount ?? 0} expiring soon`}
          color="text-teal-500"
          bg="bg-teal-500/10"
          linkTo="/contracts"
        />
      </div>

      {/* ─── TAB 1: EXECUTIVE OVERVIEW ────────────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "financials") && (
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-3">
            {/* Multi-Series Area Chart: Spend vs Invoiced vs Paid Outflow */}
            <ChartCard
              title="Procurement & Cashflow Multi-Trend"
              subtitle="Comparison of committed PO Spend vs Supplier Invoiced vs Settled Cash Outflow"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 4,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="spend"
                    name="Committed PO Spend"
                    stroke="#3b82f6"
                    fill="url(#spendGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="invoiced"
                    name="Invoiced Amount"
                    stroke="#f59e0b"
                    fill="url(#invGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    name="Settled Cash Paid"
                    stroke="#10b981"
                    fill="url(#paidGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Donut Chart: Spend by Category */}
            <ChartCard title="Spend by Category" subtitle="Distribution of committed spend">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={spendByCategory.slice(0, 8)}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {spendByCategory.map((_: any, i: number) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 4,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Grouped Double Bar Graph: Department Budget Allocated vs Spent */}
          <div className="grid gap-4 xl:grid-cols-3">
            <ChartCard
              title="Department Budget Allocated vs Actual Spent"
              subtitle="Tracking spending against corporate department budget allocations"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={filteredBudgetVsSpend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 4,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="allocated"
                    name="Budget Ceiling ($)"
                    fill="#94a3b8"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="spent"
                    name="Committed Spend ($)"
                    fill="#3b82f6"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Invoice Overdue Aging */}
            <ChartCard title="Accounts Payable Aging" subtitle="Unpaid invoice aging distribution">
              <div className="space-y-3 pt-2">
                {invoiceAging.map((bucket: any, i: number) => {
                  const maxAmount = Math.max(...invoiceAging.map((b: any) => b.amount), 1);
                  const pct = Math.round((bucket.amount / maxAmount) * 100);
                  const isOverdue = i > 0;
                  return (
                    <div key={bucket.bucket}>
                      <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
                        <span className={isOverdue ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                          {bucket.bucket}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {bucket.count} inv · {formatCurrency(bucket.amount)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOverdue ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ─── TAB 2: REQUISITIONS & SOURCING (RFQs) ────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "s2p") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" /> Requisition Intake & RFQ Sourcing Analytics
            </h3>
            <Link to="/requisitions" className="text-xs text-primary hover:underline flex items-center gap-1">
              View Requisitions <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {/* Department Demand Intake Bar Graph */}
            <ChartCard
              title="Departmental Requisition Demand Intake"
              subtitle="Requisitions count & committed demand value by department"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={filteredReqDeptData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} />
                  <YAxis
                    yAxisId="val"
                    tick={{ fontSize: 10 }}
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    yAxisId="cnt"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 4,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    formatter={(val: number, name: string) =>
                      name === "Total Demand ($)" ? formatCurrency(val) : val
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    yAxisId="val"
                    dataKey="total"
                    name="Total Demand ($)"
                    fill="#6366f1"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={26}
                  />
                  <Bar
                    yAxisId="cnt"
                    dataKey="count"
                    name="Requisitions Count"
                    fill="#10b981"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Requisition Status Distribution Pie */}
            <ChartCard title="Requisition Workflow Lifecycle" subtitle="Intake approval & conversion status breakdown">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={reqStatusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {reqStatusBreakdown.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.color || PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 4,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Sourcing Funnel & Quotes Analytics */}
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard
              title="Procure-to-Pay Lifecycle Stages & Velocity"
              subtitle="Average processing turnaround days per procurement milestone"
            >
              <div className="flex items-end gap-2 pt-4">
                {cycleStages.map((stage: any, i: number) => {
                  const maxDays = Math.max(...cycleStages.map((s: any) => s.avgDays), 1);
                  const heightPct = Math.round((stage.avgDays / maxDays) * 140);
                  return (
                    <div key={stage.stage} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-foreground">{stage.avgDays}d</span>
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${Math.max(heightPct, 15)}px`,
                          backgroundColor: PALETTE[i % PALETTE.length],
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
                End-to-end velocity:{" "}
                <strong className="text-foreground">
                  {cycleStages.reduce((s: number, c: any) => s + c.avgDays, 0)} days
                </strong>{" "}
                from demand intake to invoice disbursement
              </div>
            </ChartCard>

            <ChartCard
              title="RFQ Sourcing Bidding Matrix & Award Performance"
              subtitle="Vendor participation and bidding conversion statistics"
            >
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="rounded border border-border bg-card p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Sourcing Events</span>
                  <div className="text-xl font-bold font-mono text-foreground mt-1">{summary.totalRfqs ?? 0}</div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">RFQs initiated</span>
                </div>
                <div className="rounded border border-border bg-card p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Bids Received</span>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-1">{summary.totalQuotes ?? 0}</div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Vendor bids evaluated</span>
                </div>
                <div className="rounded border border-border bg-card p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Average Bids / RFQ</span>
                  <div className="text-xl font-bold font-mono text-primary mt-1">
                    {summary.totalRfqs > 0 ? (summary.totalQuotes / summary.totalRfqs).toFixed(1) : 0}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Competition index</span>
                </div>
              </div>
              <div className="mt-3 rounded border border-border bg-card/60 p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Open Bidding Events:</span>
                  <span className="font-bold text-blue-500">
                    {rfqStatusData.find((r: any) => r.name.includes("Open"))?.value ?? 0}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Awarded & POs Created:</span>
                  <span className="font-bold text-emerald-600">
                    {rfqStatusData.find((r: any) => r.name.includes("Awarded"))?.value ?? 0}
                  </span>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ─── TAB 3: PURCHASE ORDERS & VENDORS ─────────────────────────────────────── */}
      {(activeTab === "all" || activeTab === "orders") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <ShoppingCart className="h-4 w-4 text-primary" /> Purchase Orders & Vendor Concentration
            </h3>
            <Link to="/orders" className="text-xs text-primary hover:underline flex items-center gap-1">
              View Purchase Orders <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {/* Top 10 Suppliers Horizontal Bar Chart */}
            <ChartCard
              title="Top 10 Suppliers by Committed Spend"
              subtitle="Ranked by cumulative purchase order volume"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topSuppliers} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10 }}
                    stroke="var(--muted-foreground)"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="supplier"
                    tick={{ fontSize: 10 }}
                    stroke="var(--muted-foreground)"
                    width={95}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 4,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="spend" name="PO Spend" fill="#3b82f6" radius={[0, 3, 3, 0]} maxBarSize={18}>
                    {topSuppliers.map((_: any, i: number) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Supplier Concentration Risk Exposure */}
            <ChartCard title="Supplier Concentration Risk" subtitle="Supply chain dependency exposure matrix">
              <div className="space-y-2 pt-1 max-h-[260px] overflow-y-auto pr-1">
                {supplierRisk.map((s: any) => {
                  const riskColor =
                    s.riskScore === "High"
                      ? "text-rose-600 bg-rose-500/10 border-rose-500/20"
                      : s.riskScore === "Medium"
                        ? "text-amber-600 bg-amber-500/10 border-amber-500/20"
                        : "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
                  return (
                    <div
                      key={s.supplier}
                      className="flex items-center gap-2 rounded border border-border bg-card/50 px-2.5 py-1.5"
                    >
                      <span className="w-5 text-[10px] font-bold text-muted-foreground">#{s.rank}</span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-[11px] font-semibold text-foreground">{s.supplier}</div>
                        <div className="text-[9px] text-muted-foreground">
                          {formatCurrency(s.spend)} · {s.concentration}% of spend
                        </div>
                      </div>
                      <span className={`rounded-sm border px-1.5 py-0.5 text-[9px] font-bold ${riskColor}`}>
                        {s.riskScore}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ─── TAB 4: FINANCIALS: INVOICES, PAYMENTS & CASHFLOW ─────────────────────── */}
      {(activeTab === "all" || activeTab === "financials") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary" /> Accounts Payable, Payment Terms & Cashflow Settlement
            </h3>
            <Link to="/invoices" className="text-xs text-primary hover:underline flex items-center gap-1">
              View Invoices <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {/* Payment Methods Distribution Pie */}
            <ChartCard
              title="Disbursements by Payment Method"
              subtitle="Cash outflow breakdown across payment channels"
            >
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {paymentMethodsData.map((_: any, i: number) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 4,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Payment Terms Distribution */}
            <ChartCard
              title="Supplier Payment Terms Structure"
              subtitle="Invoices categorized by Net terms and early pay discount policies"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={paymentTermsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 4,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  />
                  <Bar dataKey="value" name="Invoice Count" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28}>
                    {paymentTermsData.map((_: any, i: number) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Cashflow Liquidity Metrics */}
            <ChartCard title="Payables Working Capital Metrics" subtitle="Settlement velocity and discount performance">
              <div className="space-y-3 pt-2">
                <div className="rounded border border-border bg-card p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Settled Cash Paid</div>
                  <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
                    {formatCurrency(summary.totalPaid ?? 0)}
                  </div>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">
                    {summary.totalInvoiced > 0
                      ? Math.round((summary.totalPaid / summary.totalInvoiced) * 100)
                      : 0}
                    % AP settlement rate
                  </span>
                </div>

                <div className="rounded border border-border bg-card p-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Overdue AP at Risk</div>
                  <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">
                    {formatCurrency(summary.overdueAmount ?? 0)}
                  </div>
                  <span className="text-[10px] text-rose-500 block mt-0.5">
                    {summary.overdueCount ?? 0} invoices past payment maturity
                  </span>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ─── TAB 5: LOGISTICS, WAREHOUSES & CONTRACTS ─────────────────────────────── */}
      {(activeTab === "all" || activeTab === "logistics") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-primary" /> Logistics, Warehouse Capacities & Inventory Health
            </h3>
            <Link to="/warehouses" className="text-xs text-primary hover:underline flex items-center gap-1">
              View Warehouses <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {/* Warehouse Fill Levels Bar Chart */}
            <ChartCard
              title="Warehouse Utilization & Stock Capacity"
              subtitle="Current fill levels against total capacity"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={warehouseAnalytics} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 4,
                      fontSize: 12,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="capacity"
                    name="Max Capacity (Units)"
                    fill="#94a3b8"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={26}
                  />
                  <Bar
                    dataKey="fillLevel"
                    name="Current Fill Level (%)"
                    fill="#06b6d4"
                    radius={[3, 3, 0, 0]}
                    maxBarSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Contracts & Compliance Breakdown */}
            <ChartCard
              title="Contract Expiry & Compliance"
              subtitle="Active agreement coverage vs legal expiry exposure"
            >
              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <div className="rounded border border-border bg-card p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-emerald-600">Active</span>
                  <div className="text-xl font-bold font-mono text-foreground mt-1">
                    {contractStats.activeCount ?? 0}
                  </div>
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">Compliant</span>
                </div>
                <div className="rounded border border-border bg-card p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-600">Expiring (30d)</span>
                  <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                    {contractStats.expiringCount ?? 0}
                  </div>
                  <span className="text-[10px] text-amber-500 mt-0.5 block">Action required</span>
                </div>
                <div className="rounded border border-border bg-card p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-rose-600">Expired</span>
                  <div className="text-xl font-bold font-mono text-rose-600 mt-1">
                    {contractStats.expiredCount ?? 0}
                  </div>
                  <span className="text-[10px] text-rose-500 mt-0.5 block">Renew</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between p-3 rounded bg-muted/30 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-primary" /> Active Logistics Shipments:{" "}
                  <strong>{logisticsStats.activeShipments ?? 0}</strong> in transit
                </span>
                <span>
                  Receipts: <strong>{logisticsStats.totalReceipts ?? 0}</strong>
                </span>
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ─── TAB 6: SCM SAVINGS & PERFORMANCE SCORECARD ───────────────────────────── */}
      {(activeTab === "all" || activeTab === "savings") && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-500" /> SCM Cost Savings Realization & Vendor Performance
          </h3>

          <div className="grid gap-4 xl:grid-cols-3">
            {/* Cost Avoidance & Savings Card */}
            <ChartCard
              title="SCM Cost Savings Breakdown"
              subtitle="Procurement value generated via competitive sourcing & budget discipline"
            >
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between rounded border border-emerald-500/20 bg-emerald-500/10 p-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      Total Cost Savings
                    </span>
                    <div className="text-2xl font-black font-mono text-emerald-600 mt-0.5">
                      {formatCurrency(savingsMetrics.totalRealizedSavings ?? 0)}
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-600">
                    +{savingsMetrics.savingsPctOfSpend ?? 0}% vs Baseline
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded border border-border bg-card p-2.5">
                    <span className="text-[10px] text-muted-foreground block">RFQ Competitive Sourcing</span>
                    <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                      {formatCurrency(savingsMetrics.sourcingSavings ?? 0)}
                    </span>
                  </div>
                  <div className="rounded border border-border bg-card p-2.5">
                    <span className="text-[10px] text-muted-foreground block">Budget Variance Retained</span>
                    <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                      {formatCurrency(savingsMetrics.budgetVarianceSavings ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Supplier OTIF Scorecard */}
            <ChartCard
              title="Supplier Scorecard & Quality Rating"
              subtitle="On-Time In-Full (OTIF) Delivery & Defect Rates"
              className="xl:col-span-2"
            >
              <div className="grid gap-2.5 sm:grid-cols-2 pt-1 max-h-[220px] overflow-y-auto pr-1">
                {supplierRisk.slice(0, 6).map((sup: any) => (
                  <div
                    key={sup.supplier}
                    className="flex items-center justify-between rounded border border-border bg-card/60 p-2.5"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground truncate max-w-[140px]">{sup.supplier}</div>
                      <div className="text-[10px] text-muted-foreground">Defect Rate: {sup.defectRate ?? "0.5"}%</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-600 font-mono">
                        {sup.otifRate ?? 95}% OTIF
                      </span>
                      <span className="block text-[9px] text-muted-foreground">{sup.riskScore} Risk</span>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        </div>
      )}
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
  linkTo,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
  bg: string;
  urgent?: boolean;
  linkTo?: string;
}) {
  const content = (
    <div
      className={`rounded-sm border bg-card p-3 transition-all hover:border-primary/40 ${
        urgent ? "border-rose-500/30 shadow-xs shadow-rose-500/10" : "border-border"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <div className={`rounded p-1 ${bg} ${color}`}>{icon}</div>
        <span className="text-[10px] text-muted-foreground font-medium leading-tight">{label}</span>
      </div>
      <div className={`text-base font-extrabold ${color}`}>{value}</div>
      {sub && <div className="text-[9px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block no-underline">{content}</Link>;
  }

  return content;
}

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
    <div className={`rounded-sm border border-border bg-card p-4 shadow-xs ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
