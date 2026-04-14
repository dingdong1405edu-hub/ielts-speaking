import { DeepgramClient } from '@deepgram/sdk'
import type { ListenV1Response } from '@deepgram/sdk'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TranscriptionWord {
  word: string
  start: number
  end: number
  confidence: number
  punctuated_word?: string
}

export interface TranscriptionResult {
  /** The full transcript as a single string */
  transcript: string
  /** Overall confidence score (0–1) */
  confidence: number
  /** Word-level timing and confidence data */
  words: TranscriptionWord[]
}

// ---------------------------------------------------------------------------
// Client singleton
//
// Deepgram SDK v5 uses DeepgramClient({ apiKey }) — NOT createClient(string).
// The constructor accepts BaseClientOptions & HeaderAuthProvider.AuthOptions,
// so the API key is passed as { apiKey: '...' }.
// ---------------------------------------------------------------------------

export const deepgramClient = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY!,
})

// ---------------------------------------------------------------------------
// Supported MIME types
// ---------------------------------------------------------------------------

const SUPPORTED_MIME_TYPES = new Set([
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/aac',
  'video/mp4',
  'video/webm',
])

// ---------------------------------------------------------------------------
// Transcription
// ---------------------------------------------------------------------------

/**
 * Transcribes an audio buffer using the Deepgram pre-recorded API (SDK v5).
 *
 * Deepgram SDK v5 call path:
 *   `client.listen.v1.media.transcribeFile(uploadable, requestOptions)`
 *
 * `HttpResponsePromise<T>` extends `Promise<T>` — awaiting it resolves to
 * the parsed body (`MediaTranscribeResponse`) directly.
 *
 * Features enabled:
 * - `smart_format`  — automatic punctuation and formatting
 * - `punctuate`     — sentence-level punctuation
 * - `utterances`    — utterance-level segmentation
 * - `filler_words`  — preserve um/uh for fluency analysis
 * - `language`      — English (en)
 * - `model`         — nova-3 (latest high-accuracy model)
 *
 * @param audioBuffer  - Raw audio bytes as a Node.js Buffer
 * @param mimeType     - MIME type of the audio (e.g. "audio/webm")
 * @returns            Transcript string, overall confidence, and word-level data
 * @throws             Error if MIME type is unsupported or transcription fails
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string,
): Promise<TranscriptionResult> {
  // Normalise and validate MIME type
  const normalisedMime = mimeType.toLowerCase().split(';')[0].trim()
  if (!SUPPORTED_MIME_TYPES.has(normalisedMime)) {
    throw new Error(
      `transcribeAudio: unsupported MIME type "${mimeType}". ` +
      `Supported types: ${[...SUPPORTED_MIME_TYPES].join(', ')}`,
    )
  }

  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error('transcribeAudio: audio buffer is empty')
  }

  // SDK v5: listen.v1.media.transcribeFile(uploadable, requestOptions)
  // HttpResponsePromise<MediaTranscribeResponse> — await gives the body directly.
  const result = await deepgramClient.listen.v1.media.transcribeFile(
    audioBuffer,
    {
      model: 'nova-3',
      language: 'en',
      smart_format: true,
      punctuate: true,
      utterances: true,
      filler_words: true,
    },
  )

  // MediaTranscribeResponse = ListenV1Response | ListenV1AcceptedResponse
  // ListenV1Response has `results`; ListenV1AcceptedResponse (async callback)
  // does not. We cast to ListenV1Response for synchronous transcription.
  const data = result as ListenV1Response

  if (!data?.results) {
    throw new Error('Deepgram returned no transcription results')
  }

  const channel = data.results.channels?.[0]
  const alternative = channel?.alternatives?.[0]

  if (!alternative) {
    throw new Error('Deepgram returned no alternatives in the transcription result')
  }

  const transcript = alternative.transcript ?? ''
  const confidence = alternative.confidence ?? 0

  // Map word-level data to our internal type
  const words: TranscriptionWord[] = (alternative.words ?? []).map((w) => ({
    word: w.word ?? '',
    start: w.start ?? 0,
    end: w.end ?? 0,
    confidence: w.confidence ?? 0,
  }))

  return { transcript, confidence, words }
}

// ---------------------------------------------------------------------------
// Convenience utilities
// ---------------------------------------------------------------------------

/**
 * Calculates the speaking duration in seconds from word-level timing data.
 *
 * @param words  - Word array from TranscriptionResult
 * @returns      Duration in seconds, or 0 if no words present
 */
export function getSpeakingDuration(words: TranscriptionWord[]): number {
  if (words.length === 0) return 0
  return words[words.length - 1].end
}

/**
 * Calculates words-per-minute (WPM) from transcription data.
 * Useful as a proxy for fluency in IELTS speaking practice.
 *
 * @param words  - Word array from TranscriptionResult
 * @returns      Words per minute, or 0 if insufficient data
 */
export function getWordsPerMinute(words: TranscriptionWord[]): number {
  const duration = getSpeakingDuration(words)
  if (duration === 0 || words.length === 0) return 0
  return Math.round((words.length / duration) * 60)
}
