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
