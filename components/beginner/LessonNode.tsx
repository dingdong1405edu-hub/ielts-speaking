'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, BookOpen, Lock, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LessonStatus = 'locked' | 'available' | 'current' | 'completed'

export interface LessonNodeProps {
  id: string
  title: string
  type: 'speak' | 'vocabulary'
  xp: number
  status: LessonStatus
  unitColor: string
  onClick: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LessonNode({
  title,
  type,
  xp,
  status,
  unitColor,
  onClick,
}: LessonNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const isLocked = status === 'locked'
  const isCurrent = status === 'current'
  const isCompleted = status === 'completed'

  const Icon = isCompleted ? Check : isLocked ? Lock : type === 'vocabulary' ? BookOpen : Mic

  return (
    <div className="relative flex flex-col items-center">
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-16 z-20 pointer-events-none"
          >
            <div className="relative bg-[#1E293B] border border-white/10 rounded-xl px-3 py-2 shadow-xl min-w-max text-center">
              <p className="text-xs font-semibold text-slate-200">{title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">+{xp} XP</p>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#1E293B]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current lesson: outer pulsing ring */}
      {isCurrent && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: `${unitColor}33` }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Node button */}
      <motion.button
        whileHover={!isLocked ? { scale: 1.1 } : {}}
        whileTap={!isLocked ? { scale: 0.92 } : {}}
        onClick={isLocked ? undefined : onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        disabled={isLocked}
        aria-label={`${title} — ${status} — +${xp} XP`}
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full transition-all duration-300',
          'w-[60px] h-[60px] border-[3px] shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120]',
          isCompleted && 'border-emerald-500 bg-emerald-500 shadow-emerald-500/30 focus-visible:ring-emerald-500',
          isCurrent && 'border-blue-400 shadow-blue-400/40 focus-visible:ring-blue-400',
          status === 'available' && 'border-white/20 bg-[#1E293B] hover:border-white/40 focus-visible:ring-blue-400',
          isLocked && 'border-white/8 bg-[#1E293B]/50 cursor-not-allowed opacity-50'
        )}
        style={
          isCurrent
            ? { backgroundColor: unitColor, borderColor: unitColor }
            : undefined
        }
      >
        <Icon
          className={cn(
            'w-6 h-6 transition-colors duration-200',
            isCompleted && 'text-white',
            isCurrent && 'text-white',
            status === 'available' && 'text-slate-400',
            isLocked && 'text-slate-600'
          )}
          strokeWidth={isCompleted ? 3 : 2}
        />
      </motion.button>

      {/* Label below */}
      <p
        className={cn(
          'mt-2.5 text-[11px] font-medium text-center max-w-[80px] leading-tight',
          isLocked ? 'text-slate-600' : isCurrent ? 'text-slate-200' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
        )}
      >
        {title}
      </p>
    </div>
  )
}
