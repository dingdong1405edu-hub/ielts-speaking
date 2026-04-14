'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Clock, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import ProgressBar from '@/components/lesson/ProgressBar'
import { cn } from '@/lib/utils'
import type { ExamQuestion } from '@/types'
import { useUserStore } from '@/store/user-store'
import XPGain from '@/components/lesson/XPGain'

const EXAM_CONFIG: Record<string, { level: string; duration: number; title: string }> = {
  hsk1: { level: '1', duration: 40, title: 'HSK 1' },
  hsk2: { level: '2', duration: 55, title: 'HSK 2' },
  hsk3: { level: '3', duration: 90, title: 'HSK 3' },
  hsk4: { level: '4', duration: 105, title: 'HSK 4' },
  hsk5: { level: '5', duration: 125, title: 'HSK 5' },
  hsk6: { level: '6', duration: 140, title: 'HSK 6' },
}

export default function ExamSessionPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.examId as string
  const config = EXAM_CONFIG[examId]

  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'ready' | 'exam' | 'complete'>('ready')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null)
  const { addXp, pendingXp, clearPendingXp } = useUserStore()

  useEffect(() => {
    fetch(`/api/exam?level=${config?.level ?? '1'}&count=20`)
      .then((r) => r.json())
      .then((json) => {
        setQuestions(json.data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [config?.level])

  const handleSubmit = useCallback(async () => {
    const correct = questions.filter((q, i) => answers[i] === q.answer).length
    const total = questions.length
    const score = Math.round((correct / total) * total)
    const pct = Math.round((correct / total) * 100)
    const xpEarned = Math.round(30 * (pct / 100))
    try {
      await fetch('/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: examId,
          score: correct,
          maxScore: total,
          details: { answers, questions: questions.map((q) => ({ question: q.question, answer: q.answer })) },
        }),
      })
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EXAM',
          title: `${config?.title ?? examId.toUpperCase()} — Đề thi thử`,
          content: { examId, answers, correct, total },
          score: pct,
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
    setResult({ score: correct, correct, total })
    setPhase('complete')
  }, [questions, answers, examId, config, addXp])

  useEffect(() => {
    if (phase !== 'exam') return
    setTimeLeft(config ? config.duration * 60 : 2400)
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timer); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, config, handleSubmit])

  const selectOption = (opt: string) => setSelected(opt)

  const next = () => {
    if (selected) setAnswers((a) => ({ ...a, [current]: selected }))
    setSelected(null)
    if (current + 1 >= questions.length) handleSubmit()
    else setCurrent((c) => c + 1)
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  if (!config) return (
    <div className="page-container text-center py-16">
      <p>Không tìm thấy đề thi</p>
      <Button className="mt-4" onClick={() => router.push('/exam')}>Quay lại</Button>
    </div>
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )

  if (phase === 'ready') return (
    <div className="page-container max-w-lg mx-auto text-center py-12">
      <div className="text-6xl mb-4">🏆</div>
      <h1 className="text-2xl font-black mb-2">Thi thử {config.title}</h1>
      <div className="flex gap-4 justify-center my-6 text-sm">
        <div className="bg-surface rounded-xl border border-border px-4 py-3">
          <p className="font-black text-xl">{questions.length}</p>
          <p className="text-muted-foreground">Câu hỏi</p>
        </div>
        <div className="bg-surface rounded-xl border border-border px-4 py-3">
          <p className="font-black text-xl">{config.duration}&apos;</p>
          <p className="text-muted-foreground">Thời gian</p>
        </div>
      </div>
      <p className="text-muted-foreground text-sm mb-8">
        Đề thi được tạo bởi AI theo chuẩn {config.title}. Chúc bạn thi tốt!
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => router.push('/exam')}>
          <ArrowLeft className="w-4 h-4 mr-2" />Quay lại
        </Button>
        <Button size="lg" onClick={() => setPhase('exam')}>🚀 Bắt đầu thi</Button>
      </div>
    </div>
  )

  if (phase === 'complete' && result) return (
    <div className="page-container max-w-lg mx-auto text-center py-12">
      {pendingXp > 0 && <XPGain xp={pendingXp} onAnimationEnd={clearPendingXp} />}
      <div className="text-6xl mb-4">{result.correct / result.total >= 0.6 ? '🎉' : '💪'}</div>
      <h2 className="text-2xl font-black mb-2">Kết quả thi</h2>
      <div className="flex gap-4 justify-center my-6">
        <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20 min-w-[100px]">
          <p className="font-black text-3xl text-primary">{result.correct}/{result.total}</p>
          <p className="text-xs text-muted-foreground">Câu đúng</p>
        </div>
        <div className="bg-secondary/10 rounded-2xl p-5 border border-secondary/20 min-w-[100px]">
          <p className="font-black text-3xl text-secondary">{Math.round((result.correct / result.total) * 100)}%</p>
          <p className="text-xs text-muted-foreground">Tỷ lệ đúng</p>
        </div>
      </div>
      <p className="text-muted-foreground mb-8">
        {result.correct / result.total >= 0.6
          ? '🎊 Chúc mừng! Bạn đạt điểm qua!'
          : 'Cần luyện thêm một chút nữa nhé!'}
      </p>
      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={() => router.push('/exam')}>Về trang thi</Button>
        <Button onClick={() => { setPhase('ready'); setCurrent(0); setAnswers({}) }}>Thi lại</Button>
      </div>
    </div>
  )

  const q = questions[current]
  return (
    <div className="page-container max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-sm text-muted-foreground">{config.title}</span>
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl px-3 py-1.5">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className={cn('font-black text-sm', timeLeft < 60 ? 'text-danger' : 'text-orange-600')}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      <ProgressBar current={current} total={questions.length} className="mb-6" />

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Câu {current + 1}/{questions.length}
          </p>
          <p className="font-bold text-lg text-foreground font-chinese">{q.question}</p>
        </div>

        <div className="space-y-3">
          {q.options?.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectOption(opt)}
              className={cn(
                'lesson-btn',
                selected === opt ? 'lesson-btn-selected' : 'lesson-btn-default'
              )}
            >
              <span className="font-bold text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          ))}
        </div>

        <Button
          size="lg"
          className="w-full"
          onClick={next}
          variant={selected ? 'default' : 'outline'}
        >
          {current + 1 >= questions.length ? 'Nộp bài' : 'Tiếp theo →'}
        </Button>

        <button
          onClick={() => { setAnswers((a) => ({ ...a, [current]: '' })); next() }}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          Bỏ qua câu này
        </button>
      </div>
    </div>
  )
}
