'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import FlashcardDeck from '@/components/flashcard/FlashcardDeck'
import { Button } from '@/components/ui/button'
import type { VocabularyWord } from '@/types'
import { useUserStore } from '@/store/user-store'
import XPGain from '@/components/lesson/XPGain'

const LEVELS = [1, 2, 3, 4, 5, 6]

export default function FlashcardPage() {
  const router = useRouter()
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(1)
  const [started, setStarted] = useState(false)
  const { addXp, pendingXp, clearPendingXp } = useUserStore()

  const fetchWords = async (level: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/vocabulary?level=${level}&review=true`)
      const json = await res.json()
      setWords(json.data ?? [])
    } catch {
      toast.error('Không thể tải từ vựng')
    } finally {
      setLoading(false)
    }
  }

  const handleStart = () => {
    fetchWords(selectedLevel).then(() => setStarted(true))
  }

  const handleComplete = async (xpEarned: number, results: { wordId: string; rating: number }[]) => {
    try {
      await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results, type: 'vocabulary' }),
      })
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'VOCABULARY',
          title: `Ôn tập từ vựng HSK ${selectedLevel}`,
          content: { vocabulary: words.map((w) => ({ hanzi: w.hanzi, pinyin: w.pinyin, meaning: w.meaning })) },
          xpEarned,
        }),
      })
      await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpToAdd: xpEarned }),
      })
      addXp(xpEarned)
      toast.success(`Hoàn thành! +${xpEarned} XP 🎉`)
    } catch {
      toast.error('Lỗi lưu kết quả')
    }
    setTimeout(() => router.push('/vocabulary'), 1500)
  }

  if (!started) {
    return (
      <div className="page-container max-w-lg mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
        <h1 className="text-2xl font-black mb-2">Ôn tập Flashcard 📚</h1>
        <p className="text-muted-foreground mb-6">Chọn cấp độ HSK để bắt đầu ôn tập</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setSelectedLevel(l)}
              className={`py-4 rounded-2xl border-2 font-black text-lg transition-all ${
                selectedLevel === l
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_3px_0_#46A302]'
                  : 'border-border bg-white text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              HSK {l}
            </button>
          ))}
        </div>

        <Button size="lg" className="w-full" onClick={handleStart} disabled={loading}>
          {loading ? 'Đang tải...' : `Bắt đầu ôn tập HSK ${selectedLevel} 🚀`}
        </Button>
      </div>
    )
  }

  if (words.length === 0 && !loading) {
    return (
      <div className="page-container max-w-lg mx-auto text-center py-16">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-black mb-2">Bạn đã ôn hết từ vựng HSK {selectedLevel}!</h2>
        <p className="text-muted-foreground mb-6">Không có từ nào cần ôn hôm nay. Quay lại sau nhé!</p>
        <Button onClick={() => router.push('/vocabulary')}>Về trang từ vựng</Button>
      </div>
    )
  }

  return (
    <div className="page-container max-w-lg mx-auto">
      {pendingXp > 0 && <XPGain xp={pendingXp} onAnimationEnd={clearPendingXp} />}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setStarted(false)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold">
          <ArrowLeft className="w-4 h-4" /> Kết thúc
        </button>
        <span className="text-sm font-bold text-muted-foreground">HSK {selectedLevel}</span>
      </div>
      <FlashcardDeck words={words} onComplete={handleComplete} />
    </div>
  )
}
