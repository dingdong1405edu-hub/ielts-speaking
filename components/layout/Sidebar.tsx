'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, BookOpen, FileText, Headphones,
  Mic, Book, PenTool, Trophy, History, LogOut, UserCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { calculateLevel } from '@/lib/utils'

interface SidebarUser {
  id: string
  name: string | null
  email: string
  image: string | null
  xp: number
  streak: number
}

interface SidebarProps {
  user: SidebarUser
}

const navItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/vocabulary', label: 'Từ vựng', icon: BookOpen },
  { href: '/grammar', label: 'Ngữ pháp', icon: FileText },
  { href: '/listening', label: 'Luyện nghe', icon: Headphones },
  { href: '/speaking', label: 'Luyện nói', icon: Mic },
  { href: '/reading', label: 'Luyện đọc', icon: Book },
  { href: '/writing', label: 'Luyện viết', icon: PenTool },
  { href: '/exam', label: 'Luyện thi', icon: Trophy },
  { href: '/history', label: 'Lịch sử', icon: History },
  { href: '/profile', label: 'Hồ sơ', icon: UserCircle },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { level, progress } = calculateLevel(user.xp)

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-white border-r border-border/60 flex-col z-40 hidden md:flex">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white shadow-sm">
          <span className="font-bold text-sm">D</span>
        </div>
        <span className="font-extrabold text-lg tracking-tight">
          DingDong<span className="text-primary">HSK</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground/60 hover:bg-surface hover:text-foreground'
                  )}
                >
                  <Icon className={cn('w-[18px] h-[18px]', isActive ? 'text-primary' : 'text-foreground/40')} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-border/60 space-y-3">
        {/* Stats row */}
        <div className="flex items-center justify-between px-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-orange-500">🔥</span>
            <span className="font-semibold text-foreground">{user.streak}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-500 text-[10px]">⚡</span>
            <span className="font-semibold text-foreground">{user.xp} XP</span>
          </div>
          <span className="font-semibold text-primary text-[11px]">Lv.{level}</span>
        </div>

        {/* XP bar */}
        <div className="px-3">
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-surface transition-colors">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user.image ?? ''} />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {(user.name?.[0] ?? user.email[0]).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-foreground">{user.name ?? user.email}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-muted-foreground hover:bg-danger/5 hover:text-danger transition-colors font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
