import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, ShieldCheck, Tag } from "lucide-react";
import * as React from "react";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import type { Row } from "@/components/kit/DataTable";
import { col } from "@/lib/scm";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers Directory — SupplyX SCM" },
      { name: "description", content: "Vendor directory, contact records and active procurement partners." },
      { property: "og:title", content: "Suppliers Directory — SupplyX SCM" },
      { property: "og:description", content: "Vendor directory, contact records and active procurement partners." },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const [scorecardSupplier, setScorecardSupplier] = React.useState<Row | null>(null);
  const suppliersQuery = useResourceList("/suppliers");
  const supplierRows = (suppliersQuery.data ?? []) as Row[];

  const totalVendors = supplierRows.length;
  const activeVendors = supplierRows.filter((r) => String(r['status'] ?? "Active") === "Active").length;
  const categories = new Set(supplierRows.map((r) => String(r['category'] ?? "General"))).size;

  return (
    <>
      <CrudPage
      title="Suppliers"
      description="Central vendor directory and procurement partner management."
      endpoint="/suppliers"
      exportName="suppliers"
      labelKey="name"
      createLabel="New supplier"
      canEdit={true}
      canDelete={true}
      headerExtra={
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Building2 className="h-3.5 w-3.5 text-primary" /> Registered Vendors
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">{totalVendors} vendors</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Central directory</div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Active Partners
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">{activeVendors} active</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Approved for PO issue</div>
          </div>

          <div className="rounded-sm border border-border bg-card p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Tag className="h-3.5 w-3.5 text-blue-500" /> Vendor Categories
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">{categories} categories</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Supply classifications</div>
          </div>
        </div>
      }
      filters={[
        { key: "status", label: "Status" },
        { key: "category", label: "Category" },
      ]}
      searchKeys={["supId", "name", "contact", "email", "phone", "category", "status"]}
      columns={[
        col.code("supId", "Supplier ID"),
        col.text("name", "Company Name"),
        col.text("contact", "Primary Contact"),
        col.text("category", "Category"),
        {
          key: "scorecard",
          label: "Performance Rating",
          render: (r) => {
            const rating = String(r["rating"] ?? "Good");
            const score = Number(r["overallScore"] ?? 75);
            let badgeClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            if (rating === "Needs Improvement" || score < 50) {
              badgeClass = "bg-rose-500/10 text-rose-600 border-rose-500/20";
            } else if (rating === "Satisfactory" || score < 70) {
              badgeClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";
            } else if (rating === "Good" || score < 85) {
              badgeClass = "bg-sky-500/10 text-sky-600 border-sky-500/20";
            }
            return (
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {rating} ({score})
                </span>
              </div>
            );
          },
        },
        {
          key: "onTimeDeliveryRate",
          label: "On-Time %",
          align: "right",
          render: (r) => {
            const onTime = Number(r["onTimeDeliveryRate"] ?? 0);
            return (
              <div className="flex flex-col items-end gap-1">
                <span className="font-semibold text-xs text-foreground">{onTime}%</span>
                <div className="h-1 w-16 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, Math.max(5, onTime))}%` }}
                  />
                </div>
              </div>
            );
          },
        },
        col.status(),
      ]}
      fields={[
        { name: "supId", label: "Supplier ID", placeholder: "SUP-1001" },
        { name: "name", label: "Company name", required: true, placeholder: "e.g. Acme Procurement Ltd" },
        { name: "contact", label: "Contact person", placeholder: "Jane Doe" },
        { name: "email", label: "Email address", placeholder: "vendor@acme.com" },
        { name: "phone", label: "Phone number", placeholder: "+1 (555) 019-2834" },
        {
          name: "category",
          label: "Category",
          type: "select",
          options: ["Raw Materials", "Hardware & Tools", "Packaging & Supplies", "Electronics & Tech", "Freight & Carrier", "General Supplier"],
          defaultValue: "General Supplier",
        },
        { name: "status", label: "Status", type: "select", options: ["Active", "Inactive", "Pending Review"], defaultValue: "Active" },
      ]}
      rowActionsExtra={(row) => (
        <Button
          variant="subtle"
          size="sm"
          onClick={() => setScorecardSupplier(row)}
        >
          <Award className="h-3.5 w-3.5 text-amber-500" />
          Scorecard
        </Button>
      )}
    />

    <ScorecardModal
      open={!!scorecardSupplier}
      onOpenChange={(o) => !o && setScorecardSupplier(null)}
      supplierRow={scorecardSupplier}
    />
  </>
);
}

