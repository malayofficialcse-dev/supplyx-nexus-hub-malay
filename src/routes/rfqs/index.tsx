import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/rfqs/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "RFQ List | SupplyX" },
      { name: "description", content: "Manage and monitor active supplier quotation requests." },
      { property: "og:title", content: "RFQ List | SupplyX" },
      { property: "og:description", content: "Manage and monitor active supplier quotation requests." },
    ],
  }),
});

function Page() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-stack-lg">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface mb-1">Request for Quotation (RFQ)</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage and monitor active supplier quotation requests.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm font-medium rounded hover:bg-surface-container transition-colors flex items-center gap-2">
              <Icon name="download" className="text-[18px]" /> Export
            </button>
            <button className="px-4 py-2 bg-primary-container text-on-primary font-body-sm text-body-sm font-medium rounded hover:bg-primary-container/90 transition-colors flex items-center gap-2">
              <Icon name="add" className="text-[18px]" /> Create RFQ
            </button>
          </div>
        </div>
        {/* Filters & Search Bar */}
        <div className="bg-surface border border-outline-variant rounded-xl p-container-padding mb-stack-md flex flex-wrap gap-4 items-end shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex-1 min-w-[200px]">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Search</label>
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
              <input className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Search by ID or Title..." type="text" />
            </div>
          </div>
          <div className="w-48">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Category</label>
            <select className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none" defaultValue="All Categories">
              <option>All Categories</option>
              <option>Raw Materials</option>
              <option>Packaging</option>
              <option>IT Hardware</option>
              <option>Logistics Services</option>
            </select>
          </div>
          <div className="w-48">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Status</label>
            <select className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none" defaultValue="All Statuses">
              <option>All Statuses</option>
              <option>Sent</option>
              <option>Responses Received</option>
              <option>Evaluation</option>
              <option>Awarded</option>
            </select>
          </div>
          <button className="px-4 py-2 bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm font-medium rounded hover:bg-surface-container transition-colors h-[38px]">
            Clear Filters
          </button>
        </div>
        {/* RFQ Data Table */}
        <div className="bg-surface border border-outline-variant rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase w-12">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  </th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap cursor-pointer hover:text-on-surface group">
                    RFQ ID <Icon name="arrow_downward" className="text-[14px] align-middle opacity-0 group-hover:opacity-100" />
                  </th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Title &amp; Category</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Status</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap cursor-pointer hover:text-on-surface group">
                    Expiry Date <Icon name="arrow_downward" className="text-[14px] align-middle opacity-100" />
                  </th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Bidders</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Created By</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {/* Row 1 */}
                <tr className="hover:bg-surface-container-lowest transition-colors h-10">
                  <td className="py-2 px-4">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  </td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">RFQ-2023-089</td>
                  <td className="py-2 px-4">
                    <div className="font-body-sm text-body-sm font-medium text-on-surface truncate max-w-[200px]">Q3 Steel Procurement</div>
                    <div className="text-[11px] text-on-surface-variant">Raw Materials</div>
                  </td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFF7ED] text-[#C2410C]">
                      Evaluation
                    </span>
                  </td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant">Oct 15, 2023</td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">4/5</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface">SJ</div>
                      <span className="font-body-sm text-body-sm text-on-surface">Sarah J.</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="visibility" className="text-[18px]" /></button>
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="more_vert" className="text-[18px]" /></button>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="hover:bg-surface-container-lowest transition-colors h-10">
                  <td className="py-2 px-4">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  </td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">RFQ-2023-092</td>
                  <td className="py-2 px-4">
                    <div className="font-body-sm text-body-sm font-medium text-on-surface truncate max-w-[200px]">Corrugated Boxes Supply</div>
                    <div className="text-[11px] text-on-surface-variant">Packaging</div>
                  </td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#EFF6FF] text-[#1D4ED8]">
                      Responses Received
                    </span>
                  </td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant">Oct 18, 2023</td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">3/8</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface">MC</div>
                      <span className="font-body-sm text-body-sm text-on-surface">Mike C.</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="visibility" className="text-[18px]" /></button>
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="more_vert" className="text-[18px]" /></button>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="hover:bg-surface-container-lowest transition-colors h-10">
                  <td className="py-2 px-4">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  </td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">RFQ-2023-104</td>
                  <td className="py-2 px-4">
                    <div className="font-body-sm text-body-sm font-medium text-on-surface truncate max-w-[200px]">Server Rack Refresh</div>
                    <div className="text-[11px] text-on-surface-variant">IT Hardware</div>
                  </td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#374151]">
                      Sent
                    </span>
                  </td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant">Oct 25, 2023</td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">0/3</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface">SJ</div>
                      <span className="font-body-sm text-body-sm text-on-surface">Sarah J.</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="visibility" className="text-[18px]" /></button>
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="more_vert" className="text-[18px]" /></button>
                  </td>
                </tr>
                {/* Row 4 */}
                <tr className="hover:bg-surface-container-lowest transition-colors h-10">
                  <td className="py-2 px-4">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  </td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">RFQ-2023-076</td>
                  <td className="py-2 px-4">
                    <div className="font-body-sm text-body-sm font-medium text-on-surface truncate max-w-[200px]">EU Freight Forwarding</div>
                    <div className="text-[11px] text-on-surface-variant">Logistics Services</div>
                  </td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#DCFCE7] text-[#16A34A]">
                      Awarded
                    </span>
                  </td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant">Sep 30, 2023</td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">6/6</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface">AT</div>
                      <span className="font-body-sm text-body-sm text-on-surface">Alex T.</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="visibility" className="text-[18px]" /></button>
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="more_vert" className="text-[18px]" /></button>
                  </td>
                </tr>
                {/* Row 5 */}
                <tr className="hover:bg-surface-container-lowest transition-colors h-10">
                  <td className="py-2 px-4">
                    <input className="rounded border-outline-variant text-primary focus:ring-primary" type="checkbox" />
                  </td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">RFQ-2023-112</td>
                  <td className="py-2 px-4">
                    <div className="font-body-sm text-body-sm font-medium text-on-surface truncate max-w-[200px]">Aluminum Ingots H2</div>
                    <div className="text-[11px] text-on-surface-variant">Raw Materials</div>
                  </td>
                  <td className="py-2 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#F3F4F6] text-[#374151]">
                      Sent
                    </span>
                  </td>
                  <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 text-error">
                    <Icon name="warning" className="text-[14px]" /> Tomorrow
                  </td>
                  <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">1/4</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface">MC</div>
                      <span className="font-body-sm text-body-sm text-on-surface">Mike C.</span>
                    </div>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="visibility" className="text-[18px]" /></button>
                    <button className="p-1 text-on-surface-variant hover:text-primary transition-colors"><Icon name="more_vert" className="text-[18px]" /></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Showing <span className="font-medium text-on-surface">1</span> to <span className="font-medium text-on-surface">5</span> of <span className="font-medium text-on-surface">24</span> results
            </div>
            <div className="flex gap-1">
              <button className="px-2 py-1 text-on-surface-variant hover:bg-surface-container rounded disabled:opacity-50" disabled>
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <button className="px-3 py-1 bg-primary-container text-on-primary rounded font-body-sm text-body-sm">1</button>
              <button className="px-3 py-1 text-on-surface-variant hover:bg-surface-container rounded font-body-sm text-body-sm">2</button>
              <button className="px-3 py-1 text-on-surface-variant hover:bg-surface-container rounded font-body-sm text-body-sm">3</button>
              <span className="px-2 py-1 text-on-surface-variant">...</span>
              <button className="px-2 py-1 text-on-surface-variant hover:bg-surface-container rounded">
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
