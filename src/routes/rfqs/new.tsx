import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/rfqs/new")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Create New RFQ - SupplyX" },
      {
        name: "description",
        content: "Create a new Request for Quotation with line items, terms, and supplier selection.",
      },
      { property: "og:title", content: "Create New RFQ - SupplyX" },
      {
        property: "og:description",
        content: "Create a new Request for Quotation with line items, terms, and supplier selection.",
      },
    ],
  }),
});

function Page() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant mb-1">
              <a className="hover:text-primary transition-colors" href="#">
                Procurement
              </a>
              <Icon name="chevron_right" className="text-[16px]" />
              <a className="hover:text-primary transition-colors" href="#">
                RFQs
              </a>
              <Icon name="chevron_right" className="text-[16px]" />
              <span className="text-on-surface">Create RFQ</span>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface">
              Create New Request for Quotation
            </h2>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-outline-variant bg-surface text-on-surface rounded hover:bg-surface-container-low transition-colors font-body-md text-body-md shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              Save Draft
            </button>
            <button className="px-4 py-2 bg-primary-container text-on-primary rounded hover:bg-primary transition-colors font-body-md text-body-md shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex items-center gap-2">
              <Icon name="send" className="text-[18px]" /> Send to Suppliers
            </button>
          </div>
        </div>
        {/* Bento Grid Layout for Form */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Left Column: Scope & Items (8 cols) */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-gutter">
            {/* Basic Info Card */}
            <section className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <h3 className="font-section-heading text-section-heading text-on-surface mb-4 border-b border-outline-variant pb-2">
                RFQ Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
                    RFQ Title <span className="text-error">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-outline-variant rounded font-body-md text-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-fixed-dim outline-none transition-all"
                    placeholder="e.g., Q3 Office Electronics Procurement"
                    type="text"
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
                    Link to PR (Optional)
                  </label>
                  <div className="relative">
                    <Icon
                      name="link"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                    />
                    <input
                      className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded font-body-md text-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-fixed-dim outline-none transition-all"
                      placeholder="PR-2023-0042"
                      type="text"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
                    Bidding Deadline <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Icon
                      name="calendar_today"
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                    />
                    <input
                      className="w-full pl-9 pr-3 py-2 border border-error rounded font-body-md text-body-md focus:border-error focus:ring-2 focus:ring-error-container outline-none transition-all text-on-surface"
                      type="date"
                    />
                    <Icon
                      name="error"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-error text-[18px]"
                    />
                  </div>
                  <p className="text-[11px] text-error mt-1">
                    Please select a valid future date.
                  </p>
                </div>
              </div>
            </section>
            {/* Items from PR Card */}
            <section className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant pb-2">
                <h3 className="font-section-heading text-section-heading text-on-surface">
                  Line Items
                </h3>
                <button className="text-primary-container font-body-sm text-body-sm flex items-center gap-1 hover:underline">
                  <Icon name="add" className="text-[16px]" /> Add Item
                </button>
              </div>
              <div className="overflow-x-auto border border-outline-variant rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-outline-variant">
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-10"></th>
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">
                        Item Description
                      </th>
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-24">
                        Qty
                      </th>
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-32">
                        UOM
                      </th>
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-32">
                        Target Date
                      </th>
                      <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-outline-variant h-[40px] hover:bg-surface-container-lowest">
                      <td className="py-1 px-4">
                        <Icon
                          name="drag_indicator"
                          className="text-outline text-[18px] cursor-grab"
                        />
                      </td>
                      <td className="py-1 px-4">
                        <input
                          className="w-full bg-transparent border-none p-0 font-body-sm text-body-sm focus:ring-0"
                          type="text"
                          defaultValue="ThinkPad T14 Gen 3"
                        />
                      </td>
                      <td className="py-1 px-4">
                        <input
                          className="w-full px-2 py-1 border border-outline-variant rounded font-data-mono text-data-mono focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                          type="number"
                          defaultValue="50"
                        />
                      </td>
                      <td className="py-1 px-4">
                        <select
                          className="w-full px-2 py-1 border border-outline-variant rounded font-body-sm text-body-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none bg-white"
                          defaultValue="EA"
                        >
                          <option>EA</option>
                          <option>BOX</option>
                        </select>
                      </td>
                      <td className="py-1 px-4">
                        <input
                          className="w-full px-2 py-1 border border-outline-variant rounded font-body-sm text-body-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none text-on-surface-variant"
                          type="date"
                          defaultValue="2023-11-15"
                        />
                      </td>
                      <td className="py-1 px-4 text-center">
                        <button className="text-outline hover:text-error transition-colors">
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-outline-variant h-[40px] hover:bg-surface-container-lowest">
                      <td className="py-1 px-4">
                        <Icon
                          name="drag_indicator"
                          className="text-outline text-[18px] cursor-grab"
                        />
                      </td>
                      <td className="py-1 px-4">
                        <input
                          className="w-full bg-transparent border-none p-0 font-body-sm text-body-sm focus:ring-0"
                          type="text"
                          defaultValue="Dell 27 Monitor - P2722H"
                        />
                      </td>
                      <td className="py-1 px-4">
                        <input
                          className="w-full px-2 py-1 border border-outline-variant rounded font-data-mono text-data-mono focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none"
                          type="number"
                          defaultValue="100"
                        />
                      </td>
                      <td className="py-1 px-4">
                        <select
                          className="w-full px-2 py-1 border border-outline-variant rounded font-body-sm text-body-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none bg-white"
                          defaultValue="EA"
                        >
                          <option>EA</option>
                        </select>
                      </td>
                      <td className="py-1 px-4">
                        <input
                          className="w-full px-2 py-1 border border-outline-variant rounded font-body-sm text-body-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none text-on-surface-variant"
                          type="date"
                          defaultValue="2023-11-15"
                        />
                      </td>
                      <td className="py-1 px-4 text-center">
                        <button className="text-outline hover:text-error transition-colors">
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex justify-between items-center text-body-sm">
                <span className="text-on-surface-variant">2 items total</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-[#EFF6FF] text-primary-container rounded font-medium hover:bg-[#DBEAFE] transition-colors border border-transparent">
                    Import via CSV
                  </button>
                </div>
              </div>
            </section>
            {/* Terms & Evaluation Card */}
            <section className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              <h3 className="font-section-heading text-section-heading text-on-surface mb-4 border-b border-outline-variant pb-2">
                Requirements & Evaluation
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
                    Terms & Conditions
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-outline-variant rounded font-body-md text-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-fixed-dim outline-none transition-all resize-y"
                    placeholder="Specify any specific delivery terms, incoterms, or compliance requirements here..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-1 uppercase">
                    Evaluation Criteria Weights
                  </label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-body-sm mb-1">
                        <span className="text-on-surface">Price</span>
                        <span className="font-data-mono font-medium">60%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container w-[60%]"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-body-sm mb-1">
                        <span className="text-on-surface">Lead Time</span>
                        <span className="font-data-mono font-medium">30%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-[#14B8A6] w-[30%]"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-body-sm mb-1">
                        <span className="text-on-surface">Quality Rating</span>
                        <span className="font-data-mono font-medium">10%</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-[#F59E0B] w-[10%]"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-2 text-right">
                    Total must equal 100%
                  </p>
                </div>
              </div>
            </section>
          </div>
          {/* Right Column: Suppliers (4 cols) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter">
            <section className="bg-surface border border-outline-variant rounded-lg shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col h-full max-h-[calc(100vh-140px)] sticky top-[80px]">
              <div className="p-container-padding border-b border-outline-variant">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-section-heading text-section-heading text-on-surface">
                    Selected Suppliers
                  </h3>
                  <span className="bg-[#EFF6FF] text-primary-container px-2 py-0.5 rounded-full text-[11px] font-bold">
                    3 Selected
                  </span>
                </div>
                <div className="relative">
                  <Icon
                    name="search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]"
                  />
                  <input
                    className="w-full pl-8 pr-3 py-1.5 border border-outline-variant rounded text-body-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none bg-surface-container-low"
                    placeholder="Search suppliers to add..."
                    type="text"
                  />
                </div>
              </div>
              {/* Supplier List (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {/* Selected Supplier */}
                <div className="flex items-center justify-between p-2 rounded hover:bg-surface-container-lowest border border-outline-variant bg-surface transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#F8FAFC] border border-outline-variant flex items-center justify-center text-primary-container font-bold text-xs">
                      TC
                    </div>
                    <div>
                      <p className="font-subsection-heading text-subsection-heading text-on-surface text-[13px] leading-tight">
                        TechCorp Global
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] text-[#16A34A] rounded text-[10px] font-medium border border-[#bbf7d0]">
                          Tier 1
                        </span>
                        <span className="text-[11px] text-on-surface-variant flex items-center">
                          <Icon name="star" className="text-[12px] mr-0.5 text-[#F59E0B]" />
                          4.8
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="close" className="text-[18px]" />
                  </button>
                </div>
                {/* Selected Supplier */}
                <div className="flex items-center justify-between p-2 rounded hover:bg-surface-container-lowest border border-outline-variant bg-surface transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#F8FAFC] border border-outline-variant flex items-center justify-center text-primary-container font-bold text-xs">
                      OS
                    </div>
                    <div>
                      <p className="font-subsection-heading text-subsection-heading text-on-surface text-[13px] leading-tight">
                        OfficeSupplies Inc
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.5 bg-[#FEF9C3] text-[#CA8A04] rounded text-[10px] font-medium border border-[#fef08a]">
                          Tier 2
                        </span>
                        <span className="text-[11px] text-on-surface-variant flex items-center">
                          <Icon name="star" className="text-[12px] mr-0.5 text-[#F59E0B]" />
                          4.2
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="close" className="text-[18px]" />
                  </button>
                </div>
                {/* Selected Supplier */}
                <div className="flex items-center justify-between p-2 rounded hover:bg-surface-container-lowest border border-outline-variant bg-surface transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-[#F8FAFC] border border-outline-variant flex items-center justify-center text-primary-container font-bold text-xs">
                      NL
                    </div>
                    <div>
                      <p className="font-subsection-heading text-subsection-heading text-on-surface text-[13px] leading-tight">
                        NEXUS Logistics & IT
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.5 bg-[#DCFCE7] text-[#16A34A] rounded text-[10px] font-medium border border-[#bbf7d0]">
                          Tier 1
                        </span>
                        <span className="text-[11px] text-on-surface-variant flex items-center">
                          <Icon name="star" className="text-[12px] mr-0.5 text-[#F59E0B]" />
                          4.9
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="close" className="text-[18px]" />
                  </button>
                </div>
                {/* Divider for suggested */}
                <div className="py-2 px-2">
                  <p className="font-label-caps text-label-caps text-outline uppercase">
                    Suggested (Based on items)
                  </p>
                </div>
                {/* Unselected Supplier */}
                <div className="flex items-center justify-between p-2 rounded hover:bg-surface-container-low transition-colors group cursor-pointer border border-transparent hover:border-outline-variant">
                  <div className="flex items-center gap-3 opacity-60">
                    <div className="w-8 h-8 rounded bg-surface border border-outline flex items-center justify-center text-on-surface-variant font-bold text-xs">
                      CD
                    </div>
                    <div>
                      <p className="font-subsection-heading text-subsection-heading text-on-surface text-[13px] leading-tight">
                        Compute Direct
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.5 bg-[#F1F5F9] text-[#475569] rounded text-[10px] font-medium">
                          Tier 3
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="text-primary-container opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="add_circle" className="text-[18px]" />
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-outline-variant bg-[#F8FAFC] rounded-b-lg">
                <div className="flex items-start gap-2">
                  <Icon name="info" className="text-[16px] text-[#CA8A04] mt-0.5" />
                  <p className="text-[11px] text-on-surface-variant leading-tight">
                    Minimum of 3 suppliers is recommended for this procurement category to ensure
                    competitive bidding.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
