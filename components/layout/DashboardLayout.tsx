"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Toaster } from "@/components/ui/toaster";

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onLogout?: () => void;
}

/**
 * Top-level dashboard layout shell.
 *
 * Desktop: sidebar (fixed width) + main content area (flex-1).
 * Mobile:  top bar + bottom tab bar from <Navbar>; sidebar hidden.
 */
export function DashboardLayout({
  children,
  user,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: "var(--bg-surface)",
        color: "var(--text-primary)",
      }}
    >
      {/* Desktop sidebar */}
      <Sidebar user={user} onLogout={onLogout} />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile navbar (top bar + drawer + bottom tabs) */}
        <Navbar user={user} onLogout={onLogout} />

        {/* Page content scrolls here */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
