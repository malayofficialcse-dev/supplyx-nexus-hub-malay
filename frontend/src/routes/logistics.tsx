import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { col } from "@/lib/scm";

export const Route = createFileRoute("/logistics")({
  head: () => ({
    meta: [
      { title: "Logistics Routes — SupplyX SCM" },
      { name: "description", content: "Lane costs, transit times and freight volume across the network." },
      { property: "og:title", content: "Logistics Routes — SupplyX SCM" },
      { property: "og:description", content: "Lane costs, transit times and freight volume across the network." },
    ],
  }),
  component: LogisticsPage,
});

function LogisticsPage() {
  return (
    <CrudPage
      title="Logistics Routes"
      description="Lane performance: cost per mile, transit time and volume."
      endpoint="/logistics"
      exportName="logistics-routes"
      labelKey="routeName"
      canCreate={false}
      canEdit={false}
      canDelete={false}
      searchKeys={["routeName"]}
      columns={[
        col.text("routeName", "Route"),
        col.money("costPerMile", "Cost / mile"),
        col.num("avgTransitTime", "Avg transit (hrs)", 1),
        col.num("volume", "Volume"),
      ]}
    />
  );
}
