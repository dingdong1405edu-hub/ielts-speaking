import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateReadingPassage, generateListeningExercise } from '@/lib/groq'
import { gradeWriting } from '@/lib/gemini'
import { rateLimit } from '@/lib/redis'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { success } = await rateLimit(`ai:${session.user.id}`, 20, 60)
  if (!success) return NextResponse.json({ data: null, error: 'Quá nhiều yêu cầu. Thử lại sau.' }, { status: 429 })

  try {
    const body = await req.json()
    const { type, level, text, prompt } = body

    let data: unknown

    switch (type) {
      case 'reading':
        data = await generateReadingPassage(level ?? 1)
        break
      case 'listening':
        data = await generateListeningExercise(level ?? 1)
        break
      case 'gradeWriting':
        // Gemini for accurate grading
        data = await gradeWriting(text ?? '', prompt ?? '', level ?? 1)
        break
      default:
        return NextResponse.json({ data: null, error: 'Loại bài không hợp lệ' }, { status: 400 })
    }

    return NextResponse.json({ data, error: null })
  } catch (e) {
    console.error('AI generate error:', e)
    return NextResponse.json({ data: null, error: 'AI không phản hồi. Thử lại sau.' }, { status: 500 })
  }
}
