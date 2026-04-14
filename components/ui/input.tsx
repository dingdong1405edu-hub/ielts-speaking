import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rendered as a <label> above the input, linked via htmlFor */
  label?: string;
  /** Displays a red error message below the input and applies error styling */
  error?: string;
  /** Icon rendered on the left side of the input */
  icon?: React.ReactNode;
  /** Icon rendered on the right side of the input */
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", label, error, icon, rightIcon, id, ...props },
    ref
  ) => {
    // Derive a stable id from the label when none is provided
    const inputId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {icon && (
            <span
              aria-hidden="true"
              className="absolute left-3 text-[var(--text-muted)] pointer-events-none flex items-center"
            >
              {icon}
            </span>
          )}

          <input
            id={inputId}
            type={type}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={hasError && inputId ? `${inputId}-error` : undefined}
            className={cn(
              // Base layout
              "w-full h-10 rounded-lg px-3 text-sm",
              // Theme-aware colors
              "bg-[var(--bg-input)] border border-[var(--border)]",
              "text-[var(--text-primary)] placeholder:text-[var(--text-muted)]",
              // Transitions
              "transition-all duration-200",
              // Focus state — clear ring + blue accent border
              "outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
              // Hover nudge
              "hover:border-[var(--border-strong)]",
              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Error override
              hasError &&
                "border-red-500 focus:ring-red-500/50 focus:border-red-500",
              // Padding adjustments for icons
              icon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <span
              aria-hidden="true"
              className="absolute right-3 text-[var(--text-muted)] pointer-events-none flex items-center"
            >
              {rightIcon}
            </span>
          )}
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="text-xs text-red-500 flex items-center gap-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
