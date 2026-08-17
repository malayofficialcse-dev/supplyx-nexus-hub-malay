import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "./kit/Button";
import { PageHeader } from "./kit/Card";
import { DataTable, type Column, type FilterDef, type Row } from "./kit/DataTable";
import { Modal } from "./kit/Modal";
import {
  ResourceForm,
  buildPayload,
  initialValues,
  validate,
  type FieldDef,
  type FormValues,
} from "./kit/ResourceForm";
import { api, unwrapList } from "@/lib/api.js";
import { useAuth } from "@/lib/auth.js";

export interface CrudPageProps {
  title: string;
  description?: string | undefined;
  endpoint: string;
  columns: Column<Row>[];
  fields?: FieldDef[] | undefined;
  filters?: FilterDef[] | undefined;
  searchKeys?: string[] | undefined;
  exportName?: string | undefined;
  canCreate?: boolean | undefined;
  canEdit?: boolean | undefined;
  canDelete?: boolean | undefined;
  updateMethod?: "put" | "patch" | undefined;
  idKey?: string | undefined;
  labelKey?: string | undefined;
  createLabel?: string | undefined;
  headerExtra?: React.ReactNode | undefined;
  toolbarExtra?: React.ReactNode | undefined;
  rowActionsExtra?: ((row: Row) => React.ReactNode) | undefined;
  transformPayload?: ((payload: Record<string, unknown>, values: FormValues) => Record<string, unknown>) | undefined;
  summary?: ((rows: Row[]) => React.ReactNode) | undefined;
}

export function useResourceList(endpoint: string) {
  return useQuery({
    queryKey: [endpoint],
    queryFn: async () => unwrapList(await api.get(endpoint)),
  });
}

