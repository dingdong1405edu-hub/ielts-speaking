import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    // Base layout
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5",
    "text-xs font-medium leading-none",
    // Smooth color transitions
    "transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        // Blue — default brand color
        default: [
          "bg-blue-100 text-blue-700",
          "dark:bg-blue-900/40 dark:text-blue-300",
        ],
        // Emerald — success / good score
        success: [
          "bg-emerald-100 text-emerald-700",
          "dark:bg-emerald-900/40 dark:text-emerald-300",
        ],
        // Amber — caution / warning
        warning: [
          "bg-amber-100 text-amber-700",
          "dark:bg-amber-900/40 dark:text-amber-300",
        ],
        // Red — error / danger
        danger: [
          "bg-red-100 text-red-700",
          "dark:bg-red-900/40 dark:text-red-300",
        ],
        // Border only — neutral / secondary
        outline: [
          "border border-[var(--border-strong)] text-[var(--text-secondary)] bg-transparent",
        ],
        // Gradient — premium / special feature
        premium: [
          "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
          "shadow-sm",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
