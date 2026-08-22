export function formatCurrency(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value: unknown, digits = 0): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatDate(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
}

export function formatDateTime(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function titleCase(value: unknown): string {
  const s = String(value ?? "").replace(/[_-]+/g, " ").trim();
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function toCsv(rows: Record<string, unknown>[], headers: { key: string; label: string }[]) {
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = headers.map((h) => escape(h.label)).join(",");
  const body = rows.map((r) => headers.map((h) => escape(r[h.key])).join(",")).join("\n");
  return `${head}\n${body}`;
}

function downloadWorkbook(filename: string, workbook: XLSX.WorkBook) {
  const bytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadExcel(
  filename: string,
  rows: Record<string, unknown>[],
  headers: { key: string; label: string }[],
) {
  const value = (raw: unknown) => raw === null || raw === undefined ? "" : typeof raw === "object" ? JSON.stringify(raw) : raw;
  const sheet = XLSX.utils.aoa_to_sheet([
    headers.map((header) => header.label),
    ...rows.map((row) => headers.map((header) => value(row[header.key]))),
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Export");
  downloadWorkbook(filename, workbook);
}

export function downloadExcelMatrix(filename: string, rows: unknown[][], sheetName = "Report") {
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31));
  downloadWorkbook(filename, workbook);
}
import * as XLSX from "xlsx";
