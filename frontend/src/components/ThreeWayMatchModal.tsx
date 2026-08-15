import { useMutation } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, FileText, Package, Receipt, ShieldCheck } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { Modal } from "@/components/kit/Modal";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export interface ThreeWayMatchResult {
  matched: boolean;
  status: "MATCHED" | "DISCREPANCY" | "PENDING_RECEIPT" | "PENDING_INVOICE" | "PENDING_BOTH" | "NOT_FOUND";
  discrepancies: string[];
  summary: {
    orderAmount: number;
    receivedTotal: number;
    invoicedAmount: number;
    amountVariance: number;
    quantityVariance: number;
    orderTotalQty: number;
    grTotalQty: number;
  };
  order: Row;
  selectedGoodsReceipt: Row | null;
  availableGoodsReceipts: Array<{ id: string; receiptId: string; deliveryDate: string; status: string }>;
  selectedInvoice: Row | null;
  availableInvoices: Array<{ id: string; invoiceId: string; date: string; amount: number; status: string }>;
  itemsBreakdown: Array<{
    description: string;
    orderedQty: number;
    receivedQty: number;
    unitPrice: number;
    poTotal: number;
    invTotal: number;
    isQtyMatched: boolean;
  }>;
}

export function ThreeWayMatchModal({
  open,
  onOpenChange,
  orderRow,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderRow: Row | null;
}) {
  const [data, setData] = React.useState<ThreeWayMatchResult | null>(null);
  const [selectedGrId, setSelectedGrId] = React.useState<string>("");
  const [selectedInvId, setSelectedInvId] = React.useState<string>("");

  const matchMutation = useMutation({
    mutationFn: async ({
      orderId,
      goodsReceiptId,
      invoiceId,
    }: {
      orderId: string;
      goodsReceiptId?: string;
      invoiceId?: string;
    }) => {
      return api.post<ThreeWayMatchResult>(`/orders/${orderId}/3way`, {
        goodsReceiptId,
        invoiceId,
      });
    },
    onSuccess: (res) => {
      setData(res);
      if (res.selectedGoodsReceipt?.['id']) {
        setSelectedGrId(String(res.selectedGoodsReceipt['id']));
      }
      if (res.selectedInvoice?.['id']) {
        setSelectedInvId(String(res.selectedInvoice['id']));
      }
    },
    onError: (err: Error) => {
      toast.error(`3-Way match error: ${err.message}`);
    },
  });

  const orderId = orderRow ? String(orderRow['id'] ?? orderRow['orderId'] ?? "") : "";

  React.useEffect(() => {
    if (open && orderId) {
      setData(null);
      setSelectedGrId("");
      setSelectedInvId("");
      matchMutation.mutate({ orderId });
    }
  }, [open, orderId]);

  const handleSelectGR = (grId: string) => {
    setSelectedGrId(grId);
    matchMutation.mutate({ orderId, goodsReceiptId: grId, invoiceId: selectedInvId });
  };

  const handleSelectInv = (invId: string) => {
    setSelectedInvId(invId);
    matchMutation.mutate({ orderId, goodsReceiptId: selectedGrId, invoiceId: invId });
  };

  const handleApprove = () => {
    toast.success(`Three-way match for PO ${String(orderRow?.['orderId'] ?? "")} approved & verified!`);
    onOpenChange(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "MATCHED":
        return (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <div className="text-[13px] font-semibold">3-Way Match Verified</div>
              <div className="text-[12px] opacity-90">
                Purchase Order terms, received quantities, and supplier invoice amounts match perfectly.
              </div>
            </div>
          </div>
        );
      case "DISCREPANCY":
        return (
          <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3.5 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <div className="text-[13px] font-semibold">Discrepancy Identified</div>
              <div className="text-[12px] opacity-90">
                Variances detected between Purchase Order, Goods Receipt, or Supplier Invoice totals.
              </div>
            </div>
          </div>
        );
      case "PENDING_RECEIPT":
        return (
          <div className="flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-3.5 text-blue-600 dark:text-blue-400">
            <Clock className="h-5 w-5 shrink-0 text-blue-500" />
            <div>
              <div className="text-[13px] font-semibold">Pending Goods Receipt</div>
              <div className="text-[12px] opacity-90">
                No matching Goods Receipt has been submitted for this Purchase Order yet.
              </div>
            </div>
          </div>
        );
      case "PENDING_INVOICE":
        return (
          <div className="flex items-center gap-2 rounded-md border border-indigo-500/30 bg-indigo-500/10 p-3.5 text-indigo-600 dark:text-indigo-400">
            <Clock className="h-5 w-5 shrink-0 text-indigo-500" />
            <div>
              <div className="text-[13px] font-semibold">Pending Supplier Invoice</div>
              <div className="text-[12px] opacity-90">
                No invoice has been billed by the supplier for this order yet.
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 rounded-md border border-slate-500/30 bg-slate-500/10 p-3.5 text-slate-600 dark:text-slate-400">
            <Clock className="h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <div className="text-[13px] font-semibold">Awaiting Verification Records</div>
              <div className="text-[12px] opacity-90">
                Goods receipt or invoice details are missing for full 3-way reconciliation.
              </div>
            </div>
          </div>
        );
    }
  };

  const summary = data?.summary;
  const selectedGR = data?.selectedGoodsReceipt;
  const selectedInv = data?.selectedInvoice;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Three-Way Reconciliation Match"
      description={`PO ${String(orderRow?.['orderId'] ?? "")} — Verification of PO, Goods Receipt & Supplier Invoice`}
      width="xl"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="subtle" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="default"
            disabled={!data || matchMutation.isPending}
            onClick={handleApprove}
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Approve & Reconcile
          </Button>
        </div>
      }
    >
      {matchMutation.isPending && !data ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4 animate-spin" />
          Running 3-Way Match Verification…
        </div>
      ) : data ? (
        <div className="space-y-4 text-xs">
          {/* Status Header Banner */}
          {getStatusBadge(data.status)}

          {/* Key Metric Tiles */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="rounded-sm border border-border bg-card p-2.5">
              <div className="text-[11px] font-medium text-muted-foreground">1. PO Amount</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {formatCurrency(summary?.orderAmount ?? 0)}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                Qty: {summary?.orderTotalQty ?? 0} items
              </div>
            </div>

            <div className="rounded-sm border border-border bg-card p-2.5">
              <div className="text-[11px] font-medium text-muted-foreground">2. Received Value</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {formatCurrency(summary?.receivedTotal ?? 0)}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                Qty: {summary?.grTotalQty ?? 0} items
              </div>
            </div>

            <div className="rounded-sm border border-border bg-card p-2.5">
              <div className="text-[11px] font-medium text-muted-foreground">3. Invoiced Amount</div>
              <div className="mt-1 text-sm font-semibold text-foreground">
                {formatCurrency(summary?.invoicedAmount ?? 0)}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {selectedInv ? String(selectedInv['invoiceId']) : "No invoice"}
              </div>
            </div>

            <div className="rounded-sm border border-border bg-card p-2.5">
              <div className="text-[11px] font-medium text-muted-foreground">Financial Variance</div>
              <div
                className={`mt-1 text-sm font-semibold ${
                  (summary?.amountVariance ?? 0) === 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatCurrency(Math.abs(summary?.amountVariance ?? 0))}
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {(summary?.amountVariance ?? 0) === 0 ? "Zero variance" : "Discrepancy found"}
              </div>
            </div>
          </div>

          {/* 3-Document Alignment Matrix */}
          <div className="grid grid-cols-3 gap-3">
            {/* Purchase Order Card */}
            <div className="rounded-sm border border-border bg-card/60 p-3">
              <div className="flex items-center gap-1.5 font-medium text-foreground pb-2 border-b border-border mb-2">
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                <span>Purchase Order</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PO Number:</span>
                  <span className="font-mono font-medium">{String(data.order['orderId'] ?? "")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Supplier:</span>
                  <span className="font-medium">{String(data.order['supplier'] ?? "")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
                    {String(data.order['status'] ?? "")}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-border/50 font-medium">
                  <span>PO Total:</span>
                  <span>{formatCurrency(Number(data.order['amount'] ?? 0))}</span>
                </div>
              </div>
            </div>

            {/* Goods Receipt Card */}
            <div className="rounded-sm border border-border bg-card/60 p-3">
              <div className="flex items-center justify-between font-medium text-foreground pb-2 border-b border-border mb-2">
                <div className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Goods Receipt</span>
                </div>
              </div>

              {data.availableGoodsReceipts.length > 1 && (
                <div className="mb-2">
                  <select
                    className="w-full rounded border border-border bg-background px-2 py-1 text-[11px]"
                    value={selectedGrId}
                    onChange={(e) => handleSelectGR(e.target.value)}
                  >
                    {data.availableGoodsReceipts.map((gr) => (
                      <option key={gr.id} value={gr.id}>
                        {gr.receiptId} ({gr.deliveryDate})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedGR ? (
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GR Number:</span>
                    <span className="font-mono font-medium">{String(selectedGR['receiptId'] ?? "")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Date:</span>
                    <span>{String(selectedGR['deliveryDate'] ?? "N/A")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
                      {String(selectedGR['status'] ?? "")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/50 font-medium">
                    <span>Received Total:</span>
                    <span>{formatCurrency(summary?.receivedTotal ?? 0)}</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground text-[11px]">
                  No Goods Receipt linked to PO.
                </div>
              )}
            </div>

            {/* Invoice Card */}
            <div className="rounded-sm border border-border bg-card/60 p-3">
              <div className="flex items-center justify-between font-medium text-foreground pb-2 border-b border-border mb-2">
                <div className="flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Supplier Invoice</span>
                </div>
              </div>

              {data.availableInvoices.length > 1 && (
                <div className="mb-2">
                  <select
                    className="w-full rounded border border-border bg-background px-2 py-1 text-[11px]"
                    value={selectedInvId}
                    onChange={(e) => handleSelectInv(e.target.value)}
                  >
                    {data.availableInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceId} ({formatCurrency(inv.amount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedInv ? (
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice No:</span>
                    <span className="font-mono font-medium">{String(selectedInv['invoiceId'] ?? "")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Date:</span>
                    <span>{String(selectedInv['date'] ?? "N/A")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
                      {String(selectedInv['status'] ?? "")}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-border/50 font-medium">
                    <span>Billed Amount:</span>
                    <span>{formatCurrency(Number(selectedInv['amount'] ?? 0))}</span>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground text-[11px]">
                  No Supplier Invoice linked.
                </div>
              )}
            </div>
          </div>

          {/* Discrepancies Callout */}
          {data.discrepancies.length > 0 && (
            <div className="rounded-sm border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-600 dark:text-amber-400 mb-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Reconciliation Discrepancies ({data.discrepancies.length})</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-muted-foreground">
                {data.discrepancies.map((disc, idx) => (
                  <li key={idx}>{disc}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Line Item Comparison Table */}
          <div className="rounded-sm border border-border overflow-hidden">
            <div className="bg-muted/60 px-3 py-2 text-[11px] font-semibold text-foreground border-b border-border">
              Line Item Validation & Quantity Breakdown
            </div>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-background border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="p-2 pl-3">Item Description</th>
                    <th className="p-2 text-right">Ordered Qty</th>
                    <th className="p-2 text-right">Received Qty</th>
                    <th className="p-2 text-right">Unit Price</th>
                    <th className="p-2 text-right">PO Total</th>
                    <th className="p-2 text-right pr-3">Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {data.itemsBreakdown.map((item, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="p-2 pl-3 font-medium text-foreground">{item.description}</td>
                      <td className="p-2 text-right">{item.orderedQty}</td>
                      <td className="p-2 text-right">{item.receivedQty}</td>
                      <td className="p-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-2 text-right">{formatCurrency(item.poTotal)}</td>
                      <td className="p-2 text-right pr-3">
                        {item.isQtyMatched ? (
                          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Matched
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-600 dark:text-amber-400 font-medium">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Variance
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
