'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import QuizGame from '@/components/grammar/QuizGame'
import type { GrammarLesson } from '@/types'

export default function GrammarLessonPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = params.lessonId as string
  const [lesson, setLesson] = useState<GrammarLesson | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then((r) => r.json())
      .then((json) => {
        setLesson(json.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [lessonId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div className="text-4xl mb-3">📝</div>
        <p className="font-bold">Không tìm thấy bài học</p>
        <Button className="mt-4" onClick={() => router.push('/grammar')}>
          Quay lại
        </Button>
      </div>
    )
  }

  return <QuizGame lesson={lesson} />
}
