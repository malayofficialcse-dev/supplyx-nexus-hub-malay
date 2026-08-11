import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { getContracts } from "@/lib/api";

export const Route = createFileRoute("/contracts")({
  component: ContractsPage,
  head: () => ({
    meta: [
      { title: "Contracts — SupplyX Enterprise SCM" },
      {
        name: "description",
        content:
          "Manage and track supplier agreements, monitor expiring contracts and initiate renewals across your supply base.",
      },
      { property: "og:title", content: "Contracts — SupplyX" },
      {
        property: "og:description",
        content:
          "Manage and track supplier agreements and renewals in the SupplyX contract register.",
      },
    ],
  }),
});

const badge: Record<string, string> = {
  Active: "bg-success-bg text-success border-success-border",
  Expiring: "bg-danger-bg text-danger border-danger-border",
  Terminated: "bg-neutral-bg text-neutral border-neutral-border",
};

function ContractsPage() {
  const { data: contracts, isLoading, error } = useQuery({
    queryKey: ["contracts"],
    queryFn: getContracts,
  });

  const rows = contracts ?? [];

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface">
              Contract List
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Manage and track supplier agreements.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-outline-variant rounded-lg bg-surface hover:bg-surface-container transition-colors text-body-sm font-body-sm flex items-center gap-2 text-on-surface font-medium shadow-sm">
              <Icon name="filter_list" className="text-[18px]" />
              Filter
            </button>
            <button className="px-4 py-2 bg-primary-container text-on-primary rounded-lg text-body-sm font-body-sm flex items-center gap-2 font-medium hover:opacity-90 transition-opacity shadow-sm">
              <Icon name="download" className="text-[18px]" />
              Export
            </button>
          </div>
        </div>

        <div className="bg-error-container border border-[#ffb4ab] rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <Icon
            name="warning"
            fill
            className="text-on-error-container mt-0.5"
          />
          <div className="flex-1">
            <h4 className="text-body-sm font-body-sm font-semibold text-on-error-container">
              Attention Required
            </h4>
            <p className="text-body-sm font-body-sm text-on-error-container opacity-90 mt-0.5">
              3 contracts are nearing expiration in the next 30 days. Please
              review and initiate renewals to prevent supply chain disruption.
            </p>
          </div>
          <button className="text-on-error-container hover:bg-surface/20 px-3 py-1 rounded text-body-sm font-body-sm font-medium transition-colors">
            View Expiring
          </button>
        </div>

        <div className="bg-surface border border-outline-variant rounded-lg shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant flex items-center justify-between bg-surface-bright">
            <div className="flex items-center gap-2 border border-outline-variant bg-surface rounded-lg px-3 py-1.5 w-72">
              <Icon name="search" className="text-outline text-[18px]" />
              <input
                type="text"
                placeholder="Search contracts or suppliers..."
                className="w-full bg-transparent border-none p-0 focus:outline-none text-body-sm font-body-sm placeholder:text-outline h-5"
              />
            </div>
            <div className="text-body-sm font-body-sm text-on-surface-variant">
              Showing 1-10 of 124 contracts
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-surface-container text-label-caps font-label-caps text-on-surface-variant border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3 font-semibold w-12">
                    <input
                      type="checkbox"
                      className="rounded-[2px] border-outline-variant accent-primary h-3.5 w-3.5"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold">Contract ID</th>
                  <th className="px-4 py-3 font-semibold">Supplier</th>
                  <th className="px-4 py-3 font-semibold">Start Date</th>
                  <th className="px-4 py-3 font-semibold">End Date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-body-sm font-body-sm text-on-surface divide-y divide-outline-variant">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                      Loading contracts...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-error">
                      Failed to load contracts.
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                      No contracts found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const terminated = row.status === "Terminated";
                    const expiring = row.status === "Expiring";
                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-surface-container-low transition-colors h-10 ${
                          terminated ? "opacity-75" : ""
                        } ${expiring ? "bg-error-container/10" : ""}`}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            disabled={terminated}
                            className="rounded-[2px] border-outline-variant accent-primary h-3.5 w-3.5"
                          />
                        </td>
                        <td
                          className={`px-4 py-2 font-data-mono text-data-mono font-medium ${
                            terminated ? "text-secondary" : "text-primary"
                          }`}
                        >
                          {row.conId}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                                terminated
                                  ? "bg-surface-variant text-on-surface-variant"
                                  : "bg-secondary-container text-on-secondary-container"
                              }`}
                            >
                              {row.initials}
                            </div>
                            {row.supplier}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-on-surface-variant">
                          {row.start}
                        </td>
                        <td
                          className={`px-4 py-2 ${
                            expiring
                              ? "text-error font-medium"
                              : "text-on-surface-variant"
                          }`}
                        >
                          {row.end}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                              badge[row.status] ?? "bg-surface-container text-on-surface"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button className="text-outline hover:text-primary transition-colors">
                            <Icon name="more_vert" className="text-[18px]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-outline-variant flex items-center justify-between bg-surface-bright">
            <button
              disabled
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-body-sm font-body-sm text-secondary hover:bg-surface-container transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary-fixed text-on-primary-fixed-variant font-medium text-body-sm">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-secondary text-body-sm transition-colors">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-secondary text-body-sm transition-colors">
                3
              </button>
              <span className="text-secondary text-body-sm px-1">...</span>
            </div>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg text-body-sm font-body-sm text-secondary hover:bg-surface-container transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}