import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import type { Row } from "@/components/kit/DataTable";
import { col, PAYMENT_METHODS, STATUS } from "@/lib/scm";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — SupplyX SCM" },
      { name: "description", content: "Outgoing supplier payments with method, status and audit trail." },
      { property: "og:title", content: "Payments — SupplyX SCM" },
      { property: "og:description", content: "Outgoing supplier payments with method, status and audit trail." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const suppliersQuery = useResourceList("/suppliers");
  const supplierOptions = Array.from(
    new Set(
      ((suppliersQuery.data ?? []) as Row[])
        .map((s) => String(s['name'] ?? ""))
        .concat(["brb", "twe", "BTENE", "Acme Corporation"])
    )
  ).filter(Boolean);

  return (
    <CrudPage
      title="Payments"
      description="Settlement runs against approved supplier invoices."
      endpoint="/payments"
      exportName="payments"
      labelKey="paymentId"
      createLabel="New payment"
      canEdit={false}
      canDelete={false}
      filters={[
        { key: "status", label: "Status" },
        { key: "method", label: "Method" },
      ]}
      searchKeys={["paymentId", "invoiceId", "supplier", "method", "status"]}
      columns={[
        col.code("paymentId", "Payment ID"),
        col.text("invoiceId", "Invoice"),
        col.text("supplier", "Supplier"),
        col.text("method", "Method"),
        col.money("amount", "Amount"),
        col.status(),
        {
          key: "createdAt",
          label: "Created",
          render: (r) => formatDateTime(r['createdAt']),
        },
      ]}
      fields={[
        { name: "paymentId", label: "Payment ID", required: true, placeholder: "PAY-3001" },
        { name: "invoiceId", label: "Invoice ID", required: true },
        { name: "supplier", label: "Supplier", type: "select", options: supplierOptions, required: true },
        { name: "amount", label: "Amount", type: "currency", required: true },
        { name: "method", label: "Method", type: "select", options: PAYMENT_METHODS, required: true },
        { name: "status", label: "Status", type: "select", options: STATUS.payment, required: true, defaultValue: "Paid" },
      ]}
      transformPayload={(payload) => ({
        ...payload,
        auditTrail: [
          {
            action: "created",
            actor: "web-client",
            timestamp: new Date().toISOString(),
          },
        ],
      })}
    />
  );
}
