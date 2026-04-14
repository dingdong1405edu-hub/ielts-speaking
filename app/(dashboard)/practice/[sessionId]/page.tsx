'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Loader2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ArrowUpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import AudioRecorder from '@/components/audio/AudioRecorder'
import { getBandColor, getTopicEmoji } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Question {
  id: string
  question: string
  part: string
  topic: string
  hints?: string[]
}

interface GradeScores {
  overall: number
  fluency: number
  vocabulary: number
  grammar: number
  pronunciation: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
}

interface PracticeSession {
  id: string
  part: string
  topic: string
  questionCount: number
  questions: Question[]
  answers: unknown[]
  completed: boolean
}

type Stage =
  | 'loading'
  | 'intro'
  | 'question_display'
  | 'recording'
  | 'grading'
  | 'question_result'
  | 'completing'
  | 'error'

const PART_LABELS: Record<string, string> = {
  PART1: 'Part 1',
  PART2: 'Part 2',
  PART3: 'Part 3',
}

const MAX_DURATION: Record<string, number> = {
  PART1: 120,
  PART2: 150,
  PART3: 180,
}

const PREP_TIME: Record<string, number> = {
  PART1: 0,
  PART2: 60,
  PART3: 0,
}

// ---------------------------------------------------------------------------
// Mini score card shown after each question
// ---------------------------------------------------------------------------

