import { AlertCircle, ArrowDown, ArrowUp, Calendar, Download, Inbox, RefreshCw, Search, X } from "lucide-react";
import * as React from "react";
import { Button } from "./Button";
import { Input, Select } from "./Input";
import { downloadExcel } from "@/lib/format";
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

export interface DateFilterDef {
  key: string;
  label: string;
}

interface DataTableProps<T extends Row> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean | undefined;
  error?: string | null | undefined;
  onRefresh?: (() => void) | undefined;
  searchKeys?: string[] | undefined;
  filters?: FilterDef[] | undefined;
  dateFilter?: DateFilterDef | undefined;
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

function toDateOnly(val: unknown): Date | null {
  if (!val) return null;
  const d = new Date(String(val));
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function offsetDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const DATE_PRESETS = [
  { label: "Today", from: todayStr, to: todayStr },
  { label: "Last 7d", from: () => offsetDays(-7), to: todayStr },
  { label: "Last 30d", from: () => offsetDays(-30), to: todayStr },
  {
    label: "This month",
    from: () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    },
    to: todayStr,
  },
  { label: "This year", from: () => `${new Date().getFullYear()}-01-01`, to: todayStr },
  { label: "Next 30d", from: todayStr, to: () => offsetDays(30) },
];

export function DataTable<T extends Row>({
  columns,
  rows,
  loading,
  error,
  onRefresh,
  searchKeys,
  filters = [],
  dateFilter,
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
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");

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

    // Date range filter
    if (dateFilter) {
      if (dateFrom) {
        const from = toDateOnly(dateFrom);
        if (from) {
          out = out.filter((r) => {
            const d = toDateOnly(cellValue(r, dateFilter.key));
            return d !== null && d >= from;
          });
        }
      }
      if (dateTo) {
        const to = toDateOnly(dateTo);
        if (to) {
          out = out.filter((r) => {
            const d = toDateOnly(cellValue(r, dateFilter.key));
            return d !== null && d <= to;
          });
        }
      }
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
  }, [rows, query, filterValues, sort, keys, dateFilter, dateFrom, dateTo]);

  React.useEffect(() => {
    setPage(1);
  }, [query, filterValues, size, rows.length, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(processed.length / size));
  const current = Math.min(page, totalPages);
  const paged = processed.slice((current - 1) * size, current * size);

  const activeDateFilter = !!(dateFrom || dateTo);
  const activeFilterCount =
    Object.values(filterValues).filter(Boolean).length + (query ? 1 : 0) + (activeDateFilter ? 1 : 0);

  function clearAll() {
    setQuery("");
    setFilterValues({});
    setDateFrom("");
    setDateTo("");
  }

  function handleExport() {
    const headers = columns.map((c) => ({ key: c.key, label: c.label }));
    const data = processed.map((r) => {
      const obj: Record<string, unknown> = {};
      for (const c of columns) {
        obj[c.key] = c.exportValue ? c.exportValue(r) : cellValue(r, c.key);
      }
      return obj;
    });
    downloadExcel(exportName, data, headers);
  }

  function toggleSort(key: string) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }

  return (
    <div className="rounded-md border border-border/80 bg-card shadow-xs overflow-hidden">
      {/* ── Main toolbar row ── */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border/70 bg-gradient-to-r from-muted/30 via-indigo-50/20 to-transparent px-3.5 py-3">
        <div className="relative min-w-[220px] flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records…"
            className="pl-8 h-8 text-[12px] bg-surface focus-visible:border-indigo-400/80 focus-visible:ring-indigo-500/20"
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
            className="h-8 text-[12px] w-auto min-w-[140px] bg-surface focus-visible:border-indigo-400/80"
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
            onClick={clearAll}
            className="text-muted-foreground hover:text-foreground hover:bg-indigo-50/50"
          >
            <X className="h-3.5 w-3.5" />
            Clear {activeFilterCount > 1 ? `(${activeFilterCount})` : ""}
          </Button>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {toolbarExtra}
          {onRefresh ? (
            <Button variant="secondary" size="sm" onClick={onRefresh} title="Refresh records">
              <RefreshCw className={cn("h-3.5 w-3.5 mr-1", loading && "animate-spin")} />
              Refresh
            </Button>
          ) : null}
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={!processed.length}>
            <Download className="h-3.5 w-3.5 mr-1" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* ── Date range filter row (only when dateFilter prop is provided) ── */}
      {dateFilter ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-gradient-to-r from-indigo-50/30 via-sky-50/15 to-transparent px-3.5 py-2">
          <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
          <span className="text-[11px] font-semibold text-indigo-700 mr-0.5">
            {dateFilter.label}:
          </span>

          <div className="flex items-center gap-1.5">
            <label
              htmlFor={`date-from-${dateFilter.key}`}
              className="text-[11px] text-muted-foreground font-medium"
            >
              From
            </label>
            <input
              type="date"
              id={`date-from-${dateFilter.key}`}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
              aria-label={`${dateFilter.label} from date`}
              className="h-7 rounded-sm border border-border/80 bg-surface px-2 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400/60 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label
              htmlFor={`date-to-${dateFilter.key}`}
              className="text-[11px] text-muted-foreground font-medium"
            >
              To
            </label>
            <input
              type="date"
              id={`date-to-${dateFilter.key}`}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              aria-label={`${dateFilter.label} to date`}
              className="h-7 rounded-sm border border-border/80 bg-surface px-2 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-400/40 focus:border-indigo-400/60 transition-all"
            />
          </div>

          {/* Quick-select presets */}
          <div className="flex items-center gap-1 ml-1 flex-wrap">
            {DATE_PRESETS.map((p) => {
              const pFrom = p.from();
              const pTo = p.to();
              const active = dateFrom === pFrom && dateTo === pTo;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setDateFrom(pFrom);
                    setDateTo(pTo);
                  }}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold border transition-colors",
                    active
                      ? "bg-indigo-500/15 text-indigo-700 border-indigo-400/40"
                      : "bg-surface text-muted-foreground border-border/60 hover:bg-indigo-50/50 hover:text-indigo-700 hover:border-indigo-400/40",
                  )}
                  aria-label={`Filter by ${p.label}`}
                  aria-pressed={active}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {activeDateFilter ? (
            <button
              type="button"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="ml-1 flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 border border-rose-300/50 bg-rose-50/50 hover:bg-rose-100/50 transition-colors"
              aria-label="Clear date filter"
            >
              <X className="h-2.5 w-2.5" />
              Clear dates
            </button>
          ) : null}

          {activeDateFilter && (
            <span className="ml-auto text-[11px] text-indigo-700 font-semibold bg-indigo-500/10 rounded px-2 py-0.5 border border-indigo-400/25">
              {processed.length} result{processed.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 border-b border-destructive/25 bg-destructive/8 px-4 py-3 text-[12px] text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border/80 bg-gradient-to-r from-muted/50 via-indigo-50/25 to-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={cn(
                    "px-3.5 py-2.5 text-left",
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
                        "inline-flex items-center gap-1.5 uppercase transition-colors hover:text-foreground cursor-pointer select-none",
                        sort?.key === c.key && "text-indigo-600 font-bold",
                      )}
                    >
                      {c.label}
                      {sort?.key === c.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-indigo-600" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />
                        )
                      ) : null}
                    </button>
                  )}
                </th>
              ))}
              {rowActions ? (
                <th className="px-3.5 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {loading && !rows.length ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="hover:bg-muted/10">
                  {columns.map((c) => (
                    <td key={c.key} className="px-3.5 py-3">
                      <div className="h-3.5 w-full max-w-[140px] animate-pulse rounded-sm bg-muted" />
                    </td>
                  ))}
                  {rowActions ? <td /> : null}
                </tr>
              ))
            ) : paged.length ? (
              paged.map((row, i) => (
                <tr
                  key={String(row["id"] ?? i)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "transition-colors hover:bg-indigo-50/25",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-3.5 py-2.5 align-middle text-foreground",
                        c.align === "right" && "text-right tabular-nums",
                        c.align === "center" && "text-center",
                      )}
                    >
                      {c.render ? c.render(row) : renderPlain(cellValue(row, c.key))}
                    </td>
                  ))}
                  {rowActions ? (
                    <td className="px-3.5 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5">{rowActions(row)}</div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 border border-border/80">
                      <Inbox className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-[13px] font-medium text-foreground">{emptyMessage}</p>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      No matching records found. Try adjusting your search query or filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-muted/10 px-3.5 py-2.5 text-[12px] text-muted-foreground">
        <span>
          Showing{" "}
          <span className="font-semibold text-foreground">
            {processed.length ? (current - 1) * size + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-foreground">
            {Math.min(current * size, processed.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">{processed.length}</span> entries
          {processed.length !== rows.length ? ` (filtered from ${rows.length} total)` : ""}
        </span>
        <div className="flex items-center gap-2">
          <Select
            aria-label="Rows per page"
            value={String(size)}
            onChange={(e) => setSize(Number(e.target.value))}
            className="h-7.5 w-auto text-[11px] bg-surface"
          >
            {[12, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} per page
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
          <span className="tabular-nums px-1 font-medium text-foreground">
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
    if (obj["name"]) return String(obj["name"]);
    if (obj["title"]) return String(obj["title"]);
    if (obj["label"]) return String(obj["label"]);
    if (obj["item"]) return String(obj["item"]);
    const vals = Object.values(obj).filter((x) => typeof x !== "object");
    return <span className="text-muted-foreground">{vals.join(", ") || "—"}</span>;
  }
  return String(v);
}
