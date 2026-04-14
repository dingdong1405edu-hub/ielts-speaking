'use client'

import { cn } from '@/lib/utils'
import { Check, Lock, Star, BookOpen } from 'lucide-react'

export type NodeStatus = 'locked' | 'current' | 'completed'

interface GrammarNodeProps {
  title: string
  titleVi: string
  status: NodeStatus
  order: number
  stars: number // 0-3 based on best score
  onClick: () => void
}

export default function GrammarNode({
  title,
  titleVi,
  status,
  order,
  stars,
  onClick,
}: GrammarNodeProps) {
  const isClickable = status !== 'locked'

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Main circle node */}
      <button
        onClick={isClickable ? onClick : undefined}
        disabled={!isClickable}
        className={cn(
          'relative w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300 border-4 border-b-[6px]',
          status === 'completed' &&
            'bg-primary border-primary/70 text-white shadow-lg shadow-primary/25 hover:scale-110 active:scale-95 active:border-b-4 cursor-pointer',
          status === 'current' &&
            'bg-secondary border-secondary/70 text-white shadow-lg shadow-secondary/30 hover:scale-110 active:scale-95 active:border-b-4 cursor-pointer animate-node-pulse',
          status === 'locked' &&
            'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
        )}
      >
        {status === 'completed' ? (
          <Check className="w-8 h-8" strokeWidth={3} />
        ) : status === 'current' ? (
          <BookOpen className="w-7 h-7" />
        ) : (
          <Lock className="w-6 h-6" />
        )}

        {/* Order badge */}
        <span
          className={cn(
            'absolute -top-1 -right-1 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center',
            status === 'completed' && 'bg-white text-primary',
            status === 'current' && 'bg-white text-secondary',
            status === 'locked' && 'bg-gray-300 text-gray-500'
          )}
        >
          {order}
        </span>
      </button>

      {/* Stars for completed */}
      {status === 'completed' && stars > 0 && (
        <div className="flex gap-0.5">
          {[1, 2, 3].map((s) => (
            <Star
              key={s}
              className={cn(
                'w-4 h-4',
                s <= stars
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          ))}
        </div>
      )}

      {/* Label */}
      <div className="text-center max-w-[120px]">
        <p
          className={cn(
            'text-xs font-bold leading-tight',
            status === 'locked' ? 'text-gray-400' : 'text-foreground'
          )}
        >
          {titleVi}
        </p>
        <p
          className={cn(
            'text-[10px] leading-tight mt-0.5',
            status === 'locked' ? 'text-gray-300' : 'text-muted-foreground'
          )}
        >
          {title}
        </p>
      </div>
    </div>
  )
}
