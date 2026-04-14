'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Star, X, Mic, BookOpen, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RoadmapTrack, type Unit, type Lesson } from '@/components/beginner/RoadmapTrack'
import dynamic from 'next/dynamic'

const AudioRecorder = dynamic(() => import('@/components/audio/AudioRecorder'), { ssr: false })

// ---------------------------------------------------------------------------
// Curriculum data
// ---------------------------------------------------------------------------

const UNITS: Unit[] = [
  {
    id: 'unit1',
    title: 'First Steps',
    color: '#3B82F6',
    lessons: [
      { id: 'u1l1', title: 'Introducing Yourself', xp: 20, type: 'speak' },
      { id: 'u1l2', title: 'Basic Greetings', xp: 20, type: 'vocabulary' },
      { id: 'u1l3', title: 'Numbers & Dates', xp: 25, type: 'speak' },
      { id: 'u1l4', title: 'Your Daily Routine', xp: 30, type: 'speak' },
    ],
  },
  {
    id: 'unit2',
    title: 'Everyday Topics',
    color: '#10B981',
    lessons: [
      { id: 'u2l1', title: 'Family & Friends', xp: 30, type: 'speak' },
      { id: 'u2l2', title: 'Hobbies & Interests', xp: 30, type: 'speak' },
      { id: 'u2l3', title: 'Food & Restaurants', xp: 35, type: 'speak' },
      { id: 'u2l4', title: 'Travel & Transport', xp: 35, type: 'speak' },
    ],
  },
  {
    id: 'unit3',
    title: 'Expressing Opinions',
    color: '#8B5CF6',
    lessons: [
      { id: 'u3l1', title: 'Agreeing & Disagreeing', xp: 40, type: 'speak' },
      { id: 'u3l2', title: 'Giving Reasons', xp: 40, type: 'speak' },
      { id: 'u3l3', title: 'Comparing Options', xp: 45, type: 'speak' },
    ],
  },
  {
    id: 'unit4',
    title: 'Complex Ideas',
    color: '#F59E0B',
    lessons: [
      { id: 'u4l1', title: 'Technology & Society', xp: 50, type: 'speak' },
      { id: 'u4l2', title: 'Environment & Change', xp: 50, type: 'speak' },
      { id: 'u4l3', title: 'Education Systems', xp: 55, type: 'speak' },
    ],
  },
  {
    id: 'unit5',
    title: 'IELTS Ready',
    color: '#EF4444',
    lessons: [
      { id: 'u5l1', title: 'Part 1 Mastery', xp: 60, type: 'speak' },
      { id: 'u5l2', title: 'Part 2 Cue Cards', xp: 65, type: 'speak' },
      { id: 'u5l3', title: 'Part 3 Discussion', xp: 70, type: 'speak' },
    ],
  },
]

// ---------------------------------------------------------------------------
// Hardcoded practice questions per lesson
// ---------------------------------------------------------------------------

const LESSON_QUESTIONS: Record<string, string> = {
  u1l1: 'Please introduce yourself. Tell me your name, where you are from, and what you do.',
  u1l2: 'How do you greet someone you have just met for the first time in your country?',
  u1l3: 'Can you tell me your date of birth and your phone number?',
  u1l4: 'Describe your typical daily routine from when you wake up to when you go to sleep.',
  u2l1: 'Tell me about your family. How many people are in your family and what do they do?',
  u2l2: 'What are your hobbies and interests? How much time do you spend on them?',
  u2l3: 'Describe a restaurant you enjoy visiting. What kind of food do they serve?',
  u2l4: 'How do you usually travel around your city? Do you prefer public transport or driving?',
  u3l1: 'Do you agree that technology has made our lives easier? Give reasons for your answer.',
  u3l2: 'Why do you think some people prefer living in cities while others prefer the countryside?',
  u3l3: 'Compare studying alone versus studying in a group. Which do you think is more effective?',
  u4l1: 'How has technology changed the way people communicate over the past decade?',
  u4l2: 'What do you think is the most serious environmental problem facing the world today?',
  u4l3: 'Compare the education systems in two countries you know about. What are the main differences?',
  u5l1: 'Where are you from and what do you like most about living there?',
  u5l2: 'Describe a memorable journey you have taken. You should say where you went, when you went, who you went with, and explain why it was memorable.',
  u5l3: 'Some people believe that in the future, artificial intelligence will replace many jobs. To what extent do you agree or disagree with this view?',
}

