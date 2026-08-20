import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileSpreadsheet, GitFork, ShoppingCart, User } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CrudPage } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { Field, Input, Select, Textarea } from "@/components/kit/Input";
import { Modal } from "@/components/kit/Modal";
import { itemsSum } from "@/components/kit/ResourceForm";
import { RequisitionFlowModal } from "@/components/RequisitionFlowModal";
import { api } from "@/lib/api.js";
import { formatCurrency } from "@/lib/format";
import { DEPARTMENTS, col, STATUS } from "@/lib/scm.js";
import { useAuth } from "@/lib/auth.js";

export const Route = createFileRoute("/requisitions")({
  head: () => ({
    meta: [
      { title: "Requisitions — SupplyX SCM" },
      { name: "description", content: "Raise, approve and convert purchase requisitions into RFQs and Purchase Orders." },
      { property: "og:title", content: "Requisitions — SupplyX SCM" },
      { property: "og:description", content: "Raise, approve and convert purchase requisitions into RFQs and Purchase Orders." },
    ],
  }),
  component: RequisitionsPage,
});

function RequisitionsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [approving, setApproving] = React.useState<Row | null>(null);
  const [decision, setDecision] = React.useState("approve");
  const [notes, setNotes] = React.useState("");

  const [rfqFor, setRfqFor] = React.useState<Row | null>(null);
  const [rfqTitle, setRfqTitle] = React.useState("");
  const [rfqDeadline, setRfqDeadline] = React.useState("");

  const [poFor, setPoFor] = React.useState<Row | null>(null);
  const [poSupplier, setPoSupplier] = React.useState("");
  const [poDeliveryDate, setPoDeliveryDate] = React.useState("");
  const [flowReq, setFlowReq] = React.useState<Row | null>(null);

  const approve = useMutation({
    mutationFn: async () => {
      const id = String(approving?.['id']);
      const body =
        decision === "approve"
          ? { approved: true, status: "Approved", approvalNotes: notes }
          : { approved: false, status: "Rejected", rejectionReason: notes };
      return api.post(`/requisitions/${id}/approve`, body);
    },
    onSuccess: () => {
      toast.success(decision === "approve" ? "Requisition approved" : "Requisition rejected");
      setApproving(null);
      setNotes("");
      void qc.invalidateQueries({ queryKey: ["/requisitions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createRfq = useMutation({
    mutationFn: async () =>
      api.post(`/requisitions/${String(rfqFor?.['id'])}/rfq`, {
        title: rfqTitle,
        deadline: rfqDeadline,
      }),
    onSuccess: () => {
      toast.success("RFQ created from requisition");
      setRfqFor(null);
      void qc.invalidateQueries({ queryKey: ["/requisitions"] });
      void qc.invalidateQueries({ queryKey: ["/rfqs"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createPo = useMutation({
    mutationFn: async () =>
      api.post(`/requisitions/${String(poFor?.['id'])}/order`, {
        supplier: poSupplier,
        deliveryDate: poDeliveryDate,
      }),
    onSuccess: () => {
      toast.success("Purchase order generated from requisition!");
      setPoFor(null);
      void qc.invalidateQueries({ queryKey: ["/requisitions"] });
      void qc.invalidateQueries({ queryKey: ["/orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <CrudPage
        title="Requisitions"
        description="Internal demand intake, approval workflow, RFQ conversion and PO generation."
        endpoint="/requisitions"
        exportName="requisitions"
        labelKey="reqId"
        createLabel="New requisition"
        canEdit={false}
        canDelete={false}
        filters={[
          { key: "status", label: "Status" },
          { key: "department", label: "Department" },
        ]}
        searchKeys={["reqId", "requester", "department", "costCenter", "item", "status"]}
        columns={[
          col.code("reqId", "Requisition"),
          {
            key: "requester",
            label: "Created By",
            render: (r) => {
              const req = String(r["requester"] ?? "System");
              return (
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/12 text-[10px] font-bold text-indigo-700 border border-indigo-400/25 uppercase">
                    {req.charAt(0)}
                  </span>
                  <span>{req}</span>
                </div>
              );
            },
          },
          col.text("department", "Department"),
          col.text("costCenter", "Cost centre"),
          col.text("item", "Primary item"),
          col.items(),
          col.money("total", "Total"),
          {
            key: "approvalTier",
            label: "Approval Tier",
            render: (r) => {
              const total = Number(r["total"] ?? 0);
              const status = String(r["status"] ?? "");
              if (total > 10000) {
                const isL1 = status.includes("L1");
                return (
                  <div className="flex flex-col gap-0.5">
                    <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                      L2 Finance Required
                    </span>
                    <span className={`text-[9px] font-semibold ${isL1 ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {isL1 ? "✓ L1 Approved" : "Awaiting L1"}
                    </span>
                  </div>
                );
              }
              return (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  L1 Only
                </span>
              );
            },
          },
          col.status(),
        ]}
        fields={[
          { name: "reqId", label: "Requisition ID", required: true, placeholder: "REQ-1001" },
          { name: "requester", label: "Created By / Requester", required: true, defaultValue: user?.name || "System" },
          { name: "department", label: "Department", type: "select", options: DEPARTMENTS, required: true },
          { name: "costCenter", label: "Cost centre", required: true, placeholder: "CC-4400" },
          { name: "item", label: "Primary item", required: true },
          { name: "status", label: "Status", type: "select", options: STATUS.requisition, required: true, defaultValue: "Pending" },
          { name: "justification", label: "Business justification", type: "textarea" },
          { name: "items", label: "Requested lines", type: "items", required: true },
        ]}
        transformPayload={(payload, values) => ({
          ...payload,
          requester: payload['requester'] || user?.name || "System",
          total: itemsSum(values),
        })}
        rowActionsExtra={(row) => {
          const status = String(row["status"] ?? "").toLowerCase();
          const isConverted = status.includes("converted");
          const isApproved = status.includes("approved");
          const isPending = status.includes("pending") || status.includes("awaiting");
          const isRejected = status.includes("rejected");

          return (
            <>
              {/* Requisition Lifecycle & Delivery History Flow Button */}
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setFlowReq(row)}
                title="View Requisition Lifecycle Flow & Delivery History"
                className="text-primary hover:text-primary font-medium"
              >
                <GitFork className="h-3.5 w-3.5 text-primary" />
                View Flow
              </Button>

              {/* Review button only for pending / awaiting approval non-converted records */}
              {!isConverted && !isRejected && isPending && (
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    setApproving(row);
                    setDecision("approve");
                    setNotes("");
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  Review
                </Button>
              )}

              {/* Sourcing & Order conversion actions only for approved non-converted records */}
              {!isConverted && !isRejected && isApproved && (
                <>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => {
                      setRfqFor(row);
                      setRfqTitle(`RFQ for ${String(row['item'] ?? row['reqId'] ?? "")}`);
                      setRfqDeadline("");
                    }}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Create RFQ
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => {
                      setPoFor(row);
                      setPoSupplier("");
                      setPoDeliveryDate(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
                    }}
                  >
                    <ShoppingCart className="h-3.5 w-3.5" />
                    Create PO
                  </Button>
                </>
              )}
            </>
          );
        }}
      />

      <Modal
        open={!!approving}
        onOpenChange={(o) => !o && setApproving(null)}
        title="Multi-Level Requisition Review"
        description={`Audit and decision review for ${String(approving?.['reqId'] ?? "")} (${formatCurrency(Number(approving?.['total'] ?? 0))})`}
        width="md"
        footer={
          <>
            <Button onClick={() => setApproving(null)}>Cancel</Button>
            <Button
              variant={decision === "approve" ? "primary" : "danger"}
              disabled={approve.isPending}
              onClick={() => approve.mutate()}
            >
              {approve.isPending
                ? "Submitting Signoff…"
                : decision === "approve"
                ? Number(approving?.["total"] ?? 0) > 10000 && String(approving?.["status"]).includes("Approved L1")
                  ? "Approve L2 (Finance Signoff)"
                  : Number(approving?.["total"] ?? 0) > 10000
                  ? "Approve L1 (Manager Signoff)"
                  : "Approve Requisition"
                : "Reject Requisition"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Approval Policy Header */}
          <div className="rounded-sm border border-border bg-muted/40 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">
                Approval Policy: {Number(approving?.["total"] ?? 0) > 10000 ? "Tier 2 (> $10,000)" : "Tier 1 (Standard ≤ $10,000)"}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  Number(approving?.["total"] ?? 0) > 10000
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                }`}
              >
                {Number(approving?.["total"] ?? 0) > 10000 ? "2-Level Approval (Manager + Finance)" : "1-Level (Manager)"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {Number(approving?.["total"] ?? 0) > 10000
                ? "High-value requisitions require initial L1 Manager authorization followed by L2 Finance Director signoff before conversion to RFQ or PO."
                : "Requisitions under $10,000 require standard departmental Manager approval."}
            </p>
          </div>

          {/* Past Approval Signatures Timeline */}
          {Array.isArray(approving?.["approvals"]) && (approving?.["approvals"] as any[]).length > 0 && (
            <div className="space-y-1.5">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Signoff Audit Trail
              </h5>
              <div className="divide-y divide-border rounded border border-border bg-card p-2 text-xs space-y-2">
                {(approving?.["approvals"] as any[]).map((sig: any, idx: number) => (
                  <div key={idx} className="pt-1.5 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">
                        {sig.level} • {sig.approver} ({sig.role})
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          sig.decision === "Approved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {sig.decision}
                      </span>
                    </div>
                    {sig.notes && (
                      <p className="text-[11px] text-muted-foreground italic mt-0.5">
                        "{sig.notes}"
                      </p>
                    )}
                    <span className="text-[9px] text-muted-foreground block mt-0.5">
                      {new Date(sig.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Field label="Your Decision" required>
              <Select value={decision} onChange={(e) => setDecision(e.target.value)}>
                <option value="approve">
                  {Number(approving?.["total"] ?? 0) > 10000 && String(approving?.["status"]).includes("Approved L1")
                    ? "Approve L2 (Finance Signoff)"
                    : Number(approving?.["total"] ?? 0) > 10000
                    ? "Approve L1 (Manager Signoff)"
                    : "Approve Requisition"}
                </option>
                <option value="reject">Reject Requisition</option>
              </Select>
            </Field>
            <Field label={decision === "approve" ? "Signoff Notes & Justification" : "Rejection Reason"} required={decision === "reject"}>
              <Textarea
                placeholder={decision === "approve" ? "e.g. Budget verified and approved for Q3 project" : "e.g. Out of scope for this fiscal quarter"}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!rfqFor}
        onOpenChange={(o) => !o && setRfqFor(null)}
        title="Create RFQ from requisition"
        description={String(rfqFor?.['reqId'] ?? "")}
        width="sm"
        footer={
          <>
            <Button onClick={() => setRfqFor(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={createRfq.isPending || !rfqTitle.trim()}
              onClick={() => createRfq.mutate()}
            >
              {createRfq.isPending ? "Creating…" : "Create RFQ"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="RFQ title" required>
            <Input value={rfqTitle} onChange={(e) => setRfqTitle(e.target.value)} />
          </Field>
          <Field label="Response deadline">
            <Input type="date" value={rfqDeadline} onChange={(e) => setRfqDeadline(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!poFor}
        onOpenChange={(o) => !o && setPoFor(null)}
        title="Generate Purchase Order from Requisition"
        description={`PO generation for ${String(poFor?.['reqId'] ?? "")}`}
        width="sm"
        footer={
          <>
            <Button onClick={() => setPoFor(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={createPo.isPending || !poSupplier.trim()}
              onClick={() => createPo.mutate()}
            >
              {createPo.isPending ? "Generating…" : "Generate PO"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Supplier name" required>
            <Input
              placeholder="e.g. Acme Corporation"
              value={poSupplier}
              onChange={(e) => setPoSupplier(e.target.value)}
            />
          </Field>
          <Field label="Delivery date" required>
            <Input
              type="date"
              value={poDeliveryDate}
              onChange={(e) => setPoDeliveryDate(e.target.value)}
            />
          </Field>
          </div>
        </Modal>

        <RequisitionFlowModal
          open={!!flowReq}
          onOpenChange={(o) => !o && setFlowReq(null)}
          reqRow={flowReq}
        />
      </>
    );
  }

