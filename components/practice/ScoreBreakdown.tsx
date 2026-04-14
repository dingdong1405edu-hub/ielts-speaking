'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { formatBandScore, getBandColor } from '@/lib/utils'

interface Scores {
  overall: number
  fluency: number
  vocabulary: number
  grammar: number
  pronunciation: number
}

interface ScoreBreakdownProps {
  scores: Scores
}

const METRICS = [
  { key: 'fluency' as const, label: 'Fluency' },
  { key: 'vocabulary' as const, label: 'Vocabulary' },
  { key: 'grammar' as const, label: 'Grammar' },
  { key: 'pronunciation' as const, label: 'Pronunciation' },
]

function getBandBgDark(score: number): string {
  if (score < 5) return 'bg-red-500/20 text-red-400 border border-red-500/30'
  if (score < 6) return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
  if (score < 7) return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
  if (score < 8) return 'bg-green-500/20 text-green-400 border border-green-500/30'
  return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
}

function getStrokeColor(score: number): string {
  if (score < 5) return '#EF4444'
  if (score < 6) return '#F97316'
  if (score < 7) return '#EAB308'
  if (score < 8) return '#22C55E'
  return '#3B82F6'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="rounded-lg border border-white/10 bg-[#0F172A] px-3 py-2 text-sm shadow-xl">
        <p className="font-semibold text-slate-200">{item.metric}</p>
        <p className={`font-bold ${getBandColor(item.score)}`}>{formatBandScore(item.score)}</p>
      </div>
    )
  }
  return null
}

export function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  const chartData = METRICS.map(({ key, label }) => ({
    metric: label,
    score: scores[key],
    fullMark: 9,
  }))

  const avgScore = scores.overall
  const strokeColor = getStrokeColor(avgScore)

  return (
    <div className="flex flex-col gap-6">
      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: animated ? 1 : 0, scale: animated ? 1 : 0.92 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="h-64 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Score"
              dataKey="score"
              stroke={strokeColor}
              fill={strokeColor}
              fillOpacity={0.2}
              strokeWidth={2}
              dot={{ fill: strokeColor, r: 4, strokeWidth: 0 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3">
        {METRICS.map(({ key, label }, idx) => {
          const score = scores[key]
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: animated ? 1 : 0, y: animated ? 0 : 16 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.07, ease: 'easeOut' }}
              className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getBandBgDark(score)}`}>
                  {score.toFixed(1)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: animated ? `${(score / 9) * 100}%` : 0 }}
                  transition={{ duration: 0.7, delay: 0.2 + idx * 0.07, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: getStrokeColor(score) }}
                />
              </div>
              <span className={`text-xs font-medium ${getBandColor(score)}`}>
                {formatBandScore(score)}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Overall badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: animated ? 1 : 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="flex items-center justify-center"
      >
        <Badge
          className={`text-base px-4 py-1.5 font-bold ${getBandBgDark(scores.overall)}`}
        >
          Overall: {formatBandScore(scores.overall)}
        </Badge>
      </motion.div>
    </div>
  )
}
