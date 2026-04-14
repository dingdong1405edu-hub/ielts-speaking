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
  streak?: number;
  onLogout?: () => void;
}

export function DashboardLayout({
  children,
  user,
  streak,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="dark min-h-screen bg-[#0F172A] text-slate-100 font-sans">
      {/* Desktop: side-by-side layout */}
      <div className="flex">
        {/* Sidebar — hidden on mobile, visible md+ */}
        <Sidebar user={user} onLogout={onLogout} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* Mobile top bar + bottom tabs */}
          <Navbar user={user} streak={streak} onLogout={onLogout} />

          {/* Page content */}
          <main className="flex-1 px-4 py-6 md:px-6 md:py-8 lg:px-8 overflow-auto pb-20 md:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
