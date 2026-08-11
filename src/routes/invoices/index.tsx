import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInvoices, Invoice } from "@/lib/api";

export const Route = createFileRoute("/invoices/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Invoice Management - SupplyX" },
      {
        name: "description",
        content: "Track, filter, and manage supplier invoices, payment status, and outstanding balances.",
      },
      { property: "og:title", content: "Invoice Management - SupplyX" },
      {
        property: "og:description",
        content: "Track, filter, and manage supplier invoices, payment status, and outstanding balances.",
      },
    ],
  }),
});

function Page() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const { data: invoices, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const allInvoices = invoices || [];
  const filteredInvoices = allInvoices.filter((inv) => {
    if (filterStatus === "All") return true;
    return inv.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const totalOutstanding = allInvoices
    .filter((inv) => inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalOverdue = allInvoices
    .filter((inv) => inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingCount = allInvoices.filter((inv) => inv.status === "Pending").length;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Breadcrumbs */}
        <div className="flex justify-between items-end mb-stack-lg flex-shrink-0">
          <div>
            <nav aria-label="Breadcrumb" className="flex text-xs text-on-surface-variant mb-2 font-medium">
              <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                  <a className="hover:text-primary transition-colors" href="#">
                    Finance
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <Icon name="chevron_right" className="text-[14px] mx-1" />
                    <a className="hover:text-primary transition-colors" href="#">
                      Accounts Payable
                    </a>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <Icon name="chevron_right" className="text-[14px] mx-1" />
                    <span className="text-on-surface font-semibold">Invoices</span>
                  </div>
                </li>
              </ol>
            </nav>
            <h2 className="font-page-title text-page-title text-on-surface">Invoice Management</h2>
          </div>
          <div className="flex gap-3">
            <button className="bg-[#EFF6FF] text-[#2563EB] font-body-sm text-body-sm font-medium py-2 px-4 rounded flex items-center gap-2 hover:bg-blue-100 transition-colors border border-transparent">
              <Icon name="download" className="text-[18px]" />
              Export CSV
            </button>
            <button
              onClick={() => navigate({ to: "/orders/new" })}
              className="bg-[#2563EB] text-white font-body-sm text-body-sm font-medium py-2 px-4 rounded flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
            >
              <Icon name="add" className="text-[18px]" />
              New Invoice
            </button>
          </div>
        </div>

        {/* Filters & KPI Ribbon */}
        <div className="flex gap-4 mb-stack-md flex-shrink-0">
          <div className="bg-surface border border-outline-variant rounded p-3 flex-1 flex flex-col justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <span className="text-xs text-on-surface-variant font-medium">Total Outstanding</span>
            <div className="flex justify-between items-end mt-1">
              <span className="font-semibold text-lg text-on-surface">
                {isLoading ? "..." : `$${totalOutstanding.toLocaleString()}`}
              </span>
              <span className="text-xs text-error font-medium flex items-center">
                <Icon name="arrow_upward" className="text-[14px]" /> Live DB
              </span>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant rounded p-3 flex-1 flex flex-col justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <span className="text-xs text-on-surface-variant font-medium">Overdue Value</span>
            <div className="flex justify-between items-end mt-1">
              <span className="font-semibold text-lg text-error">
                {isLoading ? "..." : `$${totalOverdue.toLocaleString()}`}
              </span>
              <span className="text-xs text-error font-medium flex items-center">
                <Icon name="warning" className="text-[14px]" /> Action
              </span>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant rounded p-3 flex-1 flex flex-col justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <span className="text-xs text-on-surface-variant font-medium">Pending Approval</span>
            <div className="flex justify-between items-end mt-1">
              <span className="font-semibold text-lg text-on-surface">
                {isLoading ? "..." : `${pendingCount} Invoices`}
              </span>
              <span className="text-xs text-tertiary-container font-medium flex items-center">
                <Icon name="schedule" className="text-[14px]" /> Pending
              </span>
            </div>
          </div>
          <div className="flex-none flex items-end ml-4">
            <div className="flex bg-surface-container-low rounded border border-outline-variant p-1">
              {["All", "Pending", "Paid", "Overdue"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    filterStatus === status
                      ? "bg-surface shadow-sm border border-outline-variant text-on-surface font-bold"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="bg-surface border border-outline-variant rounded shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col flex-1 overflow-hidden">
          <div className="table-container w-full overflow-x-auto">
            <table className="w-full text-left text-body-sm text-on-surface whitespace-nowrap border-collapse">
              <thead className="font-label-caps text-label-caps text-on-surface-variant bg-[#F8FAFC] border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 w-12 text-center" scope="col">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase" scope="col">Invoice #</th>
                  <th className="px-4 py-3 font-semibold uppercase" scope="col">Supplier</th>
                  <th className="px-4 py-3 font-semibold uppercase" scope="col">Date</th>
                  <th className="px-4 py-3 font-semibold uppercase text-right" scope="col">Total Amount</th>
                  <th className="px-4 py-3 font-semibold uppercase text-center" scope="col">Status</th>
                  <th className="px-4 py-3 font-semibold uppercase text-right" scope="col">Actions</th>
                </tr>
              </thead>
              <tbody className="font-data-mono text-data-mono">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                      Loading Invoices...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-error">
                      Failed to load invoices.
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                      <td className="px-4 py-2 text-center">
                        <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                      </td>
                      <td className="px-4 py-2 font-medium text-primary cursor-pointer hover:underline" onClick={() => navigate({ to: "/invoices/detail", search: { id: invoice.id } })}>
                        {invoice.invoiceId}
                      </td>
                      <td className="px-4 py-2 font-body-sm text-body-sm font-medium">{invoice.supplier}</td>
                      <td className="px-4 py-2 text-on-surface-variant">{invoice.date}</td>
                      <td className="px-4 py-2 text-right font-medium">${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold ${
                          invoice.status === "Paid"
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : invoice.status === "Overdue"
                              ? "bg-[#FEE2E2] text-[#DC2626]"
                              : "bg-[#FEF9C3] text-[#CA8A04]"
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button onClick={() => navigate({ to: "/invoices/detail", search: { id: invoice.id } })} className="text-on-surface-variant hover:text-primary transition-colors">
                          <Icon name="visibility" className="text-[18px]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-outline-variant bg-surface flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Showing 1 to {filteredInvoices.length} of {allInvoices.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 bg-primary text-white rounded font-medium text-xs">1</button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

