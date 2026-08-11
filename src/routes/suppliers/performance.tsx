import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getContracts } from "@/lib/api";

export const Route = createFileRoute("/suppliers/performance")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Supplier Performance Analytics - SupplyX" },
      { name: "description", content: "Detailed performance metrics for your supplier base, including risk score, delivery, quality and cost trends." },
      { property: "og:title", content: "Supplier Performance Analytics - SupplyX" },
      { property: "og:description", content: "Detailed performance metrics for your supplier base." },
    ],
  }),
});

function Page() {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const suppliers = contracts ?? [];
  const selected = suppliers[selectedIdx];

  // Derived mock metrics based on real contract data (augmented with performance scores)
  const getScore = (idx: number, field: "delivery" | "quality" | "cost" | "risk") => {
    const base = [88, 92, 76, 95, 84];
    const offsets: Record<string, number[]> = {
      delivery: [0, 3, -5, 2, -3],
      quality: [2, -1, 4, -2, 1],
      cost: [-3, 2, -1, 3, -4],
      risk: [0, 0, 10, -5, 5],
    };
    return Math.min(100, Math.max(0, (base[idx % base.length] ?? 88) + (offsets[field]?.[idx % 5] ?? 0)));
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-stack-lg">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <button onClick={() => navigate({ to: "/" })} className="hover:text-primary transition-colors font-body-sm">
                Procurement
              </button>
              <Icon name="chevron_right" className="text-[16px]" />
              <span className="font-body-sm text-on-surface">Supplier Performance</span>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface">Supplier Performance Analytics</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {selected ? `Viewing: ${selected.supplier} (${selected.conId})` : "Select a supplier to view performance metrics"}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-outline-variant bg-surface rounded text-on-surface font-body-sm font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
              <Icon name="download" className="text-[18px]" /> Export Report
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-on-surface-variant">Loading supplier data...</div>
        ) : (
          <div className="grid grid-cols-12 gap-gutter">
            {/* Supplier Selector (Left) */}
            <div className="col-span-12 lg:col-span-3 bg-surface border border-outline-variant rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-[#F8FAFC]">
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">Your Suppliers</p>
              </div>
              <div className="divide-y divide-outline-variant">
                {suppliers.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`w-full text-left p-3 flex items-center gap-3 hover:bg-surface-container-low transition-colors ${
                      selectedIdx === idx ? "bg-[#EFF6FF] border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedIdx === idx ? "bg-primary text-white" : "bg-surface-container text-primary"
                    }`}>
                      {s.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-sm text-body-sm font-medium text-on-surface truncate">{s.supplier}</p>
                      <p className="font-data-mono text-[11px] text-on-surface-variant">{s.conId}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                      s.status === "Active"
                        ? "bg-[#DCFCE7] text-[#16A34A]"
                        : "bg-[#FEF9C3] text-[#CA8A04]"
                    }`}>{s.status}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Performance Detail (Right) */}
            {selected ? (
              <div className="col-span-12 lg:col-span-9 space-y-gutter">
                {/* Identity Card */}
                <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-sm flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {selected.initials}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-section-heading text-section-heading text-on-surface">{selected.supplier}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Contract: {selected.conId} • {selected.start} → {selected.end}</p>
                  </div>
                  <div className="flex gap-4">
                    {(["delivery", "quality", "cost"] as const).map((metric) => {
                      const score = getScore(selectedIdx, metric);
                      return (
                        <div key={metric} className="text-center">
                          <div className={`text-2xl font-bold font-data-mono ${
                            score >= 90 ? "text-tertiary-container" : score >= 75 ? "text-primary" : "text-error"
                          }`}>
                            {score}
                          </div>
                          <div className="font-label-caps text-label-caps text-on-surface-variant uppercase mt-1 capitalize">{metric}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scorecard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  {(["delivery", "quality", "cost", "risk"] as const).map((metric) => {
                    const score = getScore(selectedIdx, metric);
                    const icons: Record<string, string> = { delivery: "local_shipping", quality: "verified", cost: "trending_down", risk: "shield" };
                    const labels: Record<string, string> = { delivery: "On-Time Delivery Rate", quality: "Quality Pass Rate", cost: "Cost Efficiency Score", risk: "Risk Index" };
                    const isRisk = metric === "risk";
                    const goodScore = isRisk ? score < 30 : score >= 85;
                    return (
                      <div key={metric} className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase">{labels[metric]}</p>
                            <p className={`text-3xl font-bold font-data-mono mt-1 ${goodScore ? "text-tertiary-container" : "text-error"}`}>
                              {score}{isRisk ? "" : "%"}
                            </p>
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${goodScore ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"}`}>
                            <Icon name={icons[metric]} className={`text-[20px] ${goodScore ? "text-[#16A34A]" : "text-error"}`} />
                          </div>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${goodScore ? "bg-tertiary-container" : "bg-error"}`}
                            style={{ width: `${isRisk ? score : score}%` }}
                          />
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                          {isRisk
                            ? score < 30 ? "Low risk — supplier performing well"
                              : score < 60 ? "Moderate risk — monitor closely"
                              : "High risk — escalation required"
                            : score >= 90 ? "Excellent performance — exceeding targets"
                              : score >= 75 ? "Good performance — meets expectations"
                              : "Below target — review required"
                          }
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Contract Timeline */}
                <div className="bg-surface border border-outline-variant rounded-lg p-container-padding shadow-sm">
                  <h3 className="font-section-heading text-section-heading text-on-surface mb-4">Contract Information</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Contract ID</p>
                      <p className="font-data-mono text-data-mono text-primary font-semibold">{selected.conId}</p>
                    </div>
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Start Date</p>
                      <p className="font-body-md text-body-md text-on-surface">{selected.start}</p>
                    </div>
                    <div>
                      <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Expiry Date</p>
                      <p className={`font-body-md text-body-md font-medium ${
                        selected.status === "Expiring" ? "text-error" : "text-on-surface"
                      }`}>
                        {selected.end}
                        {selected.status === "Expiring" && (
                          <span className="ml-2 text-[11px] bg-[#FEF9C3] text-[#CA8A04] px-2 py-0.5 rounded">Expiring Soon</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="col-span-12 lg:col-span-9 flex items-center justify-center text-on-surface-variant py-24">
                Select a supplier from the list to view performance metrics.
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
