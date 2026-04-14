'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Briefcase,
  Globe,
  Mic,
  ChevronRight,
  Loader2,
  Settings2,
  Layers,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UsageLimitModal } from '@/components/practice/UsageLimitModal'
import { getTopicEmoji } from '@/lib/utils'
import { FREE_LIMIT } from '@/lib/usage'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const TOPICS = [
  'Work & Career',
  'Education',
  'Family',
  'Technology',
  'Environment',
  'Health',
  'Travel',
  'Food',
  'Hobbies',
  'Media',
  'Housing',
  'Culture',
  'Sports',
  'Society',
]

type Part = 'PART1' | 'PART2' | 'PART3'

const PARTS: { id: Part; label: string; description: string; duration: string }[] =
  [
    {
      id: 'PART1',
      label: 'Part 1',
      description: 'Câu hỏi ngắn về bản thân và các chủ đề quen thuộc',
      duration: '1–2 phút/câu',
    },
    {
      id: 'PART2',
      label: 'Part 2',
      description: 'Thẻ gợi ý — nói liên tục 1–2 phút về một chủ đề',
      duration: '1–2 phút',
    },
    {
      id: 'PART3',
      label: 'Part 3',
      description: 'Câu hỏi thảo luận trừu tượng liên quan đến chủ đề Part 2',
      duration: '2–3 phút/câu',
    },
  ]

const QUESTION_COUNTS = [3, 5, 7, 10]

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

