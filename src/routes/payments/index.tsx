import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { getPayments, Payment } from "@/lib/api";

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
  const navigate = useNavigate();
  const { data: payments, isLoading, error } = useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: getPayments,
  });

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
              <span className="font-body-sm text-body-sm text-on-surface-variant">Total Paid</span>
              <Icon name="account_balance_wallet" className="text-outline text-[20px]" />
            </div>
            <div className="flex items-end justify-between">
              <span className="font-section-heading text-section-heading font-semibold text-on-surface">
                {isLoading ? "—" : payments?.reduce((sum, payment) => sum + payment.amount, 0).toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                })}
              </span>
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
              <span className="font-section-heading text-section-heading font-semibold text-on-surface">
                {isLoading ? "—" : payments?.filter((item) => item.status.toLowerCase() === "processing").length ?? 0}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{isLoading ? "—" : `$${payments?.filter((item) => item.status.toLowerCase() === "processing").reduce((sum, item) => sum + item.amount, 0).toLocaleString() ?? "0"}`} Vol.</span>
            </div>
          </div>
          {/* KPI 3 */}
          <div className="bg-surface border border-outline-variant rounded-lg p-container-padding table-shadow flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Failed Transactions</span>
              <Icon name="error" className="text-outline text-[20px]" />
            </div>
            <div className="flex items-end justify-between">
              <span className="font-section-heading text-section-heading font-semibold text-on-surface">
                {isLoading ? "—" : payments?.filter((item) => item.status.toLowerCase() === "failed").length ?? 0}
              </span>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                      Loading payments...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-error">
                      Failed to load payments.
                    </td>
                  </tr>
                ) : !payments || payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                      No payments found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => {
                    const status = payment.status.toLowerCase();
                    const statusStyles =
                      status === "completed"
                        ? "bg-[#DCFCE7] text-[#16A34A]"
                        : status === "processing"
                        ? "bg-[#FEF9C3] text-[#CA8A04]"
                        : status === "failed"
                        ? "bg-[#FEE2E2] text-[#DC2626]"
                        : "bg-surface-container text-on-surface-variant";

                    return (
                      <tr key={payment.id} className="h-10 hover:bg-surface-container-low transition-colors group">
                        <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">{payment.paymentId}</td>
                        <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface font-medium">{payment.supplier}</td>
                        <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">{payment.invoiceId}</td>
                        <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">{payment.method}</td>
                        <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">{new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">
                          {payment.amount.toLocaleString(undefined, {
                            style: "currency",
                            currency: "USD",
                          })}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-[4px] font-body-sm text-[11px] font-medium leading-tight ${statusStyles}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <button onClick={() => navigate({ to: "/payments/detail", search: { id: payment.id } })} className="text-outline hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                            <Icon name="more_vert" className="text-[18px]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="p-4 border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center bg-surface rounded-b-lg gap-3">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Showing {payments?.length ?? 0} payment{payments && payments.length === 1 ? "" : "s"}
            </span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-outline-variant rounded-[4px] bg-surface-container-low text-on-surface-variant font-body-sm hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
                Prev
              </button>
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
