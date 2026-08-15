import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-sm border border-border bg-card shadow-flat", className)}>
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
    <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
      <div>
        <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>
        {subtitle ? (
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
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
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[20px] font-semibold leading-tight text-foreground">{title}</h1>
        {description ? (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
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
  const bar = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-destructive",
  }[tone];

  return (
    <Card className="relative overflow-hidden">
      <span className={cn("absolute inset-y-0 left-0 w-[3px]", bar)} />
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-[22px] font-semibold leading-none text-foreground">{value}</p>
          {hint ? <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p> : null}
        </div>
        {icon ? <div className="text-primary">{icon}</div> : null}
      </div>
    </Card>
  );
}
