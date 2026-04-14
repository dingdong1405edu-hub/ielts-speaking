'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DayData {
  date: string
  minutes: number
  sessions: number
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  data: DayData | null
}

function getCellColor(minutes: number): string {
  if (minutes === 0) return 'bg-slate-800 hover:bg-slate-700'
  if (minutes < 15) return 'bg-blue-900 hover:bg-blue-800'
  if (minutes < 30) return 'bg-blue-700 hover:bg-blue-600'
  if (minutes < 60) return 'bg-blue-500 hover:bg-blue-400'
  return 'bg-blue-400 hover:bg-blue-300'
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

export function HeatmapCalendar() {
  const [months, setMonths] = useState<3 | 6>(3)
  const [data, setData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, data: null })

  const fetchData = useCallback(async (m: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/heatmap?months=${m}`)
      const json = await res.json()
      setData(json)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(months)
  }, [months, fetchData])

  // Build a full grid of days from (months ago) to today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(today)
  startDate.setMonth(startDate.getMonth() - months)
  // Align to the Monday of the start week
  const startDay = startDate.getDay()
  const daysToMonday = startDay === 0 ? 6 : startDay - 1
  startDate.setDate(startDate.getDate() - daysToMonday)

  const dataMap = new Map(data.map((d) => [d.date, d]))

  // Build columns (each column = 1 week, Mon–Sun)
  const columns: { date: Date; dateStr: string; dayData: DayData | null }[][] = []
  const cursor = new Date(startDate)

  while (cursor <= today) {
    const week: { date: Date; dateStr: string; dayData: DayData | null }[] = []
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().split('T')[0]
      week.push({
        date: new Date(cursor),
        dateStr,
        dayData: dataMap.get(dateStr) ?? null,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    columns.push(week)
  }

  // Month label positions
  const monthLabels: { label: string; colIndex: number }[] = []
  columns.forEach((week, i) => {
    const firstDay = week[0].date
    if (firstDay.getDate() <= 7) {
      monthLabels.push({ label: MONTH_LABELS[firstDay.getMonth()], colIndex: i })
    }
  })

  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0)
  const activeDays = data.filter((d) => d.minutes > 0).length

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-blue-500/40 via-transparent to-transparent" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <CardTitle>Practice Activity</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {([3, 6] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200',
                  months === m
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                )}
              >
                {m} Months
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs text-slate-500">
            <span className="text-slate-300 font-medium">{activeDays}</span> active days
          </span>
          <span className="text-xs text-slate-500">
            <span className="text-slate-300 font-medium">{formatMinutes(totalMinutes)}</span> total
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-5">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-32 flex items-center justify-center"
            >
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-500"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={months}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              <div className="overflow-x-auto pb-1">
                <div className="inline-flex gap-0.5">
                  {/* Day labels */}
                  <div className="flex flex-col gap-0.5 mr-1 justify-end" style={{ paddingBottom: 0 }}>
                    <div className="h-4" /> {/* spacer for month labels */}
                    {DAY_LABELS.map((label, i) => (
                      <div
                        key={i}
                        className="w-7 h-3 flex items-center"
                      >
                        <span className="text-[9px] text-slate-600 leading-none">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Columns */}
                  {columns.map((week, colIdx) => (
                    <div key={colIdx} className="flex flex-col gap-0.5 relative">
                      {/* Month label */}
                      <div className="h-4 flex items-center">
                        {monthLabels.find((ml) => ml.colIndex === colIdx) && (
                          <span className="text-[9px] text-slate-500 whitespace-nowrap leading-none absolute">
                            {monthLabels.find((ml) => ml.colIndex === colIdx)!.label}
                          </span>
                        )}
                      </div>
                      {/* Day cells */}
                      {week.map(({ date, dateStr, dayData }) => {
                        const isAfterToday = date > today
                        const minutes = dayData?.minutes ?? 0
                        if (isAfterToday) {
                          return (
                            <div
                              key={dateStr}
                              className="w-3 h-3 rounded-sm bg-transparent"
                            />
                          )
                        }
                        return (
                          <div
                            key={dateStr}
                            className={cn(
                              'w-3 h-3 rounded-sm cursor-pointer transition-all duration-150',
                              getCellColor(minutes)
                            )}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setTooltip({
                                visible: true,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 8,
                                data: dayData ?? { date: dateStr, minutes: 0, sessions: 0 },
                              })
                            }}
                            onMouseLeave={() =>
                              setTooltip((prev) => ({ ...prev, visible: false }))
                            }
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-[10px] text-slate-600">Less</span>
                {[0, 10, 20, 40, 70].map((min) => (
                  <div
                    key={min}
                    className={cn('w-3 h-3 rounded-sm', getCellColor(min).split(' ')[0])}
                  />
                ))}
                <span className="text-[10px] text-slate-600">More</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      {/* Tooltip — rendered outside overflow:hidden via fixed positioning */}
      {tooltip.visible && tooltip.data && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl shadow-black/40 whitespace-nowrap">
            <p className="text-slate-300 font-medium">{formatDate(tooltip.data.date)}</p>
            {tooltip.data.minutes > 0 ? (
              <>
                <p className="text-blue-400">{formatMinutes(tooltip.data.minutes)} practiced</p>
                <p className="text-slate-500">{tooltip.data.sessions} session{tooltip.data.sessions !== 1 ? 's' : ''}</p>
              </>
            ) : (
              <p className="text-slate-500">No activity</p>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
