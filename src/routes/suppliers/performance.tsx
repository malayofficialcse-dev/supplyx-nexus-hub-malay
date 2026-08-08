import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export const Route = createFileRoute("/suppliers/performance")({
  component: Page,
  head: () => ({
    meta: [
      { title: "Supplier Performance Analytics - SupplyX" },
      {
        name: "description",
        content:
          "Detailed performance metrics for GlobalTech Industries (Vendor ID: V-4921), including risk score, delivery, quality and cost trends.",
      },
      { property: "og:title", content: "Supplier Performance Analytics - SupplyX" },
      {
        property: "og:description",
        content:
          "Detailed performance metrics for GlobalTech Industries (Vendor ID: V-4921), including risk score, delivery, quality and cost trends.",
      },
    ],
  }),
});

function Page() {
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-end mb-stack-lg">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <a className="hover:text-primary transition-colors font-body-sm" href="#">
                Suppliers
              </a>
              <Icon name="chevron_right" className="text-[16px]" />
              <span className="font-body-sm text-on-surface">GlobalTech Industries</span>
            </div>
            <h2 className="font-page-title text-page-title text-on-surface">
              Supplier Performance Analytics
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Detailed performance metrics for GlobalTech Industries (Vendor ID: V-4921).
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-outline-variant bg-surface rounded text-on-surface font-body-sm font-medium hover:bg-surface-container transition-colors flex items-center gap-2">
              <Icon name="download" className="text-[18px]" />
              Export Report
            </button>
            <button className="px-4 py-2 bg-primary-container text-on-primary rounded font-body-sm font-medium hover:bg-primary transition-colors flex items-center gap-2">
              <Icon name="add_task" className="text-[18px]" />
              Create Action Plan
            </button>
          </div>
        </div>
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Risk & Identity Card (Col 1-4) */}
          <div className="col-span-12 lg:col-span-4 bg-surface border border-outline-variant rounded-lg p-container-padding card-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-high rounded flex items-center justify-center text-primary font-section-heading font-bold">
                    GT
                  </div>
                  <div>
                    <h3 className="font-subsection-heading text-subsection-heading text-on-surface">
                      GlobalTech Ind.
                    </h3>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      Tier 1 Supplier • Electronics
                    </span>
                  </div>
                </div>
                <span className="px-2 py-1 bg-surface-container-high text-primary font-label-caps text-label-caps rounded uppercase">
                  Active
                </span>
              </div>
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-body-sm text-on-surface-variant">Overall Risk Score</span>
                  <span className="font-page-title text-page-title text-on-surface">
                    24<span className="text-body-sm text-on-surface-variant font-normal">/100</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary-container h-full w-[24%] rounded-full"></div>
                </div>
                <p className="font-body-sm text-tertiary-container mt-2 flex items-center gap-1">
                  <Icon name="check_circle" className="text-[14px]" /> Low Risk Category
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-outline-variant pt-4 mt-4">
              <div>
                <span className="font-body-sm text-on-surface-variant block mb-1">Annual Spend</span>
                <span className="font-data-mono text-data-mono text-on-surface font-medium">$4.2M</span>
              </div>
              <div>
                <span className="font-body-sm text-on-surface-variant block mb-1">Active Contracts</span>
                <span className="font-data-mono text-data-mono text-on-surface font-medium">
                  3 Master, 12 POs
                </span>
              </div>
            </div>
          </div>
          {/* KPI Cards (Col 5-12) */}
          <div className="col-span-12 lg:col-span-8 grid grid-cols-3 gap-gutter">
            {/* Delivery Rate */}
            <div className="bg-surface border border-outline-variant rounded-lg p-container-padding card-shadow flex flex-col justify-between">
              <span className="font-body-sm text-on-surface-variant font-medium block mb-2">
                On-Time Delivery (OTIF)
              </span>
              <div className="flex items-end justify-between">
                <span className="font-page-title text-page-title text-on-surface">94.2%</span>
                <div className="flex items-center text-error bg-[#ffdad6] bg-opacity-20 px-2 py-1 rounded">
                  <Icon name="trending_down" className="text-[14px]" />
                  <span className="font-data-mono text-[12px] font-medium ml-1">-1.2%</span>
                </div>
              </div>
              <div className="mt-4 h-8 w-full flex items-end gap-1 opacity-60">
                <div className="w-full bg-primary h-[80%] rounded-t-sm"></div>
                <div className="w-full bg-primary h-[90%] rounded-t-sm"></div>
                <div className="w-full bg-primary h-[95%] rounded-t-sm"></div>
                <div className="w-full bg-primary h-[92%] rounded-t-sm"></div>
                <div className="w-full bg-primary h-[88%] rounded-t-sm"></div>
                <div className="w-full bg-outline-variant h-[70%] rounded-t-sm"></div>
              </div>
            </div>
            {/* Quality Rate */}
            <div className="bg-surface border border-outline-variant rounded-lg p-container-padding card-shadow flex flex-col justify-between">
              <span className="font-body-sm text-on-surface-variant font-medium block mb-2">
                Quality Acceptance Rate
              </span>
              <div className="flex items-end justify-between">
                <span className="font-page-title text-page-title text-on-surface">99.1%</span>
                <div className="flex items-center text-tertiary-container bg-[#c7ffca] bg-opacity-20 px-2 py-1 rounded">
                  <Icon name="trending_up" className="text-[14px]" />
                  <span className="font-data-mono text-[12px] font-medium ml-1">+0.4%</span>
                </div>
              </div>
              <div className="mt-4 h-8 w-full flex items-end gap-1 opacity-60">
                <div className="w-full bg-tertiary-container h-[90%] rounded-t-sm"></div>
                <div className="w-full bg-tertiary-container h-[92%] rounded-t-sm"></div>
                <div className="w-full bg-tertiary-container h-[91%] rounded-t-sm"></div>
                <div className="w-full bg-tertiary-container h-[94%] rounded-t-sm"></div>
                <div className="w-full bg-tertiary-container h-[96%] rounded-t-sm"></div>
                <div className="w-full bg-tertiary-container h-[99%] rounded-t-sm"></div>
              </div>
            </div>
            {/* Cost Variance */}
            <div className="bg-surface border border-outline-variant rounded-lg p-container-padding card-shadow flex flex-col justify-between">
              <span className="font-body-sm text-on-surface-variant font-medium block mb-2">
                Purchase Price Variance
              </span>
              <div className="flex items-end justify-between">
                <span className="font-page-title text-page-title text-on-surface">-$12.4K</span>
                <div className="flex items-center text-tertiary-container bg-[#c7ffca] bg-opacity-20 px-2 py-1 rounded">
                  <Icon name="trending_down" className="text-[14px]" />
                  <span className="font-data-mono text-[12px] font-medium ml-1">Favorable</span>
                </div>
              </div>
              <div className="mt-4 h-8 w-full flex items-end gap-1 opacity-60">
                <div className="w-full bg-surface-container-high h-[40%] rounded-t-sm"></div>
                <div className="w-full bg-surface-container-high h-[30%] rounded-t-sm"></div>
                <div className="w-full bg-tertiary-container h-[50%] rounded-t-sm"></div>
                <div className="w-full bg-tertiary-container h-[60%] rounded-t-sm"></div>
                <div className="w-full bg-tertiary-container h-[80%] rounded-t-sm"></div>
                <div className="w-full bg-tertiary-container h-[70%] rounded-t-sm"></div>
              </div>
            </div>
          </div>
          {/* Main Chart Area (Col 1-8) */}
          <div className="col-span-12 lg:col-span-8 bg-surface border border-outline-variant rounded-lg p-container-padding card-shadow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-subsection-heading text-subsection-heading text-on-surface">
                Delivery & Quality Trends (12 Months)
              </h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 font-body-sm text-on-surface-variant">
                  <div className="w-3 h-3 rounded-full bg-primary"></div> OTIF %
                </span>
                <span className="flex items-center gap-1 font-body-sm text-on-surface-variant ml-3">
                  <div className="w-3 h-3 rounded-full bg-tertiary-container"></div> Quality %
                </span>
              </div>
            </div>
            <div className="h-64 w-full relative chart-grid border-b border-l border-outline-variant flex items-end justify-between px-4 pb-0 pt-4">
              <svg
                className="absolute inset-0 w-full h-full overflow-visible"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  d="M 0,40 L 10,35 L 20,45 L 30,30 L 40,25 L 50,20 L 60,35 L 70,15 L 80,10 L 90,20 L 100,5"
                  fill="none"
                  stroke="#004ac6"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                ></path>
                <path
                  d="M 0,20 L 10,18 L 20,22 L 30,15 L 40,10 L 50,12 L 60,8 L 70,5 L 80,4 L 90,6 L 100,2"
                  fill="none"
                  stroke="#007f36"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                ></path>
              </svg>
              <div className="absolute -bottom-6 w-full flex justify-between px-4 text-on-surface-variant font-data-mono text-[10px]">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
              <div className="absolute -left-8 h-full flex flex-col justify-between py-2 text-on-surface-variant font-data-mono text-[10px] items-end pr-2">
                <span>100</span>
                <span>95</span>
                <span>90</span>
                <span>85</span>
                <span>80</span>
              </div>
            </div>
          </div>
          {/* Benchmarking (Col 9-12) */}
          <div className="col-span-12 lg:col-span-4 bg-surface border border-outline-variant rounded-lg p-container-padding card-shadow flex flex-col">
            <h3 className="font-subsection-heading text-subsection-heading text-on-surface mb-6">
              Category Benchmarking
            </h3>
            <p className="font-body-sm text-on-surface-variant mb-4">
              Compared to 14 other Tier 1 Electronics suppliers.
            </p>
            <div className="flex-1 flex flex-col gap-6 justify-center">
              <div>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-on-surface">Lead Time Variance</span>
                  <span className="text-primary font-data-mono">Top 15%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full relative">
                  <div
                    className="absolute w-1 h-3 bg-secondary top-[-2px] left-[50%] z-10"
                    title="Category Average"
                  ></div>
                  <div className="bg-primary h-full w-[85%] rounded-full opacity-80"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-on-surface">Cost Competitiveness</span>
                  <span className="text-primary font-data-mono">Top 40%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full relative">
                  <div
                    className="absolute w-1 h-3 bg-secondary top-[-2px] left-[50%] z-10"
                    title="Category Average"
                  ></div>
                  <div className="bg-primary h-full w-[60%] rounded-full opacity-80"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-body-sm mb-1">
                  <span className="text-on-surface">Responsiveness Score</span>
                  <span className="text-tertiary-container font-data-mono">Top 5%</span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full relative">
                  <div
                    className="absolute w-1 h-3 bg-secondary top-[-2px] left-[50%] z-10"
                    title="Category Average"
                  ></div>
                  <div className="bg-tertiary-container h-full w-[95%] rounded-full opacity-80"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
