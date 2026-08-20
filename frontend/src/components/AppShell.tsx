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
  UserCheck,
  LogOut,
} from "lucide-react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api.js";
import { cn } from "@/lib/utils.js";
import { API_BASE } from "@/lib/api.js";
import { useAuth } from "@/lib/auth.js";

import { CommandPalette } from "./CommandPalette";

const NAV: { group: string; items: { to: string; label: string; icon: React.ElementType; module?: string }[] }[] = [
  {
    group: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: Gauge },
      { to: "/analytics", label: "Analytics Hub", icon: BarChart2, module: "analytics" },
    ],
  },
  {
    group: "Source to Pay",
    items: [
      { to: "/suppliers", label: "Suppliers Directory", icon: Building2, module: "suppliers" },
      { to: "/requisitions", label: "Requisitions", icon: ClipboardList, module: "requisitions" },
      { to: "/rfqs", label: "RFQs", icon: FileSpreadsheet, module: "rfqs" },
      { to: "/orders", label: "Purchase Orders", icon: ShoppingCart, module: "orders" },
      { to: "/goods-receipts", label: "Goods Receipts", icon: PackageCheck, module: "goods-receipts" },
      { to: "/invoices", label: "Invoices", icon: FileText, module: "invoices" },
      { to: "/payments", label: "Payments", icon: Banknote, module: "payments" },
      { to: "/budget", label: "Budgets & Ledger", icon: Wallet, module: "budget" },
      { to: "/contracts", label: "Contracts", icon: FileSignature, module: "contracts" },
    ],
  },
  {
    group: "Logistics & Inventory",
    items: [
      { to: "/warehouses", label: "Warehouses", icon: Warehouse, module: "warehouses" },
      { to: "/inventory", label: "Inventory", icon: Boxes, module: "inventory" },
      { to: "/shipments", label: "Shipments", icon: Truck, module: "shipments" },
      { to: "/logistics", label: "Logistics Routes", icon: RouteIcon, module: "logistics" },
      { to: "/carriers", label: "Carriers", icon: Building2, module: "carriers" },
    ],
  },
  {
    group: "Commercial",
    items: [{ to: "/customers", label: "Customers", icon: Users, module: "customers" }],
  },
  {
    group: "System & Administration",
    items: [{ to: "/users", label: "User Management", icon: UserCheck, module: "users" }],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout, hasPermission } = useAuth();
  const [cmdOpen, setCmdOpen] = React.useState(false);

  // P0 Tier 1 live alert queries
  const expiringContracts = useQuery({
    queryKey: ["/contracts/expiring"],
    queryFn: async () => {
      if (!hasPermission("contracts", "view")) return [];
      return api.get("/contracts/expiring?days=30").catch(() => []);
    },
    refetchInterval: 30000,
    enabled: !!user && hasPermission("contracts", "view"),
  });

  const stockAlerts = useQuery({
    queryKey: ["/inventories/alerts"],
    queryFn: async () => {
      if (!hasPermission("inventory", "view")) return [];
      return api.get("/inventories/alerts").catch(() => []);
    },
    refetchInterval: 30000,
    enabled: !!user && hasPermission("inventory", "view"),
  });

  const expiringCount = Array.isArray(expiringContracts.data) ? expiringContracts.data.length : 0;
  const lowStockCount = Array.isArray(stockAlerts.data) ? stockAlerts.data.length : 0;

  // Filter navigation items based on user permissions
  const filteredNAV = NAV.map((group) => {
    const items = group.items.filter((item) => {
      if (!item.module) return true; // Always show items that don't specify a module (e.g. Dashboard)
      return hasPermission(item.module, "view");
    });
    return { ...group, items };
  }).filter((group) => group.items.length > 0);

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Global Command Palette */}
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />

      {/* Global Lightweight Top Accent Bar */}
      <div className="h-[2.5px] w-full bg-gradient-to-r from-primary via-indigo-500 to-sky-400 shrink-0" />
      
      <header className="sticky top-0 z-40 flex h-13 items-center gap-3 border-b border-border/80 bg-nav/95 backdrop-blur-md px-4 text-nav-foreground shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary via-indigo-600 to-primary-hover border border-indigo-400/30 text-white shadow-xs shadow-indigo-500/20">
            <Grid2x2 className="h-4.5 w-4.5" />
          </div>
          <Link to="/" className="text-[15px] font-bold tracking-tight text-foreground flex items-center gap-1.5 group">
            <span className="group-hover:text-primary transition-colors">SupplyX</span> <span className="font-medium text-[13px] text-muted-foreground hidden sm:inline-block">| Nexus SCM Suite</span>
          </Link>
        </div>

        <div className="relative mx-auto hidden w-full max-w-md md:block">
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="flex h-8.5 w-full items-center justify-between rounded-md border border-border/80 bg-muted/30 px-3 text-[12px] text-muted-foreground hover:bg-muted/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all shadow-xs cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-primary" />
              <span>Search modules, POs, suppliers...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border/70 bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {user && (
            <div className="hidden items-center gap-2 md:flex border-r border-border/70 pr-3 mr-1">
              <span className="text-[12px] font-medium text-foreground">{user.name}</span>
              <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-primary/10 text-indigo-700 border border-indigo-400/25">
                {user.role}
              </span>
            </div>
          )}
          <button className="rounded-md p-2 text-muted-foreground hover:bg-indigo-50/50 hover:text-foreground transition-colors" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>
          <button className="rounded-md p-2 text-muted-foreground hover:bg-indigo-50/50 hover:text-foreground transition-colors" aria-label="Help">
            <HelpCircle className="h-4 w-4" />
          </button>
          {user && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 via-primary to-sky-600 text-[11px] font-bold text-white uppercase shadow-xs shadow-indigo-500/20 cursor-pointer select-none ring-1 ring-white/20"
              title={`${user.name} (${user.role})`}
            >
              {user.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[12px] font-semibold text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors ml-1 cursor-pointer"
            title="Sign out of workspace"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Logout</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-[3.4rem] hidden h-[calc(100vh-3.4rem)] w-64 shrink-0 overflow-y-auto border-r border-sidebar-border bg-sidebar/95 p-3.5 lg:block">
          {filteredNAV.map((group) => (
            <div key={group.group} className="mb-4">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {group.group}
              </p>
              <nav className="mt-1 space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  
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
                        "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-sidebar-foreground transition-all",
                        active
                          ? "bg-gradient-to-r from-indigo-500/12 via-primary/8 to-transparent text-primary font-semibold shadow-xs"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {active ? (
                        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-gradient-to-b from-primary to-indigo-500" />
                      ) : null}
                      <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "opacity-75")} />
                      <span>{item.label}</span>
                      {alertBadge}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
          <div className="mt-6 border-t border-sidebar-border px-3 pt-3 text-[10px] leading-4 text-muted-foreground">
            <span className="font-semibold text-foreground/80">SupplyX SCM API v2.0</span>
            <br />
            <span className="break-all font-mono text-[9px] opacity-75">{API_BASE}</span>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-5 lg:p-7">
          <nav className="mb-4 flex gap-1.5 overflow-x-auto pb-1.5 lg:hidden">
            {filteredNAV.flatMap((g) => g.items).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "whitespace-nowrap rounded-md border border-border bg-surface px-3 py-1.5 text-[12px] font-medium shadow-xs",
                  pathname === item.to && "border-indigo-400 bg-gradient-to-r from-primary/10 to-indigo-500/10 text-primary font-semibold",
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
