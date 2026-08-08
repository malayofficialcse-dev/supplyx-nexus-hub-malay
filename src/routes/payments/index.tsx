import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/payments/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Payment Directory | SupplyX" },
      { name: "description", content: "Manage and track outgoing payments to suppliers." },
      { property: "og:title", content: "Payment Directory | SupplyX" },
      { property: "og:description", content: "Manage and track outgoing payments to suppliers." },
    ],
  }),
});

function Page() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-stack-lg">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">Payment Directory</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage and track outgoing payments to suppliers.</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-surface text-on-surface border border-outline-variant rounded-[4px] font-body-md text-body-md hover:bg-surface-container-low transition-colors table-shadow">
              <Icon name="download" className="text-[18px]" />
              Export
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#2563eb] text-white rounded-[4px] font-body-md text-body-md font-medium hover:bg-blue-700 transition-colors table-shadow">
              <Icon name="add" className="text-[18px]" />
              New Payment
            </button>
          </div>
        </div>
        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* KPI 1 */}
          <div className="bg-surface border border-outline-variant rounded-lg p-container-padding table-shadow flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Total Paid (Jan)</span>
              <Icon name="account_balance_wallet" className="text-outline text-[20px]" />
            </div>
            <div className="flex items-end justify-between">
              <span className="font-section-heading text-section-heading font-semibold text-on-surface">$1.24M</span>
              <span className="font-body-sm text-body-sm text-[#16A34A] flex items-center bg-[#DCFCE7] px-1.5 py-0.5 rounded-[4px]">
                <Icon name="trending_up" className="text-[14px]" /> +4.2%
              </span>
            </div>
          </div>
          {/* KPI 2 */}
          <div className="bg-surface border border-outline-variant rounded-lg p-container-padding table-shadow flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Processing</span>
              <Icon name="pending" className="text-outline text-[20px]" />
            </div>
            <div className="flex items-end justify-between">
              <span className="font-section-heading text-section-heading font-semibold text-on-surface">42</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">$284.5k Vol.</span>
            </div>
          </div>
          {/* KPI 3 */}
          <div className="bg-surface border border-outline-variant rounded-lg p-container-padding table-shadow flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Failed Transactions</span>
              <Icon name="error" className="text-outline text-[20px]" />
            </div>
            <div className="flex items-end justify-between">
              <span className="font-section-heading text-section-heading font-semibold text-on-surface">3</span>
              <span className="font-body-sm text-body-sm text-[#ba1a1a] flex items-center bg-[#ffdad6] px-1.5 py-0.5 rounded-[4px]">
                Action Required
              </span>
            </div>
          </div>
        </div>
        {/* Table Controls & Filters */}
        <div className="bg-surface border border-outline-variant rounded-lg table-shadow flex flex-col">
          <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#F8FAFC] rounded-t-lg">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Filter: Status */}
              <div className="relative w-full sm:w-40">
                <select
                  defaultValue="all"
                  className="w-full appearance-none bg-surface border border-outline-variant rounded-[4px] py-1.5 pl-3 pr-8 font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                  <option value="failed">Failed</option>
                </select>
                <Icon name="expand_more" className="absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none" />
              </div>
              {/* Filter: Date */}
              <div className="relative w-full sm:w-48 hidden sm:block">
                <Icon name="calendar_today" className="absolute left-2 top-1/2 -translate-y-1/2 text-outline text-[16px]" />
                <input
                  className="w-full pl-8 pr-3 py-1.5 bg-surface border border-outline-variant rounded-[4px] font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer text-center"
                  readOnly
                  type="text"
                  defaultValue="Last 30 Days"
                />
              </div>
            </div>
            {/* Table Search */}
            <div className="relative w-full sm:w-64">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
              <input
                className="w-full pl-9 pr-3 py-1.5 bg-surface border border-outline-variant rounded-[4px] font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Search ID or Supplier..."
                type="text"
              />
            </div>
          </div>
          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-outline-variant sticky top-0 z-10">
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap w-32">Payment ID</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap">Supplier</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap hidden sm:table-cell">Invoice Ref</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap hidden md:table-cell">Method</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap text-right">Amount</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap text-center w-28">Status</th>
                  <th className="py-3 px-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 bg-surface">
                <tr className="h-10 hover:bg-surface-container-low transition-colors group">
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">PAY-8923</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface font-medium">Acme Manufacturing Corp.</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">INV-2024-001</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">ACH</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">Jan 28, 2024</td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">$45,200.00</td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-[4px] bg-[#DCFCE7] text-[#16A34A] font-body-sm text-[11px] font-medium leading-tight">Completed</span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
                <tr className="h-10 hover:bg-surface-container-low transition-colors group">
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">PAY-8924</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface font-medium">Global Logistics LLC</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">FRGHT-992</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">Wire</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">Jan 29, 2024</td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">$128,500.00</td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-[4px] bg-[#FEF9C3] text-[#CA8A04] font-body-sm text-[11px] font-medium leading-tight">Processing</span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
                <tr className="h-10 hover:bg-surface-container-low transition-colors group bg-error-container/10">
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">PAY-8925</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface font-medium">TechComponents Inc.</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">INV-TC-44</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">ACH</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">Jan 29, 2024</td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">$12,450.00</td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-[4px] bg-[#FEE2E2] text-[#DC2626] font-body-sm text-[11px] font-medium leading-tight">Failed</span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
                <tr className="h-10 hover:bg-surface-container-low transition-colors group">
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">PAY-8926</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface font-medium">Oceanic Shipping Co.</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">OS-2024-11</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">Wire</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">Jan 30, 2024</td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">$85,000.00</td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-[4px] bg-[#DCFCE7] text-[#16A34A] font-body-sm text-[11px] font-medium leading-tight">Completed</span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
                <tr className="h-10 hover:bg-surface-container-low transition-colors group">
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">PAY-8927</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface font-medium">SteelWorks Ltd.</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">ST-9981</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">ACH</td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">Jan 31, 2024</td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">$22,100.50</td>
                  <td className="py-2 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-[4px] bg-[#FEF9C3] text-[#CA8A04] font-body-sm text-[11px] font-medium leading-tight">Processing</span>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface rounded-b-lg">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Showing 1 to 5 of 142 entries</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-outline-variant rounded-[4px] bg-surface-container-low text-on-surface-variant font-body-sm hover:bg-surface-container transition-colors disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 border border-primary rounded-[4px] bg-[#EFF6FF] text-[#2563EB] font-body-sm font-medium">1</button>
              <button className="px-3 py-1 border border-outline-variant rounded-[4px] bg-surface text-on-surface hover:bg-surface-container-low transition-colors font-body-sm">2</button>
              <button className="px-3 py-1 border border-outline-variant rounded-[4px] bg-surface text-on-surface hover:bg-surface-container-low transition-colors font-body-sm">3</button>
              <span className="px-2 py-1 text-on-surface-variant">...</span>
              <button className="px-3 py-1 border border-outline-variant rounded-[4px] bg-surface text-on-surface hover:bg-surface-container-low transition-colors font-body-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
