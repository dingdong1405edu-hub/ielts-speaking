"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProgressVariant = "default" | "success" | "warning";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value 0–100 */
  value?: number;
  /** Color variant for the filled bar */
  variant?: ProgressVariant;
  /** Accessible label for screen readers */
  label?: string;
  /** Show the numeric percentage to the right */
  showValue?: boolean;
}

// ---------------------------------------------------------------------------
// Variant → Tailwind fill class map
// ---------------------------------------------------------------------------

const fillVariants: Record<ProgressVariant, string> = {
  default: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
};

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      variant = "default",
      label,
      showValue = false,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value ?? 0));

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
        {/* Optional label + value row */}
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-xs font-semibold tabular-nums text-[var(--text-muted)]">
                {Math.round(clampedValue)}%
              </span>
            )}
          </div>
        )}

        {/* Track */}
        <div
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
          className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-card)]"
          style={{ border: "1px solid var(--border)" }}
        >
          {/* Fill — CSS transition on width for smooth animated mount */}
          <div
            className={cn(
              "h-full rounded-full shadow-sm",
              "transition-[width] duration-700 ease-out",
              fillVariants[variant]
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
export type { ProgressProps, ProgressVariant };
