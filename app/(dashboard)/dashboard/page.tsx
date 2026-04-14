import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { HeatmapCalendar } from '@/components/dashboard/HeatmapCalendar'
import { Leaderboard } from '@/components/dashboard/Leaderboard'
import { Badge } from '@/components/ui/badge'
import { Mic, BookOpen, FileText, ChevronRight, Sparkles } from 'lucide-react'
import { cn, formatBandScore, getBandColor, getTopicEmoji } from '@/lib/utils'
import type { PracticeSession } from '@prisma/client'

// Helper: extract overall score from a session's scores JSON
function extractOverallScore(scores: PracticeSession['scores']): number | null {
  if (!scores || typeof scores !== 'object') return null
  const vals = Object.values(scores as Record<string, number>).filter(
    (v) => typeof v === 'number' && !isNaN(v)
  )
  if (!vals.length) return null
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 2) / 2
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function sessionTypeLabel(type: string): string {
  switch (type) {
    case 'BEGINNER': return 'Beginner'
    case 'TOPIC': return 'Topic'
    case 'FULL_TEST': return 'Full Test'
    default: return type
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  const firstName = session.user.name?.split(' ')[0] ?? 'there'

  const recentSessions = await prisma.practiceSession.findMany({
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
  })

  const quickActions = [
    {
      href: '/practice',
      icon: Mic,
      label: 'Start Practice',
      description: 'Jump into a session',
      gradient: 'from-blue-600 to-blue-500',
      glow: 'shadow-blue-500/30',
    },
    {
      href: '/practice/full-test',
      icon: FileText,
      label: 'Full Test',
      description: 'All 3 parts',
      gradient: 'from-purple-600 to-purple-500',
      glow: 'shadow-purple-500/30',
    },
    {
      href: '/vocabulary',
      icon: BookOpen,
      label: 'My Vocabulary',
      description: 'Review saved words',
      gradient: 'from-emerald-600 to-emerald-500',
      glow: 'shadow-emerald-500/30',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Welcome back, {firstName}!
              </h1>
            </div>
            <p className="text-slate-400 text-sm">
              Keep up the momentum — your IELTS goals are within reach.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    'group flex items-center gap-4 p-4 rounded-xl border border-white/10',
                    'bg-slate-800/60 hover:bg-slate-800 transition-all duration-200',
                    'hover:border-white/20 hover:shadow-lg',
                    action.glow && `hover:${action.glow}`
                  )}
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center',
                      'shadow-lg transition-transform duration-200 group-hover:scale-105',
                      action.gradient
                    )}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{action.label}</p>
                    <p className="text-xs text-slate-400">{action.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Heatmap + Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <HeatmapCalendar />
          </div>
          <div className="lg:col-span-2">
            <Leaderboard currentUserId={userId} />
          </div>
        </div>

        {/* Recent Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Recent Sessions
            </h2>
            <Link
              href="/practice/history"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-150 flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-slate-700 bg-slate-800/30">
              <Mic className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">No sessions yet</p>
              <p className="text-slate-500 text-sm mt-1">Start a practice session to see your history here.</p>
              <Link
                href="/practice"
                className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors duration-150"
              >
                Start Practicing
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-slate-800/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Topic
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {recentSessions.map((s) => {
                      const score = extractOverallScore(s.scores)
                      const emoji = s.topic ? getTopicEmoji(s.topic) : '💬'

                      return (
                        <tr
                          key={s.id}
                          className="hover:bg-white/[0.02] transition-colors duration-150 group"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg" aria-hidden="true">
                                {emoji}
                              </span>
                              <span className="text-slate-200 font-medium truncate max-w-[180px]">
                                {s.topic ?? 'General Practice'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-400">
                              {sessionTypeLabel(s.type)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {score !== null ? (
                              <Badge
                                className={cn(
                                  'text-xs font-semibold',
                                  getBandColor(score)
                                    .replace('text-', 'border-')
                                    .replace(/text-\w+-\d+/, ''),
                                  'bg-transparent border',
                                  score >= 8
                                    ? 'border-blue-500/50 text-blue-400'
                                    : score >= 7
                                    ? 'border-green-500/50 text-green-400'
                                    : score >= 6
                                    ? 'border-yellow-500/50 text-yellow-400'
                                    : score >= 5
                                    ? 'border-orange-500/50 text-orange-400'
                                    : 'border-red-500/50 text-red-400'
                                )}
                              >
                                {formatBandScore(score)}
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-600">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-slate-500">
                              {formatRelativeDate(s.createdAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/practice/session/${s.id}`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5 justify-end"
                            >
                              Review <ChevronRight className="w-3 h-3" />
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
    </div>
  )
}