function StepBadge({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors duration-200"
        style={
          done
            ? { background: '#3b82f6', color: '#fff' }
            : {
                background: 'var(--bg-card)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }
        }
      >
        {n}
      </div>
      <span
        className="text-sm font-medium"
        style={{ color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}
      >
        {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Usage note
// ---------------------------------------------------------------------------

interface UsageNoteProps {
  sessionsUsed: number | null
  isPremiumActive: boolean
}

function UsageNote({ sessionsUsed, isPremiumActive }: UsageNoteProps) {
  if (isPremiumActive || sessionsUsed === null) return null
  const remaining = Math.max(0, FREE_LIMIT - sessionsUsed)

  if (remaining === 0) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{
          background: 'color-mix(in srgb, var(--bg-card) 85%, #ef4444 15%)',
          borderColor: 'rgba(239,68,68,0.4)',
        }}
      >
        <Info className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-400 font-medium">
          Bạn đã dùng hết {FREE_LIMIT} lần miễn phí. Cần nâng cấp Premium để tiếp tục.
        </p>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <Info className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Còn{' '}
        <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {remaining}/{FREE_LIMIT}
        </span>{' '}
        lần luyện tập miễn phí
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PracticePage() {
  const router = useRouter()
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLimitModal, setShowLimitModal] = useState(false)

  // Usage state (fetched client-side from stats endpoint)
  const [sessionsUsed, setSessionsUsed] = useState<number | null>(null)
  const [isPremiumActive, setIsPremiumActive] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.sessionsUsed === 'number') {
          setSessionsUsed(data.sessionsUsed)
        }
        if (typeof data.isPremiumActive === 'boolean') {
          setIsPremiumActive(data.isPremiumActive)
        }
      })
      .catch(() => {
        // Non-fatal — the API will enforce limits anyway
      })
  }, [])

  const canStart = selectedPart !== null && selectedTopic !== null

  async function handleStart() {
    if (!canStart) return

    // Client-side pre-check to show modal immediately (UX optimisation)
    if (!isPremiumActive && sessionsUsed !== null && sessionsUsed >= FREE_LIMIT) {
      setShowLimitModal(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/practice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: selectedPart,
          topic: selectedTopic,
          count: questionCount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'LIMIT_REACHED') {
          setShowLimitModal(true)
          setLoading(false)
          return
        }
        throw new Error(data.error ?? 'Không thể tạo câu hỏi')
      }

      // Update local remaining count if returned
      if (typeof data.remaining === 'number' && sessionsUsed !== null) {
        setSessionsUsed(sessionsUsed + 1)
      }

      router.push(`/practice/${data.sessionId}`)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.',
      )
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-24 md:pt-8 md:pb-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                background: 'rgba(59,130,246,0.12)',
                borderColor: 'rgba(59,130,246,0.25)',
              }}
            >
              <Mic className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Luyện tập chủ đề</h1>
          </div>
          <p className="ml-[52px] text-sm" style={{ color: 'var(--text-secondary)' }}>
            Chọn chủ đề và phần IELTS để nhận câu hỏi từ AI và chấm điểm thời gian thực.
          </p>
        </motion.div>

        {/* Progress steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-6 mb-8"
        >
          <StepBadge n={1} label="Chọn phần" done={selectedPart !== null} />
          <ChevronRight
            className="w-4 h-4 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
          />
          <StepBadge n={2} label="Chọn chủ đề" done={selectedTopic !== null} />
          <ChevronRight
            className="w-4 h-4 flex-shrink-0"
            style={{ color: 'var(--text-muted)' }}
          />
          <StepBadge n={3} label="Cài đặt" done={false} />
        </motion.div>

        <div className="flex flex-col gap-6">

          {/* Step 1: Select Part */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <CardTitle>Bước 1 — Chọn phần</CardTitle>
                </div>
                <CardDescription>Chọn phần IELTS Speaking muốn luyện tập</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PARTS.map((part) => {
                    const active = selectedPart === part.id
                    return (
                      <button
                        key={part.id}
                        onClick={() => setSelectedPart(part.id)}
                        className="relative rounded-xl border p-4 text-left transition-all duration-200"
                        style={
                          active
                            ? {
                                borderColor: '#3b82f6',
                                background: 'rgba(59,130,246,0.10)',
                                boxShadow: '0 0 0 1px #3b82f6',
                              }
                            : {
                                borderColor: 'var(--border)',
                                background: 'var(--bg-surface)',
                              }
                        }
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span
                            className="text-sm font-bold"
                            style={{ color: active ? '#60a5fa' : 'var(--text-primary)' }}
                          >
                            {part.label}
                          </span>
                          {active && (
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="currentColor"
                                viewBox="0 0 12 12"
                              >
                                <path
                                  d="M10 3L5 8.5 2 5.5"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="none"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p
                          className="text-xs leading-relaxed mb-2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {part.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {part.duration}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2: Select Topic */}
          <AnimatePresence>
            {selectedPart && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <CardTitle>Bước 2 — Chọn chủ đề</CardTitle>
                    </div>
                    <CardDescription>
                      Chọn chủ đề cho phiên {selectedPart?.replace('PART', 'Part ')} của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {TOPICS.map((topic) => {
                        const active = selectedTopic === topic
                        const emoji = getTopicEmoji(topic)
                        return (
                          <motion.button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-center transition-all duration-200"
                            style={
                              active
                                ? {
                                    borderColor: '#3b82f6',
                                    background: 'rgba(59,130,246,0.10)',
                                    boxShadow: '0 0 0 1px #3b82f6',
                                  }
                                : {
                                    borderColor: 'var(--border)',
                                    background: 'var(--bg-surface)',
                                  }
                            }
                          >
                            <span className="text-2xl leading-none">{emoji}</span>
                            <span
                              className="text-xs font-medium leading-tight"
                              style={{
                                color: active ? '#93c5fd' : 'var(--text-secondary)',
                              }}
                            >
                              {topic}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: Settings */}
          <AnimatePresence>
            {selectedTopic && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-blue-400" />
                      <CardTitle>Bước 3 — Cài đặt</CardTitle>
                    </div>
                    <CardDescription>Tuỳ chỉnh số lượng câu hỏi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Số câu hỏi
                        </span>
                        <motion.span
                          key={questionCount}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-lg font-bold text-blue-400"
                        >
                          {questionCount}
                        </motion.span>
                      </div>
                      <div className="flex gap-2">
                        {QUESTION_COUNTS.map((n) => (
                          <button
                            key={n}
                            onClick={() => setQuestionCount(n)}
                            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                            style={
                              questionCount === n
                                ? {
                                    background: '#3b82f6',
                                    color: '#fff',
                                    boxShadow: '0 4px 12px rgba(59,130,246,0.30)',
                                  }
                                : {
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    color: 'var(--text-muted)',
                                  }
                            }
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <p
                        className="text-xs mt-2"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Khoảng {questionCount * 2}–{questionCount * 3} phút
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Summary + Start */}
          <AnimatePresence>
            {canStart && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4"
              >
                {/* Summary card */}
                <div
                  className="rounded-xl border px-5 py-4"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(168,85,247,0.08) 100%)',
                    borderColor: 'rgba(59,130,246,0.2)',
                  }}
                >
                  <p
                    className="text-xs uppercase tracking-wide mb-3 font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Tóm tắt phiên
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {selectedPart?.replace('PART', 'Part ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg leading-none">
                        {getTopicEmoji(selectedTopic!)}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {selectedTopic}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {questionCount} câu hỏi
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Chấm điểm AI
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div
                    className="rounded-lg border px-4 py-3 text-sm text-red-400"
                    style={{
                      background: 'rgba(239,68,68,0.08)',
                      borderColor: 'rgba(239,68,68,0.3)',
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Usage note */}
                <UsageNote
                  sessionsUsed={sessionsUsed}
                  isPremiumActive={isPremiumActive}
                />

                {/* Start button */}
                <Button
                  onClick={handleStart}
                  disabled={loading}
                  size="lg"
                  className="w-full text-base gap-3 py-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang tạo câu hỏi…
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Bắt đầu phiên luyện tập
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Usage limit modal */}
      <UsageLimitModal
        open={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </div>
  )
}
