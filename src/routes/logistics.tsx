import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useQuery } from "@tanstack/react-query";
import { getLogistics } from "@/lib/api";

export const Route = createFileRoute("/logistics")({
  component: LogisticsPage,
  head: () => ({
    meta: [
      { title: "Logistics Optimization - SupplyX" },
      { name: "description", content: "Optimize shipping channels, route transits, and cost per mile metrics." },
    ],
  }),
});

function LogisticsPage() {
  const { data: routes, isLoading } = useQuery({
    queryKey: ["logistics"],
    queryFn: getLogistics,
  });

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="font-page-title text-page-title text-on-surface">Logistics Routes</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Analyze transit costs, average cargo shipping volume, and delivery speed across lanes.
          </p>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Route Channel</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Cost per Mile</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Avg Transit Hours</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Monthly Cargo Volume</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-[13px] text-on-surface">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      Loading logistics lanes...
                    </td>
                  </tr>
                ) : !routes || routes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant">
                      No routes found.
                    </td>
                  </tr>
                ) : (
                  routes.map((rt) => (
                    <tr key={rt.id} className="hover:bg-surface-container-low/50 transition-colors h-12">
                      <td className="px-4 font-medium flex items-center gap-2 h-12">
                        <Icon name="hub" className="text-primary text-[18px]" />
                        {rt.routeName}
                      </td>
                      <td className="px-4 font-data-mono text-data-mono text-right text-on-surface">
                        ${rt.costPerMile.toFixed(2)} / mi
                      </td>
                      <td className="px-4 font-data-mono text-data-mono text-right text-on-surface">
                        {rt.avgTransitTime} hrs
                      </td>
                      <td className="px-4 font-data-mono text-data-mono text-right text-on-surface">
                        {rt.volume.toLocaleString()} tons
                      </td>
                      <td className="px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          rt.costPerMile < 1.5
                            ? "bg-[#DCFCE7] text-[#16A34A] border border-[#DCFCE7]"
                            : rt.costPerMile > 2.5
                              ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FEF2F2]"
                              : "bg-[#EFF6FF] text-[#1D4ED8] border border-[#EFF6FF]"
                        }`}>
                          {rt.costPerMile < 1.5 ? "Optimal Cost" : rt.costPerMile > 2.5 ? "High Cost Lane" : "Standard"}
                        </span>
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
