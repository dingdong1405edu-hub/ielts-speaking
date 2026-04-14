import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
    "transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white",
        ],
        success: [
          "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30",
        ],
        warning: [
          "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        ],
        danger: [
          "bg-red-500/20 text-red-400 border border-red-500/30",
        ],
        outline: [
          "border border-slate-600 text-slate-300 bg-transparent",
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
