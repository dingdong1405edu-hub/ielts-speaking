import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  /** Rendered as a <label> above the select */
  label?: string;
  /** Option list */
  options: SelectOption[];
  /** Controlled value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Error message shown below */
  error?: string;
  /** Placeholder option shown when no value selected */
  placeholder?: string;
}

// ---------------------------------------------------------------------------
// Select
// ---------------------------------------------------------------------------

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      options,
      value,
      onChange,
      error,
      placeholder,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId =
      id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    const hasError = Boolean(error);

    function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
      onChange?.(e.target.value);
    }

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[var(--text-primary)]"
          >
            {label}
          </label>
        )}

        {/* Wrapper — needed for the custom chevron overlay */}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={hasError && selectId ? `${selectId}-error` : undefined}
            className={cn(
              // Base layout
              "w-full h-10 rounded-lg px-3 pr-9 text-sm",
              // Appearance reset so we can use the custom chevron
              "appearance-none",
              // Theme-aware colors
              "bg-[var(--bg-input)] border border-[var(--border)]",
              "text-[var(--text-primary)]",
              // Transitions
              "transition-all duration-200",
              // Focus
              "outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500",
              // Hover
              "hover:border-[var(--border-strong)]",
              // Disabled
              "disabled:cursor-not-allowed disabled:opacity-50",
              // Error
              hasError &&
                "border-red-500 focus:ring-red-500/50 focus:border-red-500",
              // Cursor
              "cursor-pointer",
              className
            )}
            {...props}
          >
            {/* Placeholder option */}
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </option>
            ))}
          </select>

          {/* Custom chevron — pointer-events-none so clicks pass through */}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "absolute right-3 h-4 w-4 shrink-0 pointer-events-none",
              "text-[var(--text-muted)]",
              "transition-colors duration-150",
              disabled && "opacity-50"
            )}
          />
        </div>

        {/* Error message */}
        {hasError && (
          <p
            id={selectId ? `${selectId}-error` : undefined}
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

Select.displayName = "Select";

export { Select };
