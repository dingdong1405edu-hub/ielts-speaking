"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Menu,
  X,
  LayoutDashboard,
  MessageSquare,
  ClipboardList,
  BookOpen,
  Flame,
} from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  streak?: number;
  onLogout?: () => void;
}

const bottomTabs = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Practice", href: "/topics", icon: MessageSquare },
  { label: "Test", href: "/test", icon: ClipboardList },
  { label: "Vocab", href: "/vocabulary", icon: BookOpen },
];

export function Navbar({ user, streak = 0, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Close drawer on route change
  React.useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Top bar — mobile only */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-[#0F172A]/90 backdrop-blur-md border-b border-white/5">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] flex items-center justify-center shadow-md shadow-blue-900/30">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">
            IELTS Speak AI
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Streak counter */}
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{streak}</span>
            </div>
          )}

          {/* User avatar */}
          <Avatar.Root className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/10 cursor-pointer">
            <Avatar.Image
              src={user?.image ?? undefined}
              alt={user?.name ?? "User"}
              className="w-full h-full object-cover"
            />
            <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </Avatar.Fallback>
          </Avatar.Root>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-all duration-200"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer — renders the sidebar at full width */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-40 w-64",
          "transform transition-transform duration-300 ease-in-out",
          menuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar user={user} onLogout={onLogout} />
      </div>

      {/* Bottom tab bar — mobile only */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center bg-[#0F172A]/95 backdrop-blur-md border-t border-white/5 h-16 safe-area-inset-bottom">
        {bottomTabs.map(({ label, href, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5",
                "transition-all duration-200",
                isActive ? "text-[#3B82F6]" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )}
              />
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6]" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
