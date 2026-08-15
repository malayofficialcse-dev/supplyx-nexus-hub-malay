import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Boxes, Building2, CheckCircle2, Warehouse as WarehouseIcon } from "lucide-react";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/warehouses")({
  head: () => ({
    meta: [
      { title: "Warehouses — SupplyX SCM" },
      { name: "description", content: "Track warehouse capacity, fill levels and operational status." },
      { property: "og:title", content: "Warehouses — SupplyX SCM" },
      { property: "og:description", content: "Track warehouse capacity, fill levels and operational status." },
    ],
  }),
  component: WarehousesPage,
});

function WarehousesPage() {
  const warehousesQuery = useResourceList("/warehouses");
  const warehouseRows = (warehousesQuery.data ?? []) as Row[];

  const totalSites = warehouseRows.length;
  const activeSites = warehouseRows.filter((r) => String(r['status']) === "Active").length;
  const avgFillLevel = warehouseRows.length
    ? Math.round(warehouseRows.reduce((s, r) => s + Number(r['fillLevel'] ?? 0), 0) / warehouseRows.length)
    : 0;
  const nearCapacityCount = warehouseRows.filter((r) => Number(r['fillLevel'] ?? 0) >= 85).length;

  return (
    <CrudPage
      title="Warehouses"
      description="Network sites, storage capacity and real-time utilisation tracking."
      endpoint="/warehouses"
      exportName="warehouses"
      labelKey="name"
      createLabel="New warehouse"
      headerExtra={
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <WarehouseIcon className="h-3.5 w-3.5 text-primary" /> Total Facilities
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">{totalSites} sites</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{activeSites} operational</div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Active Sites
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">{activeSites} active</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Online & receiving</div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Building2 className="h-3.5 w-3.5 text-blue-500" /> Network Capacity
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">{avgFillLevel}% avg fill</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Utilisation balance</div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> High Utilization
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">{nearCapacityCount} sites</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">≥ 85% capacity threshold</div>
          </div>
        </div>
      }
      filters={[{ key: "status", label: "Status" }, { key: "location", label: "Location" }]}
      searchKeys={["whId", "name", "location", "status"]}
      columns={[
        col.code("whId", "Site ID"),
        col.text("name", "Name"),
        col.text("location", "Location"),
        col.num("capacity", "Capacity"),
        {
          key: "fillLevel",
          label: "Fill level",
          align: "right",
          render: (r) => {
            const pct = Math.max(0, Math.min(100, Number(r['fillLevel'] ?? 0)));
            const colorClass =
              pct >= 90
                ? "bg-rose-500"
                : pct >= 75
                ? "bg-amber-500"
                : "bg-emerald-500";
            return (
              <div className="flex items-center justify-end gap-2">
                <div className="h-2 w-28 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${colorClass}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 tabular-nums text-right font-medium">{pct}%</span>
              </div>
            );
          },
        },
        col.status(),
      ]}
      fields={[
        { name: "whId", label: "Site ID", required: true, placeholder: "WH-01" },
        { name: "name", label: "Name", required: true },
        { name: "location", label: "Location", required: true },
        { name: "capacity", label: "Capacity (units)", type: "number", required: true },
        { name: "fillLevel", label: "Fill level (%)", type: "number", required: true },
        { name: "status", label: "Status", type: "select", options: STATUS.warehouse, required: true },
      ]}
      rowActionsExtra={(row) => (
        <Link to="/inventory" search={{ warehouseId: String(row['id'] ?? "") }}>
          <Button variant="subtle" size="sm">
            <Boxes className="h-3.5 w-3.5" />
            Stock
          </Button>
        </Link>
      )}
    />
  );
}
