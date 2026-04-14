'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTopicEmoji } from '@/lib/utils'

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

const PARTS: { id: Part; label: string; description: string; duration: string }[] = [
  {
    id: 'PART1',
    label: 'Part 1',
    description: 'Short, familiar questions about yourself and everyday topics',
    duration: '1–2 min each',
  },
  {
    id: 'PART2',
    label: 'Part 2',
    description: 'Long-turn cue card — speak for 1–2 minutes on a topic',
    duration: '1–2 min',
  },
  {
    id: 'PART3',
    label: 'Part 3',
    description: 'Abstract discussion questions linked to the Part 2 topic',
    duration: '2–3 min each',
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
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
          done
            ? 'bg-blue-500 text-white'
            : 'bg-white/10 text-slate-400 border border-white/10'
        }`}
      >
        {n}
      </div>
      <span className={`text-sm font-medium ${done ? 'text-slate-200' : 'text-slate-500'}`}>
        {label}
      </span>
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

  const canStart = selectedPart !== null && selectedTopic !== null

  async function handleStart() {
    if (!canStart) return
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
        throw new Error(data.error ?? 'Failed to generate questions')
      }

      router.push(`/practice/${data.sessionId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Mic className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">Topic Practice</h1>
          </div>
          <p className="text-slate-400 ml-[52px]">
            Choose a topic and IELTS part to get AI-generated questions and real-time grading.
          </p>
        </motion.div>

        {/* Progress steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-6 mb-8"
        >
          <StepBadge n={1} label="Select Part" done={selectedPart !== null} />
          <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
          <StepBadge n={2} label="Select Topic" done={selectedTopic !== null} />
          <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
          <StepBadge n={3} label="Settings" done={false} />
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
                  <CardTitle>Step 1 — Select Part</CardTitle>
                </div>
                <CardDescription>Choose which IELTS Speaking part to practice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PARTS.map((part) => {
                    const active = selectedPart === part.id
                    return (
                      <button
                        key={part.id}
                        onClick={() => setSelectedPart(part.id)}
                        className={`relative rounded-xl border p-4 text-left transition-all duration-200 ${
                          active
                            ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-sm font-bold ${active ? 'text-blue-400' : 'text-slate-200'}`}>
                            {part.label}
                          </span>
                          {active && (
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                                <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">
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
                      <CardTitle>Step 2 — Select Topic</CardTitle>
                    </div>
                    <CardDescription>Pick a topic for your {selectedPart?.replace('PART', 'Part ')} practice session</CardDescription>
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
                            className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 text-center transition-all duration-200 ${
                              active
                                ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                            }`}
                          >
                            <span className="text-2xl leading-none">{emoji}</span>
                            <span className={`text-xs font-medium leading-tight ${active ? 'text-blue-300' : 'text-slate-300'}`}>
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
                      <CardTitle>Step 3 — Settings</CardTitle>
                    </div>
                    <CardDescription>Customise the number of questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-300 font-medium">Number of Questions</span>
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
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              questionCount === n
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                                : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Approx. {questionCount * 2}–{questionCount * 3} minutes
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
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500 mb-3 font-medium">Session Summary</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">{selectedPart?.replace('PART', 'Part ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg leading-none">{getTopicEmoji(selectedTopic!)}</span>
                      <span className="text-slate-300">{selectedTopic}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">{questionCount} questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-300">AI grading</span>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

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
                      Generating questions…
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Start Practice Session
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
