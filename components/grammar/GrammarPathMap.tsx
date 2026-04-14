'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import GrammarNode, { type NodeStatus } from './GrammarNode'
import { Badge } from '@/components/ui/badge'
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GrammarLesson } from '@/types'

interface LessonProgress {
  lessonId: string
  bestScore: number // 0-100
}

interface GrammarPathMapProps {
  lessons: GrammarLesson[]
  progress: LessonProgress[]
}

// Zigzag offsets to create the winding path effect (px from center)
const ZIGZAG_OFFSETS = [0, 80, 0, -80, 0, 80, 0, -80]

function getNodeStatus(
  lessonId: string,
  index: number,
  progress: LessonProgress[],
  levelLessons: GrammarLesson[]
): NodeStatus {
  const found = progress.find((p) => p.lessonId === lessonId)
  if (found && found.bestScore > 0) return 'completed'

  // First lesson in level is unlocked if previous level's last is complete, or it's HSK1
  if (index === 0) return 'current'

  // Check if previous lesson is completed
  const prevId = levelLessons[index - 1]?.id
  const prevDone = progress.some((p) => p.lessonId === prevId && p.bestScore > 0)
  if (prevDone) return 'current'

  return 'locked'
}

function scoreToStars(score: number): number {
  if (score >= 90) return 3
  if (score >= 70) return 2
  if (score > 0) return 1
  return 0
}

export default function GrammarPathMap({ lessons, progress }: GrammarPathMapProps) {
  const router = useRouter()

  // Group by HSK level
  const grouped = lessons.reduce<Record<number, GrammarLesson[]>>((acc, l) => {
    if (!acc[l.hskLevel]) acc[l.hskLevel] = []
    acc[l.hskLevel].push(l)
    return acc
  }, {})

  const levels = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b)

  // Track collapsed levels
  const [collapsedLevels, setCollapsedLevels] = useState<Set<number>>(new Set())

  const toggleLevel = (level: number) => {
    setCollapsedLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  // Calculate level completion
  const getLevelCompletion = (levelLessons: GrammarLesson[]) => {
    const completed = levelLessons.filter((l) =>
      progress.some((p) => p.lessonId === l.id && p.bestScore > 0)
    ).length
    return { completed, total: levelLessons.length }
  }

  // Find the first uncompleted level to determine which levels should be accessible
  const isLevelAccessible = (level: number, levelIndex: number): boolean => {
    if (levelIndex === 0) return true
    const prevLevel = levels[levelIndex - 1]
    const prevLessons = grouped[prevLevel]
    const allPrevDone = prevLessons.every((l) =>
      progress.some((p) => p.lessonId === l.id && p.bestScore > 0)
    )
    return allPrevDone
  }

  return (
    <div className="relative pb-12">
      {levels.map((level, levelIndex) => {
        const levelLessons = grouped[level]
        const { completed, total } = getLevelCompletion(levelLessons)
        const accessible = isLevelAccessible(level, levelIndex)
        const isCollapsed = collapsedLevels.has(level)
        const allDone = completed === total

        return (
          <div key={level} className="mb-4">
            {/* Level Header Banner */}
            <button
              onClick={() => toggleLevel(level)}
              className={cn(
                'w-full rounded-2xl p-4 mb-6 flex items-center justify-between transition-all duration-200',
                'border-2 border-b-4 active:border-b-2',
                accessible
                  ? allDone
                    ? 'bg-primary/10 border-primary/30 hover:bg-primary/15'
                    : 'bg-secondary/10 border-secondary/30 hover:bg-secondary/15'
                  : 'bg-gray-100 border-gray-200'
              )}
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant={`hsk${level}` as 'hsk1'}
                  className="text-sm px-3 py-1 font-black"
                >
                  HSK {level}
                </Badge>
                <div className="text-left">
                  <p
                    className={cn(
                      'font-bold text-sm',
                      !accessible && 'text-gray-400'
                    )}
                  >
                    Ngữ pháp cấp {level}
                  </p>
                  <p
                    className={cn(
                      'text-xs',
                      accessible ? 'text-muted-foreground' : 'text-gray-300'
                    )}
                  >
                    {completed}/{total} hoàn thành
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {allDone && (
                  <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
                )}
                {/* Progress mini bar */}
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      allDone ? 'bg-primary' : 'bg-secondary'
                    )}
                    style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                  />
                </div>
                {isCollapsed ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Path Nodes */}
            {!isCollapsed && (
              <div className="relative flex flex-col items-center gap-2 py-2">
                {levelLessons.map((lesson, i) => {
                  const status = accessible
                    ? getNodeStatus(lesson.id, i, progress, levelLessons)
                    : 'locked'
                  const prog = progress.find((p) => p.lessonId === lesson.id)
                  const stars = prog ? scoreToStars(prog.bestScore) : 0
                  const offset = ZIGZAG_OFFSETS[i % ZIGZAG_OFFSETS.length]

                  return (
                    <div key={lesson.id} className="relative">
                      {/* Connector line to next node */}
                      {i < levelLessons.length - 1 && (
                        <svg
                          className="absolute top-[72px] left-1/2 -translate-x-1/2 z-0 pointer-events-none"
                          width="200"
                          height="50"
                          viewBox="0 0 200 50"
                          style={{ marginLeft: offset / 2 }}
                        >
                          <path
                            d={`M100,0 Q${100 + (ZIGZAG_OFFSETS[(i + 1) % ZIGZAG_OFFSETS.length] - offset) / 2},25 ${100 + (ZIGZAG_OFFSETS[(i + 1) % ZIGZAG_OFFSETS.length] - offset)},50`}
                            fill="none"
                            stroke={status === 'completed' ? '#10B981' : '#E2E8F0'}
                            strokeWidth="4"
                            strokeDasharray={status === 'completed' ? '0' : '8 8'}
                            strokeLinecap="round"
                          />
                        </svg>
                      )}

                      {/* Node */}
                      <div
                        className="relative z-10 py-3"
                        style={{ transform: `translateX(${offset}px)` }}
                      >
                        <GrammarNode
                          title={lesson.title}
                          titleVi={lesson.titleVi}
                          status={status}
                          order={i + 1}
                          stars={stars}
                          onClick={() => router.push(`/grammar/${lesson.id}`)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      {lessons.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <div className="text-4xl mb-3">📝</div>
          <p className="font-bold text-foreground">Chưa có bài học ngữ pháp</p>
          <p className="text-muted-foreground text-sm mt-2">
            Dữ liệu bài học sẽ sớm được cập nhật
          </p>
        </div>
      )}
    </div>
  )
}
