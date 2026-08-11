import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createWarehouse } from "@/lib/api";

export const Route = createFileRoute("/warehouses/new")({
  component: NewWarehousePage,
  head: () => ({
    meta: [
      { title: "Create Warehouse - SupplyX" },
      { name: "description", content: "Create a new warehouse location and capacity profile." },
    ],
  }),
});

function NewWarehousePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [whId, setWhId] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState(0);
  const [fillLevel, setFillLevel] = useState(0);
  const [status, setStatus] = useState("Active");

  const mutation = useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      navigate({ to: "/warehouses" });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate({ whId, name, location, capacity, fillLevel, status });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">New Warehouse</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Add a new warehouse location to the enterprise inventory network.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/warehouses" })}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" /> Back to Warehouses
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Warehouse ID</span>
              <input
                required
                value={whId}
                onChange={(e) => setWhId(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Warehouse Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Location</span>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                <option>Full</option>
                <option>Maintenance</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Capacity (sq ft)</span>
              <input
                required
                type="number"
                min={0}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Fill Level (%)</span>
              <input
                required
                type="number"
                min={0}
                max={100}
                value={fillLevel}
                onChange={(e) => setFillLevel(Number(e.target.value))}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate({ to: "/warehouses" })}
              className="rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-primary-container px-4 py-2 text-body-sm font-medium text-on-primary hover:opacity-90 transition-opacity"
            >
              {mutation.isPending ? "Creating..." : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
