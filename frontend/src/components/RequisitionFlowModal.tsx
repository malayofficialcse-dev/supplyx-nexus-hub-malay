import * as React from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  GitFork,
  PackageCheck,
  PackageX,
  ShoppingCart,
  Truck,
  User,
  Warehouse,
} from "lucide-react";
import { Modal } from "./kit/Modal";
import { Button } from "./kit/Button";
import { useResourceList } from "./CrudPage";
import type { Row } from "./kit/DataTable";
import { formatCurrency, formatDate } from "@/lib/format";

interface RequisitionFlowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reqRow: Row | null;
}

export function RequisitionFlowModal({ open, onOpenChange, reqRow }: RequisitionFlowModalProps) {
  if (!reqRow) return null;

  const reqId = String(reqRow["reqId"] ?? reqRow["id"] ?? "");
  const status = String(reqRow["status"] ?? "");
  const isApproved = status.toLowerCase().includes("approved");
  const isConverted = status.toLowerCase().includes("converted");
  const isRejected = status.toLowerCase().includes("rejected");

  const rfqsQuery = useResourceList("/rfqs");
  const ordersQuery = useResourceList("/orders");
  const receiptsQuery = useResourceList("/goods-receipts");
  const invoicesQuery = useResourceList("/invoices");
  const paymentsQuery = useResourceList("/payments");

  const rfqs = (rfqsQuery.data ?? []) as Row[];
  const orders = (ordersQuery.data ?? []) as Row[];
  const receipts = (receiptsQuery.data ?? []) as Row[];
  const invoices = (invoicesQuery.data ?? []) as Row[];
  const payments = (paymentsQuery.data ?? []) as Row[];

  // Match downstream artifacts linked to this requisition
  const matchedRfq = rfqs.find(
    (r) =>
      String(r["rfqId"]).includes(reqId) ||
      String(r["title"]).includes(reqId) ||
      (r["items"] && JSON.stringify(r["items"]).includes(reqId))
  );

  const matchedOrder = orders.find(
    (o) =>
      String(o["description"] ?? "").includes(reqId) ||
      (matchedRfq && String(o["description"] ?? "").includes(String(matchedRfq["rfqId"]))) ||
      (reqRow["item"] && String(o["description"] ?? "").includes(String(reqRow["item"])))
  );

  const matchedReceipt = matchedOrder
    ? receipts.find((gr) => String(gr["orderId"]) === String(matchedOrder["orderId"]) || String(gr["orderId"]) === String(matchedOrder["id"]))
    : null;

  const matchedInvoice = matchedOrder
    ? invoices.find(
        (inv) =>
          String(inv["supplier"]).toLowerCase() === String(matchedOrder["supplier"]).toLowerCase() &&
          Math.abs(Number(inv["amount"]) - Number(matchedOrder["amount"])) < 1
      )
    : null;

  const matchedPayment = matchedInvoice
    ? payments.find((p) => String(p["invoiceId"]) === String(matchedInvoice["invoiceId"]) || String(p["invoiceId"]) === String(matchedInvoice["id"]))
    : null;

  // Calculate workflow stages
  const stages = [
    {
      id: "req",
      title: "1. Purchase Requisition",
      subtitle: `${reqId} • ${String(reqRow["department"] ?? "General")}`,
      icon: FileText,
      status: isRejected ? "rejected" : isApproved || isConverted ? "completed" : "active",
      badge: isRejected ? "Rejected" : isConverted ? "Converted" : isApproved ? "Approved" : "Pending Review",
      details: (
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Requester:</span>
            <span className="font-medium text-foreground">{String(reqRow["requester"] ?? "System")}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Primary Item:</span>
            <span className="font-medium text-foreground">{String(reqRow["item"] ?? "Item")}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Total Value:</span>
            <span className="font-bold text-foreground">{formatCurrency(Number(reqRow["total"] ?? 0))}</span>
          </div>
          {reqRow["justification"] ? (
            <p className="mt-1 text-[11px] italic text-muted-foreground bg-muted/30 p-2 rounded border border-border/50">
              "{String(reqRow["justification"])}"
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "rfq",
      title: "2. Supplier RFQ / Sourcing",
      subtitle: matchedRfq ? `${String(matchedRfq["rfqId"])}` : "Sourcing Stage",
      icon: FileSpreadsheet,
      status: matchedRfq ? (String(matchedRfq["status"]) === "Awarded" ? "completed" : "active") : isConverted && matchedOrder ? "skipped" : isApproved ? "pending" : "not_started",
      badge: matchedRfq ? String(matchedRfq["status"]) : matchedOrder ? "Direct PO Issued" : isApproved ? "Ready for RFQ" : "Awaiting Approval",
      details: matchedRfq ? (
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between text-muted-foreground">
            <span>RFQ Title:</span>
            <span className="font-medium text-foreground">{String(matchedRfq["title"])}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Vendor Quotes:</span>
            <span className="font-medium text-foreground">{String(matchedRfq["vendorCount"] ?? 0)} bids</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Deadline:</span>
            <span className="font-medium text-foreground">{String(matchedRfq["deadline"] ?? "Open")}</span>
          </div>
        </div>
      ) : (
        <div className="text-[12px] text-muted-foreground">
          {matchedOrder ? "Converted directly into formal Purchase Order without RFQ bidding." : "Not initiated yet."}
        </div>
      ),
    },
    {
      id: "po",
      title: "3. Purchase Order",
      subtitle: matchedOrder ? `${String(matchedOrder["orderId"])} • ${String(matchedOrder["supplier"])}` : "Order Commitment",
      icon: ShoppingCart,
      status: matchedOrder ? (String(matchedOrder["status"]) === "Received" ? "completed" : "active") : "not_started",
      badge: matchedOrder ? String(matchedOrder["status"]) : "Not Issued",
      details: matchedOrder ? (
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Supplier:</span>
            <span className="font-medium text-foreground">{String(matchedOrder["supplier"])}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>PO Amount:</span>
            <span className="font-bold text-foreground">{formatCurrency(Number(matchedOrder["amount"]))}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Promised Delivery:</span>
            <span className="font-medium text-foreground">{String(matchedOrder["deliveryDate"])}</span>
          </div>
        </div>
      ) : (
        <div className="text-[12px] text-muted-foreground">PO has not been issued to supplier yet.</div>
      ),
    },
    {
      id: "delivery",
      title: "4. Inbound Delivery & Receipt",
      subtitle: matchedReceipt ? `${String(matchedReceipt["receiptId"])}` : "Delivery History",
      icon: PackageCheck,
      status: matchedReceipt ? (String(matchedReceipt["status"]) === "Delivered" || String(matchedReceipt["status"]) === "Received" ? "completed" : "active") : "not_started",
      badge: matchedReceipt ? String(matchedReceipt["status"]) : "Awaiting Delivery",
      details: matchedReceipt ? (
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Receipt Ref:</span>
            <span className="font-medium text-foreground">{String(matchedReceipt["receiptId"])}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Delivered On:</span>
            <span className="font-medium text-foreground">{String(matchedReceipt["deliveryDate"])}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Warehouse:</span>
            <span className="font-medium text-foreground">{String(matchedReceipt["warehouseId"] ?? "Main Depot")}</span>
          </div>
        </div>
      ) : (
        <div className="text-[12px] text-muted-foreground">
          {matchedOrder ? `Awaiting physical delivery from ${String(matchedOrder["supplier"])}.` : "Delivery receipt pending PO execution."}
        </div>
      ),
    },
    {
      id: "pay",
      title: "5. Invoice & Settlement",
      subtitle: matchedInvoice ? `${String(matchedInvoice["invoiceId"])}` : "Payment Settlement",
      icon: Banknote,
      status: matchedPayment || (matchedInvoice && String(matchedInvoice["status"]) === "Paid") ? "completed" : matchedInvoice ? "active" : "not_started",
      badge: matchedPayment ? "Settled / Paid" : matchedInvoice ? String(matchedInvoice["status"]) : "No Invoice",
      details: matchedInvoice ? (
        <div className="space-y-1.5 text-[12px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Invoice ID:</span>
            <span className="font-medium text-foreground">{String(matchedInvoice["invoiceId"])}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Billed Amount:</span>
            <span className="font-bold text-foreground">{formatCurrency(Number(matchedInvoice["amount"]))}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Payment Status:</span>
            <span className={`font-semibold ${String(matchedInvoice["status"]) === "Paid" ? "text-emerald-600" : "text-amber-500"}`}>
              {String(matchedInvoice["status"])}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-[12px] text-muted-foreground">Supplier invoice not registered yet.</div>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Requisition Lifecycle & Delivery Flow"
      description={`End-to-end source-to-pay traceability history for ${reqId}`}
      width="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Live Traceability from Procurement to Settlement</span>
          </div>
          <Button onClick={() => onOpenChange(false)}>Close Flow</Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Top summary cards */}
        <div className="rounded-sm border border-border bg-card p-3.5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-foreground">{reqId}</span>
              <span className="text-xs text-muted-foreground">• {String(reqRow["item"] ?? "Item")}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Raised by <strong>{String(reqRow["requester"] ?? "System")}</strong> for <strong>{String(reqRow["department"] ?? "General")}</strong> department
            </p>
          </div>
          <div className="text-right">
            <div className="text-base font-bold text-foreground">{formatCurrency(Number(reqRow["total"] ?? 0))}</div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {status}
            </span>
          </div>
        </div>

        {/* Timeline flow */}
        <div className="relative border-l-2 border-border ml-4 space-y-6 py-2">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const isDone = st.status === "completed";
            const isActive = st.status === "active";
            const isReject = st.status === "rejected";
            const isSkip = st.status === "skipped";

            const iconBg = isDone
              ? "bg-emerald-500 text-white border-emerald-400"
              : isReject
              ? "bg-rose-500 text-white border-rose-400"
              : isActive
              ? "bg-primary text-white border-primary shadow-xs shadow-primary/30 ring-4 ring-primary/10"
              : isSkip
              ? "bg-muted text-muted-foreground border-border"
              : "bg-muted/70 text-muted-foreground border-border";

            const badgeBg = isDone
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              : isReject
              ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
              : isActive
              ? "bg-primary/10 text-primary border-primary/20 font-bold"
              : "bg-muted text-muted-foreground border-border/40";

            return (
              <div key={st.id} className="relative pl-6">
                {/* Node icon */}
                <div
                  className={`absolute -left-[17px] top-0.5 flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-all ${iconBg}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="rounded-sm border border-border/80 bg-card p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{st.title}</h4>
                      <p className="text-[11px] text-muted-foreground">{st.subtitle}</p>
                    </div>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${badgeBg}`}>
                      {st.badge}
                    </span>
                  </div>
                  {st.details}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
