import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

type NavItem = { label: string; icon: string; to?: string; match?: string[] };

const NAV: NavItem[] = [
  { label: "Overview", icon: "dashboard", to: "/" },
  { label: "Procurement", icon: "shopping_cart", to: "/requisitions" },
  { label: "Inventory", icon: "inventory_2", to: "/goods-receipts" },
  { label: "Warehouses", icon: "warehouse", to: "/warehouses" },
  { label: "Orders", icon: "description", to: "/orders" },
  { label: "Shipments", icon: "local_shipping", to: "/shipments" },
  { label: "Logistics", icon: "hub", to: "/logistics" },
  { label: "Suppliers", icon: "factory", to: "/suppliers/performance" },
  { label: "Customers", icon: "groups", to: "/customers" },
  { label: "Carriers", icon: "local_shipping", to: "/carriers" },
  { label: "Contracts", icon: "article", to: "/contracts" },
  { label: "Invoices", icon: "receipt_long", to: "/invoices" },
  { label: "Payments", icon: "payments", to: "/payments" },
  { label: "Analytics", icon: "query_stats", to: "/budget" },
];


const linkBase =
  "flex items-center gap-3 px-4 py-2 transition-colors rounded-lg font-body-sm text-body-sm";
const inactive =
  "text-on-surface-variant hover:bg-surface-container-high";
const active =
  "bg-secondary-container text-on-secondary-container border-l-4 border-primary font-bold rounded-r-lg";

export function AppShell({
  children,
  period = "Jan 1 - Jan 31",
  department = "Operations Dept",
}: {
  children: ReactNode;
  period?: string;
  department?: string;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to?: string) =>
    !!to && (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="bg-background text-on-background font-body-md text-body-md h-screen overflow-hidden flex">
      <nav className="bg-surface w-sidebar-width h-full fixed left-0 top-0 border-r border-outline-variant flex flex-col py-4 z-20">
        <div className="px-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-on-primary">
              <Icon name="deployed_code" fill className="text-lg" />
            </div>
            <div>
              <h1 className="font-section-heading text-section-heading font-bold text-primary leading-tight">
                SupplyX
              </h1>
              <p className="font-body-sm text-on-surface-variant text-[11px] uppercase tracking-wider">
                Enterprise SCM
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {NAV.map((item) =>
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                className={`${linkBase} ${isActive(item.to) ? active : inactive}`}
              >
                <Icon name={item.icon} className="text-[20px]" />
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className={`${linkBase} ${inactive} cursor-default`}
              >
                <Icon name={item.icon} className="text-[20px]" />
                {item.label}
              </span>
            ),
          )}
        </div>

        <div className="px-4 mt-auto pt-4 border-t border-outline-variant space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-surface-container text-primary rounded-lg font-body-sm text-body-sm font-medium hover:bg-surface-container-high transition-colors">
            <Icon name="bolt" className="text-[18px]" />
            SupplyX Intelligence
          </button>
          <div className="pt-2 space-y-1">
            <span className={`${linkBase} ${inactive} cursor-default`}>
              <Icon name="settings" className="text-[20px]" />
              Settings
            </span>
            <span className={`${linkBase} ${inactive} cursor-default`}>
              <Icon name="help" className="text-[20px]" />
              Support
            </span>
          </div>
        </div>
      </nav>

      <div className="flex-1 ml-sidebar-width flex flex-col h-screen overflow-hidden">
        <header className="bg-surface fixed top-0 right-0 w-[calc(100%-240px)] h-16 border-b border-outline-variant shadow-sm flex justify-between items-center px-6 z-10">
          <div className="flex items-center w-96 relative">
            <Icon
              name="search"
              className="absolute left-3 text-on-surface-variant text-[20px]"
            />
            <input
              type="text"
              placeholder="Search operations..."
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-body-sm font-body-sm focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-on-surface-variant">
              <span className="text-body-sm font-body-sm font-medium">{period}</span>
              <div className="w-px h-4 bg-outline-variant" />
              <span className="text-body-sm font-body-sm text-secondary">
                {department}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant relative">
                <Icon name="notifications" className="text-[20px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border border-surface" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant">
                <Icon name="help" className="text-[20px]" />
              </button>
              <img
                className="w-8 h-8 rounded-full border border-outline-variant object-cover ml-2"
                alt="User profile"
                src="https://www.gstatic.com/labs-code/stitch/stitch-placeholder-300x300.svg"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 mt-16 p-margin-page overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}