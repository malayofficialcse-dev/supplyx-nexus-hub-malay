import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Paperclip,
  Percent,
  Calendar,
  AlertCircle,
  TrendingDown,
  Filter,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import { InvoiceDetailsModal } from "@/components/InvoiceDetailsModal";
import { AttachmentsModal, AttachmentBadge } from "@/components/AttachmentsModal";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { itemsSum } from "@/components/kit/ResourceForm";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices & Payables — SupplyX SCM" },
      { name: "description", content: "Supplier invoices, payment terms, aging status and payment settlements." },
      { property: "og:title", content: "Invoices & Payables — SupplyX SCM" },
      { property: "og:description", content: "Supplier invoices, payment terms, aging status and payment settlements." },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = React.useState<Row | null>(null);
  const [attRow, setAttRow] = React.useState<Row | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const invoicesQuery = useResourceList("/invoices");
  const suppliersQuery = useResourceList("/suppliers");
  const invoiceRows = (invoicesQuery.data ?? []) as Row[];

  const supplierOptions = Array.from(
    new Set(
      ((suppliersQuery.data ?? []) as Row[])
        .map((s) => String(s["name"] ?? ""))
        .concat(["brb", "twe", "BTENE", "Acme Corporation"])
    )
  ).filter(Boolean);

  const totalAmount = invoiceRows.reduce((s, r) => s + (Number(r["amount"]) || 0), 0);
  const approvedAmount = invoiceRows
    .filter((r) => String(r["status"]) === "Approved")
    .reduce((s, r) => s + (Number(r["amount"]) || 0), 0);
  const pendingAmount = invoiceRows
    .filter((r) => String(r["status"]) === "Draft" || String(r["status"]) === "Submitted" || String(r["status"]) === "Pending")
    .reduce((s, r) => s + (Number(r["amount"]) || 0), 0);
  const paidAmount = invoiceRows
    .filter((r) => String(r["status"]) === "Paid")
    .reduce((s, r) => s + (Number(r["amount"]) || 0), 0);

  const overdueInvoices = invoiceRows.filter((r) => {
    if (String(r["status"]) === "Paid") return false;
    const dueDate = r["dueDate"] ? new Date(String(r["dueDate"])) : null;
    if (!dueDate || isNaN(dueDate.getTime())) return false;
    return dueDate.getTime() < Date.now();
  });
  const overdueAmount = overdueInvoices.reduce((s, r) => s + (Number(r["amount"]) || 0), 0);

  const handleDownloadPdf = async (row: Row) => {
    try {
      const invId = String(row["invoiceId"] || row["id"]);
      await api.download(`/invoices/${String(row["id"])}/pdf`, `Invoice-${invId}.pdf`);
      toast.success(`Downloaded PDF for ${invId}`);
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`);
    }
  };

  return (
    <>
      <CrudPage
        title="Invoices & Payables"
        description="Accounts payable register with payment terms engine, overdue aging analysis and one-click settlement."
        endpoint="/invoices"
        exportName="invoices"
        labelKey="invoiceId"
        createLabel="New invoice"
        canEdit={true}
        canDelete={true}
        headerExtra={
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <FileText className="h-3.5 w-3.5 text-primary" /> Total Invoiced
              </div>
              <div className="mt-1 text-base font-bold text-foreground font-mono">{formatCurrency(totalAmount)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{invoiceRows.length} total bills</div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" /> Approved
              </div>
              <div className="mt-1 text-base font-bold text-foreground font-mono">{formatCurrency(approvedAmount)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Ready for disbursement</div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending Review
              </div>
              <div className="mt-1 text-base font-bold text-foreground font-mono">{formatCurrency(pendingAmount)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Awaiting verification</div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold">
                <AlertCircle className="h-3.5 w-3.5 text-rose-600" /> Overdue Invoices
              </div>
              <div className="mt-1 text-base font-bold text-rose-600 font-mono">{formatCurrency(overdueAmount)}</div>
              <div className="text-[10px] text-rose-500 mt-0.5">{overdueInvoices.length} bills past due date</div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Settled / Paid
              </div>
              <div className="mt-1 text-base font-bold text-foreground font-mono">{formatCurrency(paidAmount)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Disbursed</div>
            </div>
          </div>
        }
        filters={[
          { key: "status", label: "Status" },
          { key: "supplier", label: "Supplier" },
        ]}
        searchKeys={["invoiceId", "supplier", "status", "paymentTerms"]}
        columns={[
          col.code("invoiceId", "Invoice ID"),
          col.text("supplier", "Supplier"),
          col.date("date", "Invoice date"),
          {
            key: "paymentTerms",
            label: "Terms & Due Date",
            render: (r) => {
              const terms = String(r["paymentTerms"] ?? "NET_30");
              const isPaid = String(r["status"]) === "Paid";
              const dueDateStr = String(r["dueDate"] ?? "");
              const dueDate = dueDateStr ? new Date(dueDateStr) : null;
              const now = new Date();
              const daysLeft = dueDate && !isNaN(dueDate.getTime()) ? Math.ceil((dueDate.getTime() - now.getTime()) / 86400000) : null;
              const isOverdue = !isPaid && daysLeft !== null && daysLeft < 0;
              const isDueSoon = !isPaid && daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
              const is210Discount = terms.includes("2/10") || terms.includes("DISCOUNT");

              return (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      {terms.replace("_", " ")}
                    </span>
                    {is210Discount && !isPaid && (
                      <span className="rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-600 border border-emerald-500/20" title="2% Early Payment Discount available if paid within 10 days">
                        2% DISC
                      </span>
                    )}
                  </div>
                  {isPaid ? (
                    <span className="text-[10px] text-emerald-600 font-medium">✓ Settled</span>
                  ) : isOverdue ? (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                      <AlertCircle className="h-3 w-3" /> {Math.abs(daysLeft!)}d overdue ({formatDate(dueDateStr)})
                    </span>
                  ) : isDueSoon ? (
                    <span className="text-[10px] font-semibold text-amber-500 flex items-center gap-0.5">
                      <Clock className="h-3 w-3" /> Due in {daysLeft}d ({formatDate(dueDateStr)})
                    </span>
                  ) : dueDateStr ? (
                    <span className="text-[10px] text-muted-foreground">Due: {formatDate(dueDateStr)}</span>
                  ) : null}
                </div>
              );
            },
          },
          col.items(),
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
          { name: "invoiceId", label: "Invoice ID", required: true, placeholder: "INV-2001" },
          { name: "supplier", label: "Supplier", type: "select", options: supplierOptions, required: true },
          { name: "date", label: "Invoice date", type: "date", required: true },
          {
            name: "paymentTerms",
            label: "Payment Terms",
            type: "select",
            options: ["NET_7", "NET_14", "NET_30", "NET_45", "NET_60", "NET_90", "2/10_NET_30", "IMMEDIATE", "COD"],
            defaultValue: "NET_30",
          },
          { name: "status", label: "Status", type: "select", options: STATUS.invoice, required: true, defaultValue: "Draft" },
          { name: "items", label: "Invoice lines", type: "items", required: true },
        ]}
        formExtra={(values, isEdit) => {
          const supplier = String(values["supplier"] ?? "");
          const date = String(values["date"] ?? "");
          const currentId = String(values["invoiceId"] ?? "");
          const sum = itemsSum(values);
          if (!supplier || !date || sum <= 0) return null;

          const duplicate = invoiceRows.find(
            (inv) =>
              (!isEdit || String(inv["invoiceId"]) !== currentId) &&
              String(inv["supplier"]).toLowerCase() === supplier.toLowerCase() &&
              String(inv["date"]) === date &&
              Math.abs(Number(inv["amount"] ?? 0) - sum) < 0.01
          );

          if (!duplicate) return null;

          return (
            <div className="mb-4 flex items-start gap-2.5 rounded-sm border border-amber-500/40 bg-amber-500/10 p-3 text-[12px] text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <strong className="font-semibold">Possible Duplicate Invoice Detected:</strong>
                <p className="mt-0.5 text-foreground/90">
                  An invoice (<strong>{String(duplicate["invoiceId"])}</strong>) from <strong>{supplier}</strong> for <strong>{formatCurrency(sum)}</strong> on <strong>{date}</strong> already exists on record.
                </p>
              </div>
            </div>
          );
        }}
        transformPayload={(payload, values) => {
          const amount = itemsSum(values);
          const terms = String((values as any)["paymentTerms"] ?? "NET_30");
          let netDays = 30;
          if (terms.includes("NET_")) {
            netDays = parseInt(terms.replace(/.*?NET_/, ""), 10) || 30;
          } else if (terms === "IMMEDIATE" || terms === "COD") {
            netDays = 0;
          }
          const invDate = values["date"] ? new Date(String(values["date"])) : new Date();
          const dueDate = new Date(invDate.getTime() + netDays * 86400000).toISOString().split("T")[0];
          return { ...payload, amount, paymentTerms: terms, dueDate };
        }}
        rowActionsExtra={(row) => (
          <>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setAttRow(row)}
              title="Manage Invoice PDF & Attachments"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => setSelectedInvoice(row)}
            >
              <FileText className="h-3.5 w-3.5 text-primary" />
              Bill
            </Button>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => handleDownloadPdf(row)}
              title="Download Invoice PDF"
            >
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </>
        )}
      />

      <InvoiceDetailsModal
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
        invoiceRow={selectedInvoice}
        onStatusUpdated={() => {
          void invoicesQuery.refetch();
        }}
      />

      <AttachmentsModal
        open={!!attRow}
        onOpenChange={(open) => !open && setAttRow(null)}
        entityType="invoices"
        entityId={String(attRow?.["id"] ?? "")}
        entityLabel={`Invoice ${String(attRow?.["invoiceId"] ?? "")}`}
        attachments={(attRow?.["attachments"] as any[]) || []}
        invalidateKey="/invoices"
      />
    </>
  );
}
