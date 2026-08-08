import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/payments/detail")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Payment #PMT-8824-X9 | SupplyX" },
      { name: "description", content: "Transaction summary, invoices settled and audit trail for payment PMT-8824-X9." },
      { property: "og:title", content: "Payment #PMT-8824-X9 | SupplyX" },
      { property: "og:description", content: "Transaction summary, invoices settled and audit trail for payment PMT-8824-X9." },
    ],
  }),
});

function Page() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-stack-lg gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <a className="text-on-surface-variant hover:text-primary font-body-sm text-body-sm flex items-center" href="#">
                <Icon name="arrow_back" className="text-[16px]" />
                Back to Payments
              </a>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface flex items-center gap-3">
              Payment #PMT-8824-X9
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#bbf7d0]">
                Settled
              </span>
            </h2>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-surface text-primary border border-outline-variant rounded font-body-md text-body-md flex items-center gap-2 hover:bg-surface-container-low transition-colors shadow-sm">
              <Icon name="print" className="text-[18px]" />
              Print
            </button>
            <button className="px-4 py-2 bg-[#2563EB] text-on-primary rounded font-body-md text-body-md font-medium flex items-center gap-2 hover:bg-[#1d4ed8] transition-colors shadow-sm">
              <Icon name="download" className="text-[18px]" />
              Remittance Advice
            </button>
          </div>
        </div>
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Left Column (Main Details) */}
          <div className="lg:col-span-2 space-y-gutter">
            {/* Summary Card */}
            <div className="bg-surface rounded-lg border border-outline-variant shadow-sm p-6">
              <h3 className="font-section-heading text-section-heading text-on-surface mb-6">Transaction Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <p className="text-on-surface-variant font-body-sm text-body-sm mb-1">Total Amount</p>
                  <p className="font-data-mono text-[24px] font-semibold text-on-surface">$142,500.00</p>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">USD</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-body-sm text-body-sm mb-1">Payment Date</p>
                  <p className="font-body-md text-body-md font-medium text-on-surface">Oct 24, 2023</p>
                  <p className="text-on-surface-variant font-body-sm text-body-sm">09:14:22 EST</p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-body-sm text-body-sm mb-1">Payment Method</p>
                  <p className="font-body-md text-body-md font-medium text-on-surface flex items-center gap-2">
                    <Icon name="account_balance" className="text-[18px] text-primary" />
                    Wire Transfer
                  </p>
                </div>
                <div>
                  <p className="text-on-surface-variant font-body-sm text-body-sm mb-1">Bank Reference ID</p>
                  <p className="font-data-mono text-data-mono text-on-surface bg-surface-container-low px-2 py-1 rounded inline-block border border-outline-variant">TRX-99482-B2A</p>
                </div>
              </div>
              <div className="border-t border-outline-variant pt-6">
                <h4 className="font-subsection-heading text-subsection-heading text-on-surface mb-4">Parties Involved</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Sender (Originator)</p>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded bg-primary-container text-on-primary flex items-center justify-center font-bold">
                        SX
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">SupplyX North America LLC</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Account: **** 4492</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Chase Manhattan Bank, NY</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Recipient (Beneficiary)</p>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded bg-surface-container-highest border border-outline-variant flex items-center justify-center">
                        <Icon name="factory" className="text-on-surface-variant" />
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">Global Tech Manufacturing Inc.</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Account: **** 8812</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Deutsche Bank, Frankfurt</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Invoices Settled List */}
            <div className="bg-surface rounded-lg border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-[#F8FAFC]">
                <h3 className="font-section-heading text-section-heading text-on-surface">Invoices Settled</h3>
                <span className="font-body-sm text-body-sm text-on-surface-variant">3 Items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-outline-variant bg-[#F8FAFC]">
                    <tr>
                      <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Invoice ID</th>
                      <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">Date</th>
                      <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase">PO Number</th>
                      <th className="px-4 py-3 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 font-data-mono text-data-mono text-primary cursor-pointer hover:underline">INV-2023-881</td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">Oct 10, 2023</td>
                      <td className="px-4 py-3 font-data-mono text-data-mono text-on-surface-variant">PO-9921</td>
                      <td className="px-4 py-3 font-data-mono text-data-mono text-on-surface text-right">$45,000.00</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 font-data-mono text-data-mono text-primary cursor-pointer hover:underline">INV-2023-890</td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">Oct 12, 2023</td>
                      <td className="px-4 py-3 font-data-mono text-data-mono text-on-surface-variant">PO-9945</td>
                      <td className="px-4 py-3 font-data-mono text-data-mono text-on-surface text-right">$62,500.00</td>
                    </tr>
                    <tr className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 font-data-mono text-data-mono text-primary cursor-pointer hover:underline">INV-2023-902</td>
                      <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface">Oct 15, 2023</td>
                      <td className="px-4 py-3 font-data-mono text-data-mono text-on-surface-variant">PO-9960</td>
                      <td className="px-4 py-3 font-data-mono text-data-mono text-on-surface text-right">$35,000.00</td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t border-outline-variant bg-[#F8FAFC]">
                    <tr>
                      <td className="px-4 py-3 font-body-sm text-body-sm font-semibold text-on-surface text-right" colSpan={3}>Total:</td>
                      <td className="px-4 py-3 font-data-mono text-data-mono font-semibold text-on-surface text-right">$142,500.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          {/* Right Column (Audit Trail) */}
          <div className="space-y-gutter">
            <div className="bg-surface rounded-lg border border-outline-variant shadow-sm p-6 h-full">
              <h3 className="font-section-heading text-section-heading text-on-surface mb-6 flex items-center gap-2">
                <Icon name="history" className="text-primary" />
                Audit Trail
              </h3>
              <div className="relative border-l-2 border-outline-variant ml-3 space-y-8 pb-4">
                {/* Step 4 (Current) */}
                <div className="relative pl-6">
                  <div className="absolute w-4 h-4 rounded-full bg-[#16A34A] border-4 border-surface -left-[9px] top-1"></div>
                  <div className="mb-1">
                    <span className="font-subsection-heading text-subsection-heading text-on-surface">Payment Settled</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mb-2">Funds received by beneficiary bank.</div>
                  <div className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">Oct 24, 2023 • 09:14:22 EST</div>
                </div>
                {/* Step 3 */}
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 rounded-full bg-outline border-2 border-surface -left-[7px] top-1.5"></div>
                  <div className="mb-1">
                    <span className="font-body-md text-body-md font-medium text-on-surface">Dispatched to Clearing House</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mb-2">SWIFT message ACK received.</div>
                  <div className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">Oct 23, 2023 • 16:30:00 EST</div>
                </div>
                {/* Step 2 */}
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 rounded-full bg-outline border-2 border-surface -left-[7px] top-1.5"></div>
                  <div className="mb-1">
                    <span className="font-body-md text-body-md font-medium text-on-surface">Approved by Treasury</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mb-2">Authorized by Sarah Jenkins (Treasury Ops).</div>
                  <div className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">Oct 23, 2023 • 14:15:45 EST</div>
                </div>
                {/* Step 1 */}
                <div className="relative pl-6">
                  <div className="absolute w-3 h-3 rounded-full bg-outline border-2 border-surface -left-[7px] top-1.5"></div>
                  <div className="mb-1">
                    <span className="font-body-md text-body-md font-medium text-on-surface">Payment Initiated</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mb-2">System auto-batch generation for due invoices.</div>
                  <div className="font-data-mono text-data-mono text-on-surface-variant text-[11px]">Oct 23, 2023 • 08:00:12 EST</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
