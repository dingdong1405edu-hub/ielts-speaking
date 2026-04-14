'use client'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, getHskBadgeClass, getLessonTypeLabel } from '@/lib/utils'
import type { LessonType } from '@/types'

interface LessonCardProps {
  title: string
  description: string
  hskLevel: number
  type: LessonType
  progress?: number
  isLocked?: boolean
  onClick: () => void
}

const typeIcons: Record<string, string> = {
  VOCABULARY: '📚', GRAMMAR: '📝', LISTENING: '🎧',
  SPEAKING: '🗣️', READING: '📖', WRITING: '✏️', EXAM: '🏆',
}

export default function LessonCard({
  title, description, hskLevel, type, progress = 0, isLocked = false, onClick,
}: LessonCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 border-border p-5 transition-all duration-200 cursor-pointer',
        isLocked
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:border-primary hover:shadow-md hover:-translate-y-0.5 card-hover'
      )}
      onClick={isLocked ? undefined : onClick}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
          {isLocked ? '🔒' : typeIcons[type] ?? '📚'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-foreground">{title}</h3>
            <Badge variant={`hsk${hskLevel}` as 'hsk1'} className="text-[11px]">
              HSK {hskLevel}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
          {progress > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Tiến độ</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-surface rounded-full border border-border">
                <div
                  className="h-2 bg-primary rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{getLessonTypeLabel(type)}</span>
            {!isLocked && (
              <Button size="sm" variant={progress > 0 ? 'secondary' : 'default'}>
                {progress > 0 ? 'Tiếp tục' : 'Bắt đầu'}
              </Button>
            )}
            {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </div>
    </div>
  )
}
