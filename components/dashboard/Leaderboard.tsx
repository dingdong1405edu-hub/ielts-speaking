'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Trophy, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  image: string | null
  minutes: number
  sessions: number
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const rankConfig: Record<number, { badge: string; text: string; glow: string }> = {
  1: { badge: 'bg-amber-500 text-amber-900', text: 'text-amber-400', glow: 'shadow-amber-500/30' },
  2: { badge: 'bg-slate-400 text-slate-900', text: 'text-slate-400', glow: 'shadow-slate-400/20' },
  3: { badge: 'bg-orange-600 text-orange-100', text: 'text-orange-400', glow: 'shadow-orange-600/25' },
}

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
}

const rowVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

interface LeaderboardProps {
  currentUserId?: string
}

export function Leaderboard({ currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <Card className="relative overflow-hidden h-full flex flex-col">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-amber-500/40 via-transparent to-transparent" />

      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <CardTitle>This Week's Champions</CardTitle>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">Top 10 by minutes practiced</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden pb-4">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-slate-700" />
                  <div className="w-8 h-8 rounded-full bg-slate-700" />
                  <div className="flex-1 h-4 rounded bg-slate-700" />
                  <div className="w-12 h-4 rounded bg-slate-700" />
                </div>
              ))}
            </motion.div>
          ) : entries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-32 text-center"
            >
              <Trophy className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm text-slate-500">No activity this week yet.</p>
              <p className="text-xs text-slate-600 mt-1">Be the first on the board!</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-1.5"
            >
              {entries.map((entry) => {
                const isCurrentUser = currentUserId === entry.userId
                const rankStyle = rankConfig[entry.rank]

                return (
                  <motion.div
                    key={entry.userId}
                    variants={rowVariants}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                      isCurrentUser
                        ? 'bg-blue-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                    )}
                  >
                    {/* Rank badge */}
                    <div className="flex-shrink-0 w-6 text-center">
                      {rankStyle ? (
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shadow-md',
                            rankStyle.badge,
                            rankStyle.glow,
                            'shadow-sm'
                          )}
                        >
                          {entry.rank}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            'text-xs font-medium',
                            isCurrentUser ? 'text-blue-400' : 'text-slate-500'
                          )}
                        >
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {entry.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={entry.image}
                          alt={entry.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-600"
                        />
                      ) : (
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border',
                            isCurrentUser
                              ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                              : 'bg-slate-700 text-slate-300 border-slate-600'
                          )}
                        >
                          {getInitials(entry.name)}
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm font-medium truncate',
                          isCurrentUser ? 'text-blue-300' : 'text-slate-200'
                        )}
                      >
                        {entry.name}
                        {isCurrentUser && (
                          <span className="ml-1.5 text-[10px] text-blue-400 font-normal">(you)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {entry.sessions} session{entry.sessions !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Minutes */}
                    <div className="flex-shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span
                        className={cn(
                          'text-sm font-semibold tabular-nums',
                          rankStyle ? rankStyle.text : isCurrentUser ? 'text-blue-400' : 'text-slate-300'
                        )}
                      >
                        {formatMinutes(entry.minutes)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
