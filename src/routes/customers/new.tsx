import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer } from "@/lib/api";

export const Route = createFileRoute("/customers/new")({
  component: NewCustomerPage,
  head: () => ({
    meta: [
      { title: "Create Customer - SupplyX" },
      { name: "description", content: "Create a new customer account for the SupplyX SCM platform." },
    ],
  }),
});

function NewCustomerPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [companyName, setCompanyName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Active");
  const [salesYTD, setSalesYTD] = useState(0);

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate({ to: "/customers" });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate({ companyName, contact, email, status, salesYTD });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">New Customer</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Create a new customer record for procurement and contract management.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/customers" })}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" /> Back to Customers
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Company Name</span>
              <input
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Contact Person</span>
              <input
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-label-caps text-on-surface-variant uppercase">Sales YTD</span>
            <input
              required
              type="number"
              min={0}
              step={100}
              value={salesYTD}
              onChange={(e) => setSalesYTD(Number(e.target.value))}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate({ to: "/customers" })}
              className="rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-primary-container px-4 py-2 text-body-sm font-medium text-on-primary hover:opacity-90 transition-opacity"
            >
              {mutation.isPending ? "Creating..." : "Create Customer"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