import { useQuery } from "@tanstack/react-query";
import { Award, Activity, Clock, DollarSign, Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/kit/Button";
import { Modal } from "@/components/kit/Modal";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

function ScorecardModal({
  open,
  onOpenChange,
  supplierRow,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierRow: Row | null;
}) {
  const supplierId = supplierRow ? String(supplierRow['id']) : "";
  const query = useQuery({
    queryKey: ["/suppliers", supplierId, "scorecard"],
    queryFn: async () => {
      const res = await api.get(`/suppliers/${supplierId}/scorecard`);
      return res;
    },
    enabled: !!supplierId && open,
  });

  if (!supplierRow) return null;

  const data = query.data?.scorecard || {};
  const score = Number(data.overallScore ?? 0);
  const onTime = Number(data.onTimeDeliveryRate ?? 0);
  const defect = Number(data.defectRate ?? 0);
  const leadTime = Number(data.avgLeadTimeDays ?? 0);
  const spend = Number(data.totalOrderValue ?? 0);
  const rating = String(data.rating ?? "No Rating");

  // Multi-dimensional metrics for Radar Chart
  const qualityScore = Math.max(0, 100 - defect);
  const leadTimeScore = Math.min(100, Math.max(20, Math.round(100 - leadTime * 3)));
  const reliabilityScore = Math.min(100, Math.max(10, Math.round(onTime * 0.9 + qualityScore * 0.1)));
  const complianceScore = Math.min(100, Math.max(30, Math.round(score * 0.95)));

  const radarData = [
    { subject: "On-Time", score: onTime, fullMark: 100 },
    { subject: "Quality", score: qualityScore, fullMark: 100 },
    { subject: "Lead Time", score: leadTimeScore, fullMark: 100 },
    { subject: "Reliability", score: reliabilityScore, fullMark: 100 },
    { subject: "Compliance", score: complianceScore, fullMark: 100 },
  ];

  let scoreColor = "text-rose-500 bg-rose-500/10 border-rose-500/20";
  if (score >= 85) scoreColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  else if (score >= 70) scoreColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Supplier Performance & Quality Scorecard"
      description={`Real-time automated evaluation metrics for ${String(supplierRow['name'])}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="subtle" size="sm" onClick={() => void query.refetch()}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Re-evaluate KPIs
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close Scorecard</Button>
        </div>
      }
    >
      {query.isPending ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Calculating KPIs & scoring matrix...</div>
      ) : query.error ? (
        <div className="py-8 text-center text-sm text-destructive">Failed to calculate scorecard: {(query.error as Error).message}</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className={`col-span-2 rounded-sm border p-4 flex flex-col justify-between ${scoreColor}`}>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">Performance Rating</span>
                <h4 className="text-xl font-bold mt-1">{rating}</h4>
              </div>
              <p className="text-xs mt-3 opacity-90">
                Live calculated across {data.totalOrders ?? 0} Purchase Orders and {data.totalDeliveries ?? 0} Goods Receipts.
              </p>
            </div>

            <div className="rounded-sm border border-border bg-card p-4 text-center flex flex-col justify-center items-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Overall KPI</span>
              <div className="text-3xl font-extrabold mt-1 text-foreground">{score}</div>
              <span className="text-[10px] text-muted-foreground mt-0.5">out of 100</span>
            </div>
          </div>

          {/* Radar Chart & Key Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center border border-border/80 rounded-sm bg-card p-3">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 15, bottom: 10, left: 15 }}>
                  <PolarGrid stroke="#334155" opacity={0.5} />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={9} />
                  <Radar
                    name="Performance Score"
                    dataKey="score"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3 pr-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
                  <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> On-Time Delivery</span>
                  <span>{onTime}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${onTime}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
                  <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Inbound Quality Index</span>
                  <span>{qualityScore}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${qualityScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-foreground mb-1">
                  <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Disputed / Defect Rate</span>
                  <span className="text-amber-500 font-bold">{defect}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${defect}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-sm border border-border bg-card p-3 flex items-center gap-2.5">
              <div className="rounded bg-primary/10 p-2 text-primary">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold">Avg Lead Time</div>
                <div className="text-sm font-bold text-foreground">{leadTime} days</div>
              </div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3 flex items-center gap-2.5">
              <div className="rounded bg-emerald-500/10 p-2 text-emerald-500">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold">Total PO Spend</div>
                <div className="text-sm font-bold text-foreground">{formatCurrency(spend)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
