import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/deepgram'

// ---------------------------------------------------------------------------
// POST /api/transcribe
//
// Accepts multipart/form-data with a single "audio" field containing an
// audio file (webm, ogg, wav, mp3, etc.).
//
// Returns:
//   { transcript: string; confidence: number }
//
// Errors:
//   400 – no audio field, empty file, or unsupported mime type
//   500 – Deepgram API failure
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Parse multipart form ────────────────────────────────────────────────
    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json(
        { error: 'Request must be multipart/form-data' },
        { status: 400 },
      )
    }

    const audioFile = formData.get('audio')

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Missing "audio" field in form data' },
        { status: 400 },
      )
    }

    if (!(audioFile instanceof File)) {
      return NextResponse.json(
        { error: '"audio" field must be a File, not a string' },
        { status: 400 },
      )
    }

    if (audioFile.size === 0) {
      return NextResponse.json(
        { error: 'Audio file is empty (0 bytes)' },
        { status: 400 },
      )
    }

    // ── Convert File → Node Buffer ──────────────────────────────────────────
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioBuffer = Buffer.from(arrayBuffer)

    // Determine MIME type; fall back to 'audio/webm' if browser omits it
    const mimeType = audioFile.type || 'audio/webm'

    // ── Transcribe ──────────────────────────────────────────────────────────
    const result = await transcribeAudio(audioBuffer, mimeType)

    // ── Return result ───────────────────────────────────────────────────────
    return NextResponse.json({
      transcript: result.transcript,
      confidence: result.confidence,
      // Include word-level data — callers may use it for highlighting
      words: result.words,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    // Surface unsupported-mime-type as a 400 rather than 500
    if (message.includes('unsupported MIME type')) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    console.error('[/api/transcribe] Transcription error:', error)
    return NextResponse.json(
      { error: 'Transcription failed. Please try again.' },
      { status: 500 },
    )
  }
}
