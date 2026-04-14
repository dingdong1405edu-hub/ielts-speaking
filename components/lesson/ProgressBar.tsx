'use client'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  current: number
  total: number
  className?: string
}

export default function ProgressBar({ current, total, className }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-4 bg-surface rounded-full border border-border overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-bold text-muted-foreground w-14 text-right">
          {current}/{total}
        </span>
      </div>
    </div>
  )
}
