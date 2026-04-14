'use client'
import { useState, useEffect } from 'react'
import { Loader2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/user-store'
import XPGain from '@/components/lesson/XPGain'
import { cn, shuffleArray } from '@/lib/utils'

type WritingMode = 'arrange' | 'free'

interface ArrangeExercise {
  original: string
  meaning: string
  words: string[]
}

const ARRANGE_EXERCISES: Record<number, ArrangeExercise[]> = {
  1: [
    { original: '我 是 学生', meaning: 'Tôi là học sinh', words: ['学生', '是', '我'] },
    { original: '他 很 好', meaning: 'Anh ấy rất tốt', words: ['好', '他', '很'] },
    { original: '你 叫 什么 名字', meaning: 'Bạn tên là gì?', words: ['名字', '你', '叫', '什么'] },
  ],
  2: [
    { original: '我 喜欢 学习 汉语', meaning: 'Tôi thích học tiếng Trung', words: ['汉语', '我', '学习', '喜欢'] },
    { original: '今天 天气 很 好', meaning: 'Hôm nay thời tiết rất đẹp', words: ['好', '今天', '很', '天气'] },
  ],
  3: [
    { original: '我们 一起 去 吃饭 吧', meaning: 'Chúng ta cùng đi ăn nhé', words: ['去', '我们', '吃饭', '吧', '一起'] },
  ],
}

export default function WritingPage() {
  const [mode, setMode] = useState<WritingMode>('arrange')
  const [level, setLevel] = useState(1)
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [arranged, setArranged] = useState<string[]>([])
  const [remaining, setRemaining] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [freeText, setFreeText] = useState('')
  const [freePrompt, setFreePrompt] = useState('')
  const [grading, setGrading] = useState(false)
  const [gradeResult, setGradeResult] = useState<{ score: number; feedback: string; corrections: Array<{original: string; corrected: string; explanation: string}>; suggestions: string[] } | null>(null)
  const { addXp, pendingXp, clearPendingXp } = useUserStore()

  const exercises = ARRANGE_EXERCISES[level] ?? ARRANGE_EXERCISES[1]
  const exercise = exercises[exerciseIndex % exercises.length]

  const initExercise = (ex: ArrangeExercise) => {
    setArranged([])
    setRemaining(shuffleArray(ex.words))
    setChecked(false)
  }

  useEffect(() => {
    initExercise(exercise)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, exerciseIndex])

  const addWord = (word: string, idx: number) => {
    if (checked) return
    setArranged((a) => [...a, word])
    setRemaining((r) => r.filter((_, i) => i !== idx))
  }

  const removeWord = (word: string, idx: number) => {
    if (checked) return
    setRemaining((r) => [...r, word])
    setArranged((a) => a.filter((_, i) => i !== idx))
  }

  const checkArrange = async () => {
    setChecked(true)
    const answer = arranged.join(' ')
    const correct = answer === exercise.original
    const xpEarned = correct ? 15 : 5
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WRITING',
          title: `Sắp xếp: ${exercise.meaning}`,
          content: { exercise: exercise.original, answer, correct },
          score: correct ? 100 : 30,
          xpEarned,
        }),
      })
      await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ xpToAdd: xpEarned }) })
      addXp(xpEarned)
    } catch { /* ignore */ }
  }

  const nextArrange = () => {
    const nextEx = exercises[(exerciseIndex + 1) % exercises.length]
    setExerciseIndex((i) => i + 1)
    initExercise(nextEx)
  }

  const gradeWriting = async () => {
    if (!freeText.trim()) return
    setGrading(true)
    try {
      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'gradeWriting', level, text: freeText, prompt: freePrompt }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setGradeResult(json.data)
      const xpEarned = Math.round(15 * (json.data.score / 100))
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'WRITING',
          title: `Viết tự do: ${freePrompt || 'Bài viết tiếng Trung'}`,
          content: { text: freeText, feedback: json.data.feedback },
          score: json.data.score,
          xpEarned,
        }),
      })
      await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ xpToAdd: xpEarned }) })
      addXp(xpEarned)
    } catch {
      toast.error('Không thể chấm bài. Thử lại nhé!')
    } finally {
      setGrading(false)
    }
  }

  const isCorrect = checked && arranged.join(' ') === exercise.original

  return (
    <div className="page-container max-w-2xl mx-auto">
      {pendingXp > 0 && <XPGain xp={pendingXp} onAnimationEnd={clearPendingXp} />}

      <div className="page-header">
        <h1 className="text-2xl font-black">Luyện viết ✏️</h1>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        {(['arrange', 'free'] as WritingMode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-xl font-bold text-sm border-2 transition-all ${
              mode === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
            }`}
          >
            {m === 'arrange' ? '🔤 Sắp xếp từ' : '✍️ Viết tự do'}
          </button>
        ))}
      </div>

      {mode === 'arrange' && (
        <div className="space-y-5">
          {/* Level */}
          <div className="flex gap-2">
            {[1, 2, 3].map((l) => (
              <button key={l} onClick={() => { setLevel(l); setExerciseIndex(0); initExercise(ARRANGE_EXERCISES[l]?.[0] ?? exercises[0]) }}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-all ${level === l ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
              >
                HSK {l}
              </button>
            ))}
          </div>

          <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4 text-center">
            <p className="text-muted-foreground text-sm mb-1">Sắp xếp từ thành câu đúng</p>
            <p className="font-bold text-foreground">{exercise.meaning}</p>
          </div>

          {/* Arranged */}
          <div className="min-h-16 bg-white rounded-2xl border-2 border-dashed border-border p-3 flex flex-wrap gap-2 items-center">
            {arranged.length === 0 && (
              <span className="text-muted-foreground text-sm">Nhấn vào từ bên dưới để thêm vào đây...</span>
            )}
            {arranged.map((w, i) => (
              <button key={i} onClick={() => removeWord(w, i)} disabled={checked}
                className={cn('px-4 py-2 rounded-xl font-chinese font-bold text-base border-2 transition-all',
                  checked ? (isCorrect ? 'bg-green-100 border-success text-green-700' : 'bg-red-100 border-danger text-red-700')
                  : 'bg-secondary/10 border-secondary text-secondary hover:bg-secondary/20'
                )}
              >
                {w}
              </button>
            ))}
          </div>

          {/* Word pool */}
          <div className="flex flex-wrap gap-2">
            {remaining.map((w, i) => (
              <button key={i} onClick={() => addWord(w, i)} disabled={checked}
                className="px-4 py-2 bg-white rounded-xl font-chinese font-bold text-base border-2 border-border hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-50"
              >
                {w}
              </button>
            ))}
          </div>

          {checked && (
            <div className={cn('rounded-2xl p-4 border-2', isCorrect ? 'bg-green-50 border-success text-green-800' : 'bg-red-50 border-danger text-red-800')}>
              <p className="font-bold">{isCorrect ? '🎉 Chính xác!' : `❌ Câu đúng: ${exercise.original}`}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => initExercise(exercise)} disabled={!checked && arranged.length === 0}>
              <RotateCcw className="w-4 h-4 mr-2" />Làm lại
            </Button>
            {!checked ? (
              <Button className="flex-1" onClick={checkArrange} disabled={arranged.length === 0 || remaining.length > 0}>
                Kiểm tra
              </Button>
            ) : (
              <Button className="flex-1" onClick={nextArrange}>
                Câu tiếp theo →
              </Button>
            )}
          </div>
        </div>
      )}

      {mode === 'free' && (
        <div className="space-y-4">
          <div className="flex gap-2 mb-2">
            {[1, 2, 3, 4].map((l) => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-all ${level === l ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
              >
                HSK {l}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={freePrompt}
            onChange={(e) => setFreePrompt(e.target.value)}
            placeholder="Chủ đề bài viết (vd: Gia đình tôi...)"
            className="w-full h-12 px-4 rounded-xl border-2 border-border text-sm focus:outline-none focus:border-primary"
          />

          <textarea
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Viết tiếng Trung tại đây... 在这里写中文..."
            className="w-full min-h-40 p-4 rounded-2xl border-2 border-border font-chinese text-lg resize-none focus:outline-none focus:border-primary transition-colors"
            rows={6}
          />

          {gradeResult ? (
            <div className="space-y-4">
              <div className={cn('rounded-2xl p-5 border-2',
                gradeResult.score >= 80 ? 'bg-green-50 border-success' : gradeResult.score >= 60 ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-danger'
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-2xl">{gradeResult.score}/100</span>
                  <span className="text-2xl">{gradeResult.score >= 80 ? '🌟' : gradeResult.score >= 60 ? '👍' : '💪'}</span>
                </div>
                <p className="font-semibold text-sm">{gradeResult.feedback}</p>
              </div>
              {gradeResult.corrections?.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-4">
                  <p className="font-bold text-sm mb-3">Sửa lỗi:</p>
                  {gradeResult.corrections.map((c, i) => (
                    <div key={i} className="mb-2 text-sm">
                      <span className="line-through text-danger mr-2">{c.original}</span>→
                      <span className="text-success ml-2 font-bold">{c.corrected}</span>
                      <p className="text-muted-foreground text-xs mt-0.5">{c.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => { setGradeResult(null); setFreeText('') }}>
                Viết bài mới
              </Button>
            </div>
          ) : (
            <Button size="lg" className="w-full" onClick={gradeWriting} disabled={grading || !freeText.trim()}>
              {grading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang chấm...</> : '🤖 AI chấm bài'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
