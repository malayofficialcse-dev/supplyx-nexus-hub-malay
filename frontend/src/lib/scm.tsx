import { StatusBadge } from "@/components/kit/Badge";
import type { Column, Row } from "@/components/kit/DataTable";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

export const STATUS = {
  requisition: ["Draft", "Pending", "Approved", "Rejected", "Converted"],
  order: ["Draft", "Ordered", "Partial", "Received", "Cancelled"],
  rfq: ["Draft", "Open", "Quoted", "Awarded", "Closed"],
  receipt: ["Pending", "Partial", "Received", "Rejected"],
  invoice: ["Draft", "Submitted", "Approved", "Paid", "Overdue"],
  payment: ["Pending", "Processing", "Paid", "Failed"],
  contract: ["Draft", "Active", "Expired", "Terminated"],
  warehouse: ["Active", "Inactive", "Maintenance"],
  shipment: ["Scheduled", "In Transit", "Delivered", "Delayed", "Cancelled"],
  customer: ["Active", "Inactive", "Prospect"],
};

export const PAYMENT_METHODS = ["Bank Transfer", "ACH", "Wire", "Credit Card", "Check"];
export const CARRIER_TYPES = ["Road", "Rail", "Air", "Ocean", "Parcel", "3PL"];
export const DEPARTMENTS = [
  "Operations",
  "Procurement",
  "Manufacturing",
  "IT",
  "Facilities",
  "Logistics",
  "Finance",
  "R&D",
];

export const col = {
  text: (key: string, label: string, extra: Partial<Column<Row>> = {}): Column<Row> => ({
    key,
    label,
    ...extra,
  }),
  code: (key: string, label: string): Column<Row> => ({
    key,
    label,
    render: (r) => (
      <span className="font-mono text-[12px] font-semibold text-primary">
        {String(r[key] ?? "—")}
      </span>
    ),
  }),
  money: (key: string, label: string): Column<Row> => ({
    key,
    label,
    align: "right",
    render: (r) => formatCurrency(r[key]),
  }),
  num: (key: string, label: string, digits = 0): Column<Row> => ({
    key,
    label,
    align: "right",
    render: (r) => formatNumber(r[key], digits),
  }),
  date: (key: string, label: string): Column<Row> => ({
    key,
    label,
    render: (r) => formatDate(r[key]),
  }),
  status: (key = "status", label = "Status"): Column<Row> => ({
    key,
    label,
    render: (r) => <StatusBadge status={r[key]} />,
  }),
  actor: (key: string, label: string): Column<Row> => ({
    key,
    label,
    render: (r) => {
      const name = String(r[key] ?? "System");
      return (
        <div className="flex items-center gap-1.5 font-medium">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/12 text-[9px] font-bold text-indigo-700 border border-indigo-400/25 uppercase">
            {name.charAt(0)}
          </span>
          <span className="truncate max-w-[120px]">{name}</span>
        </div>
      );
    },
  }),
  audit: (label = "Audit Trail (Who & When)"): Column<Row> => ({
    key: "auditTrail",
    label,
    sortable: true,
    render: (r) => {
      const creator = String(r["createdBy"] || r["requester"] || r["creator"] || "System");
      const updater = String(r["updatedBy"] || r["modifier"] || creator);
      const createdDate = r["createdAt"]
        ? new Date(String(r["createdAt"])).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const updatedDate = r["updatedAt"] || r["date"] || r["lastScoreUpdated"]
        ? new Date(String(r["updatedAt"] || r["date"] || r["lastScoreUpdated"])).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : createdDate || "Recently";

      return (
        <div className="flex flex-col text-[11px] leading-snug">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/12 text-[9px] font-bold text-indigo-700 border border-indigo-400/25 uppercase">
              {updater.charAt(0)}
            </span>
            <span className="font-semibold text-[11px]">{updater}</span>
          </div>
          <div className="text-[10px] text-muted-foreground ml-5 flex items-center gap-1">
            <span>{updatedDate}</span>
            {creator !== updater && (
              <span className="text-[9px] text-muted-foreground/80">(created: {creator})</span>
            )}
          </div>
        </div>
      );
    },
    exportValue: (r) => `${r["updatedBy"] || r["createdBy"] || "System"} (${r["updatedAt"] || r["createdAt"] || ""})`,
  }),
  items: (key = "items", label = "Lines"): Column<Row> => ({
    key,
    label,
    align: "center",
    render: (r) => {
      const v = r[key];
      const n = Array.isArray(v) ? v.length : 0;
      return <span className="tabular-nums text-muted-foreground">{n}</span>;
    },
    exportValue: (r) => (Array.isArray(r[key]) ? (r[key] as unknown[]).length : 0),
  }),
};
