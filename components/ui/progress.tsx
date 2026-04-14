"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  label?: string;
  showValue?: boolean;
  gradient?: "blue" | "emerald" | "amber" | "custom";
  indicatorClassName?: string;
}

const gradientMap = {
  blue: "from-[#1E3A8A] to-[#3B82F6]",
  emerald: "from-[#059669] to-[#10B981]",
  amber: "from-amber-600 to-amber-400",
  custom: "",
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    {
      className,
      value,
      label,
      showValue = false,
      gradient = "blue",
      indicatorClassName,
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value ?? 0));

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && (
              <span className="text-sm font-medium text-slate-300">{label}</span>
            )}
            {showValue && (
              <span className="text-xs font-semibold text-slate-400">
                {Math.round(clampedValue)}%
              </span>
            )}
          </div>
        )}
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-800",
            className
          )}
          value={clampedValue}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
              "shadow-sm",
              gradientMap[gradient],
              indicatorClassName
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </ProgressPrimitive.Root>
      </div>
    );
  }
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
