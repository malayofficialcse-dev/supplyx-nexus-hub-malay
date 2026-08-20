import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CreditCard, DollarSign, Download, FileText, Printer, ShieldCheck, XCircle } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { Modal } from "@/components/kit/Modal";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/scm";

export function InvoiceDetailsModal({
  open,
  onOpenChange,
  invoiceRow,
  onStatusUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceRow: Row | null;
  onStatusUpdated?: () => void;
}) {
  const qc = useQueryClient();
  const [payModalOpen, setPayModalOpen] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState("Bank Transfer");
  const [paymentNotes, setPaymentNotes] = React.useState("");
  const [isDownloading, setIsDownloading] = React.useState(false);

  const invoiceId = String(invoiceRow?.['invoiceId'] ?? invoiceRow?.['id'] ?? "INV-0000");
  const supplier = String(invoiceRow?.['supplier'] ?? "Unknown Supplier");
  const date = String(invoiceRow?.['date'] ?? new Date().toLocaleDateString());
  const status = String(invoiceRow?.['status'] ?? "Draft");

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.put(`/invoices/${id}`, { status: "Approved" });
    },
    onSuccess: () => {
      toast.success(`Invoice ${invoiceId} approved for disbursement.`);
      void qc.invalidateQueries({ queryKey: ["/invoices"] });
      onStatusUpdated?.();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const payMutation = useMutation({
    mutationFn: async ({ id, method, notes }: { id: string; method: string; notes: string }) => {
      return api.post(`/invoices/${id}/pay`, { method, notes });
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || `Invoice ${invoiceId} paid & settled successfully!`);
      void qc.invalidateQueries({ queryKey: ["/invoices"] });
      void qc.invalidateQueries({ queryKey: ["/payments"] });
      void qc.invalidateQueries({ queryKey: ["/analytics/dashboard"] });
      onStatusUpdated?.();
      setPayModalOpen(false);
      onOpenChange(false);
    },
    onError: (err: Error) => toast.error(`Settlement error: ${err.message}`),
  });

  const handleDownloadPdf = async () => {
    if (!invoiceRow) return;
    setIsDownloading(true);
    try {
      await api.download(`/invoices/${invoiceRow.id}/pdf`, `Invoice-${invoiceId}.pdf`);
      toast.success(`Downloaded official PDF for Invoice ${invoiceId}`);
    } catch (err: any) {
      toast.error(`PDF download failed: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!invoiceRow) return null;
  const rawItems = Array.isArray(invoiceRow['items']) ? invoiceRow['items'] : [];

  const items = rawItems.map((it: any, idx: number) => {
    const qty = Number(it.quantity || it.qty || 1);
    const price = Number(it.unitPrice || it.price || (it.amount ? it.amount / qty : 0));
    const amount = Number(it.amount || qty * price);
    return {
      description: String(it.item || it.name || it.description || `Invoice Line #${idx + 1}`),
      quantity: qty,
      unitPrice: price,
      amount,
    };
  });

  const subtotal = items.reduce((s: number, i: any) => s + i.amount, 0) || Number(invoiceRow['amount'] ?? 0);
  const tax = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Supplier Bill — ${invoiceId}`}
      description={`Detailed Accounts Payable Statement for ${supplier}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Button variant="subtle" onClick={handleDownloadPdf} disabled={isDownloading}>
              <Download className="mr-1.5 h-3.5 w-3.5 text-primary" />
              {isDownloading ? "Downloading..." : "Download PDF"}
            </Button>
            <Button variant="subtle" onClick={handlePrint}>
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {status !== "Approved" && status !== "Paid" && (
              <Button
                variant="default"
                disabled={approveMutation.isPending}
                onClick={() => approveMutation.mutate(String(invoiceRow['id']))}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Approve Invoice
              </Button>
            )}
            {status !== "Paid" && (
              <Button
                variant="primary"
                onClick={() => setPayModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                1-Click Pay
              </Button>
            )}
            <Button variant="subtle" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      {/* 1-Click Pay Confirmation Submodal */}
      <Modal
        open={payModalOpen}
        onOpenChange={setPayModalOpen}
        title={`Authorize Settlement — ${invoiceId}`}
        description={`Execute real-time accounts payable disbursement of ${formatCurrency(total)} to ${supplier}`}
        width="md"
        footer={
          <>
            <Button onClick={() => setPayModalOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={payMutation.isPending}
              onClick={() =>
                payMutation.mutate({
                  id: String(invoiceRow['id']),
                  method: selectedMethod,
                  notes: paymentNotes,
                })
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <CreditCard className="mr-1.5 h-3.5 w-3.5" />
              {payMutation.isPending ? "Disbursing..." : `Confirm Payment of ${formatCurrency(total)}`}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-foreground">
            <div className="flex items-center justify-between font-bold">
              <span>Payable Recipient:</span>
              <span className="text-emerald-700 dark:text-emerald-400">{supplier}</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-sm font-extrabold">
              <span>Settlement Amount:</span>
              <span className="text-emerald-600 text-base">{formatCurrency(total)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Disbursement Method</label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Audit Settlement Notes (Optional)</label>
            <input
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
              placeholder="e.g. Approved via Executive AP Schedule, Batch #09"
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </Modal>
      <div className="space-y-4 text-xs font-sans">
        {/* Invoice Header Document Card */}
        <div className="rounded-sm border border-border bg-card p-4">
          <div className="flex items-start justify-between border-b border-border pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-base font-bold text-foreground">SupplyX SCM</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">Accounts Payable & Supplier Billing Service</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-sm font-bold text-primary">{invoiceId}</span>
              <div className="mt-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                    status === "Paid"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : status === "Approved"
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-[11px]">
            <div>
              <div className="font-medium text-muted-foreground">Vendor / Supplier:</div>
              <div className="font-semibold text-foreground text-xs mt-0.5">{supplier}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Invoice Date:</div>
              <div className="font-medium text-foreground mt-0.5">{date}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Payment Terms:</div>
              <div className="font-medium text-foreground mt-0.5">Net 30 Days</div>
            </div>
          </div>
        </div>

        {/* Bill Line Items Table */}
        <div className="rounded-sm border border-border overflow-hidden">
          <div className="bg-muted/60 px-3 py-2 text-[11px] font-semibold text-foreground border-b border-border flex justify-between items-center">
            <span>Billed Line Items ({items.length})</span>
            <span className="text-[10px] text-muted-foreground">Currency: USD ($)</span>
          </div>
          <table className="w-full text-left text-[11px]">
            <thead className="bg-background border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="p-2.5 pl-3">Item Description</th>
                <th className="p-2.5 text-right">Quantity</th>
                <th className="p-2.5 text-right">Unit Rate</th>
                <th className="p-2.5 text-right pr-3">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {items.map((it: any, i: number) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="p-2.5 pl-3 font-medium text-foreground">{it.description}</td>
                  <td className="p-2.5 text-right">{it.quantity}</td>
                  <td className="p-2.5 text-right">{formatCurrency(it.unitPrice)}</td>
                  <td className="p-2.5 text-right pr-3 font-medium text-foreground">
                    {formatCurrency(it.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bill Summary Calculations */}
        <div className="flex justify-end">
          <div className="w-64 rounded-sm border border-border bg-card p-3 space-y-2 text-[11px]">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal:</span>
              <span className="font-medium text-foreground">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Estimated Tax (8%):</span>
              <span className="font-medium text-foreground">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border font-bold text-xs text-foreground">
              <span>Total Payable:</span>
              <span className="text-primary text-sm">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
