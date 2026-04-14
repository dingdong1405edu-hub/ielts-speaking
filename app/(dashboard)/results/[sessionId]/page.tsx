'use client'

import { useEffect, useState, use, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  AlertCircle,
  BookOpen,
  Sparkles,
  X,
  Plus,
  Check,
  ChevronLeft,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScoreBreakdown } from '@/components/practice/ScoreBreakdown'
import { FeedbackPanel } from '@/components/practice/FeedbackPanel'
import { formatBandScore, getBandColor, getTopicEmoji } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Scores {
  overall: number
  fluency: number
  vocabulary: number
  grammar: number
  pronunciation: number
}

interface AnswerRecord {
  questionIndex: number
  questionText: string
  transcript: string
  scores?: Scores & {
    strengths: string[]
    improvements: string[]
    detailedFeedback: string
  }
  gradedAt?: string
}

interface SessionData {
  id: string
  part: string
  topic: string
  questionCount: number
  questions: { id: string; question: string }[]
  answers: AnswerRecord[]
  scores: Scores | null
  sampleAnswers: Record<string, { sampleAnswer: string; bandIndicators: string[] }> | null
  completed: boolean
  createdAt: string
}

interface VocabWord {
  word: string
  type: string
  definition: string
  example: string
  ieltsRelevance?: string
}

const PART_LABELS: Record<string, string> = {
  PART1: 'Part 1',
  PART2: 'Part 2',
  PART3: 'Part 3',
}

// ---------------------------------------------------------------------------
// Confetti Component
// ---------------------------------------------------------------------------

