"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Headphones,
  LayoutDashboard,
  Map,
  MessageSquare,
  FileText,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types & data
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard",     href: "/dashboard",  icon: LayoutDashboard },
  { label: "Beginner Path", href: "/beginner",   icon: Map             },
  { label: "Topic Practice",href: "/topics",     icon: MessageSquare   },
  { label: "Full Test",     href: "/test",       icon: FileText        },
  { label: "Vocabulary",    href: "/vocabulary", icon: BookOpen        },
];

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onLogout?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      style={{ backgroundColor: "var(--sidebar-bg)" }}
      className={cn(
        /* always dark navy, hidden on mobile */
        "hidden md:flex flex-col h-screen sticky top-0 z-30",
        "border-r border-white/5",
        "transition-[width] duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Logo                                                               */}
      {/* ----------------------------------------------------------------- */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-white/5",
          collapsed ? "justify-center px-0 py-5" : "px-5 py-5"
        )}
      >
        {/* Gradient circle with headphones */}
        <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <Headphones className="w-5 h-5 text-white" />
        </div>

        {!collapsed && (
          <span className="font-bold text-sm tracking-tight truncate text-white">
            IELTS Speak AI
          </span>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Nav items                                                          */}
      {/* ----------------------------------------------------------------- */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg text-sm font-medium",
                "transition-colors duration-200 group relative",
                collapsed ? "justify-center px-0 py-2.5 mx-1" : "px-3 py-2.5",
                isActive
                  ? /* active: blue left border + tinted bg */
                    "border-l-2 border-blue-500 bg-[rgba(59,130,246,0.12)] text-blue-400"
                  : "border-l-2 border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5"
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 w-5 h-5 transition-transform duration-200",
                  !isActive && "group-hover:scale-110"
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* Collapse toggle                                                    */}
      {/* ----------------------------------------------------------------- */}
      <div className="px-2 pb-2">
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center justify-center w-full rounded-lg py-2",
            "text-slate-500 hover:text-slate-300 hover:bg-white/5",
            "transition-colors duration-200"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              <span className="text-xs font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Bottom: user + theme toggle + logout                               */}
      {/* ----------------------------------------------------------------- */}
      <div className={cn("border-t border-white/5 p-3", collapsed && "px-1")}>
        {/* User row */}
        <div
          className={cn(
            "flex items-center rounded-lg p-2",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          {/* Avatar */}
          <div className="shrink-0 w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/10 bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user?.name ?? "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user?.name?.[0]?.toUpperCase() ?? "U"}</span>
            )}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">
                {user?.name ?? "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate leading-tight">
                {user?.email ?? ""}
              </p>
            </div>
          )}

          {/* Actions — only shown expanded */}
          {!collapsed && (
            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle className="text-slate-500 hover:text-slate-200" />
              <button
                type="button"
                onClick={onLogout}
                aria-label="Logout"
                className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Collapsed state: show theme + logout as column */}
        {collapsed && (
          <div className="mt-1 flex flex-col items-center gap-1">
            <ThemeToggle className="text-slate-500 hover:text-slate-200" />
            <button
              type="button"
              onClick={onLogout}
              aria-label="Logout"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
