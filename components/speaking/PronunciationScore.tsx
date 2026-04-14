'use client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PronunciationScoreProps {
  score: number
  feedback: string
  details: string[]
  onRetry: () => void
  onContinue: () => void
}

function ScoreCircle({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#58CC02' : score >= 60 ? '#FF9600' : '#FF4B4B'

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E5E5E5" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs text-muted-foreground font-semibold">/100</span>
      </div>
    </div>
  )
}

export default function PronunciationScore({
  score, feedback, details, onRetry, onContinue,
}: PronunciationScoreProps) {
  const emoji = score >= 90 ? '🌟' : score >= 70 ? '👍' : score >= 50 ? '🙂' : '💪'

  return (
    <div className="text-center space-y-6">
      <div className="text-4xl">{emoji}</div>
      <ScoreCircle score={score} />
      <p className="text-lg font-bold text-foreground">{feedback}</p>

      {details.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-4 text-left">
          <p className="text-sm font-bold text-foreground mb-2">Gợi ý cải thiện:</p>
          <ul className="space-y-1">
            {details.map((d, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-accent">→</span> {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetry} className="flex-1">
          Thử lại 🔄
        </Button>
        <Button onClick={onContinue} className="flex-1">
          Tiếp tục →
        </Button>
      </div>
    </div>
  )
}
