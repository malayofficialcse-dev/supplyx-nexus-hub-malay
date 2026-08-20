import { createFileRoute } from "@tanstack/react-router";
import { Paperclip } from "lucide-react";
import * as React from "react";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { FieldDef } from "@/components/kit/ResourceForm";
import { AttachmentsModal, AttachmentBadge } from "@/components/AttachmentsModal";
import { col, STATUS } from "@/lib/scm";
import type { Row } from "@/components/kit/DataTable";

export const Route = createFileRoute("/goods-receipts")({
  head: () => ({
    meta: [
      { title: "Goods Receipts — SupplyX SCM" },
      { name: "description", content: "Record inbound deliveries against purchase orders and post stock." },
      { property: "og:title", content: "Goods Receipts — SupplyX SCM" },
      { property: "og:description", content: "Record inbound deliveries against purchase orders and post stock." },
    ],
  }),
  component: GoodsReceiptsPage,
});

function GoodsReceiptsPage() {
  const [attRow, setAttRow] = React.useState<Row | null>(null);
  const orders = useResourceList("/orders");
  const warehouses = useResourceList("/warehouses");
  const suppliersQuery = useResourceList("/suppliers");

  const orderOptions = ((orders.data ?? []) as Row[]).map((o) => String(o['orderId'] ?? o['id']));
  const supplierOptions = Array.from(
    new Set([
      ...((suppliersQuery.data ?? []) as Row[]).map((s) => String(s['name'] ?? "")),
      // also include suppliers from existing orders as fallback
      ...((orders.data ?? []) as Row[]).map((o) => String(o['supplier'] ?? "")),
      "brb", "twe", "BTENE", "Acme Corporation",
    ])
  ).filter(Boolean);
  const warehouseOptions = ((warehouses.data ?? []) as Row[]).map((w) =>
    String(w['whId'] ?? w['id']),
  );

  const fields: FieldDef[] = [
    { name: "receiptId", label: "Receipt ID", required: true, placeholder: "GR-4001" },
    { name: "orderId", label: "Purchase order", type: "select", options: orderOptions, required: true },
    { name: "supplier", label: "Supplier", type: "select", options: supplierOptions, required: true },
    { name: "warehouseId", label: "Receiving warehouse", type: "select", options: warehouseOptions },
    { name: "deliveryDate", label: "Delivery date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", options: STATUS.receipt, required: true },
    { name: "items", label: "Received lines", type: "items", required: true },
  ];

  return (
    <>
      <CrudPage
        title="Goods Receipts"
        description="Inbound delivery confirmations and delivery note attachments that drive inventory movements."
        endpoint="/goods-receipts"
        exportName="goods-receipts"
        labelKey="receiptId"
        createLabel="Record receipt"
        canEdit={false}
        canDelete={false}
        filters={[
          { key: "status", label: "Status" },
          { key: "supplier", label: "Supplier" },
          { key: "warehouseId", label: "Warehouse" },
        ]}
        searchKeys={["receiptId", "orderId", "supplier", "warehouseId", "status"]}
        columns={[
          col.code("receiptId", "Receipt ID"),
          col.text("orderId", "Order"),
          col.text("supplier", "Supplier"),
          {
            key: "warehouseId",
            label: "Warehouse",
            render: (r) => {
              const wid = String(r["warehouseId"] ?? "");
              const wh = ((warehouses.data ?? []) as Row[]).find(
                (w) => w["id"] === wid || w["whId"] === wid
              );
              if (!wh) return <span>{wid || "—"}</span>;
              return (
                <span className="font-medium text-foreground">
                  {String(wh["whId"] || "")} — {String(wh["name"] || "")}
                </span>
              );
            },
          },
          col.date("deliveryDate", "Delivered"),
          col.items("items", "Lines"),
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
        fields={fields}
        rowActionsExtra={(row) => (
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setAttRow(row)}
            title="Manage Scanned Delivery Notes & Proof of Delivery"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Docs
          </Button>
        )}
      />

      <AttachmentsModal
        open={!!attRow}
        onOpenChange={(open) => !open && setAttRow(null)}
        entityType="goods-receipts"
        entityId={String(attRow?.["id"] ?? "")}
        entityLabel={`Goods Receipt ${String(attRow?.["receiptId"] ?? "")}`}
        attachments={(attRow?.["attachments"] as any[]) || []}
        invalidateKey="/goods-receipts"
      />
    </>
  );
}
