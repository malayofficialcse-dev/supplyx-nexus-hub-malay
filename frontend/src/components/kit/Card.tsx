import * as React from "react";
import { cn } from "@/lib/utils.js";

export function Card({
  className,
  children,
}: {
  className?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-md border border-border/80 bg-card shadow-xs transition-shadow hover:shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  subtitle,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: React.ReactNode | undefined;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 bg-muted/20">
      <div>
        <h2 className="text-[13px] font-semibold text-foreground tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string | undefined;
  actions?: React.ReactNode | undefined;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-border/40 pb-4">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string | undefined;
  icon?: React.ReactNode | undefined;
  tone?: "default" | "success" | "warning" | "danger" | undefined;
}) {
  const toneStyles = {
    default: {
      bar: "bg-primary",
      iconBg: "bg-primary/10 text-primary border-primary/20",
    },
    success: {
      bar: "bg-emerald-500",
      iconBg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    warning: {
      bar: "bg-amber-500",
      iconBg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    danger: {
      bar: "bg-rose-500",
      iconBg: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    },
  }[tone];

  return (
    <Card className="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-200">
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", toneStyles.bar)} />
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-[24px] font-bold leading-tight text-foreground tracking-tight">{value}</p>
          {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md border shadow-xs transition-transform group-hover:scale-105", toneStyles.iconBg)}>
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
