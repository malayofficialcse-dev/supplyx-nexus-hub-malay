import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

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
            <button className="bg-[#EFF6FF] text-[#2563EB] font-body-sm text-body-sm font-medium py-2 px-4 rounded-DEFAULT flex items-center gap-2 hover:bg-blue-100 transition-colors border border-transparent">
              <Icon name="download" className="text-[18px]" />
              Export CSV
            </button>
            <button className="bg-[#2563EB] text-white font-body-sm text-body-sm font-medium py-2 px-4 rounded-DEFAULT flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <Icon name="add" className="text-[18px]" />
              New Invoice
            </button>
          </div>
        </div>
        {/* Filters & KPI Ribbon */}
        <div className="flex gap-4 mb-stack-md flex-shrink-0">
          <div className="bg-surface border border-outline-variant rounded-DEFAULT p-3 flex-1 flex flex-col justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <span className="text-xs text-on-surface-variant font-medium">Total Outstanding</span>
            <div className="flex justify-between items-end mt-1">
              <span className="font-semibold text-lg text-on-surface">$1,245,000</span>
              <span className="text-xs text-error font-medium flex items-center">
                <Icon name="arrow_upward" className="text-[14px]" /> 4.2%
              </span>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant rounded-DEFAULT p-3 flex-1 flex flex-col justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <span className="text-xs text-on-surface-variant font-medium">Overdue</span>
            <div className="flex justify-between items-end mt-1">
              <span className="font-semibold text-lg text-on-surface">$312,450</span>
              <span className="text-xs text-error font-medium flex items-center">
                <Icon name="arrow_upward" className="text-[14px]" /> 1.1%
              </span>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant rounded-DEFAULT p-3 flex-1 flex flex-col justify-between shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <span className="text-xs text-on-surface-variant font-medium">Pending Approval</span>
            <div className="flex justify-between items-end mt-1">
              <span className="font-semibold text-lg text-on-surface">42 Invoices</span>
              <span className="text-xs text-tertiary-container font-medium flex items-center">
                <Icon name="arrow_downward" className="text-[14px]" /> 2.4%
              </span>
            </div>
          </div>
          <div className="flex-none flex items-end ml-4">
            <div className="flex bg-surface-container-low rounded-DEFAULT border border-outline-variant p-1">
              <button className="px-3 py-1.5 text-xs font-semibold bg-surface shadow-sm rounded border border-outline-variant text-on-surface">
                All
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Pending
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Paid
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors">
                Overdue
              </button>
            </div>
          </div>
        </div>
        {/* Data Table Container */}
        <div className="bg-surface border border-outline-variant rounded-DEFAULT shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col flex-1 overflow-hidden">
          <div className="table-container w-full overflow-x-auto">
            <table className="w-full text-left text-body-sm text-on-surface whitespace-nowrap">
              <thead className="font-label-caps text-label-caps text-on-surface-variant bg-[#F8FAFC] border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 w-12 text-center" scope="col">
                    <input
                      className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                      type="checkbox"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase" scope="col">
                    Invoice #
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase" scope="col">
                    PO #
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase" scope="col">
                    Supplier
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase" scope="col">
                    Date
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase" scope="col">
                    Due Date
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase text-right" scope="col">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase text-center" scope="col">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold uppercase text-right" scope="col">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="font-data-mono text-data-mono">
                <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                  <td className="px-4 py-2 text-center">
                    <input
                      className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-primary">INV-2023-9012</td>
                  <td className="px-4 py-2 text-on-surface-variant">PO-88392</td>
                  <td className="px-4 py-2 font-body-sm text-body-sm font-medium">Acme Corp Logistics</td>
                  <td className="px-4 py-2 text-on-surface-variant">Oct 12, 2023</td>
                  <td className="px-4 py-2 text-on-surface-variant">Nov 11, 2023</td>
                  <td className="px-4 py-2 text-right font-medium">$45,200.00</td>
                  <td className="px-4 py-2 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-[#DCFCE7] text-[#16A34A]">
                      Paid
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                  <td className="px-4 py-2 text-center">
                    <input
                      className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-primary">INV-2023-9013</td>
                  <td className="px-4 py-2 text-on-surface-variant">PO-88395</td>
                  <td className="px-4 py-2 font-body-sm text-body-sm font-medium">Global Freight Solutions</td>
                  <td className="px-4 py-2 text-on-surface-variant">Oct 14, 2023</td>
                  <td className="px-4 py-2 text-error font-medium">Oct 28, 2023</td>
                  <td className="px-4 py-2 text-right font-medium">$12,450.50</td>
                  <td className="px-4 py-2 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FEE2E2] text-[#DC2626]">
                      Overdue
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                  <td className="px-4 py-2 text-center">
                    <input
                      className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-primary">INV-2023-9014</td>
                  <td className="px-4 py-2 text-on-surface-variant">PO-88401</td>
                  <td className="px-4 py-2 font-body-sm text-body-sm font-medium">TechSupply Inc.</td>
                  <td className="px-4 py-2 text-on-surface-variant">Oct 15, 2023</td>
                  <td className="px-4 py-2 text-on-surface-variant">Nov 14, 2023</td>
                  <td className="px-4 py-2 text-right font-medium">$8,900.00</td>
                  <td className="px-4 py-2 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FEF9C3] text-[#CA8A04]">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                  <td className="px-4 py-2 text-center">
                    <input
                      className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-primary">INV-2023-9015</td>
                  <td className="px-4 py-2 text-on-surface-variant">PO-88402</td>
                  <td className="px-4 py-2 font-body-sm text-body-sm font-medium">Apex Manufacturing</td>
                  <td className="px-4 py-2 text-on-surface-variant">Oct 16, 2023</td>
                  <td className="px-4 py-2 text-on-surface-variant">Nov 15, 2023</td>
                  <td className="px-4 py-2 text-right font-medium">$134,000.00</td>
                  <td className="px-4 py-2 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FEF9C3] text-[#CA8A04]">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                  <td className="px-4 py-2 text-center">
                    <input
                      className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-primary">INV-2023-9016</td>
                  <td className="px-4 py-2 text-on-surface-variant">PO-88380</td>
                  <td className="px-4 py-2 font-body-sm text-body-sm font-medium">Acme Corp Logistics</td>
                  <td className="px-4 py-2 text-on-surface-variant">Oct 05, 2023</td>
                  <td className="px-4 py-2 text-on-surface-variant">Nov 04, 2023</td>
                  <td className="px-4 py-2 text-right font-medium">$22,150.00</td>
                  <td className="px-4 py-2 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-[#DCFCE7] text-[#16A34A]">
                      Paid
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-outline-variant hover:bg-surface-container-low transition-colors h-[40px]">
                  <td className="px-4 py-2 text-center">
                    <input
                      className="rounded border-outline-variant text-primary-container focus:ring-primary-container"
                      type="checkbox"
                    />
                  </td>
                  <td className="px-4 py-2 font-medium text-primary">INV-2023-9017</td>
                  <td className="px-4 py-2 text-on-surface-variant">PO-88410</td>
                  <td className="px-4 py-2 font-body-sm text-body-sm font-medium">Zenith Packaging</td>
                  <td className="px-4 py-2 text-on-surface-variant">Oct 18, 2023</td>
                  <td className="px-4 py-2 text-on-surface-variant">Nov 17, 2023</td>
                  <td className="px-4 py-2 text-right font-medium">$5,400.75</td>
                  <td className="px-4 py-2 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-semibold bg-[#FEF9C3] text-[#CA8A04]">
                      Pending
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-on-surface-variant hover:text-primary transition-colors">
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-outline-variant bg-surface flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">Showing 1 to 6 of 42 entries</span>
            <div className="flex items-center gap-1">
              <button
                className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
                disabled
              >
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <button className="w-8 h-8 rounded bg-primary-container text-white font-medium text-xs">1</button>
              <button className="w-8 h-8 rounded hover:bg-surface-container-low text-on-surface font-medium text-xs transition-colors">
                2
              </button>
              <button className="w-8 h-8 rounded hover:bg-surface-container-low text-on-surface font-medium text-xs transition-colors">
                3
              </button>
              <span className="px-1 text-on-surface-variant">...</span>
              <button className="w-8 h-8 rounded hover:bg-surface-container-low text-on-surface font-medium text-xs transition-colors">
                7
              </button>
              <button className="w-8 h-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low transition-colors">
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
