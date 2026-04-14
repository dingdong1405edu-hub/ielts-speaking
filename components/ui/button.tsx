"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium",
    "transition-all duration-200 ease-in-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white shadow-md",
          "hover:from-[#1e40af] hover:to-[#60a5fa] hover:shadow-blue-500/30 hover:shadow-lg",
          "focus-visible:ring-blue-500",
        ],
        outline: [
          "border border-[#3B82F6] text-[#3B82F6] bg-transparent",
          "hover:bg-[#3B82F6]/10 hover:shadow-sm",
          "dark:border-[#3B82F6] dark:text-[#3B82F6]",
          "focus-visible:ring-blue-500",
        ],
        ghost: [
          "bg-transparent text-slate-700 dark:text-slate-300",
          "hover:bg-slate-100 dark:hover:bg-slate-800",
          "focus-visible:ring-slate-400",
        ],
        destructive: [
          "bg-red-600 text-white shadow-md",
          "hover:bg-red-700 hover:shadow-red-500/30 hover:shadow-lg",
          "focus-visible:ring-red-500",
        ],
        success: [
          "bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-md",
          "hover:from-[#047857] hover:to-[#34d399] hover:shadow-emerald-500/30 hover:shadow-lg",
          "focus-visible:ring-emerald-500",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
