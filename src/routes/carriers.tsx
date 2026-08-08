import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useQuery } from "@tanstack/react-query";
import { getCarriers } from "@/lib/api";

export const Route = createFileRoute("/carriers")({
  component: CarriersPage,
  head: () => ({
    meta: [
      { title: "Shipping Carriers Directory - SupplyX" },
      { name: "description", content: "Review shipping carrier partnerships, ratings, fleet capacities, and contact information." },
    ],
  }),
});

function CarriersPage() {
  const { data: carriers, isLoading } = useQuery({
    queryKey: ["carriers"],
    queryFn: getCarriers,
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="font-page-title text-page-title text-on-surface">Carriers</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Monitor carrier partnerships, transit ratings, fleet capabilities, and key contacts.
          </p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Carrier Partner</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Freight Type</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Active Fleet Vehicles</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Performance Rating</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Contact Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-[13px] text-on-surface">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Loading carriers...
                    </td>
                  </tr>
                ) : !carriers || carriers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      No shipping carriers found.
                    </td>
                  </tr>
                ) : (
                  carriers.map((cr) => (
                    <tr key={cr.id} className="hover:bg-surface-container-low/50 transition-colors h-12">
                      <td className="px-4 font-medium flex items-center gap-2 h-12">
                        <Icon name="local_shipping" className="text-primary text-[18px]" />
                        {cr.name}
                      </td>
                      <td className="px-4 font-medium text-on-surface-variant">{cr.type}</td>
                      <td className="px-4 font-data-mono text-data-mono text-right">{cr.activeVehicles}</td>
                      <td className="px-4 font-semibold">
                        <span className="flex items-center gap-1">
                          <Icon name="star" fill className="text-yellow-500 text-[16px]" />
                          {cr.rating} / 5.0
                        </span>
                      </td>
                      <td className="px-4 font-data-mono text-data-mono text-on-surface-variant">
                        {cr.contact}
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
