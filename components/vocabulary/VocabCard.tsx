'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VocabCardProps {
  id: string
  word: string
  type: string | null
  definition: string
  example: string | null
  topic: string | null
  learned: boolean
  createdAt: string | Date
  onLearnedToggle: (id: string, learned: boolean) => void
  onDelete: (id: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  noun: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  verb: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  adjective: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  adj: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  adverb: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  phrase: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
  idiom: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
}

function getTypeBadgeClass(type: string | null): string {
  if (!type) return 'bg-slate-700/50 text-slate-400 border-slate-600/30'
  const normalized = type.toLowerCase().trim()
  return TYPE_COLORS[normalized] ?? 'bg-slate-700/50 text-slate-400 border-slate-600/30'
}

function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VocabCard({
  id,
  word,
  type,
  definition,
  example,
  topic,
  learned,
  createdAt,
  onLearnedToggle,
  onDelete,
}: VocabCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isTogglingLearned, setIsTogglingLearned] = useState(false)

  async function handleLearnedToggle() {
    if (isTogglingLearned) return
    setIsTogglingLearned(true)
    await onLearnedToggle(id, !learned)
    setIsTogglingLearned(false)
  }

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete(id)
    } else {
      setConfirmDelete(true)
      // auto-cancel after 2.5s
      setTimeout(() => setConfirmDelete(false), 2500)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative flex flex-col gap-3 rounded-2xl p-5 border',
        'bg-[#1E293B]/80 backdrop-blur-sm',
        'transition-all duration-300',
        // gradient border on hover via pseudo-element workaround using box-shadow
        'hover:shadow-[0_0_0_1.5px_theme(colors.blue.500/40),0_8px_32px_theme(colors.black/30)]',
        learned
          ? 'border-emerald-500/30'
          : 'border-white/8 hover:border-blue-500/30'
      )}
    >
      {/* Learned green overlay */}
      <AnimatePresence>
        {learned && (
          <motion.div
            key="learned-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 rounded-2xl bg-emerald-500/5 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Header: word + type badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-2xl font-bold text-slate-100 truncate leading-tight">
            {word}
          </span>
          {type && (
            <span
              className={cn(
                'shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
                getTypeBadgeClass(type)
              )}
            >
              {type}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Learned toggle */}
          <button
            onClick={handleLearnedToggle}
            disabled={isTogglingLearned}
            title={learned ? 'Mark as not learned' : 'Mark as learned'}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200',
              learned
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-white/5 border-white/10 text-slate-500 hover:border-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/10',
              isTogglingLearned && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>

          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete word'}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200',
              confirmDelete
                ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                : 'bg-white/5 border-white/10 text-slate-500 hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/10'
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Definition */}
      <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
        {definition}
      </p>

      {/* Example sentence */}
      {example && (
        <blockquote className="relative pl-3.5 border-l-2 border-blue-500/40">
          <p className="text-xs italic text-slate-400 leading-relaxed line-clamp-2">
            &ldquo;{example}&rdquo;
          </p>
        </blockquote>
      )}

      {/* Footer: topic chip + date */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        {topic ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/60 text-slate-400 border border-white/5">
            <BookOpen className="w-3 h-3" />
            {topic}
          </span>
        ) : (
          <span />
        )}
        <span className="text-[10px] text-slate-600">
          {formatDate(createdAt)}
        </span>
      </div>
    </motion.div>
  )
}
