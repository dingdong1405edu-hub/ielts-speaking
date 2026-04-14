'use client'

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AudioPlayerProps {
  /** URL of the audio to play (object URL or remote URL) */
  src: string
  /** Optional pre-computed amplitude data (0–1 per sample) for static waveform */
  amplitudeData?: number[]
  /** Number of waveform bars to render */
  barCount?: number
  /** Additional class names applied to the root element */
  className?: string
  /** Accessible label for the player */
  ariaLabel?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_BAR_COUNT = 80

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Downsample an arbitrary-length amplitude array to exactly `targetCount`
 * bars by averaging within each bucket.
 */
function downsampleAmplitude(data: number[], targetCount: number): number[] {
  if (data.length === 0) return Array(targetCount).fill(0.1)
  if (data.length <= targetCount) {
    // Pad with a flat baseline
    return [
      ...data,
      ...Array(Math.max(0, targetCount - data.length)).fill(0.1),
    ]
  }
  const step = data.length / targetCount
  return Array.from({ length: targetCount }, (_, i) => {
    const start = Math.floor(i * step)
    const end = Math.min(Math.floor((i + 1) * step), data.length)
    const slice = data.slice(start, end)
    return slice.reduce((s, v) => s + v, 0) / slice.length
  })
}

/**
 * Generates a gentle pseudo-random amplitude array when none is supplied.
 * Uses a seeded approach so the shape is stable across re-renders.
 */
function generateFallbackAmplitude(count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / count
    // Bell-curve-ish shape with some noise
    const base = 0.15 + 0.65 * Math.sin(Math.PI * t) * (0.7 + 0.3 * Math.sin(t * 7.3))
    return clamp(base, 0.05, 1)
  })
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AudioPlayer({
  src,
  amplitudeData,
  barCount = DEFAULT_BAR_COUNT,
  className,
  ariaLabel = 'Audio player',
}: AudioPlayerProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hoverFraction, setHoverFraction] = useState<number | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // ── Refs ──────────────────────────────────────────────────────────────────
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const pendingSeekRef = useRef<number | null>(null)

  // ── Amplitude bars (memoised) ─────────────────────────────────────────────
  const bars = React.useMemo<number[]>(() => {
    if (amplitudeData && amplitudeData.length > 0) {
      return downsampleAmplitude(amplitudeData, barCount)
    }
    return generateFallbackAmplitude(barCount)
  }, [amplitudeData, barCount])

  // ── Audio event handlers ──────────────────────────────────────────────────
  useEffect(() => {
    const audio = new Audio(src)
    audio.preload = 'metadata'
    audioRef.current = audio

    const onLoadedMetadata = () => {
      setDuration(isFinite(audio.duration) ? audio.duration : 0)
      setIsLoaded(true)
      setHasError(false)
      // Flush any pending seek
      if (pendingSeekRef.current !== null) {
        audio.currentTime = pendingSeekRef.current
        pendingSeekRef.current = null
      }
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(audio.duration || 0)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
    const onError = () => {
      setHasError(true)
      setIsLoaded(false)
    }
    const onDurationChange = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('durationchange', onDurationChange)

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.src = ''
      audioRef.current = null
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [src])

  // ── rAF loop for currentTime ──────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      return
    }
    const tick = () => {
      if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying])

  // ── Controls ──────────────────────────────────────────────────────────────
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      // Resume from end → restart
      if (audio.ended || audio.currentTime >= audio.duration - 0.05) {
        audio.currentTime = 0
        setCurrentTime(0)
      }
      audio.play().catch(() => setHasError(true))
    }
  }, [isPlaying])

  // ── Seek helpers ──────────────────────────────────────────────────────────
  const seekToFraction = useCallback((fraction: number) => {
    const clamped = clamp(fraction, 0, 1)
    const audio = audioRef.current
    const dur = duration || 0
    const target = clamped * dur

    if (!audio) {
      pendingSeekRef.current = target
      return
    }
    if (!isLoaded) {
      pendingSeekRef.current = target
      return
    }
    try {
      audio.currentTime = target
    } catch {
      // Ignore invalid state errors
    }
    setCurrentTime(target)
  }, [duration, isLoaded])

  const fractionFromPointer = useCallback((e: React.MouseEvent | MouseEvent): number => {
    const bar = progressBarRef.current
    if (!bar) return 0
    const rect = bar.getBoundingClientRect()
    return clamp((e.clientX - rect.left) / rect.width, 0, 1)
  }, [])

  // ── Progress bar interaction ──────────────────────────────────────────────
  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    seekToFraction(fractionFromPointer(e))

    const handleMouseMove = (ev: MouseEvent) => seekToFraction(fractionFromPointer(ev))
    const handleMouseUp = (ev: MouseEvent) => {
      setIsDragging(false)
      seekToFraction(fractionFromPointer(ev))
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [fractionFromPointer, seekToFraction])

  const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setHoverFraction(fractionFromPointer(e))
  }, [fractionFromPointer])

  const handleProgressMouseLeave = useCallback(() => {
    if (!isDragging) setHoverFraction(null)
  }, [isDragging])

  // Touch support
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const bar = progressBarRef.current
    if (!bar || !touch) return
    const rect = bar.getBoundingClientRect()
    seekToFraction(clamp((touch.clientX - rect.left) / rect.width, 0, 1))
  }, [seekToFraction])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    const bar = progressBarRef.current
    if (!bar || !touch) return
    const rect = bar.getBoundingClientRect()
    seekToFraction(clamp((touch.clientX - rect.left) / rect.width, 0, 1))
  }, [seekToFraction])

  // ── Derived values ────────────────────────────────────────────────────────
  const playedFraction = duration > 0 ? clamp(currentTime / duration, 0, 1) : 0
  const displayFraction = isDragging && hoverFraction !== null ? hoverFraction : playedFraction

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700',
        'bg-white dark:bg-slate-900 px-5 py-4 shadow-sm',
        className,
      )}
      role="region"
      aria-label={ariaLabel}
    >
      {/* Error state */}
      {hasError && (
        <p className="text-sm text-red-500 dark:text-red-400">
          Could not load audio. The file may be unavailable.
        </p>
      )}

      {/* Static waveform */}
      <div
        className="relative h-14 w-full cursor-pointer select-none overflow-hidden rounded-lg"
        ref={progressBarRef}
        onMouseDown={handleProgressMouseDown}
        onMouseMove={handleProgressMouseMove}
        onMouseLeave={handleProgressMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={currentTime}
        aria-valuetext={`${formatDuration(currentTime)} of ${formatDuration(duration)}`}
        tabIndex={0}
        onKeyDown={(e) => {
          const step = duration * 0.05
          if (e.key === 'ArrowRight') seekToFraction((currentTime + step) / duration)
          if (e.key === 'ArrowLeft') seekToFraction((currentTime - step) / duration)
        }}
      >
        {/* Bar chart */}
        <div className="absolute inset-0 flex items-center gap-[2px] px-1">
          {bars.map((amplitude, i) => {
            const barFraction = (i + 0.5) / bars.length
            const isPlayed = barFraction <= displayFraction
            const isHovered = hoverFraction !== null && barFraction <= hoverFraction

            return (
              <div
                key={i}
                className={cn(
                  'flex-1 rounded-full transition-colors duration-75',
                  isPlayed
                    ? 'bg-blue-500 dark:bg-blue-400'
                    : isHovered
                      ? 'bg-blue-300 dark:bg-blue-600'
                      : 'bg-slate-200 dark:bg-slate-700',
                )}
                style={{
                  height: `${Math.max(8, amplitude * 100)}%`,
                }}
                aria-hidden="true"
              />
            )
          })}
        </div>

        {/* Playhead */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-4 w-4 rounded-full',
            'border-2 border-white dark:border-slate-900 bg-blue-500 dark:bg-blue-400 shadow-md',
            'transition-opacity duration-150',
            isDragging || hoverFraction !== null ? 'opacity-100' : 'opacity-0',
          )}
          style={{ left: `${displayFraction * 100}%` }}
          aria-hidden="true"
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-4">
        {/* Play / Pause */}
        <button
          onClick={togglePlayPause}
          disabled={hasError || !src}
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-150',
            'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            'disabled:opacity-40 disabled:cursor-not-allowed active:scale-90',
          )}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            /* Pause icon */
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <rect x="3" y="2" width="3.5" height="12" rx="1" />
              <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
            </svg>
          ) : (
            /* Play icon */
            <svg className="h-4 w-4 translate-x-[1px]" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M3 2.5a.5.5 0 0 1 .765-.424l10 5.5a.5.5 0 0 1 0 .848l-10 5.5A.5.5 0 0 1 3 13.5v-11z" />
            </svg>
          )}
        </button>

        {/* Time display */}
        <div className="flex items-center gap-1 font-mono text-sm tabular-nums">
          <span
            className="min-w-[2.75rem] text-right text-slate-700 dark:text-slate-200"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatDuration(currentTime)}
          </span>
          <span className="text-slate-300 dark:text-slate-600">/</span>
          <span className="min-w-[2.75rem] text-slate-400 dark:text-slate-500">
            {duration > 0 ? formatDuration(duration) : '--:--'}
          </span>
        </div>

        {/* Loading indicator */}
        {!isLoaded && !hasError && src && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <svg
              className="h-3.5 w-3.5 animate-spin"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="8" cy="8" r="6"
                stroke="currentColor" strokeWidth="2.5"
                strokeDasharray="28" strokeDashoffset="14"
                strokeLinecap="round"
              />
            </svg>
            Loading…
          </div>
        )}
      </div>
    </div>
  )
}
