'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star } from 'lucide-react'
import { LessonNode, type LessonStatus } from './LessonNode'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Lesson {
  id: string
  title: string
  xp: number
  type: 'speak' | 'vocabulary'
}

export interface Unit {
  id: string
  title: string
  color: string
  lessons: Lesson[]
}

interface RoadmapTrackProps {
  units: Unit[]
  completedLessons: Set<string>
  onLessonClick: (lesson: Lesson, unit: Unit) => void
}

// ---------------------------------------------------------------------------
// Determine lesson status
// ---------------------------------------------------------------------------

function getLessonStatus(
  lessonId: string,
  lessonIndex: number,
  unitIndex: number,
  units: Unit[],
  completedLessons: Set<string>
): LessonStatus {
  if (completedLessons.has(lessonId)) return 'completed'

  // Find the first not-completed lesson across all units/lessons in order
  for (let ui = 0; ui < units.length; ui++) {
    for (let li = 0; li < units[ui].lessons.length; li++) {
      const lid = units[ui].lessons[li].id
      if (!completedLessons.has(lid)) {
        // This is the "current" lesson
        if (ui === unitIndex && li === lessonIndex) return 'current'
        return 'locked'
      }
    }
  }

  // All completed — this shouldn't happen for a real lesson, but guard
  return 'available'
}

// ---------------------------------------------------------------------------
// Single Unit block
// ---------------------------------------------------------------------------

interface UnitBlockProps {
  unit: Unit
  unitIndex: number
  units: Unit[]
  completedLessons: Set<string>
  onLessonClick: (lesson: Lesson, unit: Unit) => void
  isVisible: boolean
}

function UnitBlock({ unit, unitIndex, units, completedLessons, onLessonClick, isVisible }: UnitBlockProps) {
  // Zigzag positions: offset alternating right/left
  const zigzagOffsets = [0, 60, 100, 60, 0, -60, -100, -60]

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Unit header banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 22 }}
        className="mb-8 w-72 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${unit.color}22 0%, ${unit.color}11 100%)`,
          border: `1.5px solid ${unit.color}44`,
        }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md"
          style={{ backgroundColor: unit.color }}
        >
          <Star className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest" style={{ color: unit.color }}>
            Unit {unitIndex + 1}
          </p>
          <p className="text-sm font-bold text-slate-200">{unit.title}</p>
        </div>
      </motion.div>

      {/* Lessons in zigzag */}
      <div className="relative flex flex-col items-center gap-0">
        {unit.lessons.map((lesson, lessonIndex) => {
          const offsetX = zigzagOffsets[lessonIndex % zigzagOffsets.length]
          const status = getLessonStatus(lesson.id, lessonIndex, unitIndex, units, completedLessons)
          const isFirst = lessonIndex === 0

          return (
            <div key={lesson.id} className="flex flex-col items-center">
              {/* Connector dotted line from previous node */}
              {!isFirst && (
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={isVisible ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
                  transition={{ duration: 0.3, delay: lessonIndex * 0.06 }}
                  style={{ transformOrigin: 'top' }}
                >
                  <svg
                    width="120"
                    height="48"
                    viewBox="0 0 120 48"
                    className="overflow-visible"
                  >
                    <path
                      d={`M ${60 + (zigzagOffsets[(lessonIndex - 1) % zigzagOffsets.length] ?? 0)} 0
                          Q 60 24 ${60 + offsetX} 48`}
                      fill="none"
                      stroke={
                        status === 'completed' || getLessonStatus(lesson.id, lessonIndex, unitIndex, units, completedLessons) !== 'locked'
                          ? unit.color
                          : '#334155'
                      }
                      strokeWidth="2.5"
                      strokeDasharray="6 5"
                      strokeLinecap="round"
                      opacity="0.6"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Node with zigzag offset */}
              <motion.div
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={
                  isVisible
                    ? { opacity: 1, scale: 1, y: 0, x: offsetX }
                    : { opacity: 0, scale: 0, y: 20, x: offsetX }
                }
                transition={{
                  duration: 0.45,
                  delay: lessonIndex * 0.08,
                  type: 'spring',
                  stiffness: 260,
                  damping: 22,
                }}
              >
                <LessonNode
                  id={lesson.id}
                  title={lesson.title}
                  type={lesson.type}
                  xp={lesson.xp}
                  status={status}
                  unitColor={unit.color}
                  onClick={() => onLessonClick(lesson, unit)}
                />
              </motion.div>
            </div>
          )
        })}
      </div>

      {/* Spacer between units */}
      <div className="h-12" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main RoadmapTrack
// ---------------------------------------------------------------------------

export function RoadmapTrack({ units, completedLessons, onLessonClick }: RoadmapTrackProps) {
  return (
    <div className="flex flex-col items-center py-4">
      {units.map((unit, unitIndex) => (
        <InViewUnit
          key={unit.id}
          unit={unit}
          unitIndex={unitIndex}
          units={units}
          completedLessons={completedLessons}
          onLessonClick={onLessonClick}
        />
      ))}
    </div>
  )
}

// Wrapper that triggers animation when unit scrolls into view
function InViewUnit(props: Omit<UnitBlockProps, 'isVisible'>) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' })

  return (
    <div ref={ref} className={cn('w-full flex flex-col items-center')}>
      <UnitBlock {...props} isVisible={isInView} />
    </div>
  )
}
