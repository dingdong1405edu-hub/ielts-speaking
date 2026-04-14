"use client";

import { signOut } from "next-auth/react";

/**
 * Thin client wrapper that calls next-auth signOut.
 * Rendered invisibly — DashboardLayout's Sidebar/Navbar receive
 * `onLogout` via props set here.
 *
 * This component exists so the Server Component dashboard layout can
 * delegate the client-side signOut action without becoming a Client Component.
 */
export function SignOutButton() {
  // This component renders nothing — it is a no-op placeholder.
  // The logout action is wired directly in DashboardLayout via
  // the onLogout prop pattern used by Sidebar and Navbar.
  return null;
}

/**
 * Standalone logout handler — import this in any Client Component
 * that needs to trigger sign-out (e.g. a custom logout button).
 */
export function useLogout() {
  return () =>
    signOut({
      callbackUrl: "/login",
      redirect: true,
    });
}
