'use client'
import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { VocabularyWord } from '@/types'
import { cn } from '@/lib/utils'

interface FlashcardItemProps {
  word: VocabularyWord
  isFlipped: boolean
  onFlip: () => void
}

export default function FlashcardItem({ word, isFlipped, onFlip }: FlashcardItemProps) {
  const example = word.examples?.[0]

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1200px', minHeight: '320px' }}
      onClick={onFlip}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '320px',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-border shadow-lg flex flex-col items-center justify-center p-8"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <div
              className="font-chinese font-bold text-foreground mb-3 leading-none"
              style={{ fontSize: 'clamp(4rem, 15vw, 7rem)' }}
            >
              {word.hanzi}
            </div>
            <p className="text-muted-foreground text-lg font-medium">{word.pinyin}</p>
            <div className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-surface px-3 py-1.5 rounded-full border border-border">
              <span>HSK {word.hskLevel}</span>
            </div>
          </div>
          <p className="absolute bottom-5 text-xs text-muted-foreground">Nhấn để lật thẻ</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-primary shadow-lg flex flex-col p-8"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-center flex-1 flex flex-col items-center justify-center gap-4">
            <div className="font-chinese font-bold text-4xl text-foreground">{word.hanzi}</div>
            <p className="text-secondary font-semibold text-lg">{word.pinyin}</p>
            <div className="w-12 h-0.5 bg-border rounded" />
            <p className="text-2xl font-bold text-foreground">{word.meaning}</p>

            {example && (
              <div className="mt-3 w-full bg-primary/5 rounded-2xl border border-primary/10 p-4 text-left">
                <p className="font-chinese text-lg text-foreground mb-1">{example.sentence}</p>
                <p className="text-sm text-secondary mb-1">{example.pinyin}</p>
                <p className="text-sm text-muted-foreground">{example.meaning}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
