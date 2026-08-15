import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/shipments")({
  head: () => ({
    meta: [
      { title: "Shipments — SupplyX SCM" },
      { name: "description", content: "Track inbound and outbound shipments, carriers and delivery ETAs." },
      { property: "og:title", content: "Shipments — SupplyX SCM" },
      { property: "og:description", content: "Track inbound and outbound shipments, carriers and delivery ETAs." },
    ],
  }),
  component: ShipmentsPage,
});

function ShipmentsPage() {
  return (
    <CrudPage
      title="Shipments"
      description="In-transit visibility across every carrier and lane."
      endpoint="/shipments"
      exportName="shipments"
      labelKey="trackingNumber"
      createLabel="New shipment"
      canEdit={false}
      canDelete={false}
      filters={[
        { key: "status", label: "Status" },
        { key: "carrier", label: "Carrier" },
      ]}
      searchKeys={["trackingNumber", "origin", "destination", "carrier", "status"]}
      columns={[
        col.code("trackingNumber", "Tracking #"),
        col.text("origin", "Origin"),
        col.text("destination", "Destination"),
        col.text("carrier", "Carrier"),
        col.date("estDelivery", "Est. delivery"),
        col.status(),
      ]}
      fields={[
        { name: "trackingNumber", label: "Tracking number", required: true },
        { name: "origin", label: "Origin", required: true },
        { name: "destination", label: "Destination", required: true },
        { name: "carrier", label: "Carrier", required: true },
        { name: "estDelivery", label: "Estimated delivery", type: "date", required: true },
        { name: "status", label: "Status", type: "select", options: STATUS.shipment, required: true },
      ]}
    />
  );
}
