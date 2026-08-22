import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, RefreshCw, ShieldCheck, Truck, Workflow, X } from "lucide-react";
import { toast } from "sonner";
import { api, unwrapList } from "@/lib/api";
import { Button } from "@/components/kit/Button";
import { Card, PageHeader, StatCard } from "@/components/kit/Card";
import { DataTable } from "@/components/kit/DataTable";
import type { Row } from "@/components/kit/DataTable";
import { col } from "@/lib/scm";

export const Route = createFileRoute("/operations")({ component: OperationsPage });

function OperationsPage() {
  const qc = useQueryClient();
  const inbox = useQuery({ queryKey: ["/operations/approvals/inbox"], queryFn: async () => unwrapList(await api.get("/operations/approvals/inbox")) });
  const exceptions = useQuery({ queryKey: ["/operations/match/exceptions"], queryFn: async () => unwrapList(await api.get("/operations/match/exceptions?status=Open")) });
  const replenishment = useQuery({ queryKey: ["/operations/inventory/replenishment"], queryFn: async () => unwrapList(await api.get("/operations/inventory/replenishment")) });
  const decide = useMutation({ mutationFn: ({ id, decision }: { id: string; decision: string }) => api.post(`/operations/approvals/${id}/decision`, { decision }), onSuccess: () => { toast.success("Approval task updated"); void qc.invalidateQueries({ queryKey: ["/operations/approvals/inbox"] }); }, onError: (e: Error) => toast.error(e.message) });
  const resolve = useMutation({ mutationFn: (id: string) => api.post(`/operations/match/exceptions/${id}/resolve`, { resolution: "Reviewed and accepted by operations" }), onSuccess: () => { toast.success("Match exception resolved"); void qc.invalidateQueries({ queryKey: ["/operations/match/exceptions"] }); }, onError: (e: Error) => toast.error(e.message) });
  const refresh = () => { void inbox.refetch(); void exceptions.refetch(); void replenishment.refetch(); };
  return <div>
    <PageHeader title="Operations Control Center" description="Approval work, invoice exceptions and inventory replenishment in one queue." actions={<Button variant="subtle" onClick={refresh}><RefreshCw className="h-3.5 w-3.5" /> Refresh</Button>} />
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><StatCard label="Approval tasks" value={String(inbox.data?.length ?? 0)} tone="iris" icon={<ShieldCheck className="h-5 w-5" />} /><StatCard label="Open match exceptions" value={String(exceptions.data?.length ?? 0)} tone="danger" icon={<Workflow className="h-5 w-5" />} /><StatCard label="Replenishment suggestions" value={String(replenishment.data?.length ?? 0)} tone="warning" icon={<Truck className="h-5 w-5" />} /></div>
    <div className="grid gap-5 xl:grid-cols-2">
      <Card><div className="p-4"><h2 className="mb-3 text-sm font-bold">Approval inbox</h2><DataTable rows={inbox.data as Row[] ?? []} columns={[col.text("entityType", "Entity"), col.text("entityId", "Reference"), col.text("approverRole", "Required role"), col.date("dueAt", "Due")]} loading={inbox.isFetching} searchKeys={["entityType", "entityId", "approverRole"]} rowActions={(row) => <><Button size="sm" variant="subtle" onClick={() => decide.mutate({ id: String(row.id), decision: "approve" })}><Check className="h-3.5 w-3.5 text-success" /> Approve</Button><Button size="sm" variant="subtle" onClick={() => decide.mutate({ id: String(row.id), decision: "reject" })}><X className="h-3.5 w-3.5 text-destructive" /> Reject</Button></>} /></div></Card>
      <Card><div className="p-4"><h2 className="mb-3 text-sm font-bold">Three-way match exceptions</h2><DataTable rows={exceptions.data as Row[] ?? []} columns={[col.text("invoiceId", "Invoice"), col.text("type", "Exception"), col.text("severity", "Severity"), col.text("message", "Details")]} loading={exceptions.isFetching} searchKeys={["invoiceId", "type", "message"]} rowActions={(row) => <Button size="sm" variant="subtle" onClick={() => resolve.mutate(String(row.id))}>Resolve</Button>} /></div></Card>
      <Card><div className="p-4"><h2 className="mb-3 text-sm font-bold">Replenishment suggestions</h2><DataTable rows={replenishment.data as Row[] ?? []} columns={[col.text("item", "Item"), col.text("sku", "SKU"), col.num("available", "Available"), col.num("suggestedQuantity", "Suggested order")]} loading={replenishment.isFetching} searchKeys={["item", "sku", "warehouseId"]} /></div></Card>
    </div>
  </div>;
}
