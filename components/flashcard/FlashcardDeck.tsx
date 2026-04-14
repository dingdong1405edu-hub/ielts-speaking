'use client'
import { useState, useCallback } from 'react'
import FlashcardItem from './FlashcardItem'
import ProgressBar from '@/components/lesson/ProgressBar'
import { Button } from '@/components/ui/button'
import type { VocabularyWord } from '@/types'
import { sm2, ratingToQuality, getXpForRating, getInitialCard } from '@/lib/spaced-repetition'
import { cn } from '@/lib/utils'

const RATINGS = [
  { value: 1, label: 'Quên rồi', color: 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200' },
  { value: 2, label: 'Khó nhớ', color: 'bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-200' },
  { value: 3, label: 'Bình thường', color: 'bg-yellow-100 text-yellow-600 border-yellow-200 hover:bg-yellow-200' },
  { value: 4, label: 'Nhớ được', color: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200' },
  { value: 5, label: 'Rất thuộc', color: 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200' },
]

interface FlashcardDeckProps {
  words: VocabularyWord[]
  onComplete: (xpEarned: number, results: { wordId: string; rating: number }[]) => void
}

export default function FlashcardDeck({ words, onComplete }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [totalXp, setTotalXp] = useState(0)
  const [results, setResults] = useState<{ wordId: string; rating: number }[]>([])
  const [showComplete, setShowComplete] = useState(false)
  const [animating, setAnimating] = useState(false)

  const currentWord = words[currentIndex]

  const handleFlip = useCallback(() => {
    setIsFlipped((f) => !f)
  }, [])

  const handleRating = useCallback(
    (rating: number) => {
      if (animating || !isFlipped) return
      const xp = getXpForRating(rating)
      const newResults = [...results, { wordId: currentWord.id, rating }]
      setResults(newResults)
      setTotalXp((prev) => prev + xp)
      setAnimating(true)
      setTimeout(() => {
        if (currentIndex + 1 >= words.length) {
          setShowComplete(true)
        } else {
          setCurrentIndex((i) => i + 1)
          setIsFlipped(false)
          setAnimating(false)
        }
      }, 300)
    },
    [animating, isFlipped, results, currentWord, currentIndex, words.length]
  )

  if (showComplete) {
    const correct = results.filter((r) => r.rating >= 4).length
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-black">Hoàn thành!</h2>
        <div className="flex gap-6">
          <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20">
            <div className="text-3xl font-black text-primary">+{totalXp}</div>
            <div className="text-sm text-muted-foreground font-semibold">XP</div>
          </div>
          <div className="bg-secondary/10 rounded-2xl p-5 border border-secondary/20">
            <div className="text-3xl font-black text-secondary">{correct}/{words.length}</div>
            <div className="text-sm text-muted-foreground font-semibold">Thuộc bài</div>
          </div>
        </div>
        <Button size="lg" onClick={() => onComplete(totalXp, results)}>
          Tiếp tục 🚀
        </Button>
      </div>
    )
  }

  if (!currentWord) return null

  return (
    <div className="flex flex-col gap-6">
      <ProgressBar current={currentIndex} total={words.length} />

      <FlashcardItem
        word={currentWord}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      {!isFlipped ? (
        <Button size="lg" variant="outline" onClick={handleFlip} className="w-full">
          Lật thẻ 👀
        </Button>
      ) : (
        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-muted-foreground">
            Bạn nhớ được bao nhiêu?
          </p>
          <div className="grid grid-cols-5 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRating(r.value)}
                disabled={animating}
                className={cn(
                  'py-3 rounded-xl border-2 text-xs font-bold transition-all',
                  r.color,
                  animating && 'opacity-50'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
