'use client'
import { useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import MultipleChoice from '@/components/quiz/MultipleChoice'
import ProgressBar from '@/components/lesson/ProgressBar'
import { useUserStore } from '@/store/user-store'
import XPGain from '@/components/lesson/XPGain'

interface ReadingPassage {
  title: string
  titleVi: string
  content: string
  pinyin: string
  translation: string
  vocabulary: Array<{ hanzi: string; pinyin: string; meaning: string }>
  questions: Array<{ question: string; options: string[]; answer: string; explanation: string }>
}

export default function ReadingPage() {
  const [level, setLevel] = useState(1)
  const [passage, setPassage] = useState<ReadingPassage | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPinyin, setShowPinyin] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'reading' | 'quiz' | 'complete'>('idle')
  const [qIndex, setQIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [tooltip, setTooltip] = useState<{ word: string; meaning: string } | null>(null)
  const { addXp, pendingXp, clearPendingXp } = useUserStore()

  const generate = async () => {
    setLoading(true)
    setPhase('idle')
    try {
      const res = await fetch('/api/ai/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reading', level }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setPassage(json.data)
      setPhase('reading')
      setQIndex(0)
      setScore(0)
    } catch {
      toast.error('Không thể tạo bài đọc. Thử lại nhé!')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = async (correct: boolean) => {
    if (correct) setScore((s) => s + 1)
    const questions = passage?.questions ?? []
    if (qIndex + 1 >= questions.length) {
      const finalScore = Math.round(((score + (correct ? 1 : 0)) / questions.length) * 100)
      const xpEarned = Math.round(12 * (finalScore / 100)) + 5
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'READING',
            title: passage?.titleVi ?? `Bài đọc HSK ${level}`,
            content: { passage: passage?.content },
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

  const handleWordClick = (char: string) => {
    const vocab = passage?.vocabulary.find((v) => v.hanzi === char || v.hanzi.includes(char))
    if (vocab) setTooltip({ word: vocab.hanzi, meaning: `${vocab.pinyin} — ${vocab.meaning}` })
    else setTooltip(null)
  }

  return (
    <div className="page-container max-w-2xl mx-auto" onClick={() => setTooltip(null)}>
      {pendingXp > 0 && <XPGain xp={pendingXp} onAnimationEnd={clearPendingXp} />}

      <div className="page-header">
        <h1 className="text-2xl font-black">Luyện đọc 📖</h1>
        <p className="text-muted-foreground text-sm mt-1">Đọc hiểu theo trình độ HSK</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[1, 2, 3, 4, 5, 6].map((l) => (
          <button key={l} onClick={() => setLevel(l)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              level === l ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-muted-foreground'
            }`}
          >
            HSK {l}
          </button>
        ))}
      </div>

      {phase === 'idle' && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h2 className="text-xl font-black mb-2">Bài đọc HSK {level}</h2>
          <p className="text-muted-foreground mb-6">AI tạo bài đọc phù hợp trình độ, click vào từ để tra nghĩa</p>
          <Button size="lg" onClick={generate} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang tạo...</> : '📚 Tạo bài đọc'}
          </Button>
        </div>
      )}

      {phase === 'reading' && passage && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-black">{passage.titleVi}</h2>
            <p className="text-muted-foreground text-sm">{passage.title}</p>
          </div>

          {/* Passage */}
          <div className="bg-white rounded-2xl border-2 border-border p-6 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-3 mb-4">
              <button onClick={() => setShowPinyin(!showPinyin)}
                className={`text-xs px-3 py-1 rounded-full font-bold border transition-all ${showPinyin ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border text-muted-foreground'}`}
              >
                Pinyin
              </button>
              <button onClick={() => setShowTranslation(!showTranslation)}
                className={`text-xs px-3 py-1 rounded-full font-bold border transition-all ${showTranslation ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
              >
                Dịch nghĩa
              </button>
            </div>

            <div className="relative">
              <p className="font-chinese text-xl leading-loose text-foreground cursor-pointer">
                {passage.content.split('').map((char, i) => (
                  <span
                    key={i}
                    onClick={() => handleWordClick(char)}
                    className="hover:bg-primary/10 hover:text-primary rounded transition-colors"
                  >
                    {char}
                  </span>
                ))}
              </p>
              {tooltip && (
                <div className="absolute -top-8 left-0 bg-foreground text-white text-xs rounded-lg px-3 py-1.5 shadow-lg z-10 whitespace-nowrap">
                  {tooltip.word}: {tooltip.meaning}
                </div>
              )}
            </div>

            {showPinyin && <p className="text-secondary text-sm mt-3 leading-relaxed">{passage.pinyin}</p>}
            {showTranslation && <p className="text-muted-foreground text-sm mt-3 leading-relaxed border-t border-border pt-3">{passage.translation}</p>}
          </div>

          {/* Vocabulary list */}
          {passage.vocabulary.length > 0 && (
            <details className="bg-surface rounded-2xl border border-border p-4">
              <summary className="cursor-pointer font-bold text-sm select-none">
                Từ vựng trong bài ({passage.vocabulary.length} từ)
              </summary>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {passage.vocabulary.map((v, i) => (
                  <div key={i} className="bg-white rounded-xl p-2 border border-border">
                    <span className="font-chinese font-bold text-foreground mr-2">{v.hanzi}</span>
                    <span className="text-xs text-secondary">{v.pinyin}</span>
                    <p className="text-xs text-muted-foreground">{v.meaning}</p>
                  </div>
                ))}
              </div>
            </details>
          )}

          <Button size="lg" className="w-full" onClick={() => setPhase('quiz')}>
            Làm bài tập ({passage.questions.length} câu) →
          </Button>
        </div>
      )}

      {phase === 'quiz' && passage && (
        <div>
          <ProgressBar current={qIndex} total={passage.questions.length} className="mb-6" />
          <MultipleChoice
            question={passage.questions[qIndex].question}
            options={passage.questions[qIndex].options}
            answer={passage.questions[qIndex].answer}
            explanation={passage.questions[qIndex].explanation}
            onAnswer={handleAnswer}
          />
        </div>
      )}

      {phase === 'complete' && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-black mb-2">Hoàn thành bài đọc!</h2>
          <p className="text-muted-foreground mb-6">Đúng {score}/{passage?.questions.length} câu</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setPhase('idle'); setPassage(null) }}>
              <RefreshCw className="w-4 h-4 mr-2" />Bài khác
            </Button>
            <Button onClick={generate}>Làm lại</Button>
          </div>
        </div>
      )}
    </div>
  )
}
