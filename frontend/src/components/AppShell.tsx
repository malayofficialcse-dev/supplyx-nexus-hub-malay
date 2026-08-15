import { Link, useRouterState } from "@tanstack/react-router";
import {
  Banknote,
  BarChart2,
  Boxes,
  Building2,
  ClipboardList,
  FileSignature,
  FileSpreadsheet,
  FileText,
  Gauge,
  PackageCheck,
  Route as RouteIcon,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
  Search,
  Bell,
  HelpCircle,
  Grid2x2,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { API_BASE } from "@/lib/api";

const NAV: { group: string; items: { to: string; label: string; icon: React.ElementType }[] }[] = [
  {
    group: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: Gauge },
      { to: "/analytics", label: "Analytics Hub", icon: BarChart2 },
    ],
  },
  {
    group: "Source to Pay",
    items: [
      { to: "/suppliers", label: "Suppliers Directory", icon: Building2 },
      { to: "/requisitions", label: "Requisitions", icon: ClipboardList },
      { to: "/rfqs", label: "RFQs", icon: FileSpreadsheet },
      { to: "/orders", label: "Purchase Orders", icon: ShoppingCart },
      { to: "/goods-receipts", label: "Goods Receipts", icon: PackageCheck },
      { to: "/invoices", label: "Invoices", icon: FileText },
      { to: "/payments", label: "Payments", icon: Banknote },
      { to: "/budget", label: "Budgets & Ledger", icon: Wallet },
      { to: "/contracts", label: "Contracts", icon: FileSignature },
    ],
  },
  {
    group: "Logistics & Inventory",
    items: [
      { to: "/warehouses", label: "Warehouses", icon: Warehouse },
      { to: "/inventory", label: "Inventory", icon: Boxes },
      { to: "/shipments", label: "Shipments", icon: Truck },
      { to: "/logistics", label: "Logistics Routes", icon: RouteIcon },
      { to: "/carriers", label: "Carriers", icon: Building2 },
    ],
  },
  {
    group: "Commercial",
    items: [{ to: "/customers", label: "Customers", icon: Users }],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // P0 Tier 1 live alert queries
  const expiringContracts = useQuery({
    queryKey: ["/contracts/expiring"],
    queryFn: async () => api.get("/contracts/expiring?days=30").catch(() => []),
    refetchInterval: 30000,
  });

  const stockAlerts = useQuery({
    queryKey: ["/inventories/alerts"],
    queryFn: async () => api.get("/inventories/alerts").catch(() => []),
    refetchInterval: 30000,
  });

  const expiringCount = Array.isArray(expiringContracts.data) ? expiringContracts.data.length : 0;
  const lowStockCount = Array.isArray(stockAlerts.data) ? stockAlerts.data.length : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-border bg-nav px-3 text-nav-foreground shadow-xs">
        <Grid2x2 className="h-4 w-4 text-primary" />
        <Link to="/" className="text-[15px] font-semibold tracking-tight text-foreground">
          SupplyX <span className="font-normal text-muted-foreground">| Supply Chain Suite</span>
        </Link>
        <div className="relative mx-auto hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search modules"
            aria-label="Search modules"
            className="h-7.5 w-full rounded-sm border border-border bg-muted/40 pl-8 pr-2 text-[12px] text-foreground placeholder:text-muted-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              const q = (e.target as HTMLInputElement).value.trim().toLowerCase();
              const hit = NAV.flatMap((g) => g.items).find((i) =>
                i.label.toLowerCase().includes(q),
              );
              if (hit) window.location.assign(hit.to);
            }}
          />
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>
          <button className="rounded-sm p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Help">
            <HelpCircle className="h-4 w-4" />
          </button>
          <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-[11px] font-semibold text-primary-foreground">
            MM
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] w-60 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar py-3 lg:block">
          {NAV.map((group) => (
            <div key={group.group} className="mb-3">
              <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.group}
              </p>
              <nav>
                {group.items.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  
                  // Compute dynamic alerts count per item
                  let alertBadge = null;
                  if (item.to === "/contracts" && expiringCount > 0) {
                    alertBadge = (
                      <span className="ml-auto rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                        {expiringCount}
                      </span>
                    );
                  } else if (item.to === "/inventory" && lowStockCount > 0) {
                    alertBadge = (
                      <span className="ml-auto rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                        {lowStockCount}
                      </span>
                    );
                  }

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "relative flex items-center gap-2.5 px-4 py-1.5 text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
                        active && "bg-sidebar-accent font-semibold text-sidebar-accent-foreground",
                      )}
                    >
                      {active ? (
                        <span className="absolute inset-y-1 left-0 w-[3px] rounded-sm bg-primary" />
                      ) : null}
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      <span>{item.label}</span>
                      {alertBadge}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
          <p className="mt-4 border-t border-sidebar-border px-4 pt-3 text-[10px] leading-4 text-muted-foreground">
            API endpoint
            <br />
            <span className="break-all font-mono">{API_BASE}</span>
          </p>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 lg:px-6">
          <nav className="mb-3 flex gap-1 overflow-x-auto pb-1 lg:hidden">
            {NAV.flatMap((g) => g.items).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "whitespace-nowrap rounded-sm border border-border bg-surface px-2.5 py-1 text-[12px]",
                  pathname === item.to && "border-primary bg-accent text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
