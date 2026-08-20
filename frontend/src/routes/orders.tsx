import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Download, ScanSearch } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { itemsSum } from "@/components/kit/ResourceForm";
import { ThreeWayMatchModal } from "@/components/ThreeWayMatchModal";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Purchase Orders — SupplyX SCM" },
      { name: "description", content: "Issue purchase orders and run three-way match against receipts and invoices." },
      { property: "og:title", content: "Purchase Orders — SupplyX SCM" },
      { property: "og:description", content: "Issue purchase orders and run three-way match against receipts and invoices." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const [matchRow, setMatchRow] = React.useState<Row | null>(null);
  const suppliersQuery = useResourceList("/suppliers");
  const budgetsQuery = useResourceList("/suppliers/budget");
  const supplierRows = (suppliersQuery.data ?? []) as Row[];
  const budgetRows = (budgetsQuery.data ?? []) as Row[];

  const supplierOptions = Array.from(
    new Set(
      supplierRows
        .map((s) => String(s['name'] ?? ""))
        .concat(["brb", "twe", "BTENE", "Acme Corporation"])
    )
  ).filter(Boolean);

  const handleDownloadPdf = async (row: Row) => {
    try {
      const poNum = String(row['orderId'] || row['id']);
      await api.download(`/orders/${String(row['id'])}/pdf`, `PO-${poNum}.pdf`);
      toast.success(`Downloaded official PO PDF for ${poNum}`);
    } catch (err: any) {
      toast.error(`PDF download failed: ${err.message}`);
    }
  };

  return (
    <>
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

      <ThreeWayMatchModal
        open={!!matchRow}
        onOpenChange={(open) => !open && setMatchRow(null)}
        orderRow={matchRow}
      />
    </>
  );
}

