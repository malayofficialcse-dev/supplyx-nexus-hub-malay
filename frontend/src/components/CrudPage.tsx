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
import { api, unwrapList } from "@/lib/api";

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
  const qc = useQueryClient();
  const list = useResourceList(endpoint);
  const rows = (list.data ?? []) as Row[];

  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [values, setValues] = React.useState<FormValues>(() => initialValues(fields));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [deleting, setDeleting] = React.useState<Row | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: [endpoint] });

  const save = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (editing) {
        const id = String(editing[idKey]);
        return updateMethod === "patch"
          ? api.patch(`${endpoint}/${id}`, payload)
          : api.put(`${endpoint}/${id}`, payload);
      }
      return api.post(endpoint, payload);
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
            {canCreate && fields.length ? (
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
        columns={columns}
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
          canEdit || canDelete || rowActionsExtra
            ? (row) => (
                <>
                  {rowActionsExtra?.(row)}
                  {canEdit && fields.length ? (
                    <Button variant="subtle" size="sm" onClick={() => openEdit(row)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  ) : null}
                  {canDelete ? (
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
