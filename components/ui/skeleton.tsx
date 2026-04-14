import * as React from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * When provided, renders `lines` stacked skeleton rows that mimic a
   * paragraph of text. The last line is narrower for realism.
   */
  lines?: number;
  /**
   * Makes the skeleton a full circle — useful for avatars.
   * Ignored when `lines` is set.
   */
  rounded?: boolean;
}

// ---------------------------------------------------------------------------
// Single skeleton block
// ---------------------------------------------------------------------------

function SkeletonBlock({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Base surface
        "relative overflow-hidden",
        "bg-[var(--bg-card)]",
        "border border-[var(--border)]",
        // Shimmer pseudo-element is defined in globals.css (.skeleton class)
        // We replicate the shimmer inline here so no global class is required
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-white/[0.06] before:to-transparent",
        "before:animate-[shimmer_1.8s_linear_infinite]",
        "before:bg-[length:200%_100%]",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Skeleton — exported component
// ---------------------------------------------------------------------------

/**
 * Skeleton loading placeholder.
 *
 * Usage:
 *   // Single block
 *   <Skeleton className="h-10 w-full rounded-lg" />
 *
 *   // Paragraph of text lines
 *   <Skeleton lines={3} />
 *
 *   // Avatar circle
 *   <Skeleton rounded className="h-12 w-12" />
 */
function Skeleton({ className, lines, rounded, ...props }: SkeletonProps) {
  // Multi-line text skeleton
  if (lines && lines > 0) {
    return (
      <div
        className={cn("flex flex-col gap-2 w-full", className)}
        aria-busy="true"
        aria-label="Loading…"
        {...props}
      >
        {Array.from({ length: lines }).map((_, i) => {
          // Last line is shorter to look natural
          const isLast = i === lines - 1;
          return (
            <SkeletonBlock
              key={i}
              className={cn(
                "h-4 rounded-md",
                isLast ? "w-3/5" : "w-full"
              )}
            />
          );
        })}
      </div>
    );
  }

  // Single block (default)
  return (
    <SkeletonBlock
      aria-busy="true"
      aria-label="Loading…"
      className={cn(
        // Default dimensions — caller typically overrides via className
        "h-4 w-full",
        rounded ? "rounded-full" : "rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
