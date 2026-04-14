"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  ClipboardList,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Beginner Path", href: "/beginner", icon: GraduationCap },
  { label: "Topic Practice", href: "/topics", icon: MessageSquare },
  { label: "Full Test", href: "/test", icon: ClipboardList },
  { label: "Vocabulary", href: "/vocabulary", icon: BookOpen },
];

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onLogout?: () => void;
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0",
        "bg-[#0F172A] border-r border-white/5",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5 border-b border-white/5",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-900/30">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm text-white tracking-tight truncate">
            IELTS Speak AI
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                "transition-all duration-200 group relative",
                isActive
                  ? "bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white shadow-md shadow-blue-900/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon
                className={cn(
                  "shrink-0 w-5 h-5 transition-transform duration-200",
                  !isActive && "group-hover:scale-110"
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}

              {/* Active indicator dot */}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className={cn(
          "mx-auto mb-2 flex items-center justify-center",
          "w-8 h-8 rounded-full border border-white/10 bg-white/5",
          "text-slate-400 hover:text-slate-100 hover:bg-white/10",
          "transition-all duration-200"
        )}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* User section */}
      <div className={cn("border-t border-white/5 p-3", collapsed && "px-1")}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2",
            collapsed && "justify-center"
          )}
        >
          <Avatar.Root className="shrink-0 w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/10">
            <Avatar.Image
              src={user?.image ?? undefined}
              alt={user?.name ?? "User"}
              className="w-full h-full object-cover"
            />
            <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </Avatar.Fallback>
          </Avatar.Root>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-100 truncate">
                {user?.name ?? "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.email ?? ""}
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={onLogout}
              aria-label="Logout"
              className="shrink-0 p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={onLogout}
            aria-label="Logout"
            className="mt-1 w-full flex justify-center p-2 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
