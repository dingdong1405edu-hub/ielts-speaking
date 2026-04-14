import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { transcribeAudio } from '@/lib/deepgram'
import { rateLimit } from '@/lib/redis'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { success } = await rateLimit(`speech:${session.user.id}`, 20, 60)
  if (!success) return NextResponse.json({ data: null, error: 'Quá nhiều yêu cầu' }, { status: 429 })

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    if (!audioFile) return NextResponse.json({ data: null, error: 'Không có file âm thanh' }, { status: 400 })

    const buffer = Buffer.from(await audioFile.arrayBuffer())
    const result = await transcribeAudio(buffer, audioFile.type)
    return NextResponse.json({ data: result, error: null })
  } catch (e) {
    console.error('Transcribe error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi nhận dạng giọng nói' }, { status: 500 })
  }
}
