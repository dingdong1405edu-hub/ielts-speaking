"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { DashboardLayout } from "./DashboardLayout";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  streak?: number;
}

/**
 * Client-side wrapper for DashboardLayout.
 * Handles signOut (which requires the client-side next-auth/react package)
 * so the Server Component layout.tsx stays a pure Server Component.
 */
export function DashboardLayoutClient({
  children,
  user,
  streak = 0,
}: DashboardLayoutClientProps) {
  function handleLogout() {
    signOut({ callbackUrl: "/login", redirect: true });
  }

  return (
    <DashboardLayout user={user} streak={streak} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}
