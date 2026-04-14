import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ---------------------------------------------------------------------------
// GET /api/sessions/[id]
// Returns full session details: questions, answers, scores, feedback, sampleAnswers
// ---------------------------------------------------------------------------
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { id } = await params

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Session id is required.' }, { status: 400 })
    }

    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id },
    })

    if (!practiceSession) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
    }

    if (practiceSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    return NextResponse.json({
      session: {
        id: practiceSession.id,
        type: practiceSession.type,
        part: practiceSession.part,
        topic: practiceSession.topic,
        questionCount: practiceSession.questionCount,
        questions: practiceSession.questions,
        answers: practiceSession.answers,
        scores: practiceSession.scores,
        feedback: practiceSession.feedback,
        sampleAnswers: practiceSession.sampleAnswers,
        duration: practiceSession.duration,
        completed: practiceSession.completed,
        createdAt: practiceSession.createdAt,
      },
    })
  } catch (err) {
    console.error('[sessions/[id] GET] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
