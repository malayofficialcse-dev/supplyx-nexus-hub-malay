import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api";

export const Route = createFileRoute("/orders/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Purchase Orders - SupplyX" },
      { name: "description", content: "Browse, search, and manage all purchase orders across vendors." },
      { property: "og:title", content: "Purchase Orders - SupplyX" },
      { property: "og:description", content: "Browse, search, and manage all purchase orders across vendors." },
    ],
  }),
});

function Page() {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const liveOrders = orders || [];

  // Calculate sum and statistics
  const totalSpend = liveOrders.reduce((sum, o) => sum + o.amount, 0);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs & Header Actions */}
        <div className="flex justify-between items-end mb-stack-lg">
          <div>
            <nav className="flex text-sm text-on-surface-variant mb-2">
              <ol className="flex items-center space-x-2">
                <li><a className="hover:text-primary" href="#">Orders</a></li>
                <li><Icon name="chevron_right" className="text-[14px]" /></li>
                <li className="font-medium text-on-surface">Purchase Orders</li>
              </ol>
            </nav>
            <h2 className="font-page-title text-page-title text-on-surface">Purchase Orders</h2>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-transparent text-[#64748B] hover:bg-surface-container-high py-2 px-4 border border-[#E2E8F0] rounded-[4px] font-medium text-[14px] transition-colors">
              <Icon name="filter_list" className="text-[18px]" />
              Filters
            </button>
            <button
              onClick={() => navigate({ to: "/orders/new" })}
              className="flex items-center gap-2 bg-[#2563EB] text-white py-2 px-4 rounded-[4px] font-medium text-[14px] hover:bg-blue-700 transition-colors"
            >
              <Icon name="add" className="text-[18px]" />
              Create PO
            </button>
          </div>
        </div>
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-4 gap-gutter mb-stack-lg">
          <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-[4px] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative">
            <h3 className="text-[#64748B] text-[13px] font-medium mb-1">Total POs (YTD)</h3>
            <div className="text-[20px] font-semibold text-on-surface">{isLoading ? "..." : liveOrders.length}</div>
            <div className="absolute bottom-4 right-4 flex items-center text-[#16A34A] text-xs font-medium">
              <Icon name="trending_up" className="text-[14px] mr-0.5" />
              +12%
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-[4px] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative">
            <h3 className="text-[#64748B] text-[13px] font-medium mb-1">Total Spend</h3>
            <div className="text-[20px] font-semibold text-on-surface">
              {isLoading ? "..." : `$${totalSpend.toLocaleString()}`}
            </div>
            <div className="absolute bottom-4 right-4 flex items-center text-[#16A34A] text-xs font-medium">
              <Icon name="trending_up" className="text-[14px] mr-0.5" />
              +5.4%
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-[4px] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative">
            <h3 className="text-[#64748B] text-[13px] font-medium mb-1">Pending Delivery</h3>
            <div className="text-[20px] font-semibold text-on-surface">
              {isLoading ? "..." : liveOrders.filter((o) => o.status === "Submitted").length}
            </div>
            <div className="absolute bottom-4 right-4 flex items-center text-[#64748B] text-xs font-medium">
              <span>Active</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-[4px] p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] relative">
            <h3 className="text-[#64748B] text-[13px] font-medium mb-1">Exceptions / Delayed</h3>
            <div className="text-[20px] font-semibold text-on-surface">0</div>
            <div className="absolute bottom-4 right-4 flex items-center text-error text-xs font-medium">
              <Icon name="warning" className="text-[14px] mr-0.5" />
              0 Needs Action
            </div>
          </div>
        </div>
        {/* Data Table Card */}
        <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-[4px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col h-[600px]">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-surface-container-lowest z-10">
            <div className="flex gap-2">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1.5 text-outline-variant text-[16px]" />
                <input className="pl-8 pr-3 py-1.5 border border-[#E2E8F0] rounded-[4px] text-[13px] focus:outline-none focus:border-[#2563EB] w-64" placeholder="Search this view..." type="text" />
              </div>
              <select className="border border-[#E2E8F0] rounded-[4px] text-[13px] py-1.5 pl-3 pr-8 focus:outline-none focus:border-[#2563EB] text-on-surface-variant bg-white appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23737686%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-no-repeat bg-[position:right_10px_center]" defaultValue="All Statuses">
                <option>All Statuses</option>
                <option>Sent</option>
                <option>Received</option>
                <option>Cancelled</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded transition-colors" title="Export">
                <Icon name="download" className="text-[18px]" />
              </button>
              <button className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded transition-colors" title="Column Settings">
                <Icon name="view_column" className="text-[18px]" />
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="overflow-auto flex-1 no-scrollbar relative">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="bg-[#F8FAFC] sticky top-0 z-10 border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-[#64748B] font-semibold w-12 text-center">
                    <input className="rounded-[2px] border-[#c3c6d7] text-primary focus:ring-primary" type="checkbox" />
                  </th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-[#64748B] font-semibold cursor-pointer hover:text-on-surface">
                    PO Number <Icon name="arrow_downward" className="text-[12px] align-middle ml-1" />
                  </th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-[#64748B] font-semibold">Vendor</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-[#64748B] font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-[#64748B] font-semibold">Delivery Date</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-[#64748B] font-semibold">PO Status</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-[#64748B] font-semibold">Payment Status</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-[#64748B] font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-on-surface-variant">
                      Loading Purchase Orders...
                    </td>
                  </tr>
                ) : liveOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-on-surface-variant">
                      No purchase orders found.
                    </td>
                  </tr>
                ) : (
                  liveOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F8FAFC] transition-colors h-[40px] group">
                      <td className="px-4 text-center">
                        <input className="rounded-[2px] border-[#c3c6d7] text-primary focus:ring-primary" type="checkbox" />
                      </td>
                      <td className="px-4 font-data-mono text-data-mono font-medium text-primary">{order.orderId}</td>
                      <td className="px-4 text-on-surface font-medium">{order.supplier}</td>
                      <td className="px-4 font-data-mono text-data-mono text-right">${order.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 text-on-surface-variant">{order.deliveryDate}</td>
                      <td className="px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                          order.status === "Approved"
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : order.status === "Submitted"
                              ? "bg-[#EFF6FF] text-[#2563EB]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                        }`}>{order.status}</span>
                      </td>
                      <td className="px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[11px] font-medium ${
                          order.status === "Approved" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.status === "Approved" ? "bg-[#22C55E]" : "bg-[#94A3B8]"}`}></span> {order.status === "Approved" ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-on-surface-variant hover:text-primary mr-2" title="Download PDF">
                          <Icon name="picture_as_pdf" className="text-[16px]" />
                        </button>
                        <button className="text-on-surface-variant hover:text-primary" title="Track Shipment">
                          <Icon name="local_shipping" className="text-[16px]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="p-3 border-t border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC] text-[13px] text-on-surface-variant">
            <div>Showing 1 to {liveOrders.length} of {liveOrders.length} entries</div>
            <div className="flex items-center gap-2">
              <button className="p-1 border border-[#E2E8F0] rounded-[4px] hover:bg-surface-container-lowest disabled:opacity-50" disabled>
                <Icon name="chevron_left" className="text-[16px]" />
              </button>
              <button className="px-2.5 py-1 border border-[#E2E8F0] rounded-[4px] bg-[#2563EB] text-white">1</button>
              <button className="p-1 border border-[#E2E8F0] rounded-[4px] bg-surface-container-lowest disabled:opacity-50" disabled>
                <Icon name="chevron_right" className="text-[16px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

