import { createClient, DeepgramClient } from '@deepgram/sdk'

// Lazy-initialize to avoid throwing at build time when env vars are missing
let _deepgram: DeepgramClient | null = null
function getDeepgram(): DeepgramClient {
  if (!_deepgram) {
    _deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? '')
  }
  return _deepgram
}

export interface TranscriptionResult {
  transcript: string
  confidence: number
  words: Array<{ word: string; start: number; end: number; confidence: number }>
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  _mimeType = 'audio/webm'
): Promise<TranscriptionResult> {
  const { result, error } = await getDeepgram().listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      model: 'nova-2',
      language: 'zh-CN',
      punctuate: true,
      diarize: false,
      smart_format: true,
    }
  )

  if (error) throw new Error(`Deepgram error: ${error.message}`)

  const alternative = result?.results?.channels?.[0]?.alternatives?.[0]
  return {
    transcript: alternative?.transcript ?? '',
    confidence: alternative?.confidence ?? 0,
    words:
      alternative?.words?.map((w) => ({
        word: w.word,
        start: w.start,
        end: w.end,
        confidence: w.confidence,
      })) ?? [],
  }
}

export function scorePronunciation(
  transcribed: string,
  target: string
): { score: number; feedback: string; details: string[] } {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[，。！？,.!?\s]/g, '')
      .trim()
  const t = normalize(transcribed)
  const g = normalize(target)

  if (!t) return { score: 0, feedback: 'Không nhận được âm thanh. Hãy thử lại!', details: ['Kiểm tra microphone', 'Nói to và rõ hơn'] }
  if (t === g) return { score: 100, feedback: 'Xuất sắc! Phát âm hoàn hảo! 🎉', details: [] }

  // Levenshtein distance
  const matrix: number[][] = Array.from({ length: g.length + 1 }, (_, i) =>
    Array.from({ length: t.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= g.length; i++) {
    for (let j = 1; j <= t.length; j++) {
      matrix[i][j] =
        g[i - 1] === t[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
    }
  }

  const distance = matrix[g.length][t.length]
  const maxLen = Math.max(g.length, t.length)
  const score = Math.round(((maxLen - distance) / maxLen) * 100)
  const details: string[] = []

  let feedback: string
  if (score >= 95) feedback = 'Xuất sắc! Gần như hoàn hảo! 🌟'
  else if (score >= 80) { feedback = 'Rất tốt! Chỉ cần luyện thêm một chút.'; details.push('Chú ý phát âm rõ từng âm tiết') }
  else if (score >= 60) { feedback = 'Tốt! Cần chú ý thanh điệu.'; details.push('Luyện thanh điệu từng từ'); details.push('Nghe lại mẫu và bắt chước') }
  else { feedback = 'Hãy thử lại! Chú ý từng âm tiết.'; details.push('Nghe mẫu nhiều lần trước khi nói'); details.push('Tập từng từ một') }

  return { score, feedback, details }
}
