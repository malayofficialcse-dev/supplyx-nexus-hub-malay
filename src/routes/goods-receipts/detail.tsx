import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/goods-receipts/detail")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Goods Receipt Details | SupplyX" },
      { name: "description", content: "Review received items, discrepancies, and required actions for a goods receipt." },
      { property: "og:title", content: "Goods Receipt Details | SupplyX" },
      { property: "og:description", content: "Review received items, discrepancies, and required actions for a goods receipt." },
    ],
  }),
});

function Page() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <a className="text-primary hover:underline font-body-sm text-body-sm flex items-center" href="#">
                <Icon name="arrow_back" className="text-[14px] mr-1" />
                Back to Receipts
              </a>
              <span className="text-outline-variant">•</span>
              <span className="font-data-mono text-data-mono text-on-surface-variant">GR-2023-8842</span>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface flex items-center gap-3">
              Goods Receipt Details
              <span className="bg-tertiary-fixed-dim bg-opacity-20 text-tertiary-container text-[12px] px-2 py-0.5 rounded font-medium flex items-center gap-1 border border-tertiary-fixed-dim">
                <Icon name="check_circle" className="text-[14px]" /> Completed
              </span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Processed on Oct 24, 2023 at 14:30 EST by Warehouse A</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface border border-outline-variant text-on-surface font-body-md text-body-md py-2 px-4 rounded font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
              <Icon name="print" className="text-[18px]" /> Print
            </button>
            <button className="bg-primary-container text-on-primary font-body-md text-body-md py-2 px-4 rounded font-medium hover:bg-primary transition-colors flex items-center gap-2">
              View PO <Icon name="open_in_new" className="text-[18px]" />
            </button>
          </div>
        </div>
        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Summary Card (Left Col) */}
          <div className="lg:col-span-4 bg-surface border border-outline-variant rounded-xl shadow-sm p-container-padding flex flex-col gap-stack-md">
            <h3 className="font-section-heading text-section-heading text-on-surface border-b border-outline-variant pb-3 mb-2">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Supplier</p>
                <p className="font-body-md text-body-md font-medium">TechTronix Global</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Origin</p>
                <p className="font-body-md text-body-md">Shenzhen, CN</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Carrier</p>
                <p className="font-body-md text-body-md">Maersk Logistics</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Tracking ID</p>
                <p className="font-data-mono text-data-mono text-primary cursor-pointer hover:underline">TRK-992-11A</p>
              </div>
            </div>
            <div className="mt-4 bg-surface-container-low p-4 rounded border border-outline-variant flex items-start gap-3">
              <Icon name="verified_user" className="text-tertiary-container mt-0.5" />
              <div>
                <p className="font-body-md text-body-md font-medium text-on-surface">Inspection Passed</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Standard visual QA completed by J. Smith. No systemic issues found.</p>
              </div>
            </div>
          </div>
          {/* KPI Overview (Right Col Top) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-gutter">
            {/* KPI 1 */}
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-4 flex flex-col justify-between">
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
                Total Units Expected
                <Icon name="inventory_2" className="text-[16px] text-outline" />
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-[24px] font-semibold font-page-title text-on-surface">1,450</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">boxes</span>
              </div>
            </div>
            {/* KPI 2 */}
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-4 flex flex-col justify-between">
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
                Units Received
                <Icon name="done_all" className="text-[16px] text-tertiary-container" />
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-[24px] font-semibold font-page-title text-on-surface">1,442</span>
                <span className="font-body-sm text-body-sm text-error bg-error-container bg-opacity-30 px-1.5 py-0.5 rounded text-[11px] font-medium">-8 Short</span>
              </div>
            </div>
            {/* KPI 3 */}
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-4 flex flex-col justify-between">
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
                Damaged Units
                <Icon name="warning" className="text-[16px] text-error" />
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-[24px] font-semibold font-page-title text-error">3</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer hover:text-primary transition-colors flex items-center gap-1">
                  View Report <Icon name="arrow_forward" className="text-[14px]" />
                </span>
              </div>
            </div>
          </div>
          {/* Line Items Table (Full Width Bottom) */}
          <div className="lg:col-span-12 bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden mt-2">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface">Received Items &amp; Location Assignment</h3>
              <div className="relative w-64 hidden sm:block">
                <Icon name="filter_list" className="absolute left-3 top-1.5 text-on-surface-variant text-[16px]" />
                <input className="w-full pl-9 pr-3 py-1.5 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:outline-none focus:border-primary" placeholder="Filter items..." type="text" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant sticky top-0 bg-surface-container-low z-10 w-12"></th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant sticky top-0 bg-surface-container-low z-10">SKU / Description</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant sticky top-0 bg-surface-container-low z-10 text-right">Ordered</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant sticky top-0 bg-surface-container-low z-10 text-right">Received</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant sticky top-0 bg-surface-container-low z-10 text-center">Status</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant sticky top-0 bg-surface-container-low z-10">Storage Bin</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {/* Row 1 */}
                  <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors h-[48px]">
                    <td className="py-2 px-4 text-center">
                      <div className="w-8 h-8 bg-surface-container rounded border border-outline-variant overflow-hidden flex items-center justify-center">
                        <Icon name="memory" className="text-[16px] text-outline" />
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <p className="font-data-mono text-data-mono font-medium text-on-surface">IC-ARM-V8</p>
                      <p className="text-on-surface-variant text-[11px] truncate w-48">ARM Cortex V8 Microcontrollers</p>
                    </td>
                    <td className="py-2 px-4 text-right font-data-mono">1,000</td>
                    <td className="py-2 px-4 text-right font-data-mono">1,000</td>
                    <td className="py-2 px-4 text-center">
                      <span className="bg-tertiary-fixed-dim bg-opacity-20 text-tertiary-container text-[11px] px-2 py-0.5 rounded font-medium border border-tertiary-fixed-dim inline-block">Complete</span>
                    </td>
                    <td className="py-2 px-4">
                      <span className="font-data-mono text-data-mono bg-surface-container px-2 py-1 rounded text-on-surface border border-outline-variant">A-12-Rack4</span>
                    </td>
                  </tr>
                  {/* Row 2 (Discrepancy) */}
                  <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors h-[48px] bg-error-container bg-opacity-10">
                    <td className="py-2 px-4 text-center">
                      <div className="w-8 h-8 bg-surface-container rounded border border-outline-variant overflow-hidden flex items-center justify-center">
                        <Icon name="dns" className="text-[16px] text-outline" />
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <p className="font-data-mono text-data-mono font-medium text-on-surface">MEM-256G-NV</p>
                      <p className="text-on-surface-variant text-[11px] truncate w-48">256GB NVMe Storage Modules</p>
                    </td>
                    <td className="py-2 px-4 text-right font-data-mono">400</td>
                    <td className="py-2 px-4 text-right font-data-mono text-error font-medium">392</td>
                    <td className="py-2 px-4 text-center">
                      <span className="bg-error-container text-on-error-container text-[11px] px-2 py-0.5 rounded font-medium border border-error bg-opacity-30 inline-block">Short</span>
                    </td>
                    <td className="py-2 px-4">
                      <span className="font-data-mono text-data-mono bg-surface-container px-2 py-1 rounded text-on-surface border border-outline-variant">B-04-Rack1</span>
                    </td>
                  </tr>
                  {/* Row 3 (Damage) */}
                  <tr className="border-b border-outline-variant hover:bg-surface-bright transition-colors h-[48px]">
                    <td className="py-2 px-4 text-center">
                      <div className="w-8 h-8 bg-surface-container rounded border border-outline-variant overflow-hidden flex items-center justify-center">
                        <Icon name="cable" className="text-[16px] text-outline" />
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <p className="font-data-mono text-data-mono font-medium text-on-surface">CBL-USB-C</p>
                      <p className="text-on-surface-variant text-[11px] truncate w-48">USB-C Power Cables (2m)</p>
                    </td>
                    <td className="py-2 px-4 text-right font-data-mono">50</td>
                    <td className="py-2 px-4 text-right font-data-mono">50</td>
                    <td className="py-2 px-4 text-center">
                      <span className="bg-error-container text-on-error-container text-[11px] px-2 py-0.5 rounded font-medium border border-error bg-opacity-30 inline-flex items-center gap-1">
                        <Icon name="warning" className="text-[12px]" /> 3 Damaged
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <span className="font-data-mono text-data-mono bg-surface-container px-2 py-1 rounded text-on-surface border border-outline-variant">Q-01-Quarantine</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Damage Report Section (Bottom Right) */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-gutter mt-2">
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-container-padding">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface flex items-center gap-2 mb-4">
                <Icon name="photo_camera" className="text-error" />
                Damage Documentation
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square bg-surface-container-high rounded border border-outline-variant relative overflow-hidden group cursor-pointer">
                  <img
                    alt="Close up photograph of a crushed cardboard shipping box showing torn edges and dented corners, resting on a gray concrete warehouse floor under bright fluorescent lighting."
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 transition-opacity"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf9QrPESi72IIdUiikz6NFa8x2sfIwTr9LpVs8iz9ynQ3eJpO2knCPvhoThtMGrpE7Kl9cnexrDCtmMyDwCH7yXqLg48_cE-x4g7KuNuUDCCyq-lWUX7OoWVm9JmN1RkwTU89n3wP07vINZoJDBo5DOMeblRApKAusjbgWLGv9U1Z7kRz-LQcssN7MDL_VwReNC2Hvgnjlc7aL90g4rH8MFgVRInfFHZcpx-WuK-CfBHKQS7ajoIc"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <Icon name="zoom_in" className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
                <div className="aspect-square bg-surface-container-high rounded border border-outline-variant relative overflow-hidden group cursor-pointer">
                  <img
                    alt="Close up photograph of frayed electronic cables inside a partially opened plastic packaging, showing exposed wires. The setting is a sterile inspection table in an industrial environment."
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:opacity-100 transition-opacity"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdikdAYGmb8zlrbiMUJPyQvn2YULqgGbuB4c9TRRjpZUjXhaOW0xB2bLdN2CxBs-ozgfew9agqUgfz4KRWBGw2pSr9xWdfw4pSR4Mstp83kseCutfft7AERDLZh2LYr7hQ7ld7aEuIyQOrdT4hlJJMzKh95Qt6DJI8ZjwJXNB3RNEy9X4-gVWWQh7KTdX5xiJavOp5vbFB_jwNyS53JYFkvFD3wbVXlasuwV7IrNUdQdp0hRNh8ps"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <Icon name="zoom_in" className="text-white opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
                <div className="aspect-square border-2 border-dashed border-outline-variant rounded flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container hover:border-primary cursor-pointer transition-colors">
                  <Icon name="add" className="text-[24px]" />
                  <span className="text-[10px] font-medium mt-1">Add Photo</span>
                </div>
              </div>
              <div className="mt-4">
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">Inspector Notes</label>
                <p className="font-body-sm text-body-sm bg-surface-container-low p-3 rounded border border-outline-variant text-on-surface">Box #44 sustained crush damage during transit. 3 USB-C cables internally have severed connectors. Segregated to Quarantine Bin Q-01 pending RMA.</p>
              </div>
            </div>
            {/* Actions / Next Steps */}
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-container-padding flex flex-col justify-between">
              <div>
                <h3 className="font-subsection-heading text-subsection-heading text-on-surface mb-4">Required Actions</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <input defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" disabled type="checkbox" />
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface line-through text-opacity-50">Generate Putaway Tasks</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">System generated tasks for forklift operators.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" type="checkbox" />
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">Initiate Supplier Claim (Shortage)</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">8 units missing from PO line 2.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <input className="rounded border-outline-variant text-primary focus:ring-primary w-4 h-4 cursor-pointer" type="checkbox" />
                    </div>
                    <div>
                      <p className="font-body-sm text-body-sm font-medium text-on-surface">Process RMA for Damaged Goods</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant text-[11px]">3 units in quarantine require return authorization.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant flex justify-end">
                <button className="bg-primary-container text-on-primary font-body-md text-body-md py-2 px-6 rounded font-medium hover:bg-primary transition-colors">
                  Complete Receipt Actions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
