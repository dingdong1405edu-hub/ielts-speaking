export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { calculateLevel, getLessonTypeIcon, getLessonTypeLabel, formatRelativeDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const skills = [
  { href: '/vocabulary', label: 'Từ vựng', icon: '📚', desc: 'Flashcard & ôn tập', gradient: 'from-emerald-500 to-teal-600' },
  { href: '/grammar', label: 'Ngữ pháp', icon: '📝', desc: 'Bài học & bài tập', gradient: 'from-indigo-500 to-purple-600' },
  { href: '/listening', label: 'Nghe', icon: '🎧', desc: 'Nghe hiểu', gradient: 'from-amber-500 to-orange-600' },
  { href: '/speaking', label: 'Nói', icon: '🗣️', desc: 'Phát âm AI', gradient: 'from-rose-500 to-pink-600' },
  { href: '/reading', label: 'Đọc', icon: '📖', desc: 'Đọc hiểu', gradient: 'from-sky-500 to-blue-600' },
  { href: '/writing', label: 'Viết', icon: '✏️', desc: 'Viết & sửa', gradient: 'from-violet-500 to-fuchsia-600' },
]

export default async function DashboardPage() {
  const session = await auth()
  if (!session) return null

  const userId = session.user.id

  const [lessonCount, wordCount, recentHistory] = await Promise.all([
    prisma.lessonHistory.count({ where: { userId } }),
    prisma.userProgress.count({ where: { userId, vocabularyId: { not: null } } }),
    prisma.lessonHistory.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: 5,
    }),
  ])

  const { level, progress, nextLevelXp } = calculateLevel(session.user.xp)
  const xpToNext = nextLevelXp - session.user.xp

  return (
    <div className="page-container">
      {/* Welcome + Level */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Chào {session.user.name?.split(' ')[0] ?? 'bạn'} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {session.user.streak > 0
              ? `${session.user.streak} ngày liên tiếp 🔥`
              : 'Bắt đầu hành trình học tiếng Trung!'}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full">
            <span className="text-xs">Lv.{level}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 font-semibold px-3 py-1.5 rounded-full">
            <span className="text-xs">⚡ {session.user.xp} XP</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon="🔥" label="Streak" value={`${session.user.streak}`} sub="ngày" />
        <StatCard icon="⚡" label="Tổng XP" value={`${session.user.xp}`} sub={`còn ${xpToNext} lên cấp`} />
        <StatCard icon="📚" label="Bài học" value={`${lessonCount}`} sub="hoàn thành" />
        <StatCard icon="🧠" label="Từ đã học" value={`${wordCount}`} sub="từ vựng" />
      </div>

      {/* XP Progress */}
      <div className="card p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Tiến độ cấp {level}</span>
          <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Skills Grid */}
      <div className="mb-8">
        <h2 className="font-bold text-sm text-foreground/70 uppercase tracking-wider mb-4">Luyện tập</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {skills.map((skill) => (
            <Link key={skill.href} href={skill.href}>
              <div className="group card-interactive p-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${skill.gradient} flex items-center justify-center text-lg mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                  {skill.icon}
                </div>
                <p className="font-semibold text-sm text-foreground">{skill.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{skill.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent history */}
      {recentHistory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-foreground/70 uppercase tracking-wider">Gần đây</h2>
            <Link href="/history" className="text-primary text-xs font-semibold hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-2">
            {recentHistory.map((h) => (
              <div key={h.id} className="card p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center text-base flex-shrink-0">
                  {getLessonTypeIcon(h.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">{h.title}</p>
                  <p className="text-[11px] text-muted-foreground">{formatRelativeDate(h.completedAt.toISOString())}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  {h.score != null && (
                    <p className="text-sm font-bold text-foreground">{h.score}%</p>
                  )}
                  <p className="text-[11px] text-primary font-semibold">+{h.xpEarned} XP</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentHistory.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="font-bold text-lg mb-2">Bắt đầu ngay!</h3>
          <p className="text-muted-foreground text-sm mb-5">Ôn tập từ vựng HSK 1 để khởi động</p>
          <Link href="/vocabulary/flashcard">
            <Button>Ôn tập từ vựng</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub }: {
  icon: string; label: string; value: string; sub: string
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-extrabold text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  )
}
