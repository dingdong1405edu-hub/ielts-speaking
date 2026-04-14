export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (!user || user.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-surface">
      {/* Admin top bar */}
      <header className="sticky top-0 z-50 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-lg">🔔</span>
              <span className="font-black text-sm">DingDongHSK</span>
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">ADMIN</span>
            </Link>
            <nav className="flex items-center gap-1">
              <NavLink href="/admin">Tổng quan</NavLink>
              <NavLink href="/admin/vocabulary">Từ vựng</NavLink>
              <NavLink href="/admin/grammar">Ngữ pháp</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">{session.user.email}</span>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Về app &rarr;
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
    >
      {children}
    </Link>
  )
}
