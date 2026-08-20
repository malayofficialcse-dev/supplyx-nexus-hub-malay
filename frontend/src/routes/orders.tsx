import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Download,
  ScanSearch,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingDown,
  Package,
  Layers,
  Paperclip,
  ArrowRight,
  Filter,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { itemsSum } from "@/components/kit/ResourceForm";
import { ThreeWayMatchModal } from "@/components/ThreeWayMatchModal";
import { AttachmentsModal, AttachmentBadge } from "@/components/AttachmentsModal";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Purchase Orders & Variance — SupplyX SCM" },
      { name: "description", content: "Issue purchase orders, track quantity variance against goods receipts, and run 3-way matching." },
      { property: "og:title", content: "Purchase Orders & Variance — SupplyX SCM" },
      { property: "og:description", content: "Issue purchase orders, track quantity variance against goods receipts, and run 3-way matching." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [activeTab, setActiveTab] = React.useState<"orders" | "variance">("orders");
  const [matchRow, setMatchRow] = React.useState<Row | null>(null);
  const [attRow, setAttRow] = React.useState<Row | null>(null);
  const [varianceFilter, setVarianceFilter] = React.useState<"all" | "shortfalls" | "complete" | "pending">("all");

  const suppliersQuery = useResourceList("/suppliers");
  const budgetsQuery = useResourceList("/suppliers/budget");
  const varianceQuery = useResourceList("/orders/variance-report");

  const supplierRows = (suppliersQuery.data ?? []) as Row[];
  const budgetRows = (budgetsQuery.data ?? []) as Row[];
  const varianceData = (varianceQuery.data as any) || { summary: {}, data: [] };
  const varianceItems: any[] = Array.isArray(varianceData.data) ? varianceData.data : [];
  const varianceSummary = varianceData.summary || {};

  const supplierOptions = Array.from(
    new Set(
      supplierRows
        .map((s) => String(s["name"] ?? ""))
        .concat(["brb", "twe", "BTENE", "Acme Corporation"])
    )
  ).filter(Boolean);

  const handleDownloadPdf = async (row: Row) => {
    try {
      const poNum = String(row["orderId"] || row["id"]);
      await api.download(`/orders/${String(row["id"])}/pdf`, `PO-${poNum}.pdf`);
      toast.success(`Downloaded official PO PDF for ${poNum}`);
    } catch (err: any) {
      toast.error(`PDF download failed: ${err.message}`);
    }
  };

  const filteredVarianceItems = varianceItems.filter((item) => {
    if (varianceFilter === "shortfalls") return item.hasDiscrepancy || item.status === "Shortfall";
    if (varianceFilter === "complete") return item.fulfillmentRate >= 100 || item.status === "Complete";
    if (varianceFilter === "pending") return item.status === "Pending Delivery";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Tab Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-primary text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            Purchase Orders Register
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("variance")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all ${
              activeTab === "variance"
                ? "bg-primary text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Goods Receipt ↔ PO Variance Report
            {varianceSummary.shortfallCount > 0 && (
              <span className="ml-1 rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] font-bold text-white">
                {varianceSummary.shortfallCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "orders" ? (
        <CrudPage
          title="Purchase Orders"
          description="Committed spend with suppliers, delivery tracking and PO matching."
          endpoint="/orders"
          exportName="purchase-orders"
          labelKey="orderId"
          createLabel="New purchase order"
          canEdit={true}
          canDelete={true}
          filters={[
            { key: "status", label: "Status" },
            { key: "supplier", label: "Supplier" },
          ]}
          searchKeys={["orderId", "supplier", "status", "description"]}
          columns={[
            col.code("orderId", "PO number"),
            col.text("supplier", "Supplier"),
            col.date("deliveryDate", "Delivery date"),
            col.items(),
            col.num("receivedQuantity", "Received qty", 2),
            col.money("amount", "Amount"),
            {
              key: "attachments",
              label: "Docs",
              render: (row) => {
                const attachments = (row["attachments"] as any[]) || [];
                return (
                  <AttachmentBadge
                    count={attachments.length}
                    onClick={() => setAttRow(row)}
                  />
                );
              },
            },
            col.status(),
          ]}
          fields={[
            { name: "orderId", label: "PO number", required: true, placeholder: "PO-5001" },
            { name: "supplier", label: "Supplier", type: "select", options: supplierOptions, required: true },
            { name: "deliveryDate", label: "Delivery date", type: "date", required: true },
            { name: "status", label: "Status", type: "select", options: STATUS.order, required: true, defaultValue: "Ordered" },
            { name: "description", label: "Description", type: "textarea" },
            { name: "items", label: "Order lines", type: "items", required: true },
          ]}
          formExtra={(values) => {
            const supplier = String(values["supplier"] ?? "");
            const sum = itemsSum(values);
            if (!supplier || sum <= 0) return null;

            const sup = supplierRows.find((s) => String(s["name"]).toLowerCase() === supplier.toLowerCase());
            const category = String(sup?.["category"] ?? "General");

            const budget = budgetRows.find((b) => String(b["category"]).toLowerCase() === category.toLowerCase()) ||
              budgetRows.find((b) => String(b["category"]).toLowerCase() === "general");

            if (!budget) return null;

            const allocated = Number(budget["allocated"] ?? 0);
            const spent = Number(budget["spent"] ?? 0);
            const newTotal = spent + sum;
            const isOver = newTotal > allocated;
            const isNear = !isOver && allocated > 0 && newTotal / allocated >= 0.9;

            if (!isOver && !isNear) return null;

            return (
              <div
                className={`mb-4 flex items-start gap-2.5 rounded-sm border p-3 text-[12px] ${
                  isOver
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${isOver ? "text-rose-500" : "text-amber-500"}`} />
                <div>
                  <strong className="font-semibold">
                    {isOver ? "Budget Ceiling Exceeded:" : "Approaching Category Budget Limit:"}
                  </strong>
                  <p className="mt-0.5 text-foreground/90">
                    This PO ({formatCurrency(sum)}) brings category <strong>'{String(budget["category"])}'</strong> to{" "}
                    <strong>{formatCurrency(newTotal)}</strong> against an allocated ceiling of{" "}
                    <strong>{formatCurrency(allocated)}</strong> ({Math.round((newTotal / (allocated || 1)) * 100)}% utilization).
                  </p>
                </div>
              </div>
            );
          }}
          transformPayload={(payload, values) => ({ ...payload, amount: itemsSum(values) })}
          rowActionsExtra={(row) => (
            <>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setAttRow(row)}
                title="Manage Document Attachments"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setMatchRow(row)}
              >
                <ScanSearch className="h-3.5 w-3.5" />
                3-way match
              </Button>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => handleDownloadPdf(row)}
                title="Download Purchase Order PDF"
              >
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </>
          )}
        />
      ) : (
        /* Variance Report Tab */
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Goods Receipt ↔ PO Quantity Variance Report
            </h2>
            <p className="text-xs text-muted-foreground">
              Audit ordered vs physically received vs invoiced units across all Purchase Orders. Automatically tags fulfillment shortfalls and supplier delivery disputes.
            </p>
          </div>

          {/* Variance Summary KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-sm border border-border bg-card p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Ordered Units
              </span>
              <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                {varianceSummary.totalOrdered ?? 0}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Across {varianceSummary.totalOrders ?? 0} Purchase Orders
              </span>
            </div>

            <div className="rounded-sm border border-border bg-card p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Received Units
              </span>
              <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                {varianceSummary.totalReceived ?? 0}
              </div>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">
                {varianceSummary.overallFulfillmentRate ?? 0}% overall fulfillment
              </span>
            </div>

            <div className="rounded-sm border border-border bg-card p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Active Shortfalls / Disputes
              </span>
              <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">
                {varianceSummary.shortfallCount ?? 0}
              </div>
              <span className="text-[10px] text-rose-500 mt-0.5 block">
                POs with delivery shortage &lt; 95%
              </span>
            </div>

            <div className="rounded-sm border border-border bg-card p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Shortfall Spend at Risk
              </span>
              <div className="text-xl font-bold font-mono text-foreground mt-0.5">
                {formatCurrency(varianceSummary.totalShortfallValue ?? 0)}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Unreceived order value
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setVarianceFilter("all")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  varianceFilter === "all" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All Orders ({varianceItems.length})
              </button>
              <button
                type="button"
                onClick={() => setVarianceFilter("shortfalls")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  varianceFilter === "shortfalls" ? "bg-rose-600 text-white" : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                }`}
              >
                ⚠️ Shortfalls Only ({varianceSummary.shortfallCount ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setVarianceFilter("complete")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  varianceFilter === "complete" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Fulfilled / Complete
              </button>
              <button
                type="button"
                onClick={() => setVarianceFilter("pending")}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  varianceFilter === "pending" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Pending Delivery
              </button>
            </div>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => void varianceQuery.refetch()}
            >
              Refresh Audit
            </Button>
          </div>

          {/* Variance Table */}
          <div className="overflow-hidden rounded border border-border bg-card shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/60 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">PO Number</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3 text-right">Ordered Qty</th>
                  <th className="p-3 text-right">Received Qty</th>
                  <th className="p-3 text-right">Invoiced Qty</th>
                  <th className="p-3 text-right">Variance Qty</th>
                  <th className="p-3">Fulfillment Progress</th>
                  <th className="p-3">Audit Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVarianceItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      No purchase orders match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredVarianceItems.map((item) => {
                    const isShort = item.hasDiscrepancy || item.status === "Shortfall";
                    const isDone = item.fulfillmentRate >= 100;
                    const isPending = item.status === "Pending Delivery";

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors hover:bg-muted/30 ${
                          isShort ? "bg-rose-500/5" : ""
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-foreground">
                          {item.orderId}
                        </td>
                        <td className="p-3 font-medium text-foreground">
                          {item.supplier}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-foreground">
                          {item.orderedQty}
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-foreground">
                          {item.receivedQty}
                        </td>
                        <td className="p-3 text-right font-mono text-muted-foreground">
                          {item.invoicedQty}
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          {item.varianceQty > 0 ? (
                            <span className="text-rose-600">-{item.varianceQty} units</span>
                          ) : item.varianceQty < 0 ? (
                            <span className="text-sky-600">+{Math.abs(item.varianceQty)} units</span>
                          ) : (
                            <span className="text-emerald-600">0</span>
                          )}
                        </td>
                        <td className="p-3 w-40">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-semibold text-foreground">{item.fulfillmentRate}%</span>
                              <span className="text-muted-foreground">{item.receivedQty}/{item.orderedQty}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  isDone
                                    ? "bg-emerald-500"
                                    : isShort
                                    ? "bg-rose-500"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${Math.min(100, item.fulfillmentRate)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {isShort ? (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                              <AlertCircle className="h-3 w-3" /> Shortfall Dispute
                            </span>
                          ) : isDone ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" /> 100% Fulfilled
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                              <Clock className="h-3 w-3" /> Awaiting Delivery
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                              Partial Delivery
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => {
                              const matchingPo = ((suppliersQuery.data ?? []) as Row[]).find(
                                (s) => s.id === item.id
                              ) || item;
                              setMatchRow(item);
                            }}
                          >
                            <ScanSearch className="h-3.5 w-3.5" />
                            3-Way Match
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3-Way Match Modal */}
      <ThreeWayMatchModal
        open={!!matchRow}
        onOpenChange={(open) => !open && setMatchRow(null)}
        orderRow={matchRow}
      />

      {/* Attachments Modal */}
      <AttachmentsModal
        open={!!attRow}
        onOpenChange={(open) => !open && setAttRow(null)}
        entityType="orders"
        entityId={String(attRow?.["id"] ?? "")}
        entityLabel={`Purchase Order ${String(attRow?.["orderId"] ?? "")}`}
        attachments={(attRow?.["attachments"] as any[]) || []}
        invalidateKey="/orders"
      />
    </div>
  );
}
