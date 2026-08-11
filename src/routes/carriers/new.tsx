import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCarrier } from "@/lib/api";

export const Route = createFileRoute("/carriers/new")({
  component: NewCarrierPage,
  head: () => ({
    meta: [
      { title: "Create Carrier - SupplyX" },
      { name: "description", content: "Add a new carrier partner to the SupplyX logistics network." },
    ],
  }),
});

function NewCarrierPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [type, setType] = useState("Truck");
  const [rating, setRating] = useState(4.5);
  const [activeVehicles, setActiveVehicles] = useState(0);
  const [contact, setContact] = useState("");

  const mutation = useMutation({
    mutationFn: createCarrier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carriers"] });
      navigate({ to: "/carriers" });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate({ name, type, rating, activeVehicles, contact });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">New Carrier</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Add a new carrier partner for freight, trucking, or air logistics.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/carriers" })}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" /> Back to Carriers
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Carrier Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Freight Type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              >
                <option>Truck</option>
                <option>Air</option>
                <option>Ocean</option>
                <option>Rail</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Rating</span>
              <input
                required
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-label-caps text-on-surface-variant uppercase">Active Vehicles</span>
              <input
                required
                type="number"
                min={0}
                value={activeVehicles}
                onChange={(e) => setActiveVehicles(Number(e.target.value))}
                className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
              />
            </label>
          </div>

          <label className="space-y-2">
            <span className="text-label-caps text-on-surface-variant uppercase">Contact Info</span>
            <input
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-lg border border-outline-variant px-3 py-2 text-body-md focus:border-primary outline-none"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate({ to: "/carriers" })}
              className="rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-lg bg-primary-container px-4 py-2 text-body-sm font-medium text-on-primary hover:opacity-90 transition-opacity"
            >
              {mutation.isPending ? "Creating..." : "Create Carrier"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
