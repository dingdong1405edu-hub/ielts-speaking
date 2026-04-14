'use client'
import { useState } from 'react'
import { Play, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import MultipleChoice from '@/components/quiz/MultipleChoice'
import { useUserStore } from '@/store/user-store'
import XPGain from '@/components/lesson/XPGain'
import ProgressBar from '@/components/lesson/ProgressBar'

interface ListeningExercise {
  title: string
  script: string
  pinyin: string
  translation: string
  questions: Array<{
    question: string
    options: string[]
    answer: string
    explanation: string
  }>
}

const LEVELS = [1, 2, 3, 4, 5, 6]

export default function ListeningPage() {
  const [level, setLevel] = useState(1)
  const [exercise, setExercise] = useState<ListeningExercise | null>(null)
  const [loading, setLoading] = useState(false)
  const [showScript, setShowScript] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'listening' | 'quiz' | 'complete'>('idle')
  const { addXp, pendingXp, clearPendingXp } = useUserStore()

  const generate = async () => {
    setLoading(true)
    setShowScript(false)
    setQIndex(0)
    setScore(0)
    try {
      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'listening', level }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setExercise(json.data)
      setPhase('listening')
    } catch {
      toast.error('Không thể tạo bài nghe. Thử lại nhé!')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (correct: boolean) => {
    if (correct) setScore((s) => s + 1)
    const questions = exercise?.questions ?? []
    if (qIndex + 1 >= questions.length) {
      const finalScore = Math.round(((score + (correct ? 1 : 0)) / questions.length) * 100)
      const xpEarned = Math.round(12 * (finalScore / 100)) + 5
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'LISTENING',
            title: exercise?.title ?? `Bài nghe HSK ${level}`,
            content: { script: exercise?.script },
            score: finalScore,
            xpEarned,
          }),
        })
        await fetch('/api/user', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xpToAdd: xpEarned }),
        })
        addXp(xpEarned)
      } catch { /* ignore */ }
      setPhase('complete')
    } else {
      setQIndex((i) => i + 1)
    }
  }

  return (
    <div className="page-container max-w-2xl mx-auto">
      {pendingXp > 0 && <XPGain xp={pendingXp} onAnimationEnd={clearPendingXp} />}

      <div className="page-header">
        <h1 className="text-2xl font-black">Luyện nghe 🎧</h1>
        <p className="text-muted-foreground text-sm mt-1">Nghe hiểu theo trình độ HSK</p>
      </div>

      {/* Level selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              level === l ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-muted-foreground hover:border-muted-foreground'
            }`}
          >
            HSK {l}
          </button>
        ))}
      </div>

      {phase === 'idle' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎧</div>
          <h2 className="text-xl font-black mb-2">Bài nghe HSK {level}</h2>
          <p className="text-muted-foreground mb-6">AI sẽ tạo bài nghe phù hợp với trình độ của bạn</p>
          <Button size="lg" onClick={generate} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang tạo...</> : '🎯 Tạo bài nghe'}
          </Button>
        </div>
      )}

      {phase === 'listening' && exercise && (
        <div className="space-y-5">
          <h2 className="text-xl font-black">{exercise.title}</h2>

          {/* Script display */}
          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-foreground">Đoạn hội thoại</span>
              <button
                onClick={() => setShowScript(!showScript)}
                className="text-xs text-muted-foreground hover:text-foreground font-semibold"
              >
                {showScript ? 'Ẩn phiên âm' : 'Xem phiên âm'}
              </button>
            </div>
            <p className="font-chinese text-lg text-foreground leading-relaxed">{exercise.script}</p>
            {showScript && <p className="text-secondary text-sm mt-2">{exercise.pinyin}</p>}
          </div>

          {/* Translation toggle */}
          <details className="bg-surface rounded-2xl border border-border p-4">
            <summary className="cursor-pointer font-semibold text-sm text-muted-foreground select-none">
              Xem nghĩa tiếng Việt
            </summary>
            <p className="mt-3 text-sm text-foreground">{exercise.translation}</p>
          </details>

          <Button size="lg" className="w-full" onClick={() => setPhase('quiz')}>
            Làm bài tập ({exercise.questions.length} câu) →
          </Button>
        </div>
      )}

      {phase === 'quiz' && exercise && (
        <div>
          <ProgressBar current={qIndex} total={exercise.questions.length} className="mb-6" />
          <h3 className="font-bold text-sm text-muted-foreground mb-4">
            Câu {qIndex + 1}/{exercise.questions.length}
          </h3>
          <MultipleChoice
            question={exercise.questions[qIndex].question}
            options={exercise.questions[qIndex].options}
            answer={exercise.questions[qIndex].answer}
            explanation={exercise.questions[qIndex].explanation}
            onAnswer={handleAnswer}
          />
        </div>
      )}

      {phase === 'complete' && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-black mb-2">Hoàn thành!</h2>
          <p className="text-muted-foreground mb-6">
            Đúng {score}/{exercise?.questions.length} câu
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setPhase('idle'); setExercise(null) }}>
              <RefreshCw className="w-4 h-4 mr-2" />Bài khác
            </Button>
            <Button onClick={generate}>Làm lại bài này</Button>
          </div>
        </div>
      )}
    </div>
  )
}