function QuestionScoreCard({ scores }: { scores: GradeScores }) {
  const metrics: { label: string; key: keyof GradeScores }[] = [
    { label: 'Fluency', key: 'fluency' },
    { label: 'Vocabulary', key: 'vocabulary' },
    { label: 'Grammar', key: 'grammar' },
    { label: 'Pronunciation', key: 'pronunciation' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {/* Overall */}
      <div className="text-center py-3">
        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Overall Band</p>
        <motion.p
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className={`text-5xl font-bold ${getBandColor(scores.overall as number)}`}
        >
          {(scores.overall as number).toFixed(1)}
        </motion.p>
      </div>

      {/* Metric pills */}
      <div className="grid grid-cols-2 gap-2">
        {metrics.map(({ label, key }, i) => {
          const val = scores[key] as number
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-2"
            >
              <span className="text-xs text-slate-400">{label}</span>
              <span className={`text-sm font-bold ${getBandColor(val)}`}>{val.toFixed(1)}</span>
            </motion.div>
          )
        })}
      </div>

      {/* Strengths */}
      {scores.strengths.length > 0 && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-2">Strengths</p>
          <ul className="flex flex-col gap-1">
            {scores.strengths.slice(0, 2).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {scores.improvements.length > 0 && (
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-3">
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">Improve</p>
          <ul className="flex flex-col gap-1">
            {scores.improvements.slice(0, 2).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <ArrowUpCircle className="w-3.5 h-3.5 text-orange-400 flex-shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PracticeSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = use(params)
  const router = useRouter()

  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null)
  const [stage, setStage] = useState<Stage>('loading')
  const [currentQIdx, setCurrentQIdx] = useState(0)
  const [gradeResult, setGradeResult] = useState<GradeScores | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [startTime] = useState(Date.now())

  // Fetch session on mount
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`)
        if (!res.ok) throw new Error('Session not found')
        const data = await res.json()
        // API returns { session: {...} } or just the session object
        const sess = data.session ?? data
        if (!sess.questions || sess.questions.length === 0) throw new Error('No questions found')
        setPracticeSession(sess)
        setStage('intro')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load session')
        setStage('error')
      }
    }
    fetchSession()
  }, [sessionId])

  const currentQuestion = practiceSession?.questions[currentQIdx]
  const totalQuestions = practiceSession?.questions.length ?? 0
  const part = practiceSession?.part ?? 'PART1'
  const topic = practiceSession?.topic ?? ''

  const handleRecordingComplete = useCallback(
    async (_blob: Blob, transcript: string) => {
      if (!currentQuestion) return
      setStage('grading')
      setGradeResult(null)

      try {
        const res = await fetch('/api/practice/grade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            questionIndex: currentQIdx,
            transcript,
          }),
        })

        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Grading failed')
        setGradeResult(data.scores)
        setStage('question_result')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Grading failed. Please try again.')
        setStage('question_result') // still show result area, but without scores
      }
    },
    [sessionId, currentQIdx, currentQuestion],
  )

  const handleNextQuestion = useCallback(async () => {
    const isLast = currentQIdx >= totalQuestions - 1

    if (isLast) {
      setStage('completing')
      try {
        const duration = Math.round((Date.now() - startTime) / 1000)
        // Update duration before completing
        await fetch('/api/practice/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, duration }),
        })
        router.push(`/results/${sessionId}`)
      } catch {
        router.push(`/results/${sessionId}`)
      }
    } else {
      setCurrentQIdx((i) => i + 1)
      setGradeResult(null)
      setErrorMsg(null)
      setStage('question_display')
    }
  }, [currentQIdx, totalQuestions, sessionId, startTime, router])

  // ── Render ───────────────────────────────────────────────────────────────

  if (stage === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4" style={{ color: 'var(--text-muted)' }}>
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <p className="text-sm">Loading your session…</p>
        </div>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-slate-200 font-medium">Something went wrong</p>
          <p className="text-sm text-slate-400">{errorMsg}</p>
          <Button onClick={() => router.push('/practice')} variant="outline">
            Back to Practice
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTopicEmoji(topic)}</span>
            <div>
              <p className="font-semibold text-slate-200">{topic}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="default" className="text-xs">
                  {PART_LABELS[part] ?? part}
                </Badge>
              </div>
            </div>
          </div>
          {stage !== 'intro' && stage !== 'completing' && (
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Question</p>
              <p className="text-lg font-bold text-slate-200">
                {currentQIdx + 1}
                <span className="text-slate-500 text-sm font-normal"> / {totalQuestions}</span>
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {stage !== 'intro' && totalQuestions > 1 && (
          <div className="mb-6 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQIdx) / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* INTRO */}
          {stage === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-8 py-10 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Mic className="w-9 h-9 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-2">Ready to Practice?</h2>
                <p className="text-slate-400 text-sm max-w-sm">
                  You have <strong className="text-slate-200">{totalQuestions} question{totalQuestions !== 1 ? 's' : ''}</strong> on{' '}
                  <strong className="text-slate-200">{topic}</strong> — {PART_LABELS[part]}.
                  Answer each question out loud and our AI will grade your response.
                </p>
              </div>
              {part === 'PART2' && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm text-amber-400 max-w-sm">
                  You&apos;ll get <strong>60 seconds</strong> to prepare before each question.
                </div>
              )}
              <Button
                onClick={() => setStage('question_display')}
                size="lg"
                className="gap-2 px-10"
              >
                Begin
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* QUESTION DISPLAY */}
          {stage === 'question_display' && currentQuestion && (
            <motion.div
              key={`question-${currentQIdx}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="flex flex-col gap-6"
            >
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-medium">
                    Question {currentQIdx + 1}
                  </p>
                  <p className="text-xl font-semibold text-slate-100 leading-relaxed">
                    {currentQuestion.question}
                  </p>
                  {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Hints</p>
                      <ul className="flex flex-col gap-1">
                        {currentQuestion.hints.map((h, i) => (
                          <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">•</span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={() => setStage('recording')}
                  size="lg"
                  className="gap-2 px-10"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </Button>
                <p className="text-xs text-slate-500">
                  Max recording time: {MAX_DURATION[part] / 60} min
                  {PREP_TIME[part] > 0 && ` · ${PREP_TIME[part]}s prep time`}
                </p>
              </div>
            </motion.div>
          )}

          {/* RECORDING */}
          {stage === 'recording' && currentQuestion && (
            <motion.div
              key={`recording-${currentQIdx}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex flex-col gap-4"
            >
              {/* Question above recorder */}
              <div className="rounded-xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1 font-medium">Question</p>
                <p className="text-base text-slate-200 leading-relaxed">{currentQuestion.question}</p>
              </div>

              <AudioRecorder
                questionText={currentQuestion.question}
                maxDuration={MAX_DURATION[part] ?? 120}
                prepTime={PREP_TIME[part] ?? 0}
                onRecordingComplete={handleRecordingComplete}
              />
            </motion.div>
          )}

          {/* GRADING */}
          {stage === 'grading' && (
            <motion.div
              key="grading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-16 text-center"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                <Mic className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-200 font-semibold text-lg">AI is grading your answer…</p>
                <p className="text-sm text-slate-400 mt-1">This usually takes 5–10 seconds</p>
              </div>
            </motion.div>
          )}

          {/* QUESTION RESULT */}
          {stage === 'question_result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-6"
            >
              <Card>
                <CardContent className="pt-6">
                  {gradeResult ? (
                    <QuestionScoreCard scores={gradeResult} />
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">{errorMsg ?? 'Could not grade this answer. Moving on.'}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                onClick={handleNextQuestion}
                size="lg"
                className="w-full gap-2"
              >
                {currentQIdx >= totalQuestions - 1 ? (
                  <>
                    View Results
                    <ChevronRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Next Question
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* COMPLETING */}
          {stage === 'completing' && (
            <motion.div
              key="completing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 py-20 text-center"
            >
              <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
              <p className="text-slate-200 font-semibold">Finalising your results…</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
