import * as React from "react";
import { cn } from "@/lib/utils.js";

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

const toneClass: Record<Tone, { container: string; dot: string }> = {
  neutral: {
    container: "bg-secondary text-secondary-foreground border-border/80",
    dot: "bg-muted-foreground",
  },
  info: {
    container: "bg-blue-500/10 text-blue-600 border-blue-500/25",
    dot: "bg-blue-500",
  },
  success: {
    container: "bg-emerald-500/10 text-emerald-600 border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  warning: {
    container: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    dot: "bg-amber-500",
  },
  danger: {
    container: "bg-rose-500/10 text-rose-600 border-rose-500/25",
    dot: "bg-rose-500",
  },
  accent: {
    container: "bg-primary/10 text-primary border-primary/30",
    dot: "bg-primary",
  },
};

export function Badge({
  tone = "neutral",
  children,
  className,
  showDot = true,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
}) {
  const currentTone = toneClass[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shadow-xs transition-colors",
        currentTone.container,
        className,
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0 shadow-xs", currentTone.dot)} />
      )}
      <span>{children}</span>
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