function Confetti() {
  const pieces = Array.from({ length: 40 })
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {pieces.map((_, i) => {
        const color = colors[i % colors.length]
        const left = `${Math.random() * 100}%`
        const delay = Math.random() * 2
        const duration = 2 + Math.random() * 2
        const size = 6 + Math.random() * 8

        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left,
              top: '-20px',
              width: size,
              height: size,
              background: color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 20 : 900,
              rotate: Math.random() * 720 - 360,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration,
              delay,
              ease: 'easeIn',
            }}
          />
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sample Answer Modal
// ---------------------------------------------------------------------------

interface SampleAnswerModalProps {
  questionText: string
  sampleAnswer: string
  bandIndicators: string[]
  loading: boolean
  onClose: () => void
}

function SampleAnswerModal({ questionText, sampleAnswer, bandIndicators, loading, onClose }: SampleAnswerModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-[#1E293B] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-slate-200">Band 7–8 Sample Answer</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1 font-medium">Question</p>
            <p className="text-sm text-slate-300">{questionText}</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-2 font-medium">Sample Answer</p>
                <p className="text-sm text-slate-200 leading-relaxed bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-4">
                  {sampleAnswer}
                </p>
              </div>

              {bandIndicators.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-yellow-500 mb-2 font-medium flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Why this scores Band 7–8
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {bandIndicators.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Vocabulary Side Panel
// ---------------------------------------------------------------------------

interface VocabPanelProps {
  topic: string
  sessionId: string
  onClose: () => void
}

function VocabPanel({ topic, sessionId, onClose }: VocabPanelProps) {
  const [words, setWords] = useState<VocabWord[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/practice/vocabulary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, sessionId }),
        })
        const data = await res.json()
        if (res.ok) setWords(data.vocabulary ?? [])
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [topic, sessionId])

  async function saveWord(w: VocabWord) {
    if (saved.has(w.word)) return
    setSaving(w.word)
    try {
      await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: w.word,
          type: w.type,
          definition: w.definition,
          example: w.example,
          topic,
          sessionId,
        }),
      })
      setSaved((prev) => new Set([...prev, w.word]))
    } catch {
      // silently fail
    } finally {
      setSaving(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-sm h-full bg-[#1E293B] border-l border-white/10 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-slate-200">Related Vocabulary</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            </div>
          ) : words.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">No vocabulary found.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {words.map((w) => {
                const isSaved = saved.has(w.word)
                const isSaving = saving === w.word
                return (
                  <motion.div
                    key={w.word}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-100 text-sm">{w.word}</p>
                        <Badge variant="outline" className="text-xs mt-1">{w.type}</Badge>
                      </div>
                      <button
                        onClick={() => saveWord(w)}
                        disabled={isSaved || isSaving}
                        className={`flex-shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200 ${
                          isSaved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
                        }`}
                      >
                        {isSaving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isSaved ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Plus className="w-3 h-3" />
                        )}
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{w.definition}</p>
                    {w.example && (
                      <p className="text-xs text-slate-500 italic">&ldquo;{w.example}&rdquo;</p>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = use(params)
  const router = useRouter()

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  // Modal / panel states
  const [sampleModal, setSampleModal] = useState<{
    questionText: string
    questionIndex: number
    sampleAnswer: string
    bandIndicators: string[]
    loading: boolean
  } | null>(null)
  const [showVocab, setShowVocab] = useState(false)

  // Track which sample answers are already loaded (from session data)
  const getSampleAnswer = useCallback(
    (idx: number) => {
      if (!sessionData?.sampleAnswers) return null
      return sessionData.sampleAnswers[String(idx)] ?? null
    },
    [sessionData],
  )

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`)
        if (!res.ok) throw new Error('Failed to load results')
        const data = await res.json()
        const sess: SessionData = data.session ?? data
        setSessionData(sess)

        const overall = sess.scores?.overall ?? 0
        if (overall >= 6.5) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 4000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  async function openSampleAnswer(qIdx: number, questionText: string) {
    // Check if already cached in session
    const cached = getSampleAnswer(qIdx)
    if (cached) {
      setSampleModal({
        questionText,
        questionIndex: qIdx,
        sampleAnswer: cached.sampleAnswer,
        bandIndicators: cached.bandIndicators,
        loading: false,
      })
      return
    }

    // Fetch from API
    setSampleModal({ questionText, questionIndex: qIdx, sampleAnswer: '', bandIndicators: [], loading: true })
    try {
      const res = await fetch('/api/practice/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, questionIndex: qIdx }),
      })
      const data = await res.json()
      setSampleModal((prev) =>
        prev ? { ...prev, sampleAnswer: data.sampleAnswer, bandIndicators: data.bandIndicators ?? [], loading: false } : null,
      )
    } catch {
      setSampleModal((prev) => prev ? { ...prev, loading: false, sampleAnswer: 'Failed to generate sample answer.' } : null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm text-slate-400">Loading your results…</p>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-slate-200 font-medium">Could not load results</p>
          <p className="text-sm text-slate-400">{error}</p>
          <Button onClick={() => router.push('/practice')} variant="outline">
            Back to Practice
          </Button>
        </div>
      </div>
    )
  }

  const scores = sessionData.scores
  const answers = sessionData.answers ?? []
  const topic = sessionData.topic
  const part = sessionData.part

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-24">
      {/* Confetti */}
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

      {/* Sample answer modal */}
      <AnimatePresence>
        {sampleModal && (
          <SampleAnswerModal
            questionText={sampleModal.questionText}
            sampleAnswer={sampleModal.sampleAnswer}
            bandIndicators={sampleModal.bandIndicators}
            loading={sampleModal.loading}
            onClose={() => setSampleModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Vocabulary panel */}
      <AnimatePresence>
        {showVocab && (
          <VocabPanel topic={topic} sessionId={sessionId} onClose={() => setShowVocab(false)} />
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <span className="text-3xl">{getTopicEmoji(topic)}</span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-100">Session Results</h1>
              {scores && scores.overall >= 6.5 && (
                <Sparkles className="w-5 h-5 text-yellow-400" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default" className="text-xs">{PART_LABELS[part] ?? part}</Badge>
              <span className="text-sm text-slate-400">{topic}</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Score */}
        {scores && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="mb-6"
          >
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent p-8 text-center">
                <p className="text-sm text-slate-400 uppercase tracking-wide mb-2 font-medium">Your Result</p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`text-7xl font-black mb-1 ${getBandColor(scores.overall)}`}
                >
                  {scores.overall.toFixed(1)}
                </motion.p>
                <p className="text-slate-400 text-sm">{formatBandScore(scores.overall)}</p>

                {scores.overall >= 7.5 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 text-sm text-emerald-400 font-medium"
                  >
                    Excellent performance! Keep it up.
                  </motion.p>
                )}
                {scores.overall >= 6.5 && scores.overall < 7.5 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-3 text-sm text-yellow-400 font-medium"
                  >
                    Great work! You are above band 6.5.
                  </motion.p>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Score Breakdown (Radar + metrics) */}
        {scores && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreBreakdown scores={scores} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3 mb-6"
        >
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => setShowVocab(true)}
          >
            <BookOpen className="w-4 h-4" />
            Related Vocabulary
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => {
              const firstQ = sessionData.questions[0]
              if (firstQ) openSampleAnswer(0, firstQ.question)
            }}
          >
            <Sparkles className="w-4 h-4" />
            Sample Answers
          </Button>
        </motion.div>

        {/* Per-question feedback accordion */}
        {answers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <Card>
              <CardHeader>
                <CardTitle>Question-by-Question Feedback</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                {answers.map((answer, i) => (
                  <div key={i}>
                    {answer.scores ? (
                      <FeedbackPanel
                        feedback={{
                          questionIndex: answer.questionIndex,
                          questionText: answer.questionText,
                          transcript: answer.transcript,
                          strengths: answer.scores.strengths ?? [],
                          improvements: answer.scores.improvements ?? [],
                          detailedFeedback: answer.scores.detailedFeedback ?? '',
                        }}
                        defaultOpen={i === 0}
                      />
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-400" />
                          Question {i + 1}: No feedback available
                        </p>
                      </div>
                    )}

                    {/* Sample answer button per question */}
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => openSampleAnswer(answer.questionIndex, answer.questionText)}
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View sample answer
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Bottom action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={() => router.push('/practice')}
            className="flex-1 gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Practice Again
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex-1 gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
