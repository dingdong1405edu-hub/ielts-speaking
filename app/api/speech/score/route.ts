import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { transcribeAudio, scorePronunciation } from '@/lib/deepgram'
import { analyzePronunciation } from '@/lib/gemini'
import { rateLimit } from '@/lib/redis'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { success } = await rateLimit(`score:${session.user.id}`, 20, 60)
  if (!success) return NextResponse.json({ data: null, error: 'Quá nhiều yêu cầu' }, { status: 429 })

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const target = formData.get('target') as string

    if (!audioFile || !target) {
      return NextResponse.json({ data: null, error: 'Thiếu dữ liệu' }, { status: 400 })
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const transcription = await transcribeAudio(buffer, audioFile.type)
    const basicScore = scorePronunciation(transcription.transcript, target)

    // Enhance feedback with Gemini for more detailed analysis
    let enhancedFeedback = { feedback: basicScore.feedback, details: basicScore.details, toneAdvice: '' }
    try {
      enhancedFeedback = await analyzePronunciation(
        transcription.transcript,
        target,
        basicScore.score
      )
    } catch {
      // Fallback to basic feedback if Gemini fails
    }

    return NextResponse.json({
      data: {
        transcript: transcription.transcript,
        score: basicScore.score,
        feedback: enhancedFeedback.feedback || basicScore.feedback,
        details: enhancedFeedback.details.length > 0 ? enhancedFeedback.details : basicScore.details,
        toneAdvice: enhancedFeedback.toneAdvice,
      },
      error: null,
    })
  } catch (e) {
    console.error('Score error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi đánh giá phát âm' }, { status: 500 })
  }
}
