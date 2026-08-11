import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useQuery } from "@tanstack/react-query";
import { getGoodsReceipts } from "@/lib/api";

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
  const navigate = useNavigate();

  const { data: receipts, isLoading } = useQuery({
    queryKey: ["goodsReceipts"],
    queryFn: getGoodsReceipts,
  });

  const latestReceipt = receipts?.[0];

  const totalExpected = latestReceipt?.items.reduce((sum, item) => sum + (item.expectedQty || 0), 0) ?? 0;
  const totalReceived = latestReceipt?.items.reduce((sum, item) => sum + (item.receivedQty || 0), 0) ?? 0;
  const totalDamaged = Math.max(0, totalExpected - totalReceived);

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto py-16 text-center">
          <p className="font-page-title text-page-title text-on-surface">Loading goods receipt details…</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">Please wait while we fetch the latest goods receipt record.</p>
        </div>
      </AppShell>
    );
  }

  if (!latestReceipt) {
    return (
      <AppShell>
        <div className="max-w-7xl mx-auto py-16 text-center">
          <p className="font-page-title text-page-title text-on-surface">No goods receipt found</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">There are no goods receipts available to display. Return to the receipt list to create or select one.</p>
          <button
            onClick={() => navigate({ to: "/goods-receipts" })}
            className="mt-6 bg-primary-container text-on-primary py-2 px-4 rounded font-medium hover:bg-primary transition-colors"
          >
            Back to Receipts
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => navigate({ to: "/goods-receipts" })} className="text-primary hover:underline font-body-sm text-body-sm flex items-center">
                <Icon name="arrow_back" className="text-[14px] mr-1" />
                Back to Receipts
              </button>
              <span className="text-outline-variant">•</span>
              <span className="font-data-mono text-data-mono text-on-surface-variant">{latestReceipt.receiptId}</span>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface flex items-center gap-3">
              Goods Receipt Details
              <span className="bg-tertiary-fixed-dim bg-opacity-20 text-tertiary-container text-[12px] px-2 py-0.5 rounded font-medium flex items-center gap-1 border border-tertiary-fixed-dim">
                <Icon name="check_circle" className="text-[14px]" /> {latestReceipt.status}
              </span>
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Processed on {latestReceipt.deliveryDate} for Purchase Order {latestReceipt.orderId}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-surface border border-outline-variant text-on-surface font-body-md text-body-md py-2 px-4 rounded font-medium hover:bg-surface-container transition-colors flex items-center gap-2"
            >
              <Icon name="print" className="text-[18px]" /> Print
            </button>
            <button
              onClick={() => navigate({ to: "/orders" })}
              className="bg-primary-container text-on-primary font-body-md text-body-md py-2 px-4 rounded font-medium hover:bg-primary transition-colors flex items-center gap-2"
            >
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
                <p className="font-body-md text-body-md font-medium">{latestReceipt.supplier}</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">PO Reference</p>
                <p className="font-body-md text-body-md font-data-mono text-primary">{latestReceipt.orderId}</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Carrier</p>
                <p className="font-body-md text-body-md">Apex Logistics</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Tracking ID</p>
                <p className="font-data-mono text-data-mono text-primary">TRK-992-11A</p>
              </div>
            </div>
            <div className="mt-4 bg-surface-container-low p-4 rounded border border-outline-variant flex items-start gap-3">
              <Icon name="verified_user" className="text-tertiary-container mt-0.5" />
              <div>
                <p className="font-body-md text-body-md font-medium text-on-surface">Inspection Completed</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">QA inspection recorded and verified against database manifest.</p>
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
                <span className="text-[24px] font-semibold font-page-title text-on-surface">{isLoading ? "..." : totalExpected.toLocaleString()}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">units</span>
              </div>
            </div>
            {/* KPI 2 */}
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-4 flex flex-col justify-between">
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
                Units Received
                <Icon name="done_all" className="text-[16px] text-tertiary-container" />
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span className="text-[24px] font-semibold font-page-title text-on-surface">{isLoading ? "..." : totalReceived.toLocaleString()}</span>
                {totalDamaged > 0 ? (
                  <span className="font-body-sm text-body-sm text-error bg-error-container bg-opacity-30 px-1.5 py-0.5 rounded text-[11px] font-medium">-{totalDamaged} Short</span>
                ) : (
                  <span className="font-body-sm text-body-sm text-tertiary-container bg-[#DCFCE7] px-1.5 py-0.5 rounded text-[11px] font-medium">Full Match</span>
                )}
              </div>
            </div>
            {/* KPI 3 */}
            <div className="bg-surface border border-outline-variant rounded-xl shadow-sm p-4 flex flex-col justify-between">
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-between">
                Discrepancy / Damaged
                <Icon name="warning" className="text-[16px] text-error" />
              </p>
              <div className="mt-2 flex items-end justify-between">
                <span className={`text-[24px] font-semibold font-page-title ${totalDamaged > 0 ? "text-error" : "text-on-surface"}`}>{totalDamaged}</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">units</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="lg:col-span-12 bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden mt-2">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface">Received Manifest &amp; Line Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant">Item Description</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant text-right">Expected Qty</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant text-right">Received Qty</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant text-center">Status</th>
                    <th className="py-2 px-4 font-label-caps text-label-caps text-on-surface-variant">Storage Assignment</th>
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {latestReceipt?.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-outline-variant hover:bg-surface-bright transition-colors h-[48px]">
                      <td className="py-2 px-4 font-medium text-on-surface">{item.name}</td>
                      <td className="py-2 px-4 text-right font-data-mono">{item.expectedQty?.toLocaleString()}</td>
                      <td className="py-2 px-4 text-right font-data-mono font-bold text-primary">{item.receivedQty?.toLocaleString()}</td>
                      <td className="py-2 px-4 text-center">
                        <span className="bg-tertiary-fixed-dim bg-opacity-20 text-tertiary-container text-[11px] px-2 py-0.5 rounded font-medium border border-tertiary-fixed-dim inline-block">
                          Verified
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className="font-data-mono text-data-mono bg-surface-container px-2 py-1 rounded text-on-surface border border-outline-variant">
                          WH-01-A-{idx + 10}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

