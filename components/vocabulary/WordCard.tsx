'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { VocabularyWord } from '@/types'
import { cn } from '@/lib/utils'

interface WordCardProps {
  word: VocabularyWord
}

export default function WordCard({ word }: WordCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="bg-white rounded-2xl border-2 border-border p-4 cursor-pointer transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="font-chinese font-bold text-foreground"
            style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)' }}
          >
            {word.hanzi}
          </span>
          <div>
            <p className="text-secondary font-semibold text-sm">{word.pinyin}</p>
            <p className="text-foreground font-medium text-sm">{word.meaning}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={`hsk${word.hskLevel}` as 'hsk1'} className="text-xs">
            HSK {word.hskLevel}
          </Badge>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {expanded && word.examples.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Ví dụ</p>
          {word.examples.slice(0, 2).map((ex, i) => (
            <div key={i} className="bg-primary/5 rounded-xl p-3">
              <p className="font-chinese text-base text-foreground">{ex.sentence}</p>
              <p className="text-xs text-secondary mt-0.5">{ex.pinyin}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{ex.meaning}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
