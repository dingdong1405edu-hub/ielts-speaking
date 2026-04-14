'use client'

import { useState, useEffect } from 'react'
import { Loader2, Map } from 'lucide-react'
import GrammarPathMap from '@/components/grammar/GrammarPathMap'
import type { GrammarLesson } from '@/types'

interface LessonProgress {
  lessonId: string
  bestScore: number
}

export default function GrammarPage() {
  const [lessons, setLessons] = useState<GrammarLesson[]>([])
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/lessons').then((r) => r.json()),
      fetch('/api/grammar-progress').then((r) => r.json()),
    ])
      .then(([lessonsRes, progressRes]) => {
        setLessons(lessonsRes.data ?? [])
        setProgress(progressRes.data ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const completedCount = progress.filter((p) => p.bestScore > 0).length

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-4 py-1.5 text-sm font-bold mb-3">
          <Map className="w-4 h-4" />
          Hành trình ngữ pháp
        </div>
        <h1 className="text-2xl font-black">Ngữ pháp tiếng Trung</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {completedCount}/{lessons.length} bài hoàn thành
        </p>
        {/* Overall progress bar */}
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto mt-3">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{
              width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* Path Map */}
      <GrammarPathMap lessons={lessons} progress={progress} />
    </div>
  )
}
