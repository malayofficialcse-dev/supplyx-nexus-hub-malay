import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AreaChart,
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, BarChart2, ClipboardList, ShoppingCart, Truck } from "lucide-react";
import { useResourceList } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import { Card, CardHeader, PageHeader, StatCard } from "@/components/kit/Card";
import { DataTable, type Row } from "@/components/kit/DataTable";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/format";
import { col } from "@/lib/scm";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SupplyX Supply Chain Management" },
      {
        name: "description",
        content:
          "Live supply chain KPIs: spend, requisitions, purchase orders, shipments and inventory health.",
      },
      { property: "og:title", content: "Dashboard — SupplyX Supply Chain Management" },
      {
        property: "og:description",
        content:
          "Live supply chain KPIs: spend, requisitions, purchase orders, shipments and inventory health.",
      },
    ],
  }),
  component: Dashboard,
});

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function Dashboard() {
  const analytics = useQuery({
    queryKey: ["/analytics/dashboard"],
    queryFn: async () => api.get("/analytics/dashboard"),
    retry: false,
  });

  const advancedQuery = useQuery({
    queryKey: ["/analytics/advanced"],
    queryFn: async () => api.get("/analytics/advanced"),
    retry: false,
  });

  const requisitions = useResourceList("/requisitions");
  const orders = useResourceList("/orders");
  const invoices = useResourceList("/invoices");
  const shipments = useResourceList("/shipments");
  const warehouses = useResourceList("/warehouses");

  const reqRows = (requisitions.data ?? []) as Row[];
  const orderRows = (orders.data ?? []) as Row[];
  const invoiceRows = (invoices.data ?? []) as Row[];
  const shipmentRows = (shipments.data ?? []) as Row[];
  const warehouseRows = (warehouses.data ?? []) as Row[];

  // Prefer advanced analytics data when available
  const monthlyTrend = advancedQuery.data?.monthlyTrend ?? [];

  const totalSpend = orderRows.reduce((s, o) => s + Number(o['amount'] ?? 0), 0);
  const openReqs = reqRows.filter((r) => /pending|draft/i.test(String(r['status'] ?? ""))).length;
  const inTransit = shipmentRows.filter((s) => /transit|scheduled/i.test(String(s['status'] ?? ""))).length;
  const payable = invoiceRows
    .filter((i) => !/paid/i.test(String(i['status'] ?? "")))
    .reduce((s, i) => s + Number(i['amount'] ?? 0), 0);

  const spendBySupplier = Object.entries(
    orderRows.reduce<Record<string, number>>((acc, o) => {
      const key = String(o['supplier'] ?? "Unknown");
      acc[key] = (acc[key] ?? 0) + Number(o['amount'] ?? 0);
      return acc;
    }, {}),
  )
    .map(([supplier, amount]) => ({ supplier, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);

  const orderStatus = Object.entries(
    orderRows.reduce<Record<string, number>>((acc, o) => {
      const key = String(o['status'] ?? "Unknown");
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const apiDown = analytics.isError && requisitions.isError && orders.isError;

  return (
    <div>
      <PageHeader
        title="Supply Chain Dashboard"
        description="Consolidated view of procurement, logistics and payables performance."
        actions={
          <div className="flex gap-2">
            <Link to="/analytics">
              <Button variant="subtle">
                <BarChart2 className="h-3.5 w-3.5" /> Analytics Hub
              </Button>
            </Link>
            <Link to="/requisitions">
              <Button variant="primary">Raise requisition</Button>
            </Link>
          </div>
        }
      />

      {apiDown ? (
        <div className="mb-4 rounded-sm border border-warning/40 bg-warning/12 px-3 py-2 text-[12px] text-warning-foreground">
          The SCM API is unreachable. Start the backend, then use Refresh on any module.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Committed PO spend"
          value={formatCurrency(totalSpend)}
          hint={`${formatNumber(orderRows.length)} purchase orders`}
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        <StatCard
          label="Open requisitions"
          value={formatNumber(openReqs)}
          hint={`${formatNumber(reqRows.length)} total raised`}
          tone="warning"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <StatCard
          label="Outstanding payables"
          value={formatCurrency(payable)}
          hint={`${formatNumber(invoiceRows.length)} invoices on file`}
          tone="danger"
          icon={<Banknote className="h-5 w-5" />}
        />
        <StatCard
          label="Shipments in motion"
          value={formatNumber(inTransit)}
          hint={`${formatNumber(shipmentRows.length)} shipments tracked`}
          tone="success"
          icon={<Truck className="h-5 w-5" />}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Monthly PO spend — 12 months"
            subtitle="Area chart sourced from advanced analytics"
          />
          <div className="h-64 p-3">
            {monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashSpendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 4, fontSize: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Area type="monotone" dataKey="value" name="Spend" stroke="var(--chart-1)" fill="url(#dashSpendGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendBySupplier}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="supplier" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <Tooltip
                    contentStyle={{ borderRadius: 3, fontSize: 12, border: "1px solid var(--border)" }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="amount" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Purchase orders by status" />
          <div className="h-64 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75}>
                  {orderStatus.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 3, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div>
          <h2 className="mb-2 text-[13px] font-semibold">Latest purchase orders</h2>
          <DataTable
            columns={[
              col.code("orderId", "PO"),
              col.text("supplier", "Supplier"),
              col.money("amount", "Amount"),
              col.status(),
            ]}
            rows={orderRows.slice(0, 20)}
            loading={orders.isFetching}
            error={orders.error ? (orders.error as Error).message : null}
            onRefresh={() => {
              void orders.refetch();
            }}
            exportName="latest-orders"
            pageSize={5}
          />
        </div>
        <div>
          <h2 className="mb-2 text-[13px] font-semibold">Warehouse utilisation</h2>
          <DataTable
            columns={[
              col.code("whId", "Site"),
              col.text("name", "Name"),
              col.num("capacity", "Capacity"),
              col.num("fillLevel", "Fill %"),
              col.status(),
            ]}
            rows={warehouseRows}
            loading={warehouses.isFetching}
            error={warehouses.error ? (warehouses.error as Error).message : null}
            onRefresh={() => {
              void warehouses.refetch();
            }}
            exportName="warehouse-utilisation"
            pageSize={5}
          />
        </div>
      </div>
    </div>
  );
}
