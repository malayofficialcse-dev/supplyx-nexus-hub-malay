import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md border text-[13px] font-semibold leading-none transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:focus-ring whitespace-nowrap active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "border-primary/80 bg-primary text-primary-foreground shadow-xs shadow-primary/20 hover:bg-primary-hover hover:shadow-sm hover:shadow-primary/30",
        secondary:
          "border-border bg-surface text-foreground shadow-xs hover:bg-secondary hover:border-border-strong active:bg-muted",
        subtle:
          "border-transparent bg-transparent text-foreground hover:bg-muted/80 hover:text-foreground",
        link: "border-transparent bg-transparent text-primary underline-offset-2 hover:underline px-0",
        danger:
          "border-destructive/80 bg-destructive text-destructive-foreground shadow-xs shadow-destructive/20 hover:opacity-95 hover:shadow-sm hover:shadow-destructive/30",
        dangerOutline:
          "border-border bg-surface text-destructive hover:bg-destructive/10 hover:border-destructive/40",
      },
      size: {
        sm: "h-7.5 px-2.5 text-[12px]",
        md: "h-8.5 px-3.5",
        lg: "h-9.5 px-4 text-sm",
        icon: "h-8.5 w-8.5 px-0",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
