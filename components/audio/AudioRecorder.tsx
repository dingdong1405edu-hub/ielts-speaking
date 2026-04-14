'use client'

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

export interface AudioRecorderProps {
  /** Called when recording is complete and transcript is ready */
  onRecordingComplete: (audioBlob: Blob, transcript: string) => void
  /** Called in real-time as transcript confidence updates (optional) */
  onTranscriptUpdate?: (transcript: string) => void
  /** Maximum recording duration in seconds */
  maxDuration: number
  /** Countdown before recording starts (seconds). 0 = start immediately */
  prepTime?: number
  /** The question text shown above the recorder */
  questionText: string
  /** When true, entire recorder is non-interactive */
  isDisabled?: boolean
}

type RecorderState = 'idle' | 'preparing' | 'recording' | 'processing' | 'done'

const WAVEFORM_BAR_COUNT = 60
const TICK_MS = 100 // how often the elapsed-time counter updates

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Returns preferred MediaRecorder MIME type (webm > ogg > default) */
function getSupportedMimeType(): string {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ]
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return '' // browser default
}

// ---------------------------------------------------------------------------
// Sub-component: CircularTimer
// ---------------------------------------------------------------------------

interface CircularTimerProps {
  /** 0–1 fraction of progress */
  progress: number
  /** Label shown in centre (e.g. "45s" or "1:23") */
  label: string
  /** Colour of the arc */
  arcColor: string
  /** Size in pixels */
  size?: number
  /** Stroke width */
  strokeWidth?: number
}

function CircularTimer({
  progress,
  label,
  arcColor,
  size = 96,
  strokeWidth = 6,
}: CircularTimerProps) {
  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - clamp(progress, 0, 1))

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="rotate-[-90deg]"
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-slate-200 dark:text-slate-700"
      />
      {/* Arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={arcColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.25s ease' }}
      />
      {/* Centre label — rotate back to read normally */}
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        transform={`rotate(90, ${size / 2}, ${size / 2})`}
        className="fill-slate-800 dark:fill-slate-100 font-semibold"
        style={{ fontSize: size * 0.2, fontFamily: 'inherit' }}
      >
        {label}
      </text>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Sub-component: WaveformCanvas
// ---------------------------------------------------------------------------

interface WaveformCanvasProps {
  analyserRef: React.RefObject<AnalyserNode | null>
  isActive: boolean
}

function WaveformCanvas({ analyserRef, isActive }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isActive) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const analyser = analyserRef.current
      const W = canvas.width
      const H = canvas.height

      ctx.clearRect(0, 0, W, H)

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyser.getByteFrequencyData(dataArray)

        const barWidth = (W / WAVEFORM_BAR_COUNT) * 0.6
        const gap = (W / WAVEFORM_BAR_COUNT) * 0.4
        const step = Math.floor(bufferLength / WAVEFORM_BAR_COUNT)

        for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
          const value = dataArray[i * step] / 255
          const barHeight = Math.max(4, value * H * 0.85)
          const x = i * (barWidth + gap)
          const y = (H - barHeight) / 2

          // Gradient per bar: bright red at top fading to dark red
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
          gradient.addColorStop(0, `rgba(239,68,68,${0.5 + value * 0.5})`)
          gradient.addColorStop(1, `rgba(185,28,28,${0.3 + value * 0.4})`)

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
          ctx.fill()
        }
      } else {
        // Idle placeholders
        const barWidth = (W / WAVEFORM_BAR_COUNT) * 0.6
        const gap = (W / WAVEFORM_BAR_COUNT) * 0.4
        for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
          const x = i * (barWidth + gap)
          const barHeight = 4
          const y = (H - barHeight) / 2
          ctx.fillStyle = 'rgba(239,68,68,0.2)'
          ctx.beginPath()
          ctx.roundRect(x, y, barWidth, barHeight, 2)
          ctx.fill()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isActive, analyserRef])

  // Resize canvas to match display size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    })
    observer.observe(canvas)
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    return () => observer.disconnect()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      aria-hidden="true"
    />
  )
}

// ---------------------------------------------------------------------------
// Main component: AudioRecorder
// ---------------------------------------------------------------------------

