import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRFQs } from "@/lib/api";

export const Route = createFileRoute("/rfqs/")({
  component: Page,
  head: () => ({
    meta: [
      { title: "RFQ List | SupplyX" },
      { name: "description", content: "Manage and monitor active supplier quotation requests." },
      { property: "og:title", content: "RFQ List | SupplyX" },
      { property: "og:description", content: "Manage and monitor active supplier quotation requests." },
    ],
  }),
});

// Derive initials from department name
function deptInitials(dept: string): string {
  return dept
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Page() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const { data: rfqs, isLoading } = useQuery({
    queryKey: ["rfqs"],
    queryFn: getRFQs,
  });

  const liveRfqs = (rfqs || []).filter((rfq) => {
    const matchSearch =
      !search ||
      rfq.rfqId.toLowerCase().includes(search.toLowerCase()) ||
      rfq.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Statuses" || rfq.status === statusFilter;
    const matchCategory =
      categoryFilter === "All Categories" ||
      rfq.department.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchSearch && matchStatus && matchCategory;
  });

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All Statuses");
    setCategoryFilter("All Categories");
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-stack-lg">
          <div>
            <h2 className="font-page-title text-page-title text-on-surface mb-1">Request for Quotation (RFQ)</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage and monitor active supplier quotation requests.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm font-medium rounded hover:bg-surface-container transition-colors flex items-center gap-2">
              <Icon name="download" className="text-[18px]" /> Export
            </button>
            <button
              onClick={() => navigate({ to: "/rfqs/new" })}
              className="px-4 py-2 bg-primary-container text-on-primary font-body-sm text-body-sm font-medium rounded hover:bg-primary-container/90 transition-colors flex items-center gap-2"
            >
              <Icon name="add" className="text-[18px]" /> Create RFQ
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-surface border border-outline-variant rounded-xl p-container-padding mb-stack-md flex flex-wrap gap-4 items-end shadow-sm">
          <div className="flex-1 min-w-[200px]">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Search</label>
            <div className="relative">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]" />
              <input
                className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Search by ID or Title..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Category</label>
            <select
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-primary outline-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All Categories</option>
              <option>IT Infrastructure</option>
              <option>Marketing</option>
              <option>Operations</option>
              <option>Finance</option>
              <option>Facilities</option>
              <option>Logistics</option>
            </select>
          </div>
          <div className="w-48">
            <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Status</label>
            <select
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded text-body-sm font-body-sm focus:border-primary outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>Open</option>
              <option>Evaluation</option>
              <option>Awarded</option>
              <option>Closed</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-surface border border-outline-variant text-on-surface font-body-sm text-body-sm font-medium rounded hover:bg-surface-container transition-colors h-[38px]"
          >
            Clear Filters
          </button>
        </div>

        {/* RFQ Data Table */}
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap">RFQ ID</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Title &amp; Department</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Status</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase whitespace-nowrap">Deadline</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Bidders</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase">Department</th>
                  <th className="py-3 px-4 font-label-caps text-label-caps text-on-surface-variant uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                      Loading Requests for Quotation...
                    </td>
                  </tr>
                ) : liveRfqs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                      No quotation requests found.
                    </td>
                  </tr>
                ) : (
                  liveRfqs.map((rfq) => {
                    const initials = deptInitials(rfq.department);
                    return (
                      <tr key={rfq.id} className="hover:bg-surface-container-lowest transition-colors h-10">
                        <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface">{rfq.rfqId}</td>
                        <td className="py-2 px-4">
                          <div className="font-body-sm text-body-sm font-medium text-on-surface truncate max-w-[200px]">{rfq.title}</div>
                          <div className="text-[11px] text-on-surface-variant">{rfq.department}</div>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            rfq.status === "Open"
                              ? "bg-[#EFF6FF] text-[#1D4ED8]"
                              : rfq.status === "Closed"
                                ? "bg-[#FEF2F2] text-[#DC2626]"
                                : rfq.status === "Awarded"
                                  ? "bg-[#DCFCE7] text-[#16A34A]"
                                  : "bg-[#F3F4F6] text-[#374151]"
                          }`}>
                            {rfq.status}
                          </span>
                        </td>
                        <td className="py-2 px-4 font-body-sm text-body-sm text-on-surface-variant">{rfq.deadline}</td>
                        <td className="py-2 px-4 font-data-mono text-data-mono text-on-surface text-right">{rfq.vendorCount}</td>
                        <td className="py-2 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {initials}
                            </div>
                            <span className="font-body-sm text-body-sm text-on-surface">{rfq.department}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <button className="p-1 text-on-surface-variant hover:text-primary transition-colors">
                            <Icon name="visibility" className="text-[18px]" />
                          </button>
                          <button className="p-1 text-on-surface-variant hover:text-primary transition-colors">
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
          {/* Pagination */}
          <div className="px-4 py-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between">
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              Showing {liveRfqs.length} of {rfqs?.length ?? 0} results
            </div>
            <div className="flex gap-1">
              <button className="px-2 py-1 text-on-surface-variant hover:bg-surface-container rounded disabled:opacity-50" disabled>
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <button className="px-3 py-1 bg-primary-container text-on-primary rounded font-body-sm text-body-sm">1</button>
              <button className="px-2 py-1 text-on-surface-variant hover:bg-surface-container rounded disabled:opacity-50" disabled>
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
