'use client'
import { useEffect } from 'react'

interface XPGainProps {
  xp: number
  onAnimationEnd: () => void
}

export default function XPGain({ xp, onAnimationEnd }: XPGainProps) {
  useEffect(() => {
    const t = setTimeout(onAnimationEnd, 1200)
    return () => clearTimeout(t)
  }, [onAnimationEnd])

  if (!xp) return null
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="animate-xp-gain bg-accent text-white font-black text-xl px-6 py-3 rounded-full shadow-lg">
        +{xp} XP ⚡
      </div>
    </div>
  )
}
