'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Heart,
  X,
  Star,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Zap,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/user-store'
import XPGain from '@/components/lesson/XPGain'
import AIChatTutor from '@/components/chat/AIChatTutor'
import type { Exercise, ContentBlock, GrammarLesson } from '@/types'

type GamePhase = 'intro' | 'quiz' | 'result'
type AnswerFeedback = 'correct' | 'wrong' | null

const MAX_HEARTS = 3

interface QuizGameProps {
  lesson: GrammarLesson
}

export default function QuizGame({ lesson }: QuizGameProps) {
  const router = useRouter()
  const { addXp, pendingXp, clearPendingXp } = useUserStore()

  const exercises: Exercise[] = Array.isArray(lesson.exercises)
    ? lesson.exercises
    : []

  const [phase, setPhase] = useState<GamePhase>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hearts, setHearts] = useState(MAX_HEARTS)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<AnswerFeedback>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [fillValue, setFillValue] = useState('')
  const [showExplanation, setShowExplanation] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)

  const currentExercise = exercises[currentIndex]
  const progressPct =
    exercises.length > 0
      ? Math.round((currentIndex / exercises.length) * 100)
      : 0

  const handleCheckAnswer = useCallback(() => {
    if (!currentExercise || feedback) return

    const isMultipleChoice = currentExercise.type === 'multiple_choice'
    const userAnswer = isMultipleChoice ? selectedOption : fillValue.trim()
    if (!userAnswer) return

    const normalize = (s: string) => s.trim().toLowerCase()
    const correct = normalize(userAnswer) === normalize(currentExercise.answer)

    if (correct) {
      setScore((s) => s + 1)
      setFeedback('correct')
    } else {
      setHearts((h) => h - 1)
      setFeedback('wrong')
    }
    setShowExplanation(true)
  }, [currentExercise, feedback, selectedOption, fillValue])

  const saveResult = useCallback(async (finalScore: number, xp: number) => {
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'GRAMMAR',
          title: lesson.titleVi,
          content: { lessonId: lesson.id, score: finalScore },
          score: finalScore,
          xpEarned: xp,
        }),
      })
      await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpToAdd: xp }),
      })
      addXp(xp)
    } catch {
      /* ignore */
    }
  }, [lesson.id, lesson.titleVi, addXp])

  const handleContinue = useCallback(async () => {
    // Game over - no hearts left
    if (hearts <= 0 && feedback === 'wrong') {
      const finalScore = Math.round((score / exercises.length) * 100)
      const xp = Math.max(Math.round(10 * (finalScore / 100)), 2)
      setXpEarned(xp)
      await saveResult(finalScore, xp)
      setPhase('result')
      return
    }

    // All exercises done
    if (currentIndex + 1 >= exercises.length) {
      const finalScore = Math.round((score / exercises.length) * 100)
      const xp = Math.round(15 * (finalScore / 100)) + 5
      setXpEarned(xp)
      await saveResult(finalScore, xp)
      setPhase('result')
      return
    }

    // Next question
    setCurrentIndex((i) => i + 1)
    setFeedback(null)
    setSelectedOption(null)
    setFillValue('')
    setShowExplanation(false)
  }, [hearts, feedback, currentIndex, exercises.length, score, saveResult])

  const resetGame = () => {
    setPhase('intro')
    setCurrentIndex(0)
    setHearts(MAX_HEARTS)
    setScore(0)
    setFeedback(null)
    setSelectedOption(null)
    setFillValue('')
    setShowExplanation(false)
    setXpEarned(0)
  }

  const finalScore =
    exercises.length > 0 ? Math.round((score / exercises.length) * 100) : 0
  const starCount = finalScore >= 90 ? 3 : finalScore >= 70 ? 2 : finalScore > 0 ? 1 : 0

  // ==================== INTRO PHASE ====================
  if (phase === 'intro') {
    const content = Array.isArray(lesson.content)
      ? (lesson.content as ContentBlock[])
      : []

    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => router.push('/grammar')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        {/* Lesson header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider">
            HSK {lesson.hskLevel} &middot; Ngữ pháp
          </span>
          <h1 className="text-2xl font-black mt-1">{lesson.titleVi}</h1>
          <p className="text-muted-foreground text-sm">{lesson.title}</p>
        </div>

        {/* Lesson content cards */}
        <div className="space-y-4 mb-8">
          {content.map((block, i) => (
            <ContentBlockCard key={i} block={block} />
          ))}
        </div>

        {/* Start quiz button */}
        {exercises.length > 0 ? (
          <div className="bg-white rounded-2xl border-2 border-secondary/30 p-6 text-center">
            <div className="flex justify-center gap-1 mb-3">
              {[1, 2, 3].map((h) => (
                <Heart
                  key={h}
                  className="w-6 h-6 fill-red-500 text-red-500"
                />
              ))}
            </div>
            <h3 className="font-black text-lg mb-1">
              Sẵn sàng luyện tập?
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {exercises.length} câu hỏi &middot; {MAX_HEARTS} mạng
            </p>
            <Button
              size="lg"
              className="w-full text-base font-bold"
              onClick={() => setPhase('quiz')}
            >
              Bắt đầu Quiz Game
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push('/grammar')}
          >
            Hoàn thành
          </Button>
        )}

        <AIChatTutor context={lesson.titleVi} />
      </div>
    )
  }

  // ==================== RESULT PHASE ====================
  if (phase === 'result') {
    const gameOver = hearts <= 0 && finalScore < 100

    return (
      <div className="max-w-lg mx-auto px-4 py-8 text-center">
        {pendingXp > 0 && (
          <XPGain xp={pendingXp} onAnimationEnd={clearPendingXp} />
        )}

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={cn(
                'w-12 h-12 transition-all duration-500',
                s <= starCount
                  ? 'fill-amber-400 text-amber-400 animate-bounce-in'
                  : 'fill-gray-200 text-gray-200'
              )}
              style={{ animationDelay: `${s * 150}ms` }}
            />
          ))}
        </div>

        {/* Result message */}
        <h2 className="text-2xl font-black mb-2">
          {gameOver
            ? 'Hết mạng rồi!'
            : finalScore >= 90
              ? 'Xuất sắc!'
              : finalScore >= 70
                ? 'Tốt lắm!'
                : 'Cố gắng thêm!'}
        </h2>
        <p className="text-muted-foreground mb-6">{lesson.titleVi}</p>

        {/* Stats */}
        <div className="flex gap-4 justify-center mb-8">
          <div className="bg-primary/10 rounded-2xl p-5 border border-primary/20 flex-1">
            <div className="text-3xl font-black text-primary">{finalScore}%</div>
            <div className="text-xs text-muted-foreground">Điểm số</div>
          </div>
          <div className="bg-secondary/10 rounded-2xl p-5 border border-secondary/20 flex-1">
            <div className="text-3xl font-black text-secondary">
              {score}/{exercises.length}
            </div>
            <div className="text-xs text-muted-foreground">Đúng</div>
          </div>
          <div className="bg-accent/10 rounded-2xl p-5 border border-accent/20 flex-1">
            <div className="text-3xl font-black text-accent flex items-center justify-center gap-1">
              +{xpEarned} <Zap className="w-5 h-5" />
            </div>
            <div className="text-xs text-muted-foreground">XP</div>
          </div>
        </div>

        {/* Hearts remaining */}
        <div className="flex justify-center gap-1 mb-6">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                'w-6 h-6',
                i < hearts
                  ? 'fill-red-500 text-red-500'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {(gameOver || finalScore < 100) && (
            <Button
              size="lg"
              variant="outline"
              className="w-full gap-2"
              onClick={resetGame}
            >
              <RotateCcw className="w-4 h-4" /> Thử lại
            </Button>
          )}
          <Button
            size="lg"
            className="w-full"
            onClick={() => router.push('/grammar')}
          >
            Tiếp tục
          </Button>
        </div>
      </div>
    )
  }

  // ==================== QUIZ PHASE ====================
  const isMultipleChoice = currentExercise?.type === 'multiple_choice'

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Top bar: close, progress, hearts */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/grammar')}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden border border-border">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500 ease-out',
              feedback === 'correct'
                ? 'bg-primary'
                : feedback === 'wrong'
                  ? 'bg-danger'
                  : 'bg-secondary'
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Hearts */}
        <div className="flex gap-0.5">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                'w-5 h-5 transition-all',
                i < hearts
                  ? 'fill-red-500 text-red-500'
                  : 'fill-gray-200 text-gray-200',
                i === hearts && feedback === 'wrong' && 'animate-shake'
              )}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
          Câu {currentIndex + 1}/{exercises.length}
        </p>
        <h2 className="text-xl font-black text-foreground leading-snug">
          {currentExercise?.question}
        </h2>
      </div>

      {/* Answer area */}
      {isMultipleChoice ? (
        <div className="space-y-3 mb-6">
          {(currentExercise?.options ?? []).map((option, i) => {
            const isSelected = selectedOption === option
            const isAnswer = option === currentExercise?.answer
            const showResult = feedback !== null

            return (
              <button
                key={i}
                onClick={() => !feedback && setSelectedOption(option)}
                disabled={!!feedback}
                className={cn(
                  'w-full py-4 px-5 rounded-xl border-2 border-b-4 font-semibold text-left transition-all duration-150 text-sm',
                  !showResult && !isSelected &&
                    'border-border bg-white text-foreground hover:border-secondary/40 hover:bg-secondary/5 active:border-b-2',
                  !showResult && isSelected &&
                    'border-secondary bg-secondary/10 text-secondary-foreground',
                  showResult && isAnswer &&
                    'border-primary bg-primary/10 text-primary',
                  showResult && isSelected && !isAnswer &&
                    'border-danger bg-danger/10 text-danger',
                  showResult && !isAnswer && !isSelected &&
                    'border-border bg-white opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
                      !showResult && !isSelected && 'bg-gray-100 text-gray-500',
                      !showResult && isSelected && 'bg-secondary text-white',
                      showResult && isAnswer && 'bg-primary text-white',
                      showResult && isSelected && !isAnswer && 'bg-danger text-white',
                      showResult && !isAnswer && !isSelected && 'bg-gray-100 text-gray-400'
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && isAnswer && (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                  {showResult && isSelected && !isAnswer && (
                    <XCircle className="w-5 h-5 text-danger flex-shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="mb-6">
          <Input
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !feedback && handleCheckAnswer()}
            placeholder="Nhập câu trả lời..."
            disabled={!!feedback}
            className={cn(
              'text-lg font-chinese py-6',
              feedback === 'correct' && 'border-primary bg-primary/5',
              feedback === 'wrong' && 'border-danger bg-danger/5'
            )}
          />
        </div>
      )}

      {/* Explanation feedback */}
      {showExplanation && feedback && (
        <div
          className={cn(
            'rounded-2xl p-4 mb-6 border-2 animate-fade-in',
            feedback === 'correct'
              ? 'bg-green-50 border-primary/40'
              : 'bg-red-50 border-danger/40'
          )}
        >
          <div className="flex items-center gap-2 mb-1">
            {feedback === 'correct' ? (
              <CheckCircle className="w-5 h-5 text-primary" />
            ) : (
              <XCircle className="w-5 h-5 text-danger" />
            )}
            <span
              className={cn(
                'font-black',
                feedback === 'correct' ? 'text-primary' : 'text-danger'
              )}
            >
              {feedback === 'correct' ? 'Chính xác!' : 'Sai rồi!'}
            </span>
          </div>
          {feedback === 'wrong' && (
            <p className="text-sm text-red-700">
              Đáp án đúng: <strong>{currentExercise?.answer}</strong>
            </p>
          )}
          {currentExercise?.explanation && (
            <p className="text-sm mt-1 text-muted-foreground">
              {currentExercise.explanation}
            </p>
          )}
        </div>
      )}

      {/* Action button */}
      {!feedback ? (
        <Button
          className="w-full py-6 text-base font-bold"
          onClick={handleCheckAnswer}
          disabled={isMultipleChoice ? !selectedOption : !fillValue.trim()}
        >
          Kiểm tra
        </Button>
      ) : (
        <Button
          className={cn(
            'w-full py-6 text-base font-bold',
            feedback === 'correct'
              ? 'bg-primary hover:bg-primary/90'
              : 'bg-danger hover:bg-danger/90'
          )}
          onClick={handleContinue}
        >
          {hearts <= 0 && feedback === 'wrong'
            ? 'Xem kết quả'
            : currentIndex + 1 >= exercises.length
              ? 'Xem kết quả'
              : 'Tiếp tục'}
        </Button>
      )}
    </div>
  )
}

// ==================== Content Block Card ====================
function ContentBlockCard({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        <h2 className="text-xl font-black text-foreground mt-6 mb-2">
          {block.content}
        </h2>
      )
    case 'text':
      return (
        <p className="text-foreground leading-relaxed">{block.content}</p>
      )
    case 'pattern':
      return (
        <div className="bg-secondary/10 border-l-4 border-secondary rounded-r-2xl px-5 py-4">
          <p className="font-chinese text-xl font-bold text-foreground">
            {block.content}
          </p>
          {block.pinyin && (
            <p className="text-secondary text-sm mt-1">{block.pinyin}</p>
          )}
          {block.translation && (
            <p className="text-muted-foreground text-sm mt-0.5">
              {block.translation}
            </p>
          )}
        </div>
      )
    case 'example':
      return (
        <div className="bg-primary/5 border-l-4 border-primary rounded-r-2xl px-5 py-4">
          <p className="font-chinese text-lg text-foreground">{block.content}</p>
          {block.pinyin && (
            <p className="text-secondary text-sm mt-1">{block.pinyin}</p>
          )}
          {block.translation && (
            <p className="text-muted-foreground text-sm mt-0.5">
              &rarr; {block.translation}
            </p>
          )}
        </div>
      )
    case 'note':
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4 flex gap-3">
          <span className="text-xl flex-shrink-0">💡</span>
          <p className="text-yellow-800 text-sm leading-relaxed">
            {block.content}
          </p>
        </div>
      )
    case 'tip':
      return (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex gap-3">
          <span className="text-xl flex-shrink-0">✅</span>
          <p className="text-green-800 text-sm leading-relaxed">
            {block.content}
          </p>
        </div>
      )
    default:
      return <p className="text-foreground">{block.content}</p>
  }
}
