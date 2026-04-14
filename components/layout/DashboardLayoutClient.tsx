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
}

/**
 * Thin client wrapper around DashboardLayout.
 *
 * Exists solely to call next-auth's client-side `signOut` so that the
 * parent Server Component (`app/(dashboard)/layout.tsx`) can remain a
 * pure Server Component.
 */
export function DashboardLayoutClient({
  children,
  user,
}: DashboardLayoutClientProps) {
  function handleLogout() {
    signOut({ callbackUrl: "/login", redirect: true });
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}
