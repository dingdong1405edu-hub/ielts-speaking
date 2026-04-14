'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Volume2,
  BookOpen,
  User,
} from 'lucide-react'
import Link from 'next/link'
import AudioRecorder from '@/components/audio/AudioRecorder'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TestPhase =
  | 'intro'
  | 'loading'
  | 'part1'
  | 'part1_transition'
  | 'part2_prep'
  | 'part2_speak'
  | 'part2_followup'
  | 'part2_transition'
  | 'part3'
  | 'part3_transition'
  | 'completing'
  | 'results'

interface Question {
  id: string
  question: string
}

interface PartData {
  sessionId: string
  questions: Question[]
}

interface AnswerRecord {
  questionIndex: number
  questionText: string
  transcript: string
}

interface PartScores {
  overall: number
  fluency: number
  vocabulary: number
  grammar: number
  pronunciation: number
  strengths?: string[]
  improvements?: string[]
}

interface PartResult {
  part: string
  sessionId: string
  scores: PartScores | null
  answeredCount: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PART2_TOPICS = [
  'Technology',
  'Environment',
  'Travel',
  'Education',
  'Health',
  'Culture',
  'Media',
  'Society',
  'Sports',
  'Hobbies',
]

const PART_DESCRIPTIONS: Record<string, string> = {
  PART1: 'The examiner will ask you questions about yourself and familiar topics.',
  PART2: 'You will be given a topic card. You have 1 minute to prepare, then speak for up to 2 minutes.',
  PART3: 'The examiner will ask you more abstract questions related to the Part 2 topic.',
}

// ---------------------------------------------------------------------------
// Circular countdown timer
// ---------------------------------------------------------------------------

interface CountdownTimerProps {
  seconds: number
  total: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
}

function CountdownTimer({
  seconds,
  total,
  size = 80,
  strokeWidth = 6,
  color = '#3B82F6',
  label,
}: CountdownTimerProps) {
  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  const progress = Math.max(0, Math.min(1, seconds / total))
  const offset = circumference * (1 - progress)

  const isUrgent = seconds <= 10 && seconds > 0
  const displayColor = isUrgent ? '#EF4444' : color

  return (
    <div className="relative flex items-center justify-center flex-col gap-1">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={displayColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(90, ${size / 2}, ${size / 2})`}
          fill={isUrgent ? '#EF4444' : 'white'}
          style={{ fontSize: size * 0.22, fontWeight: 700, fontFamily: 'inherit' }}
        >
          {seconds}s
        </text>
      </svg>
      {label && (
        <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{label}</p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Part indicator bar
// ---------------------------------------------------------------------------

function PartProgressBar({ phase }: { phase: TestPhase }) {
  const parts = [
    { id: 'part1', label: 'Part 1', phases: ['part1', 'part1_transition'] },
    {
      id: 'part2',
      label: 'Part 2',
      phases: ['part2_prep', 'part2_speak', 'part2_followup', 'part2_transition'],
    },
    { id: 'part3', label: 'Part 3', phases: ['part3', 'part3_transition', 'completing', 'results'] },
  ]

  const currentPartIndex = parts.findIndex((p) => p.phases.includes(phase))

  return (
    <div className="flex items-center gap-2">
      {parts.map((part, i) => {
        const isDone = i < currentPartIndex
        const isActive = i === currentPartIndex
        return (
          <div key={part.id} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isActive
                    ? 'bg-blue-500 text-white ring-2 ring-blue-400 ring-offset-2 ring-offset-[#0B1120]'
                    : 'bg-white/10 text-slate-500'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  isDone ? 'text-emerald-400' : isActive ? 'text-blue-400' : 'text-slate-600'
                }`}
              >
                {part.label}
              </span>
            </div>
            {i < parts.length - 1 && (
              <div
                className={`w-12 h-0.5 mb-4 transition-all duration-700 ${
                  isDone ? 'bg-emerald-500' : 'bg-white/10'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Examiner avatar + question card
// ---------------------------------------------------------------------------

interface ExaminerQuestionProps {
  question: string
  questionNumber: number
  totalQuestions: number
  part: string
}

function ExaminerQuestion({
  question,
  questionNumber,
  totalQuestions,
  part,
}: ExaminerQuestionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      {/* Examiner header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">
            IELTS Examiner
          </p>
          <p className="text-xs text-slate-400">
            {part} · Question {questionNumber} of {totalQuestions}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs text-blue-400 font-medium">Speaking</span>
        </div>
      </div>

      {/* Question bubble */}
      <div className="relative bg-slate-800/80 border border-white/10 rounded-2xl rounded-tl-sm px-6 py-5 shadow-xl">
        <div className="absolute -top-2 left-4 w-4 h-4 bg-slate-800 border-l border-t border-white/10 rotate-45" />
        <p className="text-lg font-medium text-slate-100 leading-relaxed">{question}</p>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Part 2 cue card
// ---------------------------------------------------------------------------

interface CueCardProps {
  topic: string
  question: string
}

function CueCard({ topic, question }: CueCardProps) {
  // Parse cue card format — typically has bullet points after the main prompt
  const lines = question.split('\n').filter(Boolean)
  const mainPrompt = lines[0] ?? question
  const bullets = lines.slice(1).filter((l) => l.trim().startsWith('-') || l.trim().startsWith('•'))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
      className="w-full"
    >
      {/* Cue card styled as real IELTS exam card */}
      <div
        className="rounded-2xl border-2 border-amber-400/40 shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #fef9e7 0%, #fef3c7 50%, #fde68a 100%)',
        }}
      >
        {/* Card header */}
        <div className="bg-amber-500/20 border-b border-amber-400/30 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-800" />
            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
              IELTS Speaking — Part 2 Candidate Task Card
            </span>
          </div>
          <span className="text-xs text-amber-700 font-medium">{topic}</span>
        </div>

        {/* Card body */}
        <div className="px-6 py-6">
          <p className="text-amber-900 font-semibold text-base leading-relaxed mb-4">
            {mainPrompt}
          </p>

          {bullets.length > 0 ? (
            <ul className="space-y-2 mb-4">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-800 text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-700 flex-shrink-0" />
                  {b.replace(/^[-•]\s*/, '')}
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-amber-800 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-700 flex-shrink-0" />
                What it is and how you know about it
              </li>
              <li className="flex items-start gap-2 text-amber-800 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-700 flex-shrink-0" />
                What makes it interesting or special
              </li>
              <li className="flex items-start gap-2 text-amber-800 text-sm">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-700 flex-shrink-0" />
                How it relates to your life
              </li>
            </ul>
          )}

          <div className="bg-amber-100/60 border border-amber-300/60 rounded-xl px-4 py-2.5">
            <p className="text-xs text-amber-700 font-medium">
              You will have <strong>1 minute</strong> to make notes, then speak for{' '}
              <strong>1–2 minutes</strong>.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Transition screen
// ---------------------------------------------------------------------------

interface TransitionScreenProps {
  title: string
  description: string
  countdown: number
}

function TransitionScreen({ title, description, countdown }: TransitionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center gap-6 py-12"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center"
      >
        <ChevronRight className="w-8 h-8 text-blue-400" />
      </motion.div>

      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-400 max-w-sm leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-500">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        Starting in {countdown}s…
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Results screen
// ---------------------------------------------------------------------------

interface ResultsScreenProps {
  results: PartResult[]
  onRetry: () => void
}

function ResultsScreen({ results, onRetry }: ResultsScreenProps) {
  const validScores = results.filter((r) => r.scores !== null)
  const overallBand =
    validScores.length > 0
      ? Math.round(
          (validScores.reduce((s, r) => s + (r.scores?.overall ?? 0), 0) / validScores.length) * 2,
        ) / 2
      : null

  function getBandColor(score: number) {
    if (score < 5) return 'text-red-400'
    if (score < 6) return 'text-orange-400'
    if (score < 7) return 'text-yellow-400'
    if (score < 8) return 'text-emerald-400'
    return 'text-blue-400'
  }

  function getBandLabel(score: number) {
    if (score < 5) return 'Below Modest'
    if (score < 6) return 'Modest'
    if (score < 7) return 'Competent'
    if (score < 8) return 'Good'
    if (score < 9) return 'Very Good'
    return 'Expert'
  }

  const PART_LABELS: Record<string, string> = {
    PART1: 'Part 1 — Introduction',
    PART2: 'Part 2 — Long Turn',
    PART3: 'Part 3 — Discussion',
  }

  const SCORE_KEYS: { key: keyof PartScores; label: string }[] = [
    { key: 'fluency', label: 'Fluency & Coherence' },
    { key: 'vocabulary', label: 'Lexical Resource' },
    { key: 'grammar', label: 'Grammar Range' },
    { key: 'pronunciation', label: 'Pronunciation' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Hero score */}
      <div className="text-center py-8 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent">
        <p className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-3">
          Overall Band Score
        </p>
        {overallBand !== null ? (
          <>
            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className={`text-8xl font-black mb-2 ${getBandColor(overallBand)}`}
            >
              {overallBand.toFixed(1)}
            </motion.p>
            <p className="text-slate-400 text-sm font-medium">
              {getBandLabel(overallBand)} · Band {overallBand.toFixed(1)}
            </p>
            {overallBand >= 7 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-3 text-sm text-emerald-400 font-medium"
              >
                Outstanding performance on the full test!
              </motion.p>
            )}
          </>
        ) : (
          <p className="text-slate-400">No scores available — answers may not have been graded.</p>
        )}
      </div>

      {/* Per-part breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {results.map((result, i) => (
          <motion.div
            key={result.part}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="rounded-xl border border-white/10 bg-white/5 p-5"
          >
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">
              {PART_LABELS[result.part] ?? result.part}
            </p>
            {result.scores ? (
              <>
                <p
                  className={`text-4xl font-black mb-1 ${getBandColor(result.scores.overall)}`}
                >
                  {result.scores.overall.toFixed(1)}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  {result.answeredCount} question{result.answeredCount !== 1 ? 's' : ''} answered
                </p>
                <div className="space-y-2">
                  {SCORE_KEYS.map(({ key, label }) => {
                    const val = result.scores![key as keyof PartScores] as number
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">{label}</span>
                          <span className={`font-semibold ${getBandColor(val)}`}>{val.toFixed(1)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(val / 9) * 100}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                            className="h-full rounded-full bg-blue-500"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 italic">No graded answers</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors duration-200"
        >
          <Mic className="w-4 h-4" />
          Take Full Test Again
        </button>
        <Link
          href="/practice"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors duration-200"
        >
          Topic Practice
        </Link>
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors duration-200"
        >
          Dashboard
        </Link>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function FullTestPage() {
  // ── Core state ─────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<TestPhase>('intro')
  const [error, setError] = useState<string | null>(null)

  // Part data
  const [part1Data, setPart1Data] = useState<PartData | null>(null)
  const [part2Data, setPart2Data] = useState<PartData | null>(null)
  const [part3Data, setPart3Data] = useState<PartData | null>(null)

  // Current question index within each part
  const [part1Index, setPart1Index] = useState(0)
  const [part2FollowupIndex, setPart2FollowupIndex] = useState(0)
  const [part3Index, setPart3Index] = useState(0)

  // Answers per part
  const [part1Answers, setPart1Answers] = useState<AnswerRecord[]>([])
  const [part2Answers, setPart2Answers] = useState<AnswerRecord[]>([])
  const [part3Answers, setPart3Answers] = useState<AnswerRecord[]>([])

  // Transition countdown
  const [transitionCount, setTransitionCount] = useState(5)

  // Prep timer for Part 2 (60 sec)
  const [prepSeconds, setPrepSeconds] = useState(60)

  // Results
  const [partResults, setPartResults] = useState<PartResult[]>([])

  // Recorder key — increment to force remount between questions
  const [recorderKey, setRecorderKey] = useState(0)

  const transitionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current) {
      clearInterval(transitionTimerRef.current)
      transitionTimerRef.current = null
    }
  }, [])

  const clearPrepTimer = useCallback(() => {
    if (prepTimerRef.current) {
      clearInterval(prepTimerRef.current)
      prepTimerRef.current = null
    }
  }, [])

  // ── Generate all questions ─────────────────────────────────────────────────

  const generateAllParts = useCallback(async () => {
    setPhase('loading')
    setError(null)

    try {
      const part2Topic = PART2_TOPICS[Math.floor(Math.random() * PART2_TOPICS.length)]

      const [p1Res, p2Res, p3Res] = await Promise.all([
        fetch('/api/practice/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ part: 'PART1', topic: 'General', count: 5 }),
        }),
        fetch('/api/practice/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ part: 'PART2', topic: part2Topic, count: 3 }),
        }),
        fetch('/api/practice/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ part: 'PART3', topic: part2Topic, count: 5 }),
        }),
      ])

      if (!p1Res.ok || !p2Res.ok || !p3Res.ok) {
        throw new Error('Failed to generate questions. Please try again.')
      }

      const [p1Data, p2Data, p3Data] = await Promise.all([
        p1Res.json(),
        p2Res.json(),
        p3Res.json(),
      ])

      setPart1Data({ sessionId: p1Data.sessionId, questions: p1Data.questions })
      setPart2Data({ sessionId: p2Data.sessionId, questions: p2Data.questions })
      setPart3Data({ sessionId: p3Data.sessionId, questions: p3Data.questions })

      // Reset indices
      setPart1Index(0)
      setPart2FollowupIndex(0)
      setPart3Index(0)
      setPart1Answers([])
      setPart2Answers([])
      setPart3Answers([])
      setPartResults([])
      setRecorderKey((k) => k + 1)

      setPhase('part1')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setPhase('intro')
    }
  }, [])

  // ── Submit answers via grade → complete ────────────────────────────────────

  async function submitAnswers(
    sessionId: string,
    answers: AnswerRecord[],
    _questions: Question[],
  ) {
    // Grade each answer
    const gradePromises = answers.map((answer) =>
      fetch('/api/practice/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionIndex: answer.questionIndex,
          questionText: answer.questionText,
          transcript: answer.transcript,
        }),
      }).then((r) => (r.ok ? r.json() : null)),
    )

    await Promise.allSettled(gradePromises)

    // Complete the session
    const completeRes = await fetch('/api/practice/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })

    if (completeRes.ok) {
      const data = await completeRes.json()
      return data.finalScores as PartScores | null
    }
    return null
  }

  // ── Transitions between parts ──────────────────────────────────────────────

  function startTransition(to: TestPhase, seconds = 5) {
    setTransitionCount(seconds)
    let remaining = seconds
    transitionTimerRef.current = setInterval(() => {
      remaining -= 1
      setTransitionCount(remaining)
      if (remaining <= 0) {
        clearTransitionTimer()
        setPhase(to)
        setRecorderKey((k) => k + 1)
      }
    }, 1000)
  }

  // ── Handle recording complete for Part 1 ──────────────────────────────────

  const handlePart1Answer = useCallback(
    (_blob: Blob, transcript: string) => {
      if (!part1Data) return
      const q = part1Data.questions[part1Index]
      if (!q) return

      const answer: AnswerRecord = {
        questionIndex: part1Index,
        questionText: q.question,
        transcript,
      }

      setPart1Answers((prev) => [...prev, answer])

      // Grade in the background
      fetch('/api/practice/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: part1Data.sessionId,
          questionIndex: part1Index,
          questionText: q.question,
          transcript,
        }),
      }).catch(() => null)

      const nextIndex = part1Index + 1
      if (nextIndex < part1Data.questions.length) {
        // Brief pause then next question
        setTimeout(() => {
          setPart1Index(nextIndex)
          setRecorderKey((k) => k + 1)
        }, 1200)
      } else {
        // Move to Part 2 transition
        setTimeout(() => {
          setPhase('part1_transition')
          startTransition('part2_prep', 6)
        }, 1200)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [part1Data, part1Index],
  )

  // ── Handle Part 2 prep timer ───────────────────────────────────────────────

  useEffect(() => {
    if (phase === 'part2_prep') {
      setPrepSeconds(60)
      let s = 60
      prepTimerRef.current = setInterval(() => {
        s -= 1
        setPrepSeconds(s)
        if (s <= 0) {
          clearPrepTimer()
          setPhase('part2_speak')
          setRecorderKey((k) => k + 1)
        }
      }, 1000)
    }
    return () => clearPrepTimer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'part2_prep'])

  // ── Handle Part 2 long turn answer ────────────────────────────────────────

  const handlePart2SpeakAnswer = useCallback(
    (_blob: Blob, transcript: string) => {
      if (!part2Data) return
      const q = part2Data.questions[0]
      if (!q) return

      const answer: AnswerRecord = {
        questionIndex: 0,
        questionText: q.question,
        transcript,
      }
      setPart2Answers([answer])

      // Grade in the background
      fetch('/api/practice/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: part2Data.sessionId,
          questionIndex: 0,
          questionText: q.question,
          transcript,
        }),
      }).catch(() => null)

      // Move to follow-up questions
      setTimeout(() => {
        setPart2FollowupIndex(0)
        setPhase('part2_followup')
        setRecorderKey((k) => k + 1)
      }, 1200)
    },
    [part2Data],
  )

  // ── Handle Part 2 follow-up answers ───────────────────────────────────────

  const handlePart2FollowupAnswer = useCallback(
    (_blob: Blob, transcript: string) => {
      if (!part2Data) return
      // Follow-ups are questions index 1 and 2
      const qIdx = 1 + part2FollowupIndex
      const q = part2Data.questions[qIdx]
      if (!q) return

      const answer: AnswerRecord = {
        questionIndex: qIdx,
        questionText: q.question,
        transcript,
      }

      setPart2Answers((prev) => [...prev, answer])

      fetch('/api/practice/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: part2Data.sessionId,
          questionIndex: qIdx,
          questionText: q.question,
          transcript,
        }),
      }).catch(() => null)

      const nextFollowup = part2FollowupIndex + 1
      // Part 2 has 2 follow-ups (indices 1 and 2)
      if (nextFollowup < 2 && part2Data.questions[1 + nextFollowup]) {
        setTimeout(() => {
          setPart2FollowupIndex(nextFollowup)
          setRecorderKey((k) => k + 1)
        }, 1200)
      } else {
        // Move to Part 3 transition
        setTimeout(() => {
          setPhase('part2_transition')
          startTransition('part3', 6)
        }, 1200)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [part2Data, part2FollowupIndex],
  )

  // ── Handle Part 3 answers ──────────────────────────────────────────────────

  const handlePart3Answer = useCallback(
    (_blob: Blob, transcript: string) => {
      if (!part3Data) return
      const q = part3Data.questions[part3Index]
      if (!q) return

      const answer: AnswerRecord = {
        questionIndex: part3Index,
        questionText: q.question,
        transcript,
      }

      setPart3Answers((prev) => [...prev, answer])

      fetch('/api/practice/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: part3Data.sessionId,
          questionIndex: part3Index,
          questionText: q.question,
          transcript,
        }),
      }).catch(() => null)

      const nextIndex = part3Index + 1
      if (nextIndex < part3Data.questions.length) {
        setTimeout(() => {
          setPart3Index(nextIndex)
          setRecorderKey((k) => k + 1)
        }, 1200)
      } else {
        // Complete the test
        setTimeout(() => {
          setPhase('completing')
        }, 1200)
      }
    },
    [part3Data, part3Index],
  )

  // ── Complete all sessions when phase = 'completing' ────────────────────────

  useEffect(() => {
    if (phase !== 'completing') return

    async function complete() {
      try {
        const [p1Scores, p2Scores, p3Scores] = await Promise.all([
          part1Data
            ? submitAnswers(part1Data.sessionId, part1Answers, part1Data.questions)
            : Promise.resolve(null),
          part2Data
            ? submitAnswers(part2Data.sessionId, part2Answers, part2Data.questions)
            : Promise.resolve(null),
          part3Data
            ? submitAnswers(part3Data.sessionId, part3Answers, part3Data.questions)
            : Promise.resolve(null),
        ])

        setPartResults([
          { part: 'PART1', sessionId: part1Data?.sessionId ?? '', scores: p1Scores, answeredCount: part1Answers.length },
          { part: 'PART2', sessionId: part2Data?.sessionId ?? '', scores: p2Scores, answeredCount: part2Answers.length },
          { part: 'PART3', sessionId: part3Data?.sessionId ?? '', scores: p3Scores, answeredCount: part3Answers.length },
        ])

        setPhase('results')
      } catch {
        setError('Failed to complete test. Your answers were saved.')
        setPhase('results')
      }
    }

    complete()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // ── Cleanup timers on unmount ──────────────────────────────────────────────

  useEffect(() => {
    return () => {
      clearTransitionTimer()
      clearPrepTimer()
    }
  }, [clearTransitionTimer, clearPrepTimer])

  // ── Handle reset ───────────────────────────────────────────────────────────

  function handleReset() {
    clearTransitionTimer()
    clearPrepTimer()
    setPhase('intro')
    setError(null)
    setPart1Data(null)
    setPart2Data(null)
    setPart3Data(null)
    setPart1Index(0)
    setPart2FollowupIndex(0)
    setPart3Index(0)
    setPart1Answers([])
    setPart2Answers([])
    setPart3Answers([])
    setPartResults([])
  }

  // ── Derived current question info ──────────────────────────────────────────

  const currentPart1Question = part1Data?.questions[part1Index]
  const currentPart2Followup = part2Data?.questions[1 + part2FollowupIndex]
  const currentPart3Question = part3Data?.questions[part3Index]

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="pb-24 md:pb-8">
      {/* Sticky top bar — shown during active test phases */}
      {phase !== 'intro' && phase !== 'loading' && phase !== 'results' && (
        <div
          className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 border-b backdrop-blur-md"
          style={{
            background: 'var(--bg-base)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Mic className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Full IELTS Speaking Test</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Simulated examination</p>
              </div>
            </div>

            <PartProgressBar phase={phase} />

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>~14 min</span>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div
        className={`max-w-2xl mx-auto px-4 sm:px-6 pb-8 ${
          phase !== 'intro' && phase !== 'loading' && phase !== 'results'
            ? 'pt-6'
            : 'pt-8 md:pt-12'
        }`}
      >
        <AnimatePresence mode="wait">

          {/* ── INTRO ── */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center gap-8 pt-16"
            >
              {/* Icon */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Mic className="w-12 h-12 text-blue-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">AI</span>
                </div>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-slate-100 mb-3 tracking-tight">
                  Full IELTS Speaking Test
                </h1>
                <p className="text-slate-400 leading-relaxed max-w-lg">
                  A complete simulation of the IELTS Speaking examination. Three parts, authentic
                  timing, and AI-powered scoring across all four assessment criteria.
                </p>
              </div>

              {/* Structure overview */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {[
                  {
                    part: 'Part 1',
                    desc: 'Introduction & Interview',
                    detail: '5 personal questions · 30 seconds each',
                    color: 'blue',
                  },
                  {
                    part: 'Part 2',
                    desc: 'Individual Long Turn',
                    detail: '1 min prep · 2 min speaking · 2 follow-ups',
                    color: 'amber',
                  },
                  {
                    part: 'Part 3',
                    desc: 'Two-way Discussion',
                    detail: '5 abstract questions · 60 seconds each',
                    color: 'emerald',
                  },
                ].map(({ part, desc, detail, color }) => (
                  <div
                    key={part}
                    className={`rounded-xl border border-${color}-500/20 bg-${color}-500/5 p-4`}
                  >
                    <p className={`text-xs font-bold text-${color}-400 uppercase tracking-widest mb-1`}>
                      {part}
                    </p>
                    <p className="text-sm font-semibold text-slate-200 mb-1">{desc}</p>
                    <p className="text-xs text-slate-500">{detail}</p>
                  </div>
                ))}
              </div>

              {/* Instructions */}
              <div className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                  Before you begin
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  {[
                    'Ensure you are in a quiet environment with no interruptions',
                    'Allow microphone access when prompted by your browser',
                    'You cannot skip or go back — just like the real exam',
                    'Speak clearly and at a natural pace',
                    'Each recording starts automatically or when you press the button',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <div className="w-full flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={generateAllParts}
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/25"
              >
                Start Full IELTS Test
              </button>

              <p className="text-xs text-slate-600">
                Approximately 14 minutes · AI grading across all parts
              </p>
            </motion.div>
          )}

          {/* ── LOADING ── */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6 pt-32"
            >
              <div className="relative w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-blue-500/20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-200 mb-1">Preparing your test…</p>
                <p className="text-sm text-slate-500">Generating questions for all three parts</p>
              </div>
            </motion.div>
          )}

          {/* ── PART 1 ── */}
          {phase === 'part1' && currentPart1Question && (
            <motion.div
              key={`part1-${part1Index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              {/* Part header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Part 1 — Introduction</h2>
                  <p className="text-sm text-slate-500">{PART_DESCRIPTIONS.PART1}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-300">{part1Index + 1}</span>
                  <span>/</span>
                  <span>{part1Data?.questions.length}</span>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2">
                {part1Data?.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      i < part1Index
                        ? 'bg-emerald-500'
                        : i === part1Index
                        ? 'bg-blue-500'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Examiner question */}
              <ExaminerQuestion
                question={currentPart1Question.question}
                questionNumber={part1Index + 1}
                totalQuestions={part1Data?.questions.length ?? 5}
                part="Part 1"
              />

              {/* Recorder */}
              <AudioRecorder
                key={recorderKey}
                questionText={currentPart1Question.question}
                maxDuration={30}
                prepTime={3}
                onRecordingComplete={handlePart1Answer}
              />
            </motion.div>
          )}

          {/* ── PART 1 TRANSITION ── */}
          {phase === 'part1_transition' && (
            <motion.div key="p1-transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TransitionScreen
                title="Moving to Part 2"
                description="Well done on Part 1. You will now receive a task card. Take 1 minute to prepare your response before speaking."
                countdown={transitionCount}
              />
            </motion.div>
          )}

          {/* ── PART 2 PREP ── */}
          {phase === 'part2_prep' && part2Data && (
            <motion.div
              key="part2-prep"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Part 2 — Long Turn</h2>
                  <p className="text-sm text-slate-500">Preparation time</p>
                </div>
                <CountdownTimer
                  seconds={prepSeconds}
                  total={60}
                  size={72}
                  color="#F59E0B"
                  label="Prep"
                />
              </div>

              <CueCard
                topic={part3Data?.questions[0]?.question.split(' ')[0] ?? 'Topic'}
                question={part2Data.questions[0]?.question ?? ''}
              />

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="text-sm text-amber-400 font-medium">
                  Make notes now. Recording will begin automatically when the timer reaches zero.
                </p>
              </div>

              <textarea
                className="w-full h-32 rounded-xl bg-white/5 border border-white/10 text-slate-200 placeholder-slate-600 px-4 py-3 text-sm resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
                placeholder="Jot down your notes here (optional)…"
              />
            </motion.div>
          )}

          {/* ── PART 2 SPEAK ── */}
          {phase === 'part2_speak' && part2Data && (
            <motion.div
              key="part2-speak"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-100">Part 2 — Long Turn</h2>
                <p className="text-sm text-slate-500">Speak for 1–2 minutes on your topic</p>
              </div>

              <CueCard
                topic="Topic"
                question={part2Data.questions[0]?.question ?? ''}
              />

              <AudioRecorder
                key={recorderKey}
                questionText={part2Data.questions[0]?.question ?? ''}
                maxDuration={120}
                prepTime={0}
                onRecordingComplete={handlePart2SpeakAnswer}
              />
            </motion.div>
          )}

          {/* ── PART 2 FOLLOW-UP ── */}
          {phase === 'part2_followup' && currentPart2Followup && (
            <motion.div
              key={`part2-followup-${part2FollowupIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Part 2 — Follow-up</h2>
                  <p className="text-sm text-slate-500">
                    Question {part2FollowupIndex + 1} of 2
                  </p>
                </div>
              </div>

              <ExaminerQuestion
                question={currentPart2Followup.question}
                questionNumber={part2FollowupIndex + 1}
                totalQuestions={2}
                part="Part 2 Follow-up"
              />

              <AudioRecorder
                key={recorderKey}
                questionText={currentPart2Followup.question}
                maxDuration={30}
                prepTime={0}
                onRecordingComplete={handlePart2FollowupAnswer}
              />
            </motion.div>
          )}

          {/* ── PART 2 TRANSITION ── */}
          {phase === 'part2_transition' && (
            <motion.div key="p2-transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TransitionScreen
                title="Moving to Part 3"
                description="Excellent! Part 2 is complete. Part 3 involves a more abstract discussion related to your Part 2 topic."
                countdown={transitionCount}
              />
            </motion.div>
          )}

          {/* ── PART 3 ── */}
          {phase === 'part3' && currentPart3Question && (
            <motion.div
              key={`part3-${part3Index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Part 3 — Discussion</h2>
                  <p className="text-sm text-slate-500">{PART_DESCRIPTIONS.PART3}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-300">{part3Index + 1}</span>
                  <span>/</span>
                  <span>{part3Data?.questions.length}</span>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2">
                {part3Data?.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      i < part3Index
                        ? 'bg-emerald-500'
                        : i === part3Index
                        ? 'bg-blue-500'
                        : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <ExaminerQuestion
                question={currentPart3Question.question}
                questionNumber={part3Index + 1}
                totalQuestions={part3Data?.questions.length ?? 5}
                part="Part 3"
              />

              <AudioRecorder
                key={recorderKey}
                questionText={currentPart3Question.question}
                maxDuration={60}
                prepTime={5}
                onRecordingComplete={handlePart3Answer}
              />
            </motion.div>
          )}

          {/* ── PART 3 TRANSITION / COMPLETING ── */}
          {(phase === 'part3_transition' || phase === 'completing') && (
            <motion.div
              key="completing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-6 pt-32 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-14 h-14 rounded-full border-4 border-t-blue-500 border-blue-500/20"
              />
              <div>
                <p className="text-lg font-bold text-slate-100 mb-1">Finalising your results…</p>
                <p className="text-sm text-slate-500">
                  Calculating your band scores across all three parts
                </p>
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {phase === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 pt-8"
            >
              {/* Header */}
              <div className="text-center mb-2">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Test Complete</span>
                </div>
                <h1 className="text-2xl font-black text-slate-100 mb-1">Your Results</h1>
                <p className="text-slate-500 text-sm">Full IELTS Speaking Test · AI Assessment</p>
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-sm text-amber-400">{error}</p>
                </div>
              )}

              <ResultsScreen results={partResults} onRetry={handleReset} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
