'use client'
import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MultipleChoiceProps {
  question: string
  options: string[]
  answer: string
  explanation?: string
  onAnswer: (correct: boolean) => void
}

export default function MultipleChoice({
  question, options, answer, explanation, onAnswer,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (option: string) => {
    if (submitted) return
    setSelected(option)
  }

  const handleSubmit = () => {
    if (!selected || submitted) return
    setSubmitted(true)
  }

  const handleContinue = () => {
    onAnswer(selected === answer)
  }

  const getOptionClass = (option: string) => {
    if (!submitted) {
      return selected === option ? 'lesson-btn lesson-btn-selected' : 'lesson-btn lesson-btn-default'
    }
    if (option === answer) return 'lesson-btn lesson-btn-correct'
    if (option === selected) return 'lesson-btn lesson-btn-wrong'
    return 'lesson-btn lesson-btn-default opacity-50'
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground">{question}</h3>

      <div className="space-y-3">
        {options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(option)}
            className={cn(getOptionClass(option), 'w-full text-left')}
          >
            <span className="font-semibold mr-2 text-muted-foreground">
              {String.fromCharCode(65 + i)}.
            </span>
            {option}
          </button>
        ))}
      </div>

      {submitted && (
        <div
          className={cn(
            'rounded-2xl p-4 border-2 flex items-start gap-3',
            selected === answer
              ? 'bg-green-50 border-success text-green-800'
              : 'bg-red-50 border-danger text-red-800'
          )}
        >
          {selected === answer ? (
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-bold">
              {selected === answer ? 'Chính xác! 🎉' : `Đáp án đúng: ${answer}`}
            </p>
            {explanation && <p className="text-sm mt-1 opacity-80">{explanation}</p>}
          </div>
        </div>
      )}

      {!submitted ? (
        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={!selected}
          variant={selected ? 'default' : 'outline'}
        >
          Kiểm tra
        </Button>
      ) : (
        <Button className="w-full" onClick={handleContinue}>
          Tiếp tục →
        </Button>
      )}
    </div>
  )
}
