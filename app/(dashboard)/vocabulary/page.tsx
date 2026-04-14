'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  LayoutList,
  Layers,
  Search,
  X,
  Check,
  Trash2,
  Mic,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { VocabCard } from '@/components/vocabulary/VocabCard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VocabEntry {
  id: string
  word: string
  type: string | null
  definition: string
  example: string | null
  topic: string | null
  learned: boolean
  createdAt: string
}

type ViewMode = 'grid' | 'list' | 'flashcard'

interface VocabState {
  words: VocabEntry[]
  search: string
  topicFilter: string
  viewMode: ViewMode
  currentFlashcard: number
  isFlipped: boolean
}

// ---------------------------------------------------------------------------
// Topic badge colours for list view
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<string, string> = {
  noun: 'bg-blue-500/15 text-blue-400',
  verb: 'bg-emerald-500/15 text-emerald-400',
  adjective: 'bg-purple-500/15 text-purple-400',
  adj: 'bg-purple-500/15 text-purple-400',
  adverb: 'bg-amber-500/15 text-amber-400',
  phrase: 'bg-rose-500/15 text-rose-400',
  idiom: 'bg-orange-500/15 text-orange-400',
}

function getTypeClass(type: string | null) {
  if (!type) return 'bg-slate-700/60 text-slate-400'
  return TYPE_COLORS[type.toLowerCase().trim()] ?? 'bg-slate-700/60 text-slate-400'
}

// ---------------------------------------------------------------------------
// Flashcard component (3-D flip)
// ---------------------------------------------------------------------------

interface FlashcardProps {
  entry: VocabEntry
  isFlipped: boolean
  onFlip: () => void
}

