import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/goods-receipts/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Goods Receipt | SupplyX" },
      { name: "description", content: "Log received items against an incoming purchase order." },
      { property: "og:title", content: "Goods Receipt | SupplyX" },
      { property: "og:description", content: "Log received items against an incoming purchase order." },
    ],
  }),
});

function Page() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-stack-lg">
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm mb-1">
              <span className="hover:text-primary cursor-pointer">Inventory</span>
              <Icon name="chevron_right" className="text-[16px]" />
              <span className="hover:text-primary cursor-pointer">Receipts</span>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface">Goods Receipt</h2>
          </div>
          <div>
            <span className="inline-flex items-center gap-1 bg-surface-container-high text-primary px-3 py-1 rounded font-body-sm text-body-sm">
              <Icon name="qr_code_scanner" className="text-[16px]" />
              Scan Barcode
            </span>
          </div>
        </div>
        {/* Main Form Card */}
        <div className="bg-surface rounded-xl border border-outline-variant shadow-slight p-container-padding">
          {/* Reference Section (Read Only context) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter pb-stack-lg border-b border-outline-variant">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">PO Reference</label>
              <div className="flex items-center gap-2">
                <span className="font-data-mono text-data-mono text-on-surface bg-surface-container px-2 py-1 rounded">PO-2023-8942A</span>
                <button className="text-primary hover:underline font-body-sm text-body-sm">View Details</button>
              </div>
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Expected Delivery</label>
              <p className="font-body-md text-body-md text-on-surface">Oct 24, 2023 (Today)</p>
            </div>
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Supplier</label>
              <div className="flex items-center gap-2">
                <Icon name="factory" className="text-on-surface-variant text-[18px]" />
                <p className="font-body-md text-body-md text-on-surface">TechCorp Industries</p>
              </div>
            </div>
          </div>
          {/* Line Items Logging */}
          <div className="pt-stack-lg">
            <h3 className="font-subsection-heading text-subsection-heading text-on-surface mb-stack-md flex items-center gap-2">
              <Icon name="view_list" className="text-primary" />
              Receiving Items (1/3 Pending)
            </h3>
            {/* Item Card (Active) */}
            <div className="border border-outline-variant rounded-lg p-stack-md bg-surface-bright relative">
              {/* Status Indicator */}
              <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-lg"></div>
              <div className="flex justify-between items-start mb-stack-md">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">SKU: TC-884-X</span>
                    <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">Expected: 500 Units</span>
                  </div>
                  <h4 className="font-body-md text-body-md font-medium text-on-surface">Industrial Grade Microprocessors (Gen 4)</h4>
                </div>
              </div>
              <form className="grid grid-cols-1 md:grid-cols-12 gap-gutter items-end">
                {/* Received Qty */}
                <div className="md:col-span-3">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Received Qty <span className="text-error">*</span></label>
                  <input className="w-full border border-outline-variant rounded p-2 font-data-mono text-data-mono text-on-surface input-focus-ring" type="number" defaultValue={500} />
                </div>
                {/* Damaged Qty */}
                <div className="md:col-span-3">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Damaged/Rejected</label>
                  <input className="w-full border border-outline-variant rounded p-2 font-data-mono text-data-mono text-error input-focus-ring" type="number" defaultValue={0} />
                </div>
                {/* Bin Location */}
                <div className="md:col-span-3">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Bin Location</label>
                  <div className="relative">
                    <Icon name="shelves" className="absolute left-2 top-2 text-on-surface-variant text-[18px]" />
                    <input className="w-full border border-outline-variant rounded p-2 pl-8 font-data-mono text-data-mono text-on-surface input-focus-ring uppercase" placeholder="e.g. A-12-B" type="text" />
                  </div>
                </div>
                {/* Quality Check */}
                <div className="md:col-span-3">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Quality Status</label>
                  <select defaultValue="pass" className="w-full border border-outline-variant rounded p-2 font-body-sm text-body-sm text-on-surface input-focus-ring bg-white">
                    <option value="pass">Passed Inspection</option>
                    <option value="pending">Pending QA</option>
                    <option value="fail">Failed - Quarantine</option>
                  </select>
                </div>
              </form>
              {/* Notes Section (Optional) */}
              <div className="mt-stack-md pt-stack-sm border-t border-outline-variant border-dashed">
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Receiving Notes (Optional)</label>
                <textarea className="w-full border border-outline-variant rounded p-2 font-body-sm text-body-sm text-on-surface input-focus-ring" placeholder="Add any observations about packaging or transport conditions..." rows={1} />
              </div>
            </div>
          </div>
        </div>
        {/* Action Footer */}
        <div className="flex justify-end gap-3 items-center">
          <button className="px-4 py-2 rounded font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container-high transition-colors">
            Cancel
          </button>
          <button className="px-4 py-2 rounded font-body-sm text-body-sm text-on-surface border border-outline-variant hover:bg-surface-container transition-colors">
            Save Draft
          </button>
          <button className="px-6 py-2 bg-[#2563EB] text-white rounded font-body-sm text-body-sm font-medium hover:bg-primary transition-colors flex items-center gap-2 shadow-slight">
            <Icon name="check_circle" className="text-[18px]" />
            Complete Receipt
          </button>
        </div>
      </div>
    </AppShell>
  );
}
