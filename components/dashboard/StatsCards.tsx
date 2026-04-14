'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView, animate, type Variants } from 'framer-motion'
import { BookOpen, TrendingUp, Trophy, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Stats {
  totalSessions: number
  avgBand: number
  bestBand: number
  streak: number
  totalVocab: number
  sessionsThisWeek: number
}

function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1.2,
}: {
  value: number
  decimals?: number
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate(v) {
        if (ref.current) ref.current.textContent = v.toFixed(decimals)
      },
    })
    return () => controls.stop()
  }, [inView, value, decimals, duration])

  return <span ref={ref}>0</span>
}

const cardConfig = [
  {
    key: 'totalSessions',
    label: 'Total Sessions',
    sublabel: 'practice sessions',
    icon: BookOpen,
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
    gradientBorder: 'from-blue-500/40 via-transparent to-transparent',
    decimals: 0,
  },
  {
    key: 'avgBand',
    label: 'Average Band',
    sublabel: 'overall score',
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    gradientBorder: 'from-emerald-500/40 via-transparent to-transparent',
    decimals: 1,
  },
  {
    key: 'bestBand',
    label: 'Best Band',
    sublabel: 'highest achieved',
    icon: Trophy,
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
    gradientBorder: 'from-amber-500/40 via-transparent to-transparent',
    decimals: 1,
  },
  {
    key: 'streak',
    label: 'Current Streak',
    sublabel: 'days in a row',
    icon: Flame,
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
    gradientBorder: 'from-red-500/40 via-transparent to-transparent',
    decimals: 0,
  },
] as const

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {cardConfig.map((cfg) => {
        const Icon = cfg.icon
        const value = stats ? (stats[cfg.key as keyof Stats] as number) : 0

        return (
          <motion.div key={cfg.key} variants={itemVariants}>
            <Card className="relative overflow-hidden group">
              {/* Gradient border top */}
              <div
                className={cn(
                  'absolute inset-x-0 top-0 h-px bg-gradient-to-r',
                  cfg.gradientBorder
                )}
              />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                      {cfg.label}
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-bold text-white tabular-nums">
                        {loading ? (
                          <span className="animate-pulse text-slate-600">--</span>
                        ) : (
                          <AnimatedNumber value={value} decimals={cfg.decimals} />
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{cfg.sublabel}</p>
                  </div>
                  <div
                    className={cn(
                      'flex-shrink-0 p-3 rounded-xl transition-transform duration-300 group-hover:scale-110',
                      cfg.iconBg
                    )}
                  >
                    <Icon className={cn('w-5 h-5', cfg.iconColor)} />
                  </div>
                </div>
              </CardContent>
              {/* Subtle glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.02] to-transparent" />
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