function Flashcard({ entry, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div
      className="relative w-full max-w-lg mx-auto cursor-pointer"
      style={{ perspective: '1200px', height: '320px' }}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      aria-label={isFlipped ? 'Card back — click to flip to front' : 'Card front — click to flip to back'}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onFlip()}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-br from-[#1E293B] to-[#0F172A] flex flex-col items-center justify-center gap-4 p-8 shadow-2xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-3">
              Word
            </p>
            <h2 className="text-5xl font-bold text-slate-100 mb-4">{entry.word}</h2>
            {entry.type && (
              <span
                className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
                  getTypeClass(entry.type)
                )}
              >
                {entry.type}
              </span>
            )}
          </div>
          <p className="absolute bottom-6 text-xs text-slate-600">Tap or press Space to reveal</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex flex-col justify-center gap-4 p-8 shadow-2xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Definition</p>
          <p className="text-lg text-slate-200 leading-relaxed">{entry.definition}</p>
          {entry.example && (
            <blockquote className="border-l-2 border-blue-500/40 pl-3 mt-1">
              <p className="text-sm italic text-slate-400">&ldquo;{entry.example}&rdquo;</p>
            </blockquote>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function VocabularyPage() {
  const [state, setState] = useState<VocabState>({
    words: [],
    search: '',
    topicFilter: '',
    viewMode: 'grid',
    currentFlashcard: 0,
    isFlipped: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topics, setTopics] = useState<string[]>([])

  // Keep a ref for keydown so we always have latest state
  const stateRef = useRef(state)
  stateRef.current = state

  // ── Fetch vocabulary ────────────────────────────────────────────────────

  const fetchVocabulary = useCallback(async (search = '', topic = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (topic) params.set('topic', topic)
      params.set('page', '1')

      const res = await fetch(`/api/vocabulary?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load vocabulary')
      const data = await res.json() as { vocabulary: VocabEntry[] }

      setState((prev) => ({
        ...prev,
        words: data.vocabulary,
        currentFlashcard: 0,
        isFlipped: false,
      }))

      // Derive topic list from full unfiltered fetch once
      if (!search && !topic) {
        const allTopics = Array.from(
          new Set(data.vocabulary.map((w) => w.topic).filter(Boolean) as string[])
        ).sort()
        setTopics(allTopics)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVocabulary()
  }, [fetchVocabulary])

  // ── Handle search / topic filter ─────────────────────────────────────────

  useEffect(() => {
    const id = setTimeout(() => {
      fetchVocabulary(state.search, state.topicFilter)
    }, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.search, state.topicFilter])

  // ── Keyboard navigation for flashcard mode ────────────────────────────────

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const s = stateRef.current
      if (s.viewMode !== 'flashcard') return
      const total = s.words.length
      if (e.code === 'Space') {
        e.preventDefault()
        setState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }))
      } else if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
        e.preventDefault()
        setState((prev) => ({
          ...prev,
          currentFlashcard: (prev.currentFlashcard + 1) % total,
          isFlipped: false,
        }))
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
        e.preventDefault()
        setState((prev) => ({
          ...prev,
          currentFlashcard: (prev.currentFlashcard - 1 + total) % total,
          isFlipped: false,
        }))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // ── Mutations ─────────────────────────────────────────────────────────────

  async function handleLearnedToggle(id: string, learned: boolean) {
    // Optimistic update
    setState((prev) => ({
      ...prev,
      words: prev.words.map((w) => (w.id === id ? { ...w, learned } : w)),
    }))
    try {
      await fetch(`/api/vocabulary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learned }),
      })
    } catch {
      // revert
      setState((prev) => ({
        ...prev,
        words: prev.words.map((w) => (w.id === id ? { ...w, learned: !learned } : w)),
      }))
    }
  }

  async function handleDelete(id: string) {
    setState((prev) => ({
      ...prev,
      words: prev.words.filter((w) => w.id !== id),
      currentFlashcard: Math.max(0, prev.currentFlashcard - 1),
    }))
    try {
      await fetch(`/api/vocabulary?id=${id}`, { method: 'DELETE' })
    } catch {
      // best effort — re-fetch to sync
      fetchVocabulary(state.search, state.topicFilter)
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const { words, search, topicFilter, viewMode, currentFlashcard, isFlipped } = state
  const learnedCount = words.filter((w) => w.learned).length
  const currentWord = words[currentFlashcard]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-24 md:pt-8 md:pb-8">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <BookOpen className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Vocabulary Notebook</h1>
          </div>
          <p className="ml-[52px] text-sm" style={{ color: 'var(--text-muted)' }}>
            {words.length} word{words.length !== 1 ? 's' : ''} saved
            {words.length > 0 && ` · ${learnedCount} learned`}
          </p>
        </motion.div>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="flex flex-wrap items-center gap-3 mb-6"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search words or definitions…"
              value={search}
              onChange={(e) => setState((prev) => ({ ...prev, search: e.target.value }))}
              className={cn(
                'w-full pl-9 pr-9 py-2.5 rounded-xl border border-white/10 bg-white/5',
                'text-sm text-slate-200 placeholder:text-slate-600',
                'focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30',
                'transition-all duration-200'
              )}
            />
            {search && (
              <button
                onClick={() => setState((prev) => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Topic filter */}
          <select
            value={topicFilter}
            onChange={(e) => setState((prev) => ({ ...prev, topicFilter: e.target.value }))}
            className={cn(
              'px-3 py-2.5 rounded-xl border border-white/10 bg-[#1E293B] text-sm text-slate-300',
              'focus:outline-none focus:border-blue-500/50 transition-all duration-200',
              'min-w-[160px]'
            )}
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1 gap-0.5">
            {(
              [
                { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid view' },
                { mode: 'list' as ViewMode, icon: LayoutList, label: 'List view' },
                { mode: 'flashcard' as ViewMode, icon: Layers, label: 'Flashcard view' },
              ] as const
            ).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setState((prev) => ({ ...prev, viewMode: mode, isFlipped: false }))}
                title={label}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
                  viewMode === mode
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500"
              />
              <p className="text-slate-500 text-sm">Loading vocabulary…</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-20"
            >
              <p className="text-red-400">{error}</p>
              <button
                onClick={() => fetchVocabulary(search, topicFilter)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
              >
                Retry
              </button>
            </motion.div>
          ) : words.length === 0 ? (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-6"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/8 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-slate-600" />
              </div>
              <div className="text-center max-w-sm">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  {search || topicFilter ? 'No words match your filters' : 'Your notebook is empty'}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {search || topicFilter
                    ? 'Try clearing the search or changing the topic filter.'
                    : 'Words you save during practice sessions will appear here. Start a session to build your vocabulary!'}
                </p>
              </div>
              {!search && !topicFilter && (
                <Link
                  href="/practice"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/25"
                >
                  <Mic className="w-4 h-4" />
                  Start Practicing
                </Link>
              )}
            </motion.div>
          ) : viewMode === 'grid' ? (
            /* Grid view */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {words.map((entry) => (
                  <VocabCard
                    key={entry.id}
                    {...entry}
                    onLearnedToggle={handleLearnedToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : viewMode === 'list' ? (
            /* List view */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/8 bg-[#1E293B]/60 overflow-hidden"
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Word</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">Definition</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider hidden md:table-cell">Topic</th>
                    <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  <AnimatePresence>
                    {words.map((entry) => (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={cn(
                          'transition-colors duration-150',
                          entry.learned ? 'bg-emerald-500/5' : 'hover:bg-white/[0.02]'
                        )}
                      >
                        <td className="px-5 py-3.5 font-semibold text-slate-200">{entry.word}</td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          {entry.type ? (
                            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase', getTypeClass(entry.type))}>
                              {entry.type}
                            </span>
                          ) : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 max-w-xs">
                          <p className="truncate">{entry.definition}</p>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-xs text-slate-500">{entry.topic ?? '—'}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleLearnedToggle(entry.id, !entry.learned)}
                              title={entry.learned ? 'Unmark learned' : 'Mark learned'}
                              className={cn(
                                'flex items-center justify-center w-7 h-7 rounded-full border transition-all duration-150',
                                entry.learned
                                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                                  : 'border-white/10 text-slate-600 hover:border-emerald-500/30 hover:text-emerald-400'
                              )}
                            >
                              <Check className="w-3 h-3" strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              title="Delete word"
                              className="flex items-center justify-center w-7 h-7 rounded-full border border-white/10 text-slate-600 hover:border-red-500/30 hover:text-red-400 transition-all duration-150"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </motion.div>
          ) : (
            /* Flashcard mode */
            <motion.div
              key="flashcard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8 py-4"
            >
              {/* Progress bar */}
              <div className="w-full max-w-lg">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>{learnedCount} / {words.length} learned</span>
                  <span>{Math.round((learnedCount / words.length) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${(learnedCount / words.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Card counter */}
              <p className="text-sm text-slate-500">
                <span className="text-slate-200 font-semibold">{currentFlashcard + 1}</span>
                {' / '}
                <span>{words.length}</span>
              </p>

              {/* Card */}
              {currentWord && (
                <Flashcard
                  entry={currentWord}
                  isFlipped={isFlipped}
                  onFlip={() => setState((prev) => ({ ...prev, isFlipped: !prev.isFlipped }))}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center gap-6">
                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      currentFlashcard: (prev.currentFlashcard - 1 + words.length) % words.length,
                      isFlipped: false,
                    }))
                  }
                  className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all duration-200"
                  aria-label="Previous card"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Mark learned toggle */}
                {currentWord && (
                  <button
                    onClick={() => handleLearnedToggle(currentWord.id, !currentWord.learned)}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200',
                      currentWord.learned
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400'
                    )}
                  >
                    <Check className="w-4 h-4" strokeWidth={2.5} />
                    {currentWord.learned ? 'Learned' : 'Mark Learned'}
                  </button>
                )}

                <button
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      currentFlashcard: (prev.currentFlashcard + 1) % words.length,
                      isFlipped: false,
                    }))
                  }
                  className="flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all duration-200"
                  aria-label="Next card"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="text-xs text-slate-600">
                Press <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-500">Space</kbd> to flip,{' '}
                <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-500">←</kbd>{' '}
                <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-500">→</kbd> to navigate
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
