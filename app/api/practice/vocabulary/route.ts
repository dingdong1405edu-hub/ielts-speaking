import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateVocabulary } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { topic, sessionId } = body as {
      topic?: string
      sessionId?: string
    }

    // --- Validate topic ---
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'topic is required.' }, { status: 400 })
    }

    // sessionId is optional context — no ownership check needed here since we
    // are only generating vocabulary (not reading session data).
    void sessionId

    const result = await generateVocabulary(topic.trim())

    return NextResponse.json({ vocabulary: result.vocabulary })
  } catch (err) {
    console.error('[practice/vocabulary] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
