import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createChatStream } from '@/lib/groq'
import { rateLimit } from '@/lib/redis'

const TUTOR_SYSTEM = `Bạn là gia sư tiếng Trung thân thiện và kiên nhẫn.
Luôn trả lời bằng tiếng Việt, trừ khi cần ví dụ tiếng Trung.
Giải thích ngắn gọn, rõ ràng. Dùng ví dụ cụ thể.
Khuyến khích học viên và tạo không khí học tập tích cực.`

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { success } = await rateLimit(`chat:${session.user.id}`, 15, 60)
  if (!success) return NextResponse.json({ data: null, error: 'Quá nhiều tin nhắn' }, { status: 429 })

  try {
    const { messages } = await req.json()
    const stream = await createChatStream(messages, TUTOR_SYSTEM)

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
        controller.close()
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (e) {
    return NextResponse.json({ data: null, error: 'Lỗi chat AI' }, { status: 500 })
  }
}