// ---------------------------------------------------------------------------
// Confetti burst (CSS-only, lightweight)
// ---------------------------------------------------------------------------

function ConfettiBurst() {
  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899']
  const pieces = Array.from({ length: 28 }, (_, i) => i)

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((i) => {
        const color = colors[i % colors.length]
        const left = `${Math.random() * 100}%`
        const delay = Math.random() * 0.4
        const duration = 1.2 + Math.random() * 0.8
        const size = 8 + Math.random() * 8

        return (
          <motion.div
            key={i}
            style={{ left, top: '-5%', width: size, height: size, backgroundColor: color, borderRadius: Math.random() > 0.5 ? '50%' : '2px' }}
            initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{
              y: '110vh',
              opacity: [1, 1, 0],
              rotate: Math.random() * 720 - 360,
              x: Math.random() * 200 - 100,
            }}
            transition={{ duration, delay, ease: 'easeIn' }}
          />
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// XP Progress bar
// ---------------------------------------------------------------------------

const XP_LEVEL_THRESHOLD = 500

function XPBar({ xp, streak }: { xp: number; streak: number }) {
  const progress = (xp % XP_LEVEL_THRESHOLD) / XP_LEVEL_THRESHOLD
  const level = Math.floor(xp / XP_LEVEL_THRESHOLD) + 1

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/8 bg-[#1E293B]/60 px-5 py-4 mb-6">
      {/* Streak */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
          <Flame className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-orange-400 leading-none">{streak}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Streak</p>
        </div>
      </div>

      <div className="w-px h-10 bg-white/8 mx-1 shrink-0" />

      {/* XP bar */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">Level {level}</span>
          <span className="text-slate-500">{xp} XP</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-slate-600">{XP_LEVEL_THRESHOLD - (xp % XP_LEVEL_THRESHOLD)} XP to next level</span>
        </div>
      </div>

      {/* Total XP badge */}
      <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
        <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" strokeWidth={0} />
        <span className="text-sm font-bold text-yellow-400">{xp}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Lesson Modal
// ---------------------------------------------------------------------------

interface LessonModalProps {
  lesson: Lesson
  unit: Unit
  onClose: () => void
  onComplete: (lessonId: string, xp: number) => Promise<{ newXP: number; newStreak: number }>
}

type ModalStep = 'practice' | 'success'

function LessonModal({ lesson, unit, onClose, onComplete }: LessonModalProps) {
  const [step, setStep] = useState<ModalStep>('practice')
  const [newXP, setNewXP] = useState<number | null>(null)
  const [newStreak, setNewStreak] = useState<number | null>(null)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const hasCompletedRef = useRef(false)

  const question = LESSON_QUESTIONS[lesson.id] ?? `Tell me about the topic: ${lesson.title}.`

  async function handleRecordingComplete() {
    if (hasCompletedRef.current || isCompleting) return
    hasCompletedRef.current = true
    setIsCompleting(true)

    try {
      const result = await onComplete(lesson.id, lesson.xp)
      setNewXP(result.newXP)
      setNewStreak(result.newStreak)
      setShowConfetti(true)
      setStep('success')
      setTimeout(() => setShowConfetti(false), 2500)
    } catch {
      // still show success — best effort
      setStep('success')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <>
      {showConfetti && <ConfettiBurst />}

      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 8 }}
          transition={{ type: 'spring', stiffness: 240, damping: 26 }}
          className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0F172A] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${unit.color}22 0%, ${unit.color}08 100%)` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                style={{ backgroundColor: unit.color }}
              >
                {lesson.type === 'vocabulary' ? (
                  <BookOpen className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{unit.title}</p>
                <p className="text-sm font-bold text-slate-200">{lesson.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === 'practice' ? (
                <motion.div
                  key="practice"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  className="flex flex-col gap-4"
                >
                  <AudioRecorder
                    questionText={question}
                    maxDuration={60}
                    prepTime={lesson.type === 'speak' ? 15 : 0}
                    onRecordingComplete={handleRecordingComplete}
                  />

                  {isCompleting && (
                    <div className="flex items-center justify-center gap-2 py-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 rounded-full border-2 border-blue-500/30 border-t-blue-500"
                      />
                      <span className="text-sm text-slate-400">Saving progress…</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5 py-6 text-center"
                >
                  {/* Big success icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.25 }}
                    >
                      <svg className="w-10 h-10 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </motion.div>
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-100">Great job!</h3>
                    <p className="text-slate-400 mt-1">You completed &ldquo;{lesson.title}&rdquo;</p>
                  </div>

                  {/* XP reward */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20"
                  >
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-xl font-bold text-yellow-400">+{lesson.xp} XP</span>
                  </motion.div>

                  {/* New stats */}
                  {newXP !== null && (
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-lg font-bold text-slate-200">{newXP}</p>
                        <p className="text-xs text-slate-500">Total XP</p>
                      </div>
                      {newStreak !== null && (
                        <>
                          <div className="w-px h-8 bg-white/8" />
                          <div>
                            <p className="text-lg font-bold text-orange-400">{newStreak}</p>
                            <p className="text-xs text-slate-500">Day Streak</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full mt-2 py-3 rounded-xl font-semibold text-white transition-all duration-200 text-sm"
                    style={{ backgroundColor: unit.color }}
                  >
                    Continue
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

interface ProgressData {
  completedLessons: string[]
  totalXP: number
  streak: number
}

export default function BeginnerPage() {
  const [progressData, setProgressData] = useState<ProgressData>({
    completedLessons: [],
    totalXP: 0,
    streak: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<{ lesson: Lesson; unit: Unit } | null>(null)

  // ── Load progress ──────────────────────────────────────────────────────────

  const loadProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/user/beginner-progress')
      if (res.ok) {
        const data = await res.json() as { completedLessons: string[]; totalXP: number; streak: number }
        setProgressData({ completedLessons: data.completedLessons, totalXP: data.totalXP, streak: data.streak })
      }
    } catch {
      // silently fail — default state is fine
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  // ── Mark lesson complete ───────────────────────────────────────────────────

  async function handleLessonComplete(lessonId: string, xp: number) {
    const res = await fetch('/api/user/beginner-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, xpEarned: xp }),
    })
    if (!res.ok) throw new Error('Failed to save progress')
    const data = await res.json() as { completedLessons: string[]; totalXP: number; streak: number }

    // Update local state from server response
    setProgressData({
      completedLessons: data.completedLessons,
      totalXP: data.totalXP,
      streak: data.streak,
    })

    return { newXP: data.totalXP, newStreak: data.streak }
  }

  function handleModalClose() {
    setActiveLesson(null)
  }

  const completedSet = new Set(progressData.completedLessons)
  const totalLessons = UNITS.reduce((sum, u) => sum + u.lessons.length, 0)
  const completedCount = progressData.completedLessons.length

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-20">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Star className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Beginner Path</h1>
          </div>
          <p className="text-slate-400 ml-[52px] text-sm">
            {completedCount} / {totalLessons} lessons completed
          </p>
        </motion.div>

        {/* XP bar */}
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <XPBar xp={progressData.totalXP} streak={progressData.streak} />
          </motion.div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="flex flex-col items-center gap-8 py-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-6 w-full">
                <div className="h-14 w-72 rounded-2xl bg-white/5 animate-pulse" />
                <div className="flex flex-col items-center gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="w-[60px] h-[60px] rounded-full bg-white/5 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Roadmap */
          <RoadmapTrack
            units={UNITS}
            completedLessons={completedSet}
            onLessonClick={(lesson, unit) => setActiveLesson({ lesson, unit })}
          />
        )}
      </div>

      {/* Lesson modal */}
      <AnimatePresence>
        {activeLesson && (
          <LessonModal
            key={activeLesson.lesson.id}
            lesson={activeLesson.lesson}
            unit={activeLesson.unit}
            onClose={handleModalClose}
            onComplete={handleLessonComplete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
