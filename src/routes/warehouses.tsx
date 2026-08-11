import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useQuery } from "@tanstack/react-query";
import { getWarehouses } from "@/lib/api";

export const Route = createFileRoute("/warehouses")({
  component: WarehousesPage,
  head: () => ({
    meta: [
      { title: "Warehouses Management - SupplyX" },
      { name: "description", content: "Manage enterprise SCM warehouses, storage capacity, and inventories." },
    ],
  }),
});

function WarehousesPage() {
  const navigate = useNavigate();
  const { data: warehouses, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">Warehouses</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Monitor and manage enterprise storage locations and inventory capacities.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: "/warehouses/new" })}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2 text-body-sm font-medium text-on-primary hover:opacity-90 transition-opacity"
          >
            <Icon name="add" className="text-[18px]" />
            New Warehouse
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-on-surface-variant">
              Loading warehouses...
            </div>
          ) : !warehouses || warehouses.length === 0 ? (
            <div className="col-span-full text-center py-8 text-on-surface-variant">
              No warehouses found.
            </div>
          ) : (
            warehouses.map((wh) => (
              <div key={wh.id} className="bg-surface border border-outline-variant rounded-xl p-container-padding shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="font-data-mono text-body-sm text-outline font-semibold uppercase">{wh.whId}</span>
                    <h3 className="font-section-heading text-subsection-heading text-on-surface font-semibold mt-1">
                      {wh.name}
                    </h3>
                    <p className="text-[12px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Icon name="location_on" className="text-[14px]" /> {wh.location}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    wh.status === "Active"
                      ? "bg-[#DCFCE7] text-[#16A34A]"
                      : wh.status === "Full"
                        ? "bg-[#FEF2F2] text-[#DC2626]"
                        : "bg-[#FEF9C3] text-[#A16207]"
                  }`}>
                    {wh.status}
                  </span>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-[12px] font-medium">
                    <span className="text-on-surface-variant">Storage Fill Rate:</span>
                    <span className="text-on-surface">{wh.fillLevel}%</span>
                  </div>
                  <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        wh.fillLevel > 90
                          ? "bg-error"
                          : wh.fillLevel > 70
                            ? "bg-secondary-fixed"
                            : "bg-primary"
                      }`}
                      style={{ width: `${wh.fillLevel}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-on-surface-variant pt-1">
                    <span>Capacity: {wh.capacity.toLocaleString()} sq ft</span>
                    <span>Available: {Math.round(wh.capacity * (1 - wh.fillLevel / 100)).toLocaleString()} sq ft</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Outlet />
      </div>
    </AppShell>
  );
}
