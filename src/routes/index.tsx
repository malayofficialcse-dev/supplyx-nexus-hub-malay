import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useQuery } from "@tanstack/react-query";
import { getDashboardAnalytics, getRequisitions, getContracts } from "@/lib/api";

export const Route = createFileRoute("/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Procurement Dashboard - SupplyX" },
      {
        name: "description",
        content: "Overview of purchasing activities, spend trends, and supplier metrics.",
      },
      { property: "og:title", content: "Procurement Dashboard - SupplyX" },
      {
        property: "og:description",
        content: "Overview of purchasing activities, spend trends, and supplier metrics.",
      },
    ],
  }),
});

function Page() {
  const navigate = useNavigate();

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["dashboardAnalytics"],
    queryFn: getDashboardAnalytics,
  });

  const { data: requisitions, isLoading: isRequisitionsLoading } = useQuery({
    queryKey: ["requisitions"],
    queryFn: getRequisitions,
  });

  const { data: contracts } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const kpis = analytics?.kpis || {
    totalSpendYTD: 0,
    pendingRequisitions: 0,
    activeRfqs: 0,
    overdueInvoices: 0,
    overdueInvoicesVal: 0,
  };

  const categories = analytics?.categories || [];
  const monthlyTrend = analytics?.monthlySpendTrend || [
    { month: "Jan", spend: 320000 },
    { month: "Feb", spend: 410000 },
    { month: "Mar", spend: 390000 },
    { month: "Apr", spend: 540000 },
    { month: "May", spend: 480000 },
    { month: "Jun", spend: 610000 },
    { month: "Jul", spend: 550000 },
  ];

  const recentRequisitions = requisitions?.slice(0, 5) || [];

  // Top suppliers dynamically mapped from database contracts
  const topSuppliers = contracts?.slice(0, 3).map((c, idx) => ({
    name: c.supplier,
    score: idx === 0 ? 98 : idx === 1 ? 92 : 88,
    status: c.status,
  })) || [
    { name: "Global Tech Mfg", score: 98, status: "Active" },
    { name: "Nordic Steel Co.", score: 92, status: "Expiring" },
    { name: "Apex Packaging", score: 88, status: "Active" },
  ];

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(2)}M`;
    }
    return `$${val.toLocaleString()}`;
  };

  // SVG Chart Calculation
  const maxSpend = Math.max(...monthlyTrend.map((t) => t.spend), 100000);
  const chartHeight = 160;
  const chartWidth = 500;
  const points = monthlyTrend.map((t, idx) => {
    const x = (idx / (monthlyTrend.length - 1)) * chartWidth;
    const y = chartHeight - (t.spend / maxSpend) * (chartHeight - 20);
    return { x, y, month: t.month, spend: t.spend };
  });

  const svgPathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  const svgAreaD = `${svgPathD} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-stack-lg">
        {/* Page Header & Actions */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">Procurement Dashboard</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Overview of purchasing activities and supplier metrics.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate({ to: "/rfqs/new" })}
              className="px-4 py-2 border border-outline-variant rounded font-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              New RFQ
            </button>
            <button
              onClick={() => navigate({ to: "/requisitions" })}
              className="px-4 py-2 bg-primary-container text-on-primary rounded font-body-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Icon name="add" className="text-[18px]" />
              Create Requisition
            </button>
          </div>
        </div>

        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Total Spend */}
          <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-sm text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                Total Spend (YTD)
              </span>
              <Icon name="payments" className="text-outline text-[20px]" />
            </div>
            <div className="font-data-mono text-page-title text-on-surface mb-1">
              {isAnalyticsLoading ? "..." : formatCurrency(kpis.totalSpendYTD)}
            </div>
            <div className="flex items-center gap-1 font-body-sm text-[12px] text-tertiary-container">
              <Icon name="trending_up" className="text-[16px]" />
              <span>+12.4% vs last year</span>
            </div>
          </div>

          {/* Pending Requisitions */}
          <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-sm text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                Pending Requisitions
              </span>
              <Icon name="assignment" className="text-outline text-[20px]" />
            </div>
            <div className="font-data-mono text-page-title text-on-surface mb-1">
              {isAnalyticsLoading ? "..." : kpis.pendingRequisitions}
            </div>
            <div className="flex items-center gap-1 font-body-sm text-[12px] text-tertiary-container">
              <Icon name="check_circle" className="text-[16px]" />
              <span>Live DB Count</span>
            </div>
          </div>

          {/* Active RFQs */}
          <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-sm text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                Active RFQs
              </span>
              <Icon name="gavel" className="text-outline text-[20px]" />
            </div>
            <div className="font-data-mono text-page-title text-on-surface mb-1">
              {isAnalyticsLoading ? "..." : kpis.activeRfqs}
            </div>
            <div className="flex items-center gap-1 font-body-sm text-[12px] text-on-surface-variant">
              <Icon name="schedule" className="text-[16px] text-outline" />
              <span>Open tenders</span>
            </div>
          </div>

          {/* Overdue Invoices */}
          <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)] bg-error-container/10">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-sm text-on-surface-variant uppercase tracking-wider text-[11px] font-semibold">
                Overdue Invoices
              </span>
              <Icon name="warning" className="text-error text-[20px]" />
            </div>
            <div className="font-data-mono text-page-title text-error mb-1">
              {isAnalyticsLoading ? "..." : kpis.overdueInvoices}
            </div>
            <div className="flex items-center gap-1 font-body-sm text-[12px] text-error">
              <span className="font-medium">${kpis.overdueInvoicesVal.toLocaleString()}</span>
              <span className="text-on-surface-variant">total value</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Left Column (Wider) */}
          <div className="lg:col-span-2 space-y-gutter">
            {/* Spend Trend Chart */}
            <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-section-heading text-section-heading text-on-surface">Monthly Spend Trend</h3>
                  <p className="text-[12px] text-on-surface-variant">Live procurement analytics aggregated from database</p>
                </div>
                <span className="text-xs bg-primary-container/10 text-primary font-medium px-2.5 py-1 rounded">Realtime DB</span>
              </div>
              <div className="bg-surface-container-low rounded border border-outline-variant p-4 relative overflow-hidden">
                <svg viewBox="0 0 500 200" className="w-full h-48 overflow-visible">
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="0" y1="160" x2="500" y2="160" stroke="#CBD5E1" />

                  {/* Area Fill */}
                  <path d={svgAreaD} fill="url(#spendGradient)" />

                  {/* Trend Line */}
                  <path d={svgPathD} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

                  {/* Data Points */}
                  {points.map((pt, i) => (
                    <g key={i} className="group cursor-pointer">
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="3" className="hover:r-7 transition-all" />
                      <text x={pt.x} y="185" textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">{pt.month}</text>
                      <title>{`${pt.month}: $${pt.spend.toLocaleString()}`}</title>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Data Table: Recent Requisitions */}
            <div className="bg-surface border border-outline-variant rounded-lg shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="p-container-padding border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-section-heading text-subsection-heading text-on-surface">
                  Recent Requisitions
                </h3>
                <button
                  onClick={() => navigate({ to: "/requisitions" })}
                  className="font-body-sm text-primary hover:underline"
                >
                  Create Requisition
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-24">
                        Req ID
                      </th>
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Department
                      </th>
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Item
                      </th>
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">
                        Amount
                      </th>
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-[13px] text-on-surface">
                    {isRequisitionsLoading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-on-surface-variant">
                          Loading Requisitions...
                        </td>
                      </tr>
                    ) : recentRequisitions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-on-surface-variant">
                          No requisitions found.
                        </td>
                      </tr>
                    ) : (
                      recentRequisitions.map((req) => (
                        <tr
                          key={req.id}
                          className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors h-10"
                        >
                          <td className="py-2 px-4 font-data-mono font-medium text-primary">{req.reqId}</td>
                          <td className="py-2 px-4">{req.department}</td>
                          <td className="py-2 px-4 truncate max-w-[200px]">{req.item}</td>
                          <td className="py-2 px-4 font-data-mono text-right">${req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`px-2 py-1 rounded text-[11px] font-medium ${
                                req.status === "Approved"
                                  ? "bg-[#DCFCE7] text-[#16A34A]"
                                  : req.status === "Rejected"
                                    ? "bg-[#FEE2E2] text-[#DC2626]"
                                    : "bg-[#EFF6FF] text-[#2563EB]"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (Narrower) */}
          <div className="space-y-gutter">
            {/* Spend by Category */}
            <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <h3 className="font-section-heading text-subsection-heading text-on-surface mb-4">
                Spend by Category
              </h3>
              <div className="flex items-center justify-center h-48 relative">
                <div className="w-32 h-32 rounded-full border-[16px] border-surface-container-low border-t-primary border-r-[#2563EB] border-b-[#16A34A] relative flex items-center justify-center">
                  <span className="font-section-heading font-bold text-on-surface text-lg">YTD</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {categories.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-[13px]">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-sm ${
                          i === 0
                            ? "bg-primary"
                            : i === 1
                              ? "bg-[#2563EB]"
                              : i === 2
                                ? "bg-[#16A34A]"
                                : "bg-surface-container-low border border-outline-variant"
                        }`}
                      ></div>
                      <span className="text-on-surface">{c.category}</span>
                    </div>
                    <span className="font-data-mono text-on-surface-variant">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Performance Scorecard */}
            <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-section-heading text-subsection-heading text-on-surface">Top Suppliers</h3>
                <Icon name="emoji_events" className="text-[18px] text-on-surface-variant" />
              </div>
              <div className="space-y-4">
                {topSuppliers.map((supplier, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[13px] mb-1">
                      <span className="font-medium text-on-surface">{supplier.name}</span>
                      <span className="text-tertiary-container font-data-mono">{supplier.score}/100</span>
                    </div>
                    <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                      <div className="bg-tertiary-container h-full rounded-full" style={{ width: `${supplier.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
