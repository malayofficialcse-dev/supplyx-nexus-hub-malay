import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContract } from "@/lib/api";

export const Route = createFileRoute("/contracts/new")({
  component: NewContractPage,
  head: () => ({
    meta: [
      { title: "Create Contract - SupplyX" },
      { name: "description", content: "Create a new supplier contract record." },
    ],
  }),
});

function NewContractPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [conId, setConId] = useState("");
  const [initials, setInitials] = useState("");
  const [supplier, setSupplier] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("Active");

  const mutation = useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      navigate({ to: "/contracts" });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate({ conId, initials, supplier, start, end, status });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">New Contract</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Add a new supplier contract to the SupplyX contract registry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/contracts" })}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" /> Back to Contracts
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Contract ID</span>
              <input
                required
                value={conId}
                onChange={(e) => setConId(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Initials</span>
              <input
                required
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Supplier</span>
              <input
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
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
                <option>Expiring</option>
                <option>Terminated</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Start Date</span>
              <input
                required
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">End Date</span>
              <input
                required
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate({ to: "/contracts" })}
              className="rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-primary-container px-4 py-2 text-body-sm font-medium text-on-primary hover:opacity-90 transition-opacity"
            >
              {mutation.isPending ? "Creating..." : "Create Contract"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
