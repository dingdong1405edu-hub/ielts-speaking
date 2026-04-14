'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ArrowUpCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackData {
  questionText: string
  transcript: string
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
  questionIndex: number
}

interface FeedbackPanelProps {
  feedback: FeedbackData
  defaultOpen?: boolean
}

export function FeedbackPanel({ feedback, defaultOpen = false }: FeedbackPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [showFullFeedback, setShowFullFeedback] = useState(false)

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header / toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors duration-150 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center border border-blue-500/30">
            {feedback.questionIndex + 1}
          </span>
          <span className="text-sm font-medium text-slate-200 truncate">
            {feedback.questionText}
          </span>
        </div>
        <span className="flex-shrink-0 ml-3 text-slate-400">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-col gap-4 border-t border-white/10 pt-4">

              {/* Transcript */}
              {feedback.transcript && (
                <div>
                  <p className="text-xs uppercase tracking-wide font-medium text-slate-500 mb-2">
                    Your Answer
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed bg-white/5 rounded-lg px-4 py-3 border border-white/10 italic">
                    &ldquo;{feedback.transcript}&rdquo;
                  </p>
                </div>
              )}

              {/* Strengths */}
              {feedback.strengths.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide font-medium text-emerald-500 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Strengths
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {feedback.strengths.map((s, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {feedback.improvements.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide font-medium text-orange-400 mb-2 flex items-center gap-1.5">
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    Areas to Improve
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {feedback.improvements.map((s, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.1 }}
                        className="flex items-start gap-2 text-sm text-slate-300"
                      >
                        <ArrowUpCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Feedback - collapsible */}
              {feedback.detailedFeedback && (
                <div>
                  <button
                    onClick={() => setShowFullFeedback((f) => !f)}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors mb-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {showFullFeedback ? 'Hide' : 'Show'} Examiner Feedback
                    {showFullFeedback ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showFullFeedback && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className={cn(
                          'text-sm text-slate-300 leading-relaxed',
                          'bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3',
                        )}>
                          {feedback.detailedFeedback}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
