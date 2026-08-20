import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  Package,
  PackageCheck,
  PackageX,
  ShieldAlert,
  ShieldCheck,
  Truck,
  XCircle,
  Zap,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/kit/Button";
import { Modal } from "@/components/kit/Modal";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

export interface ThreeWayMatchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string | null;
  onPaymentSuccess?: () => void;
}

export function ThreeWayMatchModal({
  open,
  onOpenChange,
  invoiceId,
  onPaymentSuccess,
}: ThreeWayMatchModalProps) {
  const queryClient = useQueryClient();
  const [overrideModal, setOverrideModal] = React.useState(false);
  const [overrideNote, setOverrideNote] = React.useState("");

  const { data: report, isLoading, error, refetch } = useQuery({
    queryKey: ["/invoices", invoiceId, "three-way-match"],
    queryFn: () => (invoiceId ? api.get<any>(`/invoices/${invoiceId}/three-way-match`) : null),
    enabled: !!invoiceId && open,
  });

  const payMutation = useMutation({
    mutationFn: () => api.post(`/invoices/${invoiceId}/pay`, {}),
    onSuccess: () => {
      toast.success("Payment authorized and settled successfully via 3-Way Match validation!");
      void queryClient.invalidateQueries({ queryKey: ["/invoices"] });
      void queryClient.invalidateQueries({ queryKey: ["/payments"] });
      void queryClient.invalidateQueries({ queryKey: ["/analytics"] });
      onPaymentSuccess?.();
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(`Payment authorization failed: ${err.message}`);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (data: { action: string; note?: string; overrideAmount?: number }) =>
      api.post(`/invoices/${invoiceId}/resolve-match`, data),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Discrepancy resolution logged.");
      void refetch();
      void queryClient.invalidateQueries({ queryKey: ["/invoices"] });
      setOverrideModal(false);
    },
    onError: (err: any) => {
      toast.error(`Failed to resolve discrepancy: ${err.message}`);
    },
  });

  if (!open) return null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Automated 3-Way / 4-Way Match Engine"
      description="Cross-referencing Purchase Order (PO) ↔ Goods Receipt (GRN) ↔ QA Inspection ↔ Supplier Invoice"
      width="xl"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Tolerance Threshold:</span>
            <span>±1.5% or $5.00 auto-clear</span>
          </div>

          <div className="flex items-center gap-2">
            {report?.matchStatus !== "PERFECT_MATCH" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    resolveMutation.mutate({
                      action: "CREDIT_NOTE_REQUESTED",
                      note: "Requested debit memo for line-item variance.",
                    })
                  }
                  disabled={resolveMutation.isPending}
                >
                  Request Credit Note
                </Button>

                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => setOverrideModal(true)}
                  disabled={resolveMutation.isPending}
                >
                  Manager Override
                </Button>
              </>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => payMutation.mutate()}
              disabled={payMutation.isPending || (report?.matchStatus !== "PERFECT_MATCH" && !report?.toleranceApplied)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {payMutation.isPending ? "Settling Outflow…" : "Authorize Payment Release"}
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex h-56 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          <Zap className="h-6 w-6 animate-bounce text-primary" />
          <span className="font-semibold text-foreground">Evaluating 4-Way Matching Verification…</span>
          <span className="text-xs text-muted-foreground">Auditing PO quantities, GRN passed units, and billed unit prices</span>
        </div>
      ) : error ? (
        <div className="rounded border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to compile matching report: {(error as Error).message}
        </div>
      ) : !report ? null : (
        <div className="space-y-4">
          {/* Header Verdict Ribbon */}
          <div
            className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-sm border p-3.5 ${
              report.matchStatus === "PERFECT_MATCH"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : report.matchStatus === "GRN_PENDING"
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-rose-500/30 bg-rose-500/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`rounded p-2 ${
                  report.matchStatus === "PERFECT_MATCH"
                    ? "bg-emerald-500 text-white"
                    : report.matchStatus === "GRN_PENDING"
                      ? "bg-amber-500 text-white"
                      : "bg-rose-500 text-white"
                }`}
              >
                {report.matchStatus === "PERFECT_MATCH" ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <ShieldAlert className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">
                    {report.matchStatus === "PERFECT_MATCH"
                      ? "3-Way Match Verified & Ready for Payment"
                      : report.matchStatus === "GRN_PENDING"
                        ? "Payment Hold: Awaiting Warehouse GRN"
                        : report.matchStatus === "QUANTITY_MISMATCH"
                          ? "Quantity Discrepancy Detected"
                          : report.matchStatus === "PRICE_MISMATCH"
                            ? "Unit Price Variance Flagged"
                            : report.matchStatus === "QA_REJECTED"
                              ? "Quality Inspection Defects Flagged"
                              : "Unlinked Purchase Order (Rogue Spend)"}
                  </span>
                  {report.toleranceApplied && (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      Within ±1.5% Tolerance
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Invoice {report.invoiceNumber} · Supplier: <strong>{report.supplier}</strong> · Total:{" "}
                  <strong>{formatCurrency(report.invoiceAmount)}</strong>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Variance Delta</span>
              <div
                className={`text-base font-black font-mono ${
                  Math.abs(report.totalAmountVariance) < 0.01
                    ? "text-emerald-600"
                    : "text-rose-600"
                }`}
              >
                {report.totalAmountVariance > 0 ? `+${formatCurrency(report.totalAmountVariance)}` : formatCurrency(report.totalAmountVariance)}
              </div>
            </div>
          </div>

          {/* 3 Pillar Comparison Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Pillar 1: PO */}
            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-1.5">
                <span className="flex items-center gap-1.5 text-primary">
                  <FileText className="h-3.5 w-3.5" /> 1. Purchase Order
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{report.poNumber || "N/A"}</span>
              </div>
              <div className="text-sm font-bold text-foreground font-mono">
                {report.poAmount !== null ? formatCurrency(report.poAmount) : "Unlinked"}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Agreed contracted ceiling rate
              </span>
            </div>

            {/* Pillar 2: GRN & QA */}
            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-1.5">
                <span className="flex items-center gap-1.5 text-blue-500">
                  <PackageCheck className="h-3.5 w-3.5" /> 2. Warehouse GRN
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{report.grnNumber || "Pending"}</span>
              </div>
              <div className="text-sm font-bold text-foreground font-mono">
                {report.grnDate ? formatDate(report.grnDate) : "Dock Receipt Pending"}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Physical dock inspection log
              </span>
            </div>

            {/* Pillar 3: Invoice */}
            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-1.5">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <CreditCard className="h-3.5 w-3.5" /> 3. Supplier Invoice
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">{report.invoiceNumber}</span>
              </div>
              <div className="text-sm font-bold text-foreground font-mono text-emerald-600">
                {formatCurrency(report.invoiceAmount)}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Billed payable disbursement
              </span>
            </div>
          </div>

          {/* Warnings & Risk Flags */}
          {report.flags.length > 0 && (
            <div className="space-y-1.5 rounded border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Discrepancy Audit Findings:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {report.flags.map((flag: string, i: number) => (
                  <li key={i}>{flag}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Line-Item Comparison Matrix */}
          <div>
            <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary" /> Line-Item Audit Comparison Matrix
            </h4>
            <div className="overflow-x-auto rounded border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 text-[10px] uppercase font-bold text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-2.5">Line Item</th>
                    <th className="p-2.5 text-center">PO Rate</th>
                    <th className="p-2.5 text-center">GRN Passed</th>
                    <th className="p-2.5 text-center">Billed Qty</th>
                    <th className="p-2.5 text-center">Billed Rate</th>
                    <th className="p-2.5 text-right">Variance</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {report.lineItems.map((item: any, idx: number) => {
                    const isOk = item.status === "MATCHED";
                    return (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="p-2.5 font-semibold text-foreground">{item.item}</td>
                        <td className="p-2.5 text-center font-mono text-muted-foreground">
                          {formatCurrency(item.poUnitPrice)}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          <span
                            className={
                              item.grnPassedQuantity < item.invoicedQuantity
                                ? "text-rose-600 font-bold"
                                : "text-foreground"
                            }
                          >
                            {item.grnPassedQuantity}
                          </span>
                        </td>
                        <td className="p-2.5 text-center font-mono text-foreground font-bold">
                          {item.invoicedQuantity}
                        </td>
                        <td className="p-2.5 text-center font-mono">
                          <span
                            className={
                              item.invoicedUnitPrice > item.poUnitPrice
                                ? "text-rose-600 font-bold"
                                : "text-foreground"
                            }
                          >
                            {formatCurrency(item.invoicedUnitPrice)}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          {Math.abs(item.amountVariance) < 0.01 ? (
                            <span className="text-emerald-600">$0.00</span>
                          ) : (
                            <span className="text-rose-600">
                              {item.amountVariance > 0 ? `+${formatCurrency(item.amountVariance)}` : formatCurrency(item.amountVariance)}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-center">
                          {isOk ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" /> Matched
                            </span>
                          ) : item.status === "QTY_MISMATCH" ? (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                              <PackageX className="h-3 w-3" /> Qty Delta
                            </span>
                          ) : item.status === "PRICE_MISMATCH" ? (
                            <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                              <DollarSign className="h-3 w-3" /> Price Delta
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                              <Clock className="h-3 w-3" /> Awaiting GRN
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Manager Override Form */}
          {overrideModal && (
            <div className="rounded border border-primary/30 bg-primary/5 p-3 space-y-2">
              <div className="text-xs font-bold text-foreground">
                Manager Authorization & Audit Override
              </div>
              <textarea
                value={overrideNote}
                onChange={(e) => setOverrideNote(e.target.value)}
                placeholder="Specify audit justification for price or quantity variance override (e.g. Authorized emergency freight surcharge)..."
                className="w-full rounded border border-border bg-card p-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="xs" onClick={() => setOverrideModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  onClick={() =>
                    resolveMutation.mutate({
                      action: "APPROVE_OVERRIDE",
                      note: overrideNote,
                    })
                  }
                  disabled={resolveMutation.isPending || !overrideNote.trim()}
                >
                  Confirm Override Approval
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
