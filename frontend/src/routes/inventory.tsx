import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader, StatCard } from "@/components/kit/Card";
import { DataTable } from "@/components/kit/DataTable";
import type { Row } from "@/components/kit/DataTable";
import { Select } from "@/components/kit/Input";
import { useResourceList } from "@/components/CrudPage";
import { api, unwrapList } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { col } from "@/lib/scm";
import { Boxes, PackageX, Warehouse as WarehouseIcon } from "lucide-react";

type Search = { warehouseId?: string };

export const Route = createFileRoute("/inventory")({
  validateSearch: (search: Record<string, unknown>): Search =>
    search['warehouseId'] ? { warehouseId: String(search['warehouseId']) } : {},
  head: () => ({
    meta: [
      { title: "Inventory — SupplyX SCM" },
      { name: "description", content: "Live stock balances by warehouse, item and SKU across the network." },
      { property: "og:title", content: "Inventory — SupplyX SCM" },
      { property: "og:description", content: "Live stock balances by warehouse, item and SKU across the network." },
    ],
  }),
  component: InventoryPage,
});

function InventoryPage() {
  const { warehouseId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const warehouses = useResourceList("/warehouses");
  const [selected, setSelected] = React.useState(warehouseId ?? "");

  React.useEffect(() => {
    setSelected(warehouseId ?? "");
  }, [warehouseId]);

  const endpoint = selected ? `/inventories/warehouse/${selected}` : "/inventories";
  const list = useQuery({
    queryKey: ["/inventories", selected],
    queryFn: async () => unwrapList(await api.get(endpoint)),
  });

  const rows = (list.data ?? []) as Row[];
  const totalQty = rows.reduce((s, r) => s + Number(r['quantity'] ?? 0), 0);
  const outOfStock = rows.filter((r) => Number(r['quantity'] ?? 0) <= 0).length;
  const distinctWarehouses = new Set(rows.map((r) => String(r['warehouseId'] ?? ""))).size;

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Stock on hand by warehouse, item and SKU."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Stock lines" value={formatNumber(rows.length)} icon={<Boxes className="h-5 w-5" />} />
        <StatCard label="Total quantity" value={formatNumber(totalQty)} />
        <StatCard
          label="Out of stock"
          value={formatNumber(outOfStock)}
          tone={outOfStock ? "danger" : "success"}
          icon={<PackageX className="h-5 w-5" />}
        />
        <StatCard
          label="Warehouses covered"
          value={formatNumber(distinctWarehouses)}
          icon={<WarehouseIcon className="h-5 w-5" />}
        />
      </div>

      <DataTable
        columns={[
          col.text("item", "Item"),
          col.text("sku", "SKU"),
          col.text("warehouseId", "Warehouse"),
          col.text("unit", "Unit"),
          {
            key: "quantity",
            label: "Quantity",
            align: "right",
            render: (r) => {
              const q = Number(r['quantity'] ?? 0);
              const rp = Number(r['reorderPoint'] ?? 0);
              const low = rp > 0 && q <= rp;
              return (
                <div className="flex flex-col items-end">
                  <span className={q <= 0 ? "font-semibold text-rose-600" : low ? "font-semibold text-amber-500" : "tabular-nums text-foreground"}>
                    {formatNumber(q, 2)}
                  </span>
                  {rp > 0 && (
                    <span className="text-[9px] text-muted-foreground">Min: {rp}</span>
                  )}
                </div>
              );
            },
          },
          {
            key: "alert",
            label: "Alert Status",
            render: (r) => {
              const q = Number(r['quantity'] ?? 0);
              const rp = Number(r['reorderPoint'] ?? 0);
              if (q <= 0) {
                return <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">Out of Stock</span>;
              }
              if (rp > 0 && q <= rp) {
                return <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">Low Stock</span>;
              }
              return <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600">Optimal</span>;
            },
          },
        ]}
        rows={rows}
        loading={list.isFetching}
        error={list.error ? (list.error as Error).message : null}
        onRefresh={() => {
          void list.refetch();
        }}
        searchKeys={["item", "sku", "warehouseId", "unit"]}
        filters={[{ key: "unit", label: "Unit" }]}
        exportName="inventory"
        emptyMessage="No stock records for this selection."
        toolbarExtra={
          <Select
            aria-label="Filter by warehouse"
            className="w-auto min-w-[180px]"
            value={selected}
            onChange={(e) => {
              const v = e.target.value;
              setSelected(v);
              void navigate({ search: v ? { warehouseId: v } : {} });
            }}
          >
            <option value="">All warehouses</option>
            {((warehouses.data ?? []) as Row[]).map((w) => (
              <option key={String(w['id'])} value={String(w['id'])}>
                {String(w['whId'] ?? "")} — {String(w['name'] ?? "")}
              </option>
            ))}
          </Select>
        }
      />
    </div>
  );
}