export function CrudPage({
  title,
  description,
  endpoint,
  columns,
  fields = [],
  filters,
  searchKeys,
  exportName,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  updateMethod = "put",
  idKey = "id",
  labelKey,
  createLabel,
  headerExtra,
  toolbarExtra,
  rowActionsExtra,
  transformPayload,
  summary,
}: CrudPageProps) {
  const { user, hasPermission } = useAuth();
  
  // Resolve module key from endpoint
  const cleanEndpoint = endpoint.replace(/^\/api\//, "").replace(/^\//, "");
  const firstSegment = cleanEndpoint.split("/")[0];
  const moduleName = firstSegment === "inventories" ? "inventory" : firstSegment;

  const allowedCreate = canCreate && hasPermission(moduleName, "create");
  const allowedEdit = canEdit && hasPermission(moduleName, "edit");
  const allowedDelete = canDelete && hasPermission(moduleName, "delete");

  const qc = useQueryClient();
  const list = useResourceList(endpoint);
  const rows = (list.data ?? []) as Row[];

  // Computed columns including automatic user & date-time audit trail
  const computedColumns = React.useMemo(() => {
    const hasAudit = columns.some((c) => c.key === "audit" || c.key === "auditTrail");
    if (hasAudit) return columns;

    const auditCol: Column<Row> = {
      key: "auditTrail",
      label: "Audit Trail (Who & When)",
      sortable: true,
      render: (row) => {
        const creator = String(row["createdBy"] || row["requester"] || row["creator"] || "System");
        const updater = String(row["updatedBy"] || row["modifier"] || creator);
        const createdDate = row["createdAt"]
          ? new Date(String(row["createdAt"])).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        const updatedDate = row["updatedAt"] || row["date"] || row["lastScoreUpdated"]
          ? new Date(String(row["updatedAt"] || row["date"] || row["lastScoreUpdated"])).toLocaleString([], {
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
              <span className="font-semibold text-[11px] text-foreground">{updater}</span>
            </div>
            <div className="text-[10px] text-muted-foreground ml-5 flex items-center gap-1">
              <span>{updatedDate}</span>
              {creator && creator !== updater && (
                <span className="text-[9px] text-muted-foreground/80">(by {creator})</span>
              )}
            </div>
          </div>
        );
      },
      exportValue: (row) => `${row["updatedBy"] || row["createdBy"] || "System"} (${row["updatedAt"] || row["createdAt"] || ""})`,
    };

    return [...columns, auditCol];
  }, [columns]);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [values, setValues] = React.useState<FormValues>(() => initialValues(fields));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleting, setDeleting] = React.useState<Row | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: [endpoint] });

  const save = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const enrichedPayload = {
        ...payload,
        updatedBy: user?.name || "System",
        updatedAt: new Date().toISOString(),
        ...(editing
          ? {}
          : {
              createdBy: user?.name || "System",
              createdAt: new Date().toISOString(),
            }),
      };

      if (editing) {
        const id = String(editing[idKey]);
        return updateMethod === "patch"
          ? api.patch(`${endpoint}/${id}`, enrichedPayload)
          : api.put(`${endpoint}/${id}`, enrichedPayload);
      }
      return api.post(endpoint, enrichedPayload);
    },
    onSuccess: () => {
      toast.success(editing ? `${title} record updated` : `${title} record created`);
      setFormOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => api.del(`${endpoint}/${String(row[idKey])}`),
    onSuccess: () => {
      toast.success("Record deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openCreate() {
    setEditing(null);
    setValues(initialValues(fields));
    setErrors({});
    setFormOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setValues(initialValues(fields, row));
    setErrors({});
    setFormOpen(true);
  }

  function submit() {
    const errs = validate(fields, values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    let payload: Record<string, unknown> = buildPayload(fields, values);
    if (transformPayload) payload = transformPayload(payload, values) ?? payload;
    save.mutate(payload);
  }

  const errorMessage = list.error ? (list.error as Error).message : null;

  return (
    <div>
      <PageHeader
        title={title}
        {...(description ? { description } : {})}
        actions={
          <>
            {headerExtra}
            {allowedCreate && fields.length ? (
              <Button variant="primary" onClick={openCreate}>
                <Plus className="h-3.5 w-3.5" />
                {createLabel ?? "New record"}
              </Button>
            ) : null}
          </>
        }
      />

      {summary ? <div className="mb-4">{summary(rows)}</div> : null}

      <DataTable
        columns={computedColumns}
        rows={rows}
        loading={list.isFetching}
        error={errorMessage}
        onRefresh={() => {
          void list.refetch();
        }}
        {...(searchKeys ? { searchKeys } : {})}
        {...(filters ? { filters } : {})}
        exportName={exportName ?? endpoint.replace(/\//g, "")}
        {...(toolbarExtra ? { toolbarExtra } : {})}
        rowActions={
          allowedEdit || allowedDelete || rowActionsExtra
            ? (row) => (
                <>
                  {rowActionsExtra?.(row)}
                  {allowedEdit && fields.length ? (
                    <Button variant="subtle" size="sm" onClick={() => openEdit(row)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  ) : null}
                  {allowedDelete ? (
                    <Button variant="subtle" size="sm" onClick={() => setDeleting(row)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-destructive">Delete</span>
                    </Button>
                  ) : null}
                </>
              )
            : undefined
        }
      />

      <Modal
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? `Edit ${title.replace(/s$/, "")}` : createLabel || `New ${title.replace(/s$/, "")}`}
        description={
          editing
            ? `Update the details for ${String(editing[labelKey ?? idKey] ?? "")}.`
            : "Complete the required fields and save."
        }
        width="lg"
        footer={
          <>
            <Button onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={submit} disabled={save.isPending}>
              {save.isPending ? "Saving…" : editing ? "Save changes" : "Create"}
            </Button>
          </>
        }
      >
        <ResourceForm
          fields={fields}
          values={values}
          errors={errors}
          isEdit={!!editing}
          onChange={(name, value) => setValues((prev) => ({ ...prev, [name]: value }))}
        />
      </Modal>

      <Modal
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Delete record"
        description="This action cannot be undone."
        width="sm"
        footer={
          <>
            <Button onClick={() => setDeleting(null)}>Cancel</Button>
            <Button
              variant="danger"
              disabled={remove.isPending}
              onClick={() => deleting && remove.mutate(deleting)}
            >
              {remove.isPending ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-foreground">
          Are you sure you want to delete{" "}
          <strong>{String(deleting?.[labelKey ?? idKey] ?? "this record")}</strong>?
        </p>
      </Modal>
    </div>
  );
}
