import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateSampleAnswer } from '@/lib/groq'
import type { GeneratedQuestion } from '@/lib/groq'
import type { Prisma } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId, questionIndex } = body as {
      sessionId?: string
      questionIndex?: number
    }

    // --- Validate inputs ---
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 })
    }
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return NextResponse.json({ error: 'questionIndex must be a non-negative number.' }, { status: 400 })
    }

    // --- Fetch and verify ownership ---
    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
    })

    if (!practiceSession) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
    }
    if (practiceSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    // --- Resolve the question text ---
    const questions = practiceSession.questions as unknown as GeneratedQuestion[]
    if (!Array.isArray(questions) || questionIndex >= questions.length) {
      return NextResponse.json(
        { error: `questionIndex ${questionIndex} is out of range (session has ${questions.length} question(s)).` },
        { status: 400 },
      )
    }

    const question = questions[questionIndex]
    const part = practiceSession.part ?? 'PART1'
    const topic = practiceSession.topic ?? ''

    // --- Generate sample answer ---
    const result = await generateSampleAnswer(part, topic, question.question)

    // --- Persist sampleAnswers map in session ---
    const existingSampleAnswers =
      practiceSession.sampleAnswers != null &&
      typeof practiceSession.sampleAnswers === 'object' &&
      !Array.isArray(practiceSession.sampleAnswers)
        ? (practiceSession.sampleAnswers as Record<string, unknown>)
        : {}

    const updatedSampleAnswers = {
      ...existingSampleAnswers,
      [questionIndex]: {
        sampleAnswer: result.sampleAnswer,
        bandIndicators: result.bandIndicators,
        generatedAt: new Date().toISOString(),
      },
    }

    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { sampleAnswers: updatedSampleAnswers as unknown as Prisma.InputJsonValue },
    })

    return NextResponse.json({
      sampleAnswer: result.sampleAnswer,
      bandIndicators: result.bandIndicators,
    })
  } catch (err) {
    console.error('[practice/sample] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
