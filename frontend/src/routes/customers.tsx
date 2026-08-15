import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — SupplyX SCM" },
      { name: "description", content: "Customer accounts, contacts and year-to-date sales performance." },
      { property: "og:title", content: "Customers — SupplyX SCM" },
      { property: "og:description", content: "Customer accounts, contacts and year-to-date sales performance." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <CrudPage
      title="Customers"
      description="Downstream accounts and commercial performance."
      endpoint="/customers"
      exportName="customers"
      labelKey="companyName"
      createLabel="New customer"
      filters={[{ key: "status", label: "Status" }]}
      searchKeys={["companyName", "contact", "email", "status"]}
      columns={[
        col.text("companyName", "Company"),
        col.text("contact", "Contact"),
        {
          key: "email",
          label: "Email",
          render: (r) => (
            <a className="text-primary hover:underline" href={`mailto:${String(r['email'] ?? "")}`}>
              {String(r['email'] ?? "—")}
            </a>
          ),
        },
        col.money("salesYTD", "Sales YTD"),
        col.status(),
      ]}
      fields={[
        { name: "companyName", label: "Company name", required: true },
        { name: "contact", label: "Primary contact", required: true },
        { name: "email", label: "Email", required: true },
        { name: "salesYTD", label: "Sales YTD", type: "currency", required: true },
        { name: "status", label: "Status", type: "select", options: STATUS.customer, required: true },
      ]}
    />
  );
}
