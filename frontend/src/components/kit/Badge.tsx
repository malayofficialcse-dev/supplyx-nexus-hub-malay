import * as React from "react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

const toneClass: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground border-border",
  info: "bg-accent text-accent-foreground border-accent-foreground/20",
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/18 text-warning-foreground border-warning/40",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  accent: "bg-primary/10 text-primary border-primary/25",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONES: { match: RegExp; tone: Tone }[] = [
  { match: /(approved|completed|complete|paid|delivered|active|received|awarded|closed won|matched|success|in stock)/i, tone: "success" },
  { match: /(pending|awaiting|draft|open|in review|submitted|processing|in transit|partial|scheduled)/i, tone: "warning" },
  { match: /(rejected|cancelled|canceled|failed|overdue|blocked|inactive|expired|out of stock)/i, tone: "danger" },
  { match: /(sent|issued|ordered|shipped|published|new|quoted)/i, tone: "info" },
];

export function statusTone(status: unknown): Tone {
  const s = String(status ?? "");
  for (const entry of STATUS_TONES) if (entry.match.test(s)) return entry.tone;
  return "neutral";
}

export function StatusBadge({ status }: { status: unknown }) {
  const label = String(status ?? "").replace(/[_-]+/g, " ");
  if (!label) return <span className="text-muted-foreground">—</span>;
  return <Badge tone={statusTone(status)}>{label}</Badge>;
}
