import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

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
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">Budget &amp; Spend Analysis</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Procurement financial overview and variance tracking.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md font-medium rounded hover:bg-surface-container transition-colors flex items-center gap-2">
              <Icon name="download" className="text-[18px]" />
              Export Report
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary font-body-md text-body-md font-medium rounded hover:bg-on-primary-fixed-variant transition-colors shadow-sm">
              Adjust Budgets
            </button>
          </div>
        </div>
        {/* KPI Row (4 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-6">
          {/* Card 1 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-md text-body-md text-on-surface-variant">Total Budget (FY24)</span>
              <Icon name="account_balance_wallet" className="text-outline" />
            </div>
            <div className="font-page-title text-page-title text-on-surface mb-1">$24.5M</div>
            <div className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> Base Allocation
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-md text-body-md text-on-surface-variant">YTD Actual Spend</span>
              <Icon name="payments" className="text-outline" />
            </div>
            <div className="font-page-title text-page-title text-on-surface mb-1">$14.2M</div>
            <div className="flex items-center gap-1 font-body-sm text-body-sm">
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-medium text-[11px]">57.9% of Budget</span>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-md text-body-md text-on-surface-variant">Remaining Capacity</span>
              <Icon name="pie_chart" className="text-outline" />
            </div>
            <div className="font-page-title text-page-title text-on-surface mb-1">$10.3M</div>
            <div className="w-full h-1.5 bg-surface-container mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[42%]"></div>
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)] border-t-2 border-t-error">
            <div className="flex justify-between items-start mb-2">
              <span className="font-body-md text-body-md text-on-surface-variant">Projected Variance</span>
              <Icon name="trending_up" className="text-error" />
            </div>
            <div className="font-page-title text-page-title text-error mb-1">+$1.2M</div>
            <div className="flex items-center gap-1 font-body-sm text-body-sm text-error">
              Expected Overage vs Plan
            </div>
          </div>
        </div>
        {/* Bento Grid Section: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-6">
          {/* Main Chart: Budget vs Actual by Category (Span 8) */}
          <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col">
            <div className="p-container-padding border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-section-heading text-section-heading text-on-surface">Budget vs Actual by Category</h3>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-surface-container-highest border border-outline"></span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-primary"></span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Actual</span>
                </div>
                <button className="p-1 hover:bg-surface-container rounded text-outline"><Icon name="more_vert" className="text-[20px]" /></button>
              </div>
            </div>
            <div className="p-container-padding flex-1 min-h-[300px] flex flex-col justify-end relative">
              {/* Simulated Bar Chart */}
              <div className="absolute left-6 top-6 bottom-12 w-px bg-outline-variant opacity-50 z-0"></div>
              <div className="absolute left-6 top-[25%] right-6 h-px bg-outline-variant opacity-20 z-0 flex items-center"><span className="absolute -left-10 text-[10px] text-outline">$10M</span></div>
              <div className="absolute left-6 top-[50%] right-6 h-px bg-outline-variant opacity-20 z-0 flex items-center"><span className="absolute -left-9 text-[10px] text-outline">$5M</span></div>
              <div className="absolute left-6 top-[75%] right-6 h-px bg-outline-variant opacity-20 z-0 flex items-center"><span className="absolute -left-9 text-[10px] text-outline">$0</span></div>
              <div className="flex justify-around items-end h-[240px] w-full pl-6 relative z-10 pb-2 border-b border-outline-variant">
                {/* Group 1 */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="flex items-end gap-1">
                    <div className="w-8 h-[200px] bg-surface-container-highest border border-outline-variant/30 rounded-t-sm group-hover:bg-surface-container-high transition-colors"></div>
                    <div className="w-8 h-[210px] bg-error/90 rounded-t-sm group-hover:bg-error transition-colors relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded font-data-mono transition-opacity whitespace-nowrap">$12.1M / $11.5M</div>
                    </div>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface mt-2 text-center text-[11px] font-medium uppercase tracking-wider">Raw Mat</span>
                </div>
                {/* Group 2 */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="flex items-end gap-1">
                    <div className="w-8 h-[160px] bg-surface-container-highest border border-outline-variant/30 rounded-t-sm group-hover:bg-surface-container-high transition-colors"></div>
                    <div className="w-8 h-[140px] bg-primary rounded-t-sm group-hover:bg-primary-fixed-variant transition-colors relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded font-data-mono transition-opacity whitespace-nowrap">$6.2M / $8.5M</div>
                    </div>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface mt-2 text-center text-[11px] font-medium uppercase tracking-wider">Logistics</span>
                </div>
                {/* Group 3 */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="flex items-end gap-1">
                    <div className="w-8 h-[80px] bg-surface-container-highest border border-outline-variant/30 rounded-t-sm group-hover:bg-surface-container-high transition-colors"></div>
                    <div className="w-8 h-[70px] bg-primary rounded-t-sm group-hover:bg-primary-fixed-variant transition-colors relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded font-data-mono transition-opacity whitespace-nowrap">$3.1M / $4.0M</div>
                    </div>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface mt-2 text-center text-[11px] font-medium uppercase tracking-wider">IT Svcs</span>
                </div>
                {/* Group 4 */}
                <div className="flex flex-col items-center gap-1 group">
                  <div className="flex items-end gap-1">
                    <div className="w-8 h-[40px] bg-surface-container-highest border border-outline-variant/30 rounded-t-sm group-hover:bg-surface-container-high transition-colors"></div>
                    <div className="w-8 h-[45px] bg-error/90 rounded-t-sm group-hover:bg-error transition-colors relative">
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded font-data-mono transition-opacity whitespace-nowrap">$1.2M / $1.0M</div>
                    </div>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface mt-2 text-center text-[11px] font-medium uppercase tracking-wider">Facilities</span>
                </div>
              </div>
            </div>
          </div>
          {/* Secondary Chart: Forecast Trend (Span 4) */}
          <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col">
            <div className="p-container-padding border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface">Forecast Trend</h3>
            </div>
            <div className="p-container-padding flex-1 flex flex-col">
              <div className="mb-4">
                <span className="font-body-sm text-body-sm text-on-surface-variant block mb-1">Projected End of Year</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-page-title text-page-title text-on-surface">$25.7M</span>
                  <span className="font-body-sm text-body-sm text-error bg-error-container px-2 py-0.5 rounded-sm font-medium">+4.8% vs Plan</span>
                </div>
              </div>
              {/* Simulated Line Chart Area */}
              <div className="flex-1 w-full bg-surface-bright rounded border border-outline-variant overflow-hidden relative min-h-[160px]">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none">
                  <div className="w-full h-px bg-outline-variant/20"></div>
                  <div className="w-full h-px bg-outline-variant/20"></div>
                  <div className="w-full h-px bg-outline-variant/20"></div>
                </div>
                {/* SVG Curve simulation (decorative) */}
                <svg className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Budget Line */}
                  <polyline className="text-outline" fill="none" points="0,70 30,70 60,70 100,70" stroke="currentColor" strokeDasharray="4,4" strokeWidth="1.5" />
                  {/* Actual/Forecast Line */}
                  <path className="text-primary" d="M0,90 Q30,60 50,75 T100,40" fill="none" stroke="currentColor" strokeWidth="2" />
                  {/* Area under curve */}
                  <path className="text-primary opacity-10" d="M0,90 Q30,60 50,75 T100,40 L100,100 L0,100 Z" fill="currentColor" />
                </svg>
                {/* Plot Point */}
                <div className="absolute top-[35%] right-[5%] w-2 h-2 bg-primary rounded-full ring-2 ring-surface-container-lowest"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Section: Lists & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Category Utilization */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col">
            <div className="p-container-padding border-b border-outline-variant">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface">Category Utilization</h3>
            </div>
            <div className="p-4 flex flex-col gap-5">
              {/* Item 1 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-body-md text-body-md text-on-surface font-medium">Raw Materials</span>
                  <span className="font-data-mono text-data-mono text-on-surface">105%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex">
                  <div className="h-full bg-error" style={{ width: "100%" }}></div>
                  <div className="h-full bg-error-container" style={{ width: "5%" }}></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">$12.1M Spend</span>
                  <span className="font-body-sm text-body-sm text-error text-[11px]">$600K Over</span>
                </div>
              </div>
              {/* Item 2 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-body-md text-body-md text-on-surface font-medium">Logistics &amp; Freight</span>
                  <span className="font-data-mono text-data-mono text-on-surface">72%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "72%" }}></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">$6.2M Spend</span>
                  <span className="font-body-sm text-body-sm text-tertiary text-[11px]">$2.3M Remaining</span>
                </div>
              </div>
              {/* Item 3 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-body-md text-body-md text-on-surface font-medium">IT &amp; Software</span>
                  <span className="font-data-mono text-data-mono text-on-surface">77%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "77%" }}></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">$3.1M Spend</span>
                  <span className="font-body-sm text-body-sm text-tertiary text-[11px]">$900K Remaining</span>
                </div>
              </div>
              {/* Item 4 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-body-md text-body-md text-on-surface font-medium">Facilities Maintenance</span>
                  <span className="font-data-mono text-data-mono text-on-surface">120%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden flex">
                  <div className="h-full bg-error" style={{ width: "100%" }}></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">$1.2M Spend</span>
                  <span className="font-body-sm text-body-sm text-error text-[11px]">$200K Over</span>
                </div>
              </div>
            </div>
          </div>
          {/* Top Vendors Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col overflow-hidden">
            <div className="p-container-padding border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest z-10 sticky top-0">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface">Top Spending Vendors</h3>
              <a className="font-body-sm text-body-sm text-primary hover:underline" href="#">View All</a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-bright border-b border-outline-variant">
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Vendor Name</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Category</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">Spend YTD</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                    <td className="py-2 px-4 font-medium text-on-surface">GlobalChem Industries</td>
                    <td className="py-2 px-4 text-on-surface-variant">Raw Materials</td>
                    <td className="py-2 px-4 font-data-mono text-data-mono text-right">$4.2M</td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                    <td className="py-2 px-4 font-medium text-on-surface">Apex Logistics Group</td>
                    <td className="py-2 px-4 text-on-surface-variant">Logistics</td>
                    <td className="py-2 px-4 font-data-mono text-data-mono text-right">$3.8M</td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                    <td className="py-2 px-4 font-medium text-on-surface">SteelCorp Partners</td>
                    <td className="py-2 px-4 text-on-surface-variant">Raw Materials</td>
                    <td className="py-2 px-4 font-data-mono text-data-mono text-right">$2.9M</td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                    <td className="py-2 px-4 font-medium text-on-surface">CloudSys Systems</td>
                    <td className="py-2 px-4 text-on-surface-variant">IT Svcs</td>
                    <td className="py-2 px-4 font-data-mono text-data-mono text-right">$1.5M</td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors h-[40px]">
                    <td className="py-2 px-4 font-medium text-on-surface">Oceanic Freight Line</td>
                    <td className="py-2 px-4 text-on-surface-variant">Logistics</td>
                    <td className="py-2 px-4 font-data-mono text-data-mono text-right">$1.1M</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
