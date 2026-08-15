import * as React from "react";
import { cn } from "@/lib/utils";

const base =
  "h-8 w-full rounded-sm border border-input bg-surface px-2.5 text-[13px] text-foreground placeholder:text-muted-foreground transition-colors focus-visible:focus-ring focus-visible:border-primary disabled:opacity-60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, "h-auto min-h-20 py-2 leading-5", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(base, "cursor-pointer appearance-none bg-no-repeat pr-7", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23616161' stroke-width='2'><path d='m6 9 6 6 6-6'/></svg>\")",
      backgroundPosition: "right 8px center",
    }}
    {...props}
  />
));
Select.displayName = "Select";

export function Field({
  label,
  required,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean | undefined;
  hint?: string | undefined;
  error?: string | undefined;
  children: React.ReactNode;
  className?: string | undefined;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[12px] font-semibold text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </span>
      {children}
      {hint && !error ? (
        <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
      {error ? <span className="mt-1 block text-[11px] text-destructive">{error}</span> : null}
    </label>
  );
}
