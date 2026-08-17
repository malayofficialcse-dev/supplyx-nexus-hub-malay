import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, FileSpreadsheet, ShoppingCart, User } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { CrudPage } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { Field, Input, Select, Textarea } from "@/components/kit/Input";
import { Modal } from "@/components/kit/Modal";
import { itemsSum } from "@/components/kit/ResourceForm";
import { api } from "@/lib/api.js";
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
        rowActionsExtra={(row) => (
          <>
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
      />

      <Modal
        open={!!approving}
        onOpenChange={(o) => !o && setApproving(null)}
        title="Review requisition"
        description={`Decision for ${String(approving?.['reqId'] ?? "")}`}
        width="sm"
        footer={
          <>
            <Button onClick={() => setApproving(null)}>Cancel</Button>
            <Button
              variant={decision === "approve" ? "primary" : "danger"}
              disabled={approve.isPending}
              onClick={() => approve.mutate()}
            >
              {approve.isPending ? "Submitting…" : decision === "approve" ? "Approve" : "Reject"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Decision" required>
            <Select value={decision} onChange={(e) => setDecision(e.target.value)}>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
            </Select>
          </Field>
          <Field label={decision === "approve" ? "Approval notes" : "Rejection reason"}>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
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
    </>
  );
}

