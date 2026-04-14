"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Headphones,
  Menu,
  X,
  LayoutDashboard,
  Map,
  MessageSquare,
  FileText,
  BookOpen,
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const drawerNavItems = [
  { label: "Dashboard",      href: "/dashboard",  icon: LayoutDashboard },
  { label: "Beginner Path",  href: "/beginner",   icon: Map             },
  { label: "Topic Practice", href: "/practice",   icon: MessageSquare   },
  { label: "Full Test",      href: "/full-test",  icon: FileText        },
  { label: "Vocabulary",     href: "/vocabulary", icon: BookOpen        },
];

const bottomTabs = [
  { label: "Home",     href: "/dashboard",  icon: LayoutDashboard },
  { label: "Beginner", href: "/beginner",   icon: Map             },
  { label: "Test",     href: "/full-test",  icon: FileText        },
  { label: "Vocab",    href: "/vocabulary", icon: BookOpen        },
  { label: "Practice", href: "/practice",   icon: MessageSquare   },
];

interface NavbarProps {
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

export function Navbar({ user, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // Close drawer on navigation
  React.useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll while drawer is open
  React.useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      {/* ----------------------------------------------------------------- */}
      {/* Top bar — mobile only                                              */}
      {/* ----------------------------------------------------------------- */}
      <header
        className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14
          bg-[var(--bg-base)]/90 backdrop-blur-md
          border-b border-[var(--border)]
          transition-colors duration-200"
      >
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2" aria-label="Home">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center shadow-md">
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
            IELTS Speak AI
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            className="flex items-center justify-center w-8 h-8 rounded-lg
              text-[var(--text-muted)] hover:text-[var(--text-primary)]
              hover:bg-[var(--bg-card-hover)]
              transition-colors duration-200"
          >
            {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Drawer overlay                                                     */}
      {/* ----------------------------------------------------------------- */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Slide-in drawer                                                    */}
      {/* ----------------------------------------------------------------- */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-72",
          "flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "var(--sidebar-bg)" }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-white tracking-tight">
              IELTS Speak AI
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {drawerNavItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                  "border-l-2 transition-colors duration-200",
                  isActive
                    ? "border-blue-500 bg-[rgba(59,130,246,0.12)] text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5"
                )}
              >
                <Icon className="shrink-0 w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer — user + theme + logout */}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="shrink-0 w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10 bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
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
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email ?? ""}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle className="text-slate-400 hover:text-slate-200" />
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                onLogout?.();
              }}
              className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg text-sm
                text-slate-400 hover:text-red-400 hover:bg-red-400/10
                transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Bottom tab bar — mobile only                                       */}
      {/* ----------------------------------------------------------------- */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40
          flex items-stretch
          bg-[var(--bg-base)]/95 backdrop-blur-md
          border-t border-[var(--border)]
          h-16 pb-safe
          transition-colors duration-200"
      >
        {bottomTabs.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 relative",
                "transition-colors duration-200",
                isActive
                  ? "text-blue-500"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              {/* Active indicator line at top */}
              {isActive && (
                <span className="absolute top-0 inset-x-3 h-0.5 rounded-b-full bg-blue-500" />
              )}
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