export default function AudioRecorder({
  onRecordingComplete,
  onTranscriptUpdate,
  maxDuration,
  prepTime = 0,
  questionText,
  isDisabled = false,
}: AudioRecorderProps) {
  // ── State ─────────────────────────────────────────────────────────────────
  const [recorderState, setRecorderState] = useState<RecorderState>('idle')
  const [prepCountdown, setPrepCountdown] = useState(prepTime)
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)

  // ── Refs ──────────────────────────────────────────────────────────────────
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blobRef = useRef<Blob | null>(null)

  // ── Cleanup helper ────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current)
    if (prepIntervalRef.current) clearInterval(prepIntervalRef.current)
    if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current)
    elapsedIntervalRef.current = null
    prepIntervalRef.current = null
    maxDurationTimerRef.current = null
  }, [])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null
  }, [])

  // ── Reset to idle ─────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    clearTimers()
    stopStream()
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null
    audioChunksRef.current = []
    blobRef.current = null
    if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl)
    setAudioBlobUrl(null)
    setElapsedSecs(0)
    setPrepCountdown(prepTime)
    setTranscript('')
    setError(null)
    setRecorderState('idle')
  }, [clearTimers, stopStream, audioBlobUrl, prepTime])

  // ── Transcription ─────────────────────────────────────────────────────────
  const sendForTranscription = useCallback(async (blob: Blob) => {
    setRecorderState('processing')
    try {
      const form = new FormData()
      form.append('audio', blob, 'recording.webm')

      const res = await fetch('/api/transcribe', { method: 'POST', body: form })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }
      const { transcript: tx } = await res.json() as { transcript: string; confidence: number }

      setTranscript(tx)
      onTranscriptUpdate?.(tx)

      const url = URL.createObjectURL(blob)
      setAudioBlobUrl(url)
      setRecorderState('done')
      onRecordingComplete(blob, tx)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transcription failed'
      setError(`Transcription error: ${msg}`)
      setRecorderState('idle')
    }
  }, [onRecordingComplete, onTranscriptUpdate])

  // ── Stop recording ────────────────────────────────────────────────────────
  const stopRecording = useCallback(() => {
    clearTimers()
    stopStream()
    const mr = mediaRecorderRef.current
    if (!mr || mr.state === 'inactive') return

    mr.addEventListener('stop', () => {
      const blob = new Blob(audioChunksRef.current, {
        type: mr.mimeType || 'audio/webm',
      })
      blobRef.current = blob
      sendForTranscription(blob)
    }, { once: true })

    mr.stop()
  }, [clearTimers, stopStream, sendForTranscription])

  // ── Start recording ───────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError(null)
    audioChunksRef.current = []

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      const name = err instanceof Error ? (err as DOMException).name : ''
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Microphone access denied. Please allow microphone access in your browser settings and try again.')
      } else if (name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.')
      } else {
        setError('Could not access microphone. Please check your browser permissions.')
      }
      return
    }

    streamRef.current = stream

    // Set up Web Audio API for waveform visualisation
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audioCtx = new AudioCtx()
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.75
    const source = audioCtx.createMediaStreamSource(stream)
    source.connect(analyser)
    audioCtxRef.current = audioCtx
    analyserRef.current = analyser

    // MediaRecorder
    const mimeType = getSupportedMimeType()
    const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    mediaRecorderRef.current = mr

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data)
    }

    mr.start(250) // collect chunks every 250 ms
    setRecorderState('recording')
    setElapsedSecs(0)

    // Elapsed counter
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSecs((prev) => prev + TICK_MS / 1000)
    }, TICK_MS)

    // Auto-stop at maxDuration
    maxDurationTimerRef.current = setTimeout(() => {
      stopRecording()
    }, maxDuration * 1000)
  }, [maxDuration, stopRecording])

  // ── Start full flow (prep → record) ───────────────────────────────────────
  const handleStart = useCallback(() => {
    if (isDisabled) return

    if (prepTime > 0) {
      setRecorderState('preparing')
      setPrepCountdown(prepTime)

      prepIntervalRef.current = setInterval(() => {
        setPrepCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(prepIntervalRef.current!)
            prepIntervalRef.current = null
            startRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      startRecording()
    }
  }, [isDisabled, prepTime, startRecording])

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimers()
      stopStream()
      if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Derived values ────────────────────────────────────────────────────────
  const remainingSecs = Math.max(0, maxDuration - elapsedSecs)
  const recordingProgress = elapsedSecs / maxDuration
  const prepProgress = prepTime > 0 ? (prepTime - prepCountdown) / prepTime : 0

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700',
        'bg-white dark:bg-slate-900 p-6 shadow-sm',
        isDisabled && 'opacity-60 pointer-events-none',
      )}
      role="region"
      aria-label="Audio recorder"
    >
      {/* Question */}
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Question
      </p>
      <p className="text-base text-slate-800 dark:text-slate-100 leading-relaxed">
        {questionText}
      </p>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-4"
          >
            <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main recorder body */}
      <AnimatePresence mode="wait">

        {/* ── IDLE ── */}
        {recorderState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 py-4"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-10 w-10 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 6 0v8.25a3 3 0 0 1-3 3z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Max recording time:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {formatDuration(maxDuration)}
                </span>
              </p>
              {prepTime > 0 && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {prepTime}s preparation time before recording starts
                </p>
              )}
            </div>
            <button
              onClick={handleStart}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200',
                'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                'active:scale-[0.97]',
              )}
              aria-label="Start recording"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <circle cx="8" cy="8" r="7" className="text-white/30" fill="currentColor" />
                <circle cx="8" cy="8" r="4" />
              </svg>
              {prepTime > 0 ? 'Start Preparation' : 'Start Recording'}
            </button>
          </motion.div>
        )}

        {/* ── PREPARING ── */}
        {recorderState === 'preparing' && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-6 py-4"
          >
            {/* Pulsing amber ring */}
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-md" />
              <CircularTimer
                progress={prepProgress}
                label={`${prepCountdown}s`}
                arcColor="#F59E0B"
                size={104}
              />
            </motion.div>

            <div className="text-center">
              <p className="text-base font-semibold text-amber-600 dark:text-amber-400">
                Prepare your answer
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Recording will begin automatically
              </p>
            </div>

            <button
              onClick={reset}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {/* ── RECORDING ── */}
        {recorderState === 'recording' && (
          <motion.div
            key="recording"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col gap-5"
          >
            {/* Waveform */}
            <div className="relative h-20 w-full overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <WaveformCanvas analyserRef={analyserRef} isActive />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between gap-4">
              {/* Elapsed time */}
              <div className="flex items-center gap-2">
                {/* Pulsing red dot */}
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-block h-3 w-3 rounded-full bg-red-500"
                  aria-label="Recording"
                />
                <span className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">
                  {formatDuration(elapsedSecs)}
                </span>
              </div>

              {/* Circular remaining timer */}
              <CircularTimer
                progress={1 - recordingProgress}
                label={remainingSecs <= 60 ? `${Math.ceil(remainingSecs)}s` : formatDuration(remainingSecs)}
                arcColor="#EF4444"
                size={72}
                strokeWidth={5}
              />

              {/* Stop button */}
              <button
                onClick={stopRecording}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all duration-200',
                  'bg-red-600 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
                  'active:scale-90',
                )}
                aria-label="Stop recording"
              >
                {/* Square stop icon */}
                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <rect x="5" y="5" width="10" height="10" rx="1" />
                </svg>
              </button>
            </div>

            {/* Remaining label */}
            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              {Math.ceil(remainingSecs)}s remaining · tap{' '}
              <span className="font-medium text-slate-500 dark:text-slate-400">stop</span>{' '}
              when finished
            </p>
          </motion.div>
        )}

        {/* ── PROCESSING ── */}
        {recorderState === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-5 py-6"
          >
            {/* Spinner */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-blue-100 dark:border-slate-700 dark:border-t-blue-400"
              />
              <svg className="h-7 w-7 text-blue-400 dark:text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Transcribing your answer…
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              This usually takes a few seconds
            </p>
          </motion.div>
        )}

        {/* ── DONE ── */}
        {recorderState === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            {/* Success badge */}
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                <svg className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Recording complete
              </span>
            </div>

            {/* Transcript */}
            <div>
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Your transcript
              </p>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200 scrollbar-thin">
                {transcript || (
                  <span className="italic text-slate-400 dark:text-slate-500">
                    No speech detected
                  </span>
                )}
              </div>
            </div>

            {/* Audio playback */}
            {audioBlobUrl && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Playback
                </p>
                <audio
                  src={audioBlobUrl}
                  controls
                  className="w-full rounded-lg"
                  aria-label="Your recorded answer"
                />
              </div>
            )}

            {/* Re-record */}
            <button
              onClick={reset}
              className={cn(
                'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700',
                'bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300',
                'hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              )}
              aria-label="Re-record answer"
            >
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M1.5 8A6.5 6.5 0 0 1 8 1.5m0 0 2 2m-2-2-2 2M14.5 8A6.5 6.5 0 0 1 8 14.5m0 0-2-2m2 2 2-2" />
              </svg>
              Re-record
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
