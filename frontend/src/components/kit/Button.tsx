import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-sm border text-[13px] font-semibold leading-none transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:focus-ring whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-primary text-primary-foreground hover:bg-primary-hover hover:border-primary-hover",
        secondary:
          "border-input bg-surface text-foreground hover:bg-secondary active:bg-muted",
        subtle:
          "border-transparent bg-transparent text-foreground hover:bg-secondary",
        link: "border-transparent bg-transparent text-primary underline-offset-2 hover:underline px-0",
        danger:
          "border-destructive bg-destructive text-destructive-foreground hover:opacity-90",
        dangerOutline:
          "border-input bg-surface text-destructive hover:bg-destructive/8 hover:border-destructive",
      },
      size: {
        sm: "h-7 px-2.5",
        md: "h-8 px-3",
        lg: "h-9 px-4 text-sm",
        icon: "h-8 w-8 px-0",
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
