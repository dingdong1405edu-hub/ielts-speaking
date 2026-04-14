"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    // Base layout & typography
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg font-medium text-sm",
    // Transitions
    "transition-all duration-200 ease-in-out",
    // Focus ring
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)]",
    // Disabled
    "disabled:pointer-events-none disabled:opacity-50",
    // Press feedback
    "active:scale-[0.97]",
    // Cursor
    "cursor-pointer select-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-blue-600 text-white shadow-sm",
          "hover:bg-blue-700 hover:shadow-md",
          "focus-visible:ring-blue-500",
        ],
        outline: [
          "border border-[var(--border-strong)] bg-transparent text-[var(--text-primary)]",
          "hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-strong)]",
          "focus-visible:ring-[var(--text-secondary)]",
        ],
        ghost: [
          "bg-transparent text-[var(--text-secondary)]",
          "hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)]",
          "focus-visible:ring-[var(--text-secondary)]",
        ],
        destructive: [
          "bg-red-600 text-white shadow-sm",
          "hover:bg-red-700 hover:shadow-md",
          "focus-visible:ring-red-500",
        ],
        success: [
          "bg-emerald-600 text-white shadow-sm",
          "hover:bg-emerald-700 hover:shadow-md",
          "focus-visible:ring-emerald-500",
        ],
        premium: [
          "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm",
          "hover:from-amber-600 hover:to-orange-600 hover:shadow-md",
          "focus-visible:ring-amber-500",
        ],
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
