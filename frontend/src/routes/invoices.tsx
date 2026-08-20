import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, CreditCard, DollarSign, Download, FileText } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import { InvoiceDetailsModal } from "@/components/InvoiceDetailsModal";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { itemsSum } from "@/components/kit/ResourceForm";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { title: "Invoices — SupplyX SCM" },
      { name: "description", content: "Supplier invoices, amounts due and approval status." },
      { property: "og:title", content: "Invoices — SupplyX SCM" },
      { property: "og:description", content: "Supplier invoices, amounts due and approval status." },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = React.useState<Row | null>(null);
  const invoicesQuery = useResourceList("/invoices");
  const suppliersQuery = useResourceList("/suppliers");
  const invoiceRows = (invoicesQuery.data ?? []) as Row[];

  const supplierOptions = Array.from(
    new Set(
      ((suppliersQuery.data ?? []) as Row[])
        .map((s) => String(s['name'] ?? ""))
        .concat(["brb", "twe", "BTENE", "Acme Corporation"])
    )
  ).filter(Boolean);

  const totalAmount = invoiceRows.reduce((s, r) => s + (Number(r['amount']) || 0), 0);
  const approvedAmount = invoiceRows
    .filter((r) => String(r['status']) === "Approved")
    .reduce((s, r) => s + (Number(r['amount']) || 0), 0);
  const pendingAmount = invoiceRows
    .filter((r) => String(r['status']) === "Draft" || String(r['status']) === "Submitted" || String(r['status']) === "Pending")
    .reduce((s, r) => s + (Number(r['amount']) || 0), 0);
  const paidAmount = invoiceRows
    .filter((r) => String(r['status']) === "Paid")
    .reduce((s, r) => s + (Number(r['amount']) || 0), 0);

  const handleDownloadPdf = async (row: Row) => {
    try {
      const invId = String(row['invoiceId'] || row['id']);
      await api.download(`/invoices/${String(row['id'])}/pdf`, `Invoice-${invId}.pdf`);
      toast.success(`Downloaded PDF for ${invId}`);
    } catch (err: any) {
      toast.error(`Download failed: ${err.message}`);
    }
  };

  return (
    <>
      <CrudPage
        title="Invoices"
        description="Accounts payable register with line-level detail, bill generation and payment tracking."
        endpoint="/invoices"
        exportName="invoices"
        labelKey="invoiceId"
        createLabel="New invoice"
        canEdit={true}
        canDelete={true}
        headerExtra={
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <FileText className="h-3.5 w-3.5 text-primary" /> Total Invoiced
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">{formatCurrency(totalAmount)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{invoiceRows.length} total bills</div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" /> Approved
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">{formatCurrency(approvedAmount)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Ready for payment</div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending Review
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">{formatCurrency(pendingAmount)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Awaiting signoff</div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Settled / Paid
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">{formatCurrency(paidAmount)}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Disbursed</div>
            </div>
          </div>
        }
        filters={[{ key: "status", label: "Status" }, { key: "supplier", label: "Supplier" }]}
        searchKeys={["invoiceId", "supplier", "status"]}
        columns={[
          col.code("invoiceId", "Invoice ID"),
          col.text("supplier", "Supplier"),
          col.date("date", "Invoice date"),
          col.items(),
          col.money("amount", "Amount"),
          {
            key: "paymentTerms",
            label: "Terms",
            render: (r) => {
              const terms = String(r["paymentTerms"] ?? "NET_30");
              const dueDate = r["dueDate"] ? new Date(String(r["dueDate"])) : null;
              const now = new Date();
              const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - now.getTime()) / 86400000) : null;
              const isOverdue = daysLeft !== null && daysLeft < 0;
              const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
              return (
                <div className="flex flex-col gap-0.5">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {terms}
                  </span>
                  {daysLeft !== null && (
                    <span className={`text-[9px] font-semibold ${isOverdue ? "text-rose-600" : isUrgent ? "text-amber-500" : "text-muted-foreground"}`}>
                      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `due in ${daysLeft}d`}
                    </span>
                  )}
                </div>
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
            label: "Payment terms",
            type: "select",
            options: ["NET_7", "NET_14", "NET_30", "NET_45", "NET_60", "NET_90", "IMMEDIATE", "COD"],
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
          const terms = (values as any)["paymentTerms"] ?? "NET_30";
          const netDays = parseInt(terms.replace("NET_", ""), 10) || 0;
          const dueDate = terms === "IMMEDIATE" || terms === "COD"
            ? new Date().toISOString().split("T")[0]
            : new Date(Date.now() + netDays * 86400000).toISOString().split("T")[0];
          return { ...payload, amount, paymentTerms: terms, dueDate };
        }}
        rowActionsExtra={(row) => (
          <>
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
              title="Download PDF"
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
    </>
  );
}

