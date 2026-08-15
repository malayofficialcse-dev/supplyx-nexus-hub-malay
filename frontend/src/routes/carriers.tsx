import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { CrudPage } from "@/components/CrudPage";
import { CARRIER_TYPES, col } from "@/lib/scm";

export const Route = createFileRoute("/carriers")({
  head: () => ({
    meta: [
      { title: "Carriers — SupplyX SCM" },
      { name: "description", content: "Freight carrier directory with service ratings and fleet capacity." },
      { property: "og:title", content: "Carriers — SupplyX SCM" },
      { property: "og:description", content: "Freight carrier directory with service ratings and fleet capacity." },
    ],
  }),
  component: CarriersPage,
});

function CarriersPage() {
  return (
    <CrudPage
      title="Carriers"
      description="Transport partners, service ratings and active fleet."
      endpoint="/carriers"
      exportName="carriers"
      labelKey="name"
      createLabel="New carrier"
      filters={[{ key: "type", label: "Mode" }]}
      searchKeys={["name", "type", "contact"]}
      columns={[
        col.text("name", "Carrier"),
        col.text("type", "Mode"),
        {
          key: "rating",
          label: "Rating",
          align: "right",
          render: (r) => (
            <span className="inline-flex items-center justify-end gap-1 tabular-nums">
              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
              {Number(r['rating'] ?? 0).toFixed(1)}
            </span>
          ),
        },
        col.num("activeVehicles", "Active vehicles"),
        col.text("contact", "Contact"),
      ]}
      fields={[
        { name: "name", label: "Carrier name", required: true },
        { name: "type", label: "Mode", type: "select", options: CARRIER_TYPES, required: true },
        { name: "rating", label: "Rating (0-5)", type: "number", required: true },
        { name: "activeVehicles", label: "Active vehicles", type: "number", required: true },
        { name: "contact", label: "Contact", required: true },
      ]}
    />
  );
}
