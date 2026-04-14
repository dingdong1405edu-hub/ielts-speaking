import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { explainGrammar } from '@/lib/groq'
import { rateLimit } from '@/lib/redis'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { success } = await rateLimit(`ai:explain:${session.user.id}`, 10, 60)
  if (!success) return NextResponse.json({ data: null, error: 'Quá nhiều yêu cầu' }, { status: 429 })

  try {
    const { pattern, hskLevel } = await req.json()
    const data = await explainGrammar(pattern, hskLevel ?? 1)
    return NextResponse.json({ data, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: 'Lỗi AI' }, { status: 500 })
  }
}
