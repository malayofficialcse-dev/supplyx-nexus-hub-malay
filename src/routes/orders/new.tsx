import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/orders/new")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Create Purchase Order - SupplyX" },
      { name: "description", content: "Draft a new purchase order from an RFQ, including vendor, shipping, line items and totals." },
      { property: "og:title", content: "Create Purchase Order - SupplyX" },
      { property: "og:description", content: "Draft a new purchase order from an RFQ, including vendor, shipping, line items and totals." },
    ],
  }),
});

function Page() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-1">
              <span className="font-body-sm text-body-sm">From RFQ:</span>
              <span className="font-data-mono text-data-mono bg-surface-container px-2 py-0.5 rounded border border-outline-variant">RFQ-2024-8902</span>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface">Purchase Order: Draft</h2>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 rounded bg-surface border border-outline-variant text-on-surface-variant font-body-md text-body-md hover:bg-surface-container transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              Save Draft
            </button>
            <button className="px-4 py-2 rounded bg-primary-container text-on-primary font-body-md text-body-md font-medium hover:bg-primary transition-colors shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
              Generate PO
            </button>
          </div>
        </div>
        {/* Layout Grid */}
        <div className="grid grid-cols-12 gap-gutter items-start">
          {/* Left Column: Primary Data */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-stack-lg">
            {/* Vendor Information */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-container-padding flex flex-col gap-stack-md">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface flex items-center gap-2">
                <Icon name="factory" fill className="text-primary" />
                Vendor Details
              </h3>
              <div className="grid grid-cols-2 gap-gutter">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Select Vendor</label>
                  <select className="w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all" defaultValue="Global Tech Components Inc.">
                    <option>Global Tech Components Inc.</option>
                    <option>Apex Manufacturing Ltd.</option>
                    <option>Steel Works Co.</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Vendor Contact</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded p-2 text-body-md font-body-md text-on-surface-variant cursor-not-allowed" readOnly type="text" defaultValue="Sarah Jenkins (s.jenkins@globaltech.com)" />
                </div>
              </div>
            </div>
            {/* Addresses */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-container-padding flex flex-col gap-stack-md">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface flex items-center gap-2">
                <Icon name="local_shipping" fill className="text-primary" />
                Shipping &amp; Billing
              </h3>
              <div className="grid grid-cols-2 gap-gutter">
                {/* Shipping */}
                <div className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Shipping Address</span>
                    <button className="text-primary hover:underline text-body-sm font-body-sm">Edit</button>
                  </div>
                  <div className="font-body-md text-body-md text-on-surface leading-relaxed">
                    <strong>SupplyX Central Warehouse (WH-01)</strong><br />
                    1450 Logistics Boulevard<br />
                    Dock 4, Receiving<br />
                    Chicago, IL 60607, USA
                  </div>
                </div>
                {/* Billing */}
                <div className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Billing Address</span>
                    <button className="text-primary hover:underline text-body-sm font-body-sm">Edit</button>
                  </div>
                  <div className="font-body-md text-body-md text-on-surface leading-relaxed">
                    <strong>SupplyX Corporate Headquarters</strong><br />
                    Accounts Payable Dept<br />
                    100 Enterprise Way<br />
                    New York, NY 10001, USA
                  </div>
                </div>
              </div>
            </div>
            {/* Line Items Table */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
              <div className="p-container-padding border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                <h3 className="font-subsection-heading text-subsection-heading text-on-surface flex items-center gap-2">
                  <Icon name="inventory_2" fill className="text-primary" />
                  Line Items
                </h3>
                <button className="flex items-center gap-1 text-primary hover:text-on-primary-fixed-variant transition-colors font-body-sm text-body-sm font-medium">
                  <Icon name="add" className="text-[18px]" /> Add Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase sticky top-0">Item / SKU</th>
                      <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase sticky top-0 text-right">Qty</th>
                      <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase sticky top-0">UOM</th>
                      <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase sticky top-0 text-right">Unit Price</th>
                      <th className="p-3 font-label-caps text-label-caps text-on-surface-variant uppercase sticky top-0 text-right">Ext. Price</th>
                      <th className="p-3 sticky top-0 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {/* Item 1 */}
                    <tr className="hover:bg-surface-bright transition-colors group">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md font-medium text-on-surface">Industrial Microcontroller V2</span>
                          <span className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">SKU: MCU-IND-202</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <input className="w-20 border border-outline-variant rounded p-1 text-right text-body-md font-body-md outline-none focus:border-primary-container" type="number" defaultValue={1500} />
                      </td>
                      <td className="p-3 text-body-md font-body-md text-on-surface-variant">Units</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-on-surface-variant">$</span>
                          <input className="w-24 border border-outline-variant rounded p-1 text-right text-data-mono font-data-mono outline-none focus:border-primary-container" type="text" defaultValue="45.00" />
                        </div>
                      </td>
                      <td className="p-3 text-right font-data-mono text-data-mono font-medium text-on-surface">
                        $67,500.00
                      </td>
                      <td className="p-3 text-center">
                        <button className="text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </td>
                    </tr>
                    {/* Item 2 */}
                    <tr className="hover:bg-surface-bright transition-colors group">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md font-medium text-on-surface">Thermal Heat Sink (Aluminum)</span>
                          <span className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">SKU: THS-AL-050</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <input className="w-20 border border-outline-variant rounded p-1 text-right text-body-md font-body-md outline-none focus:border-primary-container" type="number" defaultValue={3000} />
                      </td>
                      <td className="p-3 text-body-md font-body-md text-on-surface-variant">Units</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-on-surface-variant">$</span>
                          <input className="w-24 border border-outline-variant rounded p-1 text-right text-data-mono font-data-mono outline-none focus:border-primary-container" type="text" defaultValue="12.50" />
                        </div>
                      </td>
                      <td className="p-3 text-right font-data-mono text-data-mono font-medium text-on-surface">
                        $37,500.00
                      </td>
                      <td className="p-3 text-center">
                        <button className="text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100">
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* Right Column: Settings & Totals */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-stack-lg sticky top-24">
            {/* Logistics & Terms */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-container-padding flex flex-col gap-stack-md">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface border-b border-outline-variant pb-2">Logistics &amp; Terms</h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Shipping Method</label>
                  <select className="w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-primary-container outline-none" defaultValue="FedEx Freight Priority">
                    <option>FedEx Freight Priority</option>
                    <option>UPS Ground Commercial</option>
                    <option>DHL Global Express</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Expected Delivery Date</label>
                  <input className="w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-primary-container outline-none" type="date" defaultValue="2024-02-15" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Payment Terms</label>
                  <select className="w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-primary-container outline-none" defaultValue="Net 30">
                    <option>Net 30</option>
                    <option>Net 60</option>
                    <option>Net 90</option>
                    <option>Due on Receipt</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Incoterms</label>
                  <select className="w-full bg-surface border border-outline-variant rounded p-2 text-body-md font-body-md focus:border-primary-container outline-none" defaultValue="FOB - Free On Board">
                    <option>FOB - Free On Board</option>
                    <option>DDP - Delivered Duty Paid</option>
                    <option>EXW - Ex Works</option>
                  </select>
                </div>
              </div>
            </div>
            {/* Order Summary */}
            <div className="bg-surface-bright rounded-xl border border-primary-fixed shadow-[0_1px_3px_rgba(15,23,42,0.04)] p-container-padding flex flex-col gap-stack-md">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface">Order Summary</h3>
              <div className="flex flex-col gap-2 font-body-md text-body-md border-b border-outline-variant pb-4">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-data-mono text-data-mono">$105,000.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Shipping Estimate</span>
                  <span className="font-data-mono text-data-mono">$1,250.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Tax (Calculated at 8.5%)</span>
                  <span className="font-data-mono text-data-mono">$8,925.00</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-section-heading text-section-heading font-bold text-on-surface">Total</span>
                <span className="font-data-mono text-[20px] font-bold text-primary">$115,175.00</span>
              </div>
              <div className="mt-4 pt-4 border-t border-outline-variant">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2 block">Internal Notes</label>
                <textarea className="w-full bg-surface border border-outline-variant rounded p-2 text-body-sm font-body-sm focus:border-primary-container outline-none resize-none h-20" placeholder="Add optional notes for internal review..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
