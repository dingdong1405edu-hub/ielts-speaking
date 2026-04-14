'use client'
import { useState, useRef, useCallback } from 'react'
import { Mic, Square, Play, Send, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type RecordingState = 'idle' | 'recording' | 'recorded' | 'evaluating'

interface AudioRecorderProps {
  targetText: string
  targetPinyin: string
  onResult: (score: number, feedback: string, details: string[]) => void
}

export default function AudioRecorder({ targetText, targetPinyin, onResult }: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [bars, setBars] = useState<number[]>(Array(20).fill(4))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const animFrameRef = useRef<number>()
  const analyserRef = useRef<AnalyserNode>()

  const startRecording = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      analyserRef.current = analyser

      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = (e) => chunksRef.current.push(e.data)
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        setState('recorded')
        stream.getTracks().forEach((t) => t.stop())
        cancelAnimationFrame(animFrameRef.current!)
      }

      mr.start()
      setState('recording')

      const draw = () => {
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        setBars(Array.from({ length: 20 }, (_, i) => {
          const v = data[Math.floor((i / 20) * data.length)] ?? 0
          return Math.max(4, (v / 255) * 60)
        }))
        animFrameRef.current = requestAnimationFrame(draw)
      }
      draw()
    } catch {
      setError('Không thể truy cập microphone. Vui lòng cho phép quyền.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop()
  }, [])

  const submitAudio = useCallback(async () => {
    if (!chunksRef.current.length) return
    setState('evaluating')
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')
      formData.append('target', targetText)

      const res = await fetch('/api/speech/score', { method: 'POST', body: formData })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      onResult(json.data.score, json.data.feedback, json.data.details ?? [])
    } catch (e) {
      setError('Có lỗi khi đánh giá. Thử lại nhé!')
      setState('recorded')
    }
  }, [targetText, onResult])

  const reset = useCallback(() => {
    setAudioUrl(null)
    setState('idle')
    setError('')
  }, [])

  return (
    <div className="space-y-6">
      {/* Target sentence */}
      <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 text-center">
        <p className="font-chinese text-3xl font-bold text-foreground mb-2">{targetText}</p>
        <p className="text-secondary font-medium">{targetPinyin}</p>
      </div>

      {/* Waveform */}
      <div className="flex items-center justify-center gap-1 h-16 bg-surface rounded-2xl border border-border px-4">
        {bars.map((h, i) => (
          <div
            key={i}
            className={cn(
              'w-1.5 rounded-full transition-all duration-75',
              state === 'recording' ? 'bg-danger' : 'bg-border'
            )}
            style={{ height: `${state === 'recording' ? h : 4}px` }}
          />
        ))}
      </div>

      {error && <p className="text-danger text-sm text-center font-semibold">{error}</p>}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {state === 'idle' && (
          <Button size="lg" variant="destructive" onClick={startRecording} className="gap-2">
            <Mic className="w-5 h-5" />
            Bắt đầu nói
          </Button>
        )}
        {state === 'recording' && (
          <Button size="lg" variant="outline" onClick={stopRecording} className="gap-2 border-danger text-danger hover:bg-red-50">
            <Square className="w-5 h-5 fill-current" />
            Dừng
          </Button>
        )}
        {state === 'recorded' && (
          <>
            <Button size="default" variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Ghi lại
            </Button>
            {audioUrl && (
              <Button
                size="default"
                variant="outline"
                onClick={() => new Audio(audioUrl).play()}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                Nghe lại
              </Button>
            )}
            <Button size="default" onClick={submitAudio} className="gap-2">
              <Send className="w-4 h-4" />
              Đánh giá
            </Button>
          </>
        )}
        {state === 'evaluating' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Đang đánh giá...
          </div>
        )}
      </div>
    </div>
  )
}
