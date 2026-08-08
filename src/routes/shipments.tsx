import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useQuery } from "@tanstack/react-query";
import { getShipments } from "@/lib/api";

export const Route = createFileRoute("/shipments")({
  component: ShipmentsPage,
  head: () => ({
    meta: [
      { title: "Freight Shipments Tracking - SupplyX" },
      { name: "description", content: "Track active carrier transits, origins, destinations, and logistics schedules." },
    ],
  }),
});

function ShipmentsPage() {
  const { data: shipments, isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: getShipments,
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="font-page-title text-page-title text-on-surface">Shipment Tracking</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Monitor SCM freight dispatches, carriers, and delivery status trails.
          </p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Tracking No</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Carrier</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Route (Origin → Destination)</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Est. Delivery</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Status</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-[13px] text-on-surface">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-on-surface-variant">
                      Loading shipments...
                    </td>
                  </tr>
                ) : !shipments || shipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-on-surface-variant">
                      No shipments tracked.
                    </td>
                  </tr>
                ) : (
                  shipments.map((sh) => (
                    <tr key={sh.id} className="hover:bg-surface-container-low/50 transition-colors h-12">
                      <td className="px-4 font-data-mono text-data-mono font-medium text-primary">
                        {sh.trackingNumber}
                      </td>
                      <td className="px-4 font-medium flex items-center gap-2 h-12">
                        <Icon name="local_shipping" className="text-outline text-[18px]" />
                        {sh.carrier}
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold">{sh.origin}</span>
                          <Icon name="trending_flat" className="text-outline text-[14px]" />
                          <span className="font-semibold text-on-surface-variant">{sh.destination}</span>
                        </div>
                      </td>
                      <td className="px-4 text-on-surface-variant">{sh.estDelivery}</td>
                      <td className="px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          sh.status === "Delivered"
                            ? "bg-[#DCFCE7] text-[#16A34A]"
                            : sh.status === "Delayed"
                              ? "bg-[#FEF2F2] text-[#DC2626]"
                              : "bg-[#EFF6FF] text-[#1D4ED8]"
                        }`}>
                          {sh.status}
                        </span>
                      </td>
                      <td className="px-4 text-right">
                        <button className="p-1 text-on-surface-variant hover:text-primary transition-colors" title="Track Live">
                          <Icon name="map" className="text-[18px]" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
