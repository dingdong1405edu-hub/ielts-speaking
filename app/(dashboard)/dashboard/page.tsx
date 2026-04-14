import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getUserUsage } from '@/lib/usage'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar'
import { Leaderboard } from '@/components/dashboard/Leaderboard'
import { UsageBanner } from '@/components/dashboard/UsageBanner'
import { Badge } from '@/components/ui/badge'
import { Mic, BookOpen, FileText, ChevronRight, Calendar } from 'lucide-react'
import { cn, formatBandScore, getTopicEmoji } from '@/lib/utils'
import type { PracticeSession } from '@prisma/client'

// Helper: extract overall score from a session's scores JSON
function extractOverallScore(scores: PracticeSession['scores']): number | null {
  if (!scores || typeof scores !== 'object') return null
  const vals = Object.values(scores as Record<string, number>).filter(
    (v) => typeof v === 'number' && !isNaN(v),
  )
  if (!vals.length) return null
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 2) / 2
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
}

function sessionTypeLabel(type: string): string {
  switch (type) {
    case 'BEGINNER':
      return 'Beginner'
    case 'TOPIC':
      return 'Chủ đề'
    case 'FULL_TEST':
      return 'Full Test'
    default:
      return type
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const firstName = session.user.name?.split(' ')[0] ?? 'bạn'

  const todayLabel = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const [recentSessions, usage] = await Promise.all([
    prisma.practiceSession.findMany({
      where: { userId, completed: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        topic: true,
        scores: true,
        duration: true,
        createdAt: true,
      },
    }),
    getUserUsage(userId),
  ])

  const quickActions = [
    {
      href: '/practice',
      icon: Mic,
      label: 'Luyện tập ngay',
      description: 'Bắt đầu phiên luyện tập',
      accent: '#3b82f6',
      accentBg: 'rgba(59,130,246,0.12)',
      accentBorder: 'rgba(59,130,246,0.25)',
    },
    {
      href: '/full-test',
      icon: FileText,
      label: 'Bài kiểm tra đầy đủ',
      description: 'Cả 3 phần IELTS',
      accent: '#a855f7',
      accentBg: 'rgba(168,85,247,0.12)',
      accentBorder: 'rgba(168,85,247,0.25)',
    },
    {
      href: '/vocabulary',
      icon: BookOpen,
      label: 'Từ vựng của tôi',
      description: 'Ôn luyện từ đã lưu',
      accent: '#10b981',
      accentBg: 'rgba(16,185,129,0.12)',
      accentBorder: 'rgba(16,185,129,0.25)',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pt-8 md:pb-8 space-y-8">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-widest mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              Bảng điều khiển
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Chào mừng trở lại,{' '}
              <span className="text-blue-400">{firstName}</span>!
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Tiếp tục hành trình — mục tiêu IELTS của bạn đang đến gần.
            </p>
          </div>
          <div
            className="flex items-center gap-2 flex-shrink-0 rounded-lg border px-3 py-2 self-start"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs capitalize">{todayLabel}</span>
          </div>
        </div>

        {/* ── Stats Cards ──────────────────────────────────────────────── */}
        <StatsCards />

        {/* ── Usage Banner ─────────────────────────────────────────────── */}
        <UsageBanner
          sessionsUsed={usage.sessionsUsed}
          isPremiumActive={usage.isPremiumActive}
          premiumUntil={usage.premiumUntil}
        />

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <div>
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="quick-action-card group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border)',
                    '--card-accent-border': action.accentBorder,
                  } as React.CSSProperties}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105"
                    style={{
                      background: action.accentBg,
                      borderColor: action.accentBorder,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: action.accent }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {action.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  />
                </Link>
              )
            })}
          </div>
        </div>

        {/* ── Heatmap + Leaderboard ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <HeatmapCalendar />
          </div>
          <div className="lg:col-span-2">
            <Leaderboard currentUserId={userId} />
          </div>
        </div>

        {/* ── Recent Sessions ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              Phiên luyện tập gần đây
            </h2>
            <Link
              href="/practice/history"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-150 flex items-center gap-1"
            >
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-14 rounded-2xl border border-dashed"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'color-mix(in srgb, var(--bg-surface) 50%, transparent 50%)' }}
              >
                <Mic className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
              </div>
              <p
                className="font-semibold text-sm"
                style={{ color: 'var(--text-primary)' }}
              >
                Chưa có phiên nào
              </p>
              <p
                className="text-sm mt-1 text-center max-w-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Bắt đầu phiên luyện tập để xem lịch sử tại đây.
              </p>
              <Link
                href="/practice"
                className="mt-5 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-sm font-semibold transition-colors duration-150"
              >
                Bắt đầu luyện tập
              </Link>
            </div>
          ) : (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className="border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <th
                        className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Chủ đề
                      </th>
                      <th
                        className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Loại
                      </th>
                      <th
                        className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Điểm
                      </th>
                      <th
                        className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Ngày
                      </th>
                      <th className="px-5 py-3.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {recentSessions.map((s, idx) => {
                      const score = extractOverallScore(s.scores)
                      const emoji = s.topic ? getTopicEmoji(s.topic) : '💬'
                      const isLast = idx === recentSessions.length - 1

                      return (
                        <tr
                          key={s.id}
                          className="session-row group transition-colors duration-100"
                          style={
                            {
                              borderBottom: isLast
                                ? undefined
                                : '1px solid var(--border)',
                            } as React.CSSProperties
                          }
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="text-base" aria-hidden="true">
                                {emoji}
                              </span>
                              <span
                                className="font-medium truncate max-w-[180px] text-sm"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {s.topic ?? 'Luyện tập chung'}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className="text-xs"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {sessionTypeLabel(s.type)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {score !== null ? (
                              <Badge
                                className={cn(
                                  'text-xs font-semibold bg-transparent border',
                                  score >= 8
                                    ? 'border-blue-500/50 text-blue-400'
                                    : score >= 7
                                    ? 'border-green-500/50 text-green-400'
                                    : score >= 6
                                    ? 'border-yellow-500/50 text-yellow-400'
                                    : score >= 5
                                    ? 'border-orange-500/50 text-orange-400'
                                    : 'border-red-500/50 text-red-400',
                                )}
                              >
                                {formatBandScore(score)}
                              </Badge>
                            ) : (
                              <span
                                className="text-xs"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className="text-xs"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              {formatRelativeDate(s.createdAt)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href={`/results/${s.id}`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5 justify-end"
                            >
                              Xem lại <ChevronRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}
