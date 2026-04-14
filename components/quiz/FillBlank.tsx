'use client'
import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface FillBlankProps {
  question: string
  answer: string
  explanation?: string
  onAnswer: (correct: boolean) => void
  hint?: string
}

export default function FillBlank({ question, answer, explanation, onAnswer, hint }: FillBlankProps) {
  const [value, setValue] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const normalize = (s: string) => s.trim().toLowerCase()
  const isCorrect = normalize(value) === normalize(answer)

  const handleSubmit = () => {
    if (!value.trim() || submitted) return
    setSubmitted(true)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">{question}</h3>
      {hint && <p className="text-sm text-muted-foreground">Gợi ý: {hint}</p>}

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Nhập câu trả lời..."
        disabled={submitted}
        className={cn(
          'text-base font-chinese',
          submitted && isCorrect && 'border-success bg-green-50',
          submitted && !isCorrect && 'border-danger bg-red-50'
        )}
      />

      {submitted && (
        <div
          className={cn(
            'rounded-2xl p-4 border-2 flex items-start gap-3',
            isCorrect ? 'bg-green-50 border-success text-green-800' : 'bg-red-50 border-danger text-red-800'
          )}
        >
          {isCorrect ? (
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">{isCorrect ? 'Chính xác! 🎉' : `Đáp án đúng: ${answer}`}</p>
            {explanation && <p className="text-sm mt-1 opacity-80">{explanation}</p>}
          </div>
        </div>
      )}

      {!submitted ? (
        <Button className="w-full" onClick={handleSubmit} disabled={!value.trim()}>
          Kiểm tra
        </Button>
      ) : (
        <Button className="w-full" onClick={() => onAnswer(isCorrect)}>
          Tiếp tục →
        </Button>
      )}
    </div>
  )
}
