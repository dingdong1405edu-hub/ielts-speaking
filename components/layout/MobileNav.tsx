'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Trophy, History, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/vocabulary', label: 'Từ vựng', icon: BookOpen },
  { href: '/speaking', label: 'Nói', icon: Mic },
  { href: '/exam', label: 'Thi', icon: Trophy },
  { href: '/history', label: 'Lịch sử', icon: History },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-border/40 z-40 md:hidden safe-area-bottom">
      <ul className="flex items-center justify-around h-16 px-1">
        {mobileNavItems.map((item) => {
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
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                  isActive ? 'text-primary' : 'text-foreground/40'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
