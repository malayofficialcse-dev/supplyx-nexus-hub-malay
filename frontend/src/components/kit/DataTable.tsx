import { AlertCircle, ArrowDown, ArrowUp, Download, Inbox, RefreshCw, Search, X } from "lucide-react";
import * as React from "react";
import { Button } from "./Button";
import { Input, Select } from "./Input";
import { downloadCsv } from "@/lib/format";
import { cn } from "@/lib/utils";

export type Row = Record<string, unknown>;

export interface Column<T extends Row = Row> {
  key: string;
  label: string;
  align?: "left" | "right" | "center" | undefined;
  width?: string | undefined;
  sortable?: boolean | undefined;
  render?: ((row: T) => React.ReactNode) | undefined;
  exportValue?: ((row: T) => unknown) | undefined;
}

export interface FilterDef {
  key: string;
  label: string;
  options?: string[] | undefined;
}

interface DataTableProps<T extends Row> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean | undefined;
  error?: string | null | undefined;
  onRefresh?: (() => void) | undefined;
  searchKeys?: string[] | undefined;
  filters?: FilterDef[] | undefined;
  exportName?: string | undefined;
  rowActions?: ((row: T) => React.ReactNode) | undefined;
  toolbarExtra?: React.ReactNode | undefined;
  emptyMessage?: string | undefined;
  pageSize?: number | undefined;
  onRowClick?: ((row: T) => void) | undefined;
}

function cellValue(row: Row, key: string): unknown {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, row);
}

export function DataTable<T extends Row>({
  columns,
  rows,
  loading,
  error,
  onRefresh,
  searchKeys,
  filters = [],
  exportName = "export",
  rowActions,
  toolbarExtra,
  emptyMessage = "No records found.",
  pageSize = 12,
  onRowClick,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(pageSize);

  const keys = searchKeys ?? columns.map((c) => c.key);

  const filterOptions = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const f of filters) {
      map[f.key] =
        f.options ??
        Array.from(
          new Set(
            rows
              .map((r) => cellValue(r, f.key))
              .filter((v) => v !== null && v !== undefined && v !== "")
              .map((v) => String(v)),
          ),
        ).sort();
    }
    return map;
  }, [filters, rows]);

  const processed = React.useMemo(() => {
    let out = [...rows];

    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter((r) =>
        keys.some((k) => {
          const v = cellValue(r, k);
          if (v === null || v === undefined) return false;
          const s = typeof v === "object" ? JSON.stringify(v) : String(v);
          return s.toLowerCase().includes(q);
        }),
      );
    }

    for (const [k, v] of Object.entries(filterValues)) {
      if (!v) continue;
      out = out.filter((r) => String(cellValue(r, k) ?? "") === v);
    }

    if (sort) {
      out.sort((a, b) => {
        const av = cellValue(a, sort.key);
        const bv = cellValue(b, sort.key);
        const an = Number(av);
        const bn = Number(bv);
        let cmp: number;
        if (Number.isFinite(an) && Number.isFinite(bn) && av !== "" && bv !== "") {
          cmp = an - bn;
        } else {
          cmp = String(av ?? "").localeCompare(String(bv ?? ""));
        }
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }

    return out;
  }, [rows, query, filterValues, sort, keys]);

  React.useEffect(() => {
    setPage(1);
  }, [query, filterValues, size, rows.length]);

  const totalPages = Math.max(1, Math.ceil(processed.length / size));
  const current = Math.min(page, totalPages);
  const paged = processed.slice((current - 1) * size, current * size);

  const activeFilterCount = Object.values(filterValues).filter(Boolean).length + (query ? 1 : 0);

  function handleExport() {
    const headers = columns.map((c) => ({ key: c.key, label: c.label }));
    const data = processed.map((r) => {
      const obj: Record<string, unknown> = {};
      for (const c of columns) {
        obj[c.key] = c.exportValue ? c.exportValue(r) : cellValue(r, c.key);
      }
      return obj;
    });
    downloadCsv(exportName, data, headers);
  }

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  return (
    <div className="rounded-sm border border-border bg-card shadow-flat">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="pl-7"
            aria-label="Search records"
          />
        </div>

        {filters.map((f) => (
          <Select
            key={f.key}
            aria-label={`Filter by ${f.label}`}
            value={filterValues[f.key] ?? ""}
            onChange={(e) =>
              setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))
            }
            className="w-auto min-w-[130px]"
          >
            <option value="">All {f.label.toLowerCase()}</option>
            {(filterOptions[f.key] ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        ))}

        {activeFilterCount > 0 ? (
          <Button
            variant="subtle"
            size="sm"
            onClick={() => {
              setQuery("");
              setFilterValues({});
            }}
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </Button>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {toolbarExtra}
          {onRefresh ? (
            <Button variant="secondary" size="md" onClick={onRefresh} title="Refresh">
              <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
              Refresh
            </Button>
          ) : null}
          <Button variant="secondary" size="md" onClick={handleExport} disabled={!processed.length}>
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-2 border-b border-destructive/25 bg-destructive/8 px-4 py-3 text-[12px] text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/70">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={cn(
                    "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                  )}
                >
                  {c.sortable === false ? (
                    c.label
                  ) : (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-sm uppercase transition-colors hover:text-foreground",
                        sort?.key === c.key && "text-primary",
                      )}
                    >
                      {c.label}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : null}
                    </button>
                  )}
                </th>
              ))}
              {rowActions ? (
                <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading && !rows.length ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2.5">
                      <div className="h-3 w-full max-w-[140px] animate-pulse rounded-sm bg-muted" />
                    </td>
                  ))}
                  {rowActions ? <td /> : null}
                </tr>
              ))
            ) : paged.length ? (
              paged.map((row, i) => (
                <tr
                  key={String(row['id'] ?? i)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-border transition-colors hover:bg-accent/50",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3 py-2 align-middle text-foreground",
                        c.align === "right" && "text-right tabular-nums",
                        c.align === "center" && "text-center",
                      )}
                    >
                      {c.render ? c.render(row) : renderPlain(cellValue(row, c.key))}
                    </td>
                  ))}
                  {rowActions ? (
                    <td className="px-3 py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">{rowActions(row)}</div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-3 py-14">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Inbox className="h-7 w-7" />
                    <p className="text-[13px]">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-[12px] text-muted-foreground">
        <span>
          {processed.length ? (current - 1) * size + 1 : 0}–
          {Math.min(current * size, processed.length)} of {processed.length}
          {processed.length !== rows.length ? ` (filtered from ${rows.length})` : ""}
        </span>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Rows per page"
            value={String(size)}
            onChange={(e) => setSize(Number(e.target.value))}
            className="h-7 w-auto"
          >
            {[12, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            variant="secondary"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </Button>
          <span className="tabular-nums">
            Page {current} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="secondary"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderPlain(v: unknown): React.ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-muted-foreground">—</span>;
  if (Array.isArray(v)) {
    return <span className="text-muted-foreground">{v.length} item{v.length === 1 ? "" : "s"}</span>;
  }
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if (obj['name']) return String(obj['name']);
    if (obj['title']) return String(obj['title']);
    if (obj['label']) return String(obj['label']);
    if (obj['item']) return String(obj['item']);
    const vals = Object.values(obj).filter((x) => typeof x !== "object");
    return <span className="text-muted-foreground">{vals.join(", ") || "—"}</span>;
  }
  return String(v);
}
