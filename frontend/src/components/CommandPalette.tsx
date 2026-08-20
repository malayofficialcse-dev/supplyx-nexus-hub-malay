import * as React from "react";
import { Command } from "cmdk";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  ShoppingCart,
  PackageCheck,
  FileText,
  Banknote,
  Wallet,
  FileSignature,
  Warehouse,
  Boxes,
  Truck,
  Route as RouteIcon,
  Users,
  Gauge,
  BarChart2,
  PlusCircle,
  FileDown,
  RotateCw,
  X,
  Sparkles,
} from "lucide-react";
import { api, unwrapList } from "@/lib/api";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");

  // Live search queries across suppliers, orders, invoices
  const [liveResults, setLiveResults] = React.useState<{
    suppliers: any[];
    orders: any[];
    invoices: any[];
  }>({ suppliers: [], orders: [], invoices: [] });
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!search || search.trim().length < 2) {
      setLiveResults({ suppliers: [], orders: [], invoices: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [sups, ords, invs] = await Promise.all([
          api.get(`/suppliers?search=${encodeURIComponent(search)}`).catch(() => []),
          api.get(`/orders?search=${encodeURIComponent(search)}`).catch(() => []),
          api.get(`/invoices`).catch(() => []),
        ]);

        const supplierList = unwrapList(sups).slice(0, 4);
        const orderList = unwrapList(ords).slice(0, 4);
        const invoiceList = unwrapList(invs)
          .filter((i: any) =>
            (i.invoiceId || "").toLowerCase().includes(search.toLowerCase()) ||
            (i.supplier || "").toLowerCase().includes(search.toLowerCase())
          )
          .slice(0, 4);

        setLiveResults({ suppliers: supplierList, orders: orderList, invoices: invoiceList });
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  if (!open) return null;

  const handleSelect = (callback: () => void) => {
    onOpenChange(false);
    setSearch("");
    callback();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs pt-[14vh] p-4 animate-in fade-in duration-150"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-border/80 bg-white/95 text-foreground shadow-2xl ring-1 ring-black/10 backdrop-blur-xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="flex h-full w-full flex-col overflow-hidden"
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <div className="flex items-center border-b border-border/70 px-4 py-3 bg-muted/20">
            <Search className="mr-3 h-4 w-4 shrink-0 text-primary" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command, module name, PO number, or supplier..."
              className="flex h-6 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              autoFocus
            />
            {search ? (
              <button
                onClick={() => setSearch("")}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/80 bg-muted/40 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                ESC
              </kbd>
            )}
          </div>

          <Command.List className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin text-foreground">
            <Command.Empty className="py-8 text-center text-xs text-muted-foreground">
              {isSearching ? "Searching supply chain ledger..." : "No results found for your query."}
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group
              heading="Quick SCM Actions"
              className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-indigo-400/80"
            >
              <Command.Item
                value="action new purchase order po"
                onSelect={() => handleSelect(() => navigate({ to: "/orders" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <PlusCircle className="mr-2.5 h-3.5 w-3.5 text-indigo-400" />
                <span>Create Purchase Order</span>
                <span className="ml-auto text-[10px] text-slate-400 font-mono">/orders</span>
              </Command.Item>

              <Command.Item
                value="action new invoice pay supplier"
                onSelect={() => handleSelect(() => navigate({ to: "/invoices" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <FileText className="mr-2.5 h-3.5 w-3.5 text-teal-400" />
                <span>Review & Pay Invoices</span>
                <span className="ml-auto text-[10px] text-slate-400 font-mono">/invoices</span>
              </Command.Item>

              <Command.Item
                value="action view analytics spend intelligence"
                onSelect={() => handleSelect(() => navigate({ to: "/analytics" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <Sparkles className="mr-2.5 h-3.5 w-3.5 text-amber-400" />
                <span>Launch Spend Analytics Hub</span>
                <span className="ml-auto text-[10px] text-slate-400 font-mono">/analytics</span>
              </Command.Item>

              <Command.Item
                value="action recalculate department budgets"
                onSelect={() => handleSelect(() => navigate({ to: "/budget" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <RotateCw className="mr-2.5 h-3.5 w-3.5 text-emerald-400" />
                <span>Audit & Recalculate Budgets</span>
                <span className="ml-auto text-[10px] text-slate-400 font-mono">/budget</span>
              </Command.Item>
            </Command.Group>

            {/* Live Search Results (if available) */}
            {liveResults.orders.length > 0 && (
              <Command.Group
                heading="Matching Purchase Orders"
                className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-blue-400/80"
              >
                {liveResults.orders.map((o: any) => (
                  <Command.Item
                    key={o.id || o.orderId}
                    value={`order ${o.orderId} ${o.supplier}`}
                    onSelect={() => handleSelect(() => navigate({ to: "/orders" }))}
                    className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
                  >
                    <ShoppingCart className="mr-2.5 h-3.5 w-3.5 text-blue-400" />
                    <span className="font-mono text-blue-400 mr-2 font-semibold">{o.orderId}</span>
                    <span>{o.supplier}</span>
                    <span className="ml-auto text-[11px] font-bold text-slate-200">
                      ${Number(o.amount || 0).toLocaleString()}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {liveResults.invoices.length > 0 && (
              <Command.Group
                heading="Matching Invoices"
                className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-teal-400/80"
              >
                {liveResults.invoices.map((inv: any) => (
                  <Command.Item
                    key={inv.id || inv.invoiceId}
                    value={`invoice ${inv.invoiceId} ${inv.supplier}`}
                    onSelect={() => handleSelect(() => navigate({ to: "/invoices" }))}
                    className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
                  >
                    <FileText className="mr-2.5 h-3.5 w-3.5 text-teal-400" />
                    <span className="font-mono text-teal-400 mr-2 font-semibold">{inv.invoiceId}</span>
                    <span>{inv.supplier}</span>
                    <span className="ml-auto text-[11px] font-bold text-slate-200">
                      ${Number(inv.amount || 0).toLocaleString()} ({inv.status})
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {liveResults.suppliers.length > 0 && (
              <Command.Group
                heading="Suppliers Directory"
                className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-indigo-400/80"
              >
                {liveResults.suppliers.map((s: any) => (
                  <Command.Item
                    key={s.id || s.supId}
                    value={`supplier ${s.name} ${s.category}`}
                    onSelect={() => handleSelect(() => navigate({ to: "/suppliers" }))}
                    className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
                  >
                    <Building2 className="mr-2.5 h-3.5 w-3.5 text-indigo-400" />
                    <span className="font-semibold text-slate-100 mr-2">{s.name}</span>
                    <span className="text-[11px] text-slate-400">({s.category || "General"})</span>
                    <span className="ml-auto text-[10px] text-slate-400 font-mono">{s.supId}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Navigation Modules */}
            <Command.Group
              heading="Workspace Navigation"
              className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:text-muted-foreground/80"
            >
              <Command.Item
                value="nav dashboard overview kpis"
                onSelect={() => handleSelect(() => navigate({ to: "/" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <Gauge className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Executive Dashboard</span>
              </Command.Item>

              <Command.Item
                value="nav suppliers vendor partners directory"
                onSelect={() => handleSelect(() => navigate({ to: "/suppliers" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <Building2 className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Suppliers Directory & Scorecards</span>
              </Command.Item>

              <Command.Item
                value="nav requisitions internal purchase requests"
                onSelect={() => handleSelect(() => navigate({ to: "/requisitions" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <ClipboardList className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Purchase Requisitions</span>
              </Command.Item>

              <Command.Item
                value="nav rfqs request quotation vendor quotes"
                onSelect={() => handleSelect(() => navigate({ to: "/rfqs" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <FileSpreadsheet className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>RFQs & Supplier Sourcing</span>
              </Command.Item>

              <Command.Item
                value="nav orders purchase orders po 3-way match"
                onSelect={() => handleSelect(() => navigate({ to: "/orders" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <ShoppingCart className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Purchase Orders & 3-Way Match</span>
              </Command.Item>

              <Command.Item
                value="nav goods receipts inbound delivery notes"
                onSelect={() => handleSelect(() => navigate({ to: "/goods-receipts" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <PackageCheck className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Goods Receipts & Receiving</span>
              </Command.Item>

              <Command.Item
                value="nav invoices accounts payable bills"
                onSelect={() => handleSelect(() => navigate({ to: "/invoices" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <FileText className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Invoices & Accounts Payable</span>
              </Command.Item>

              <Command.Item
                value="nav payments settlement disbursements"
                onSelect={() => handleSelect(() => navigate({ to: "/payments" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <Banknote className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Payments & Audit Trail</span>
              </Command.Item>

              <Command.Item
                value="nav budgets ledger department spend"
                onSelect={() => handleSelect(() => navigate({ to: "/budget" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <Wallet className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Department Budgets & Ledger</span>
              </Command.Item>

              <Command.Item
                value="nav contracts agreements renewals"
                onSelect={() => handleSelect(() => navigate({ to: "/contracts" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <FileSignature className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Contracts & Expirations</span>
              </Command.Item>

              <Command.Item
                value="nav warehouses inventory storage locations"
                onSelect={() => handleSelect(() => navigate({ to: "/warehouses" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <Warehouse className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Warehouses & Capacity</span>
              </Command.Item>

              <Command.Item
                value="nav inventory stock levels reorder alerts"
                onSelect={() => handleSelect(() => navigate({ to: "/inventory" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <Boxes className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Inventory & Low Stock Alerts</span>
              </Command.Item>

              <Command.Item
                value="nav shipments logistics carriers"
                onSelect={() => handleSelect(() => navigate({ to: "/shipments" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <Truck className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>Shipments & In-Transit Tracking</span>
              </Command.Item>

              <Command.Item
                value="nav users permissions roles security"
                onSelect={() => handleSelect(() => navigate({ to: "/users" }))}
                className="relative flex cursor-pointer select-none items-center rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 outline-none data-[selected=true]:bg-primary/20 data-[selected=true]:text-primary hover:bg-white/5 transition-colors"
              >
                <Users className="mr-2.5 h-3.5 w-3.5 opacity-75" />
                <span>User Management & Permissions</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-3.5 py-2 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-mono">
                <kbd className="rounded border border-border/80 bg-background/50 px-1 py-0.5 text-[9px]">↑</kbd>
                <kbd className="rounded border border-border/80 bg-background/50 px-1 py-0.5 text-[9px]">↓</kbd> to navigate
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1 font-mono">
                <kbd className="rounded border border-border/80 bg-background/50 px-1 py-0.5 text-[9px]">↵</kbd> to select
              </span>
            </div>
            <span className="text-[10px] font-semibold text-primary/90">SupplyX Command Palette</span>
          </div>
        </Command>
      </div>
    </div>
  );
}
