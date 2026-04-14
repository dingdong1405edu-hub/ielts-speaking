"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the overlay, close button, or Escape key is pressed */
  onClose: () => void;
  /** Dialog title — required for accessibility */
  title: string;
  /** Optional subtitle / description shown below the title */
  description?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Max-width variant */
  size?: ModalSize;
  /** Additional className on the panel */
  className?: string;
}

// ---------------------------------------------------------------------------
// Size → max-width map
// ---------------------------------------------------------------------------

const sizeMap: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* ---- Backdrop ---- */}
            <Dialog.Overlay asChild>
              <motion.div
                key="modal-overlay"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.2 }}
                className={cn(
                  "fixed inset-0 z-50",
                  // Dark translucent overlay with backdrop blur
                  "bg-black/60 backdrop-blur-sm"
                )}
              />
            </Dialog.Overlay>

            {/* ---- Panel ---- */}
            <Dialog.Content asChild>
              <motion.div
                key="modal-panel"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  // Positioning — centered, scrollable on mobile
                  "fixed inset-0 z-50 flex items-center justify-center p-4",
                  // We use a wrapper div pattern so the overlay sits behind
                  "pointer-events-none"
                )}
              >
                <div
                  className={cn(
                    "pointer-events-auto w-full",
                    // Surface
                    "bg-[var(--bg-card)]",
                    "border border-[var(--border)]",
                    "shadow-[var(--shadow-md)]",
                    // Layout
                    "max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden",
                    // Mobile: full-width, no rounded corners
                    "rounded-none",
                    // sm+: constrained width with rounded corners
                    "sm:rounded-xl",
                    sizeMap[size],
                    className
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 p-6 pb-0 shrink-0">
                    <div className="flex flex-col gap-1">
                      <Dialog.Title className="text-lg font-semibold leading-snug text-[var(--text-primary)]">
                        {title}
                      </Dialog.Title>
                      {description && (
                        <Dialog.Description className="text-sm text-[var(--text-secondary)]">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>

                    {/* Close button */}
                    <Dialog.Close asChild>
                      <button
                        onClick={onClose}
                        aria-label="Close dialog"
                        className={cn(
                          "shrink-0 rounded-lg p-1.5 -mr-1 -mt-1",
                          "text-[var(--text-muted)]",
                          "hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]",
                          "transition-colors duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        )}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* Body — scrollable when content overflows */}
                  <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {children}
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export { Modal };
