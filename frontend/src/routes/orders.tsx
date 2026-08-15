import { createFileRoute } from "@tanstack/react-router";
import { ScanSearch } from "lucide-react";
import * as React from "react";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { itemsSum } from "@/components/kit/ResourceForm";
import { ThreeWayMatchModal } from "@/components/ThreeWayMatchModal";
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
  const supplierOptions = Array.from(
    new Set(
      ((suppliersQuery.data ?? []) as Row[])
        .map((s) => String(s['name'] ?? ""))
        .concat(["brb", "twe", "BTENE", "Acme Corporation"])
    )
  ).filter(Boolean);

  return (
    <>
      <CrudPage
        title="Purchase Orders"
        description="Committed spend with suppliers, delivery tracking and PO matching."
        endpoint="/orders"
        exportName="purchase-orders"
        labelKey="orderId"
        createLabel="New purchase order"
        canEdit={false}
        canDelete={false}
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
        transformPayload={(payload, values) => ({ ...payload, amount: itemsSum(values) })}
        rowActionsExtra={(row) => (
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setMatchRow(row)}
          >
            <ScanSearch className="h-3.5 w-3.5" />
            3-way match
          </Button>
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

