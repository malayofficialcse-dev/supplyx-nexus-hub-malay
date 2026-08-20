import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CalendarCheck, Clock, FileSignature, Paperclip } from "lucide-react";
import * as React from "react";
import { CrudPage, useResourceList } from "@/components/CrudPage";
import { Button } from "@/components/kit/Button";
import type { Row } from "@/components/kit/DataTable";
import { AttachmentsModal, AttachmentBadge } from "@/components/AttachmentsModal";
import { col, STATUS } from "@/lib/scm";

export const Route = createFileRoute("/contracts")({
  head: () => ({
    meta: [
      { title: "Contracts — SupplyX SCM" },
      { name: "description", content: "Manage supplier contracts, validity windows and lifecycle status." },
      { property: "og:title", content: "Contracts — SupplyX SCM" },
      { property: "og:description", content: "Manage supplier contracts, validity windows and lifecycle status." },
    ],
  }),
  component: ContractsPage,
});

function ContractsPage() {
  const [attRow, setAttRow] = React.useState<Row | null>(null);
  const suppliersQuery = useResourceList("/suppliers");
  const contractsQuery = useResourceList("/contracts");
  const contractRows = (contractsQuery.data ?? []) as Row[];

  const supplierOptions = Array.from(
    new Set(
      ((suppliersQuery.data ?? []) as Row[])
        .map((s) => String(s['name'] ?? ""))
        .concat(["brb", "twe", "BTENE", "Acme Corporation"])
    )
  ).filter(Boolean);

  const activeCount = contractRows.filter((r) => String(r['status']) === "Active").length;
  const now = new Date();
  const expiringCount = contractRows.filter((r) => {
    const d = new Date(String(r['end']));
    const diff = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    return diff >= 0 && diff <= 30 && String(r['status']) === "Active";
  }).length;
  const expiredCount = contractRows.filter((r) => {
    const d = new Date(String(r['end']));
    return d.getTime() < now.getTime();
  }).length;

  return (
    <>
      <CrudPage
        title="Contracts"
        description="Supplier agreements, validity periods and renewal windows."
        endpoint="/contracts"
        exportName="contracts"
        labelKey="conId"
        createLabel="New contract"
        updateMethod="put"
        headerExtra={
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <FileSignature className="h-3.5 w-3.5 text-emerald-500" /> Active Contracts
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">{activeCount} agreements</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Compliant active spend</div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Expiring Soon
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">{expiringCount} expiring</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Next 30 days window</div>
            </div>

            <div className="rounded-sm border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-500" /> Expired Contracts
              </div>
              <div className="mt-1 text-lg font-bold text-foreground">{expiredCount} expired</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Requires renegotiation</div>
            </div>
          </div>
        }
        filters={[{ key: "status", label: "Status" }, { key: "supplier", label: "Supplier" }]}
        searchKeys={["conId", "supplier", "initials", "status"]}
        columns={[
          col.code("conId", "Contract ID"),
          col.text("supplier", "Supplier"),
          col.text("initials", "Owner"),
          col.date("start", "Start"),
          {
            key: "end",
            label: "End",
            render: (r) => {
              const endDate = new Date(String(r['end']));
              const diff = Math.ceil((endDate.getTime() - now.getTime()) / 86400000);
              let badgeClass = "text-foreground tabular-nums";
              let warningText = "";
              if (diff < 0) {
                badgeClass = "text-rose-500 font-semibold tabular-nums";
                warningText = " (Expired)";
              } else if (diff <= 30) {
                badgeClass = "text-amber-500 font-semibold tabular-nums";
                warningText = ` (${diff}d left)`;
              }
              return (
                <span className={badgeClass}>
                  {String(r['end'])}
                  {warningText}
                </span>
              );
            },
          },
          {
            key: "attachments",
            label: "Docs",
            render: (row) => {
              const attachments = (row["attachments"] as any[]) || [];
              return (
                <AttachmentBadge
                  count={attachments.length}
                  onClick={() => setAttRow(row)}
                />
              );
            },
          },
          col.status(),
        ]}
        fields={[
          { name: "conId", label: "Contract ID", required: true, placeholder: "CON-1001" },
          { name: "supplier", label: "Supplier", type: "select", options: supplierOptions, required: true },
          { name: "initials", label: "Owner initials", required: true, placeholder: "MM" },
          { name: "start", label: "Start date", type: "date", required: true },
          { name: "end", label: "End date", type: "date", required: true },
          { name: "status", label: "Status", type: "select", options: STATUS.contract, required: true, defaultValue: "Active" },
        ]}
        rowActionsExtra={(row) => (
          <Button
            variant="subtle"
            size="sm"
            onClick={() => setAttRow(row)}
            title="Manage Signed PDF Agreements & Attachments"
          >
            <Paperclip className="h-3.5 w-3.5" />
            Docs
          </Button>
        )}
      />

      <AttachmentsModal
        open={!!attRow}
        onOpenChange={(open) => !open && setAttRow(null)}
        entityType="contracts"
        entityId={String(attRow?.["id"] ?? "")}
        entityLabel={`Contract ${String(attRow?.["conId"] ?? "")}`}
        attachments={(attRow?.["attachments"] as any[]) || []}
        invalidateKey="/contracts"
      />
    </>
  );
}
