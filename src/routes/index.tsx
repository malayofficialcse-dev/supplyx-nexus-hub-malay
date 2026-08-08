import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

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
            <button className="px-4 py-2 border border-outline-variant rounded font-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
              New RFQ
            </button>
            <button className="px-4 py-2 bg-primary-container text-on-primary rounded font-body-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
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
            <div className="font-data-mono text-page-title text-on-surface mb-1">$4.2M</div>
            <div className="flex items-center gap-1 font-body-sm text-[12px] text-error">
              <Icon name="trending_up" className="text-[16px]" />
              <span>+12.4% vs last year</span>
            </div>
            <div className="absolute bottom-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Icon name="account_balance_wallet" className="text-[80px] -mr-4 -mb-4" />
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
            <div className="font-data-mono text-page-title text-on-surface mb-1">45</div>
            <div className="flex items-center gap-1 font-body-sm text-[12px] text-tertiary-container">
              <Icon name="trending_down" className="text-[16px]" />
              <span>-5 since yesterday</span>
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
            <div className="font-data-mono text-page-title text-on-surface mb-1">12</div>
            <div className="flex items-center gap-1 font-body-sm text-[12px] text-on-surface-variant">
              <Icon name="schedule" className="text-[16px] text-outline" />
              <span>3 closing this week</span>
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
            <div className="font-data-mono text-page-title text-error mb-1">8</div>
            <div className="flex items-center gap-1 font-body-sm text-[12px] text-error">
              <span className="font-medium">$124,500</span>
              <span className="text-on-surface-variant">total value</span>
            </div>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Left Column (Wider) */}
          <div className="lg:col-span-2 space-y-gutter">
            {/* Spend Trend Chart (Placeholder area) */}
            <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)] h-80 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-section-heading text-section-heading text-on-surface">Monthly Spend Trend</h3>
                <button className="text-on-surface-variant hover:text-primary transition-colors">
                  <Icon name="more_horiz" className="text-[20px]" />
                </button>
              </div>
              <div className="flex-1 bg-surface-container-low rounded border border-outline-variant/50 border-dashed flex items-center justify-center relative overflow-hidden">
                {/* Abstract representation of a chart */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(0deg, transparent 24%, #e2e8f0 25%, #e2e8f0 26%, transparent 27%, transparent 74%, #e2e8f0 75%, #e2e8f0 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #e2e8f0 25%, #e2e8f0 26%, transparent 27%, transparent 74%, #e2e8f0 75%, #e2e8f0 76%, transparent 77%, transparent)",
                    backgroundSize: "40px 40px",
                  }}
                ></div>
                <span className="font-body-sm text-on-surface-variant z-10 bg-surface px-2 rounded">
                  Line Chart Visualization Area
                </span>
              </div>
            </div>
            {/* Data Table: Recent Requisitions */}
            <div className="bg-surface border border-outline-variant rounded-lg shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="p-container-padding border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-section-heading text-subsection-heading text-on-surface">
                  Recent Requisitions
                </h3>
                <a className="font-body-sm text-primary hover:underline" href="#">
                  View All
                </a>
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
                    <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors h-10">
                      <td className="py-2 px-4 font-data-mono">REQ-2041</td>
                      <td className="py-2 px-4">IT Infrastructure</td>
                      <td className="py-2 px-4 truncate max-w-[150px]">Dell PowerEdge Servers (x4)</td>
                      <td className="py-2 px-4 font-data-mono text-right">$45,200</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant rounded text-[11px] font-medium">
                          Pending Approval
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors h-10">
                      <td className="py-2 px-4 font-data-mono">REQ-2040</td>
                      <td className="py-2 px-4">Marketing</td>
                      <td className="py-2 px-4 truncate max-w-[150px]">Q3 Campaign Agency Retainer</td>
                      <td className="py-2 px-4 font-data-mono text-right">$12,500</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 bg-[#DCFCE7] text-[#16A34A] rounded text-[11px] font-medium">
                          Approved
                        </span>
                      </td>
                    </tr>
                    <tr className="hover:bg-surface-container-low/50 transition-colors h-10">
                      <td className="py-2 px-4 font-data-mono">REQ-2039</td>
                      <td className="py-2 px-4">Facilities</td>
                      <td className="py-2 px-4 truncate max-w-[150px]">HVAC Maintenance Q2</td>
                      <td className="py-2 px-4 font-data-mono text-right">$8,100</td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 bg-[#FEE2E2] text-[#DC2626] rounded text-[11px] font-medium">
                          Rejected
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Right Column (Narrower) */}
          <div className="space-y-gutter">
            {/* Spend by Category (Donut Placeholder) */}
            <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <h3 className="font-section-heading text-subsection-heading text-on-surface mb-4">
                Spend by Category
              </h3>
              <div className="flex items-center justify-center h-48 relative">
                {/* CSS representation of a donut chart */}
                <div className="w-32 h-32 rounded-full border-[16px] border-surface-container-low border-t-primary border-r-primary border-b-secondary-fixed relative flex items-center justify-center">
                  <span className="font-section-heading font-bold text-on-surface text-lg">YTD</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-primary"></div>
                    <span className="text-on-surface">IT Equipment</span>
                  </div>
                  <span className="font-data-mono text-on-surface-variant">42%</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-secondary-fixed"></div>
                    <span className="text-on-surface">Professional Services</span>
                  </div>
                  <span className="font-data-mono text-on-surface-variant">35%</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-surface-container-low border border-outline-variant"></div>
                    <span className="text-on-surface">Other</span>
                  </div>
                  <span className="font-data-mono text-on-surface-variant">23%</span>
                </div>
              </div>
            </div>
            {/* Supplier Performance Scorecard */}
            <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-section-heading text-subsection-heading text-on-surface">Top Suppliers</h3>
                <Icon name="emoji_events" className="text-[18px] text-on-surface-variant" />
              </div>
              <div className="space-y-4">
                {/* Supplier 1 */}
                <div>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="font-medium text-on-surface">TechCorp Global</span>
                    <span className="text-tertiary-container font-data-mono">98/100</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-tertiary-container h-full rounded-full" style={{ width: "98%" }}></div>
                  </div>
                </div>
                {/* Supplier 2 */}
                <div>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="font-medium text-on-surface">Apex Logistics</span>
                    <span className="text-tertiary-container font-data-mono">92/100</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-tertiary-container h-full rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                {/* Supplier 3 */}
                <div>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="font-medium text-on-surface">OfficePlus</span>
                    <span className="text-[#CA8A04] font-data-mono">75/100</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div className="bg-[#EAB308] h-full rounded-full" style={{ width: "75%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
