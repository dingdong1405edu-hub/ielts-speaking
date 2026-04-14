import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { gradeAnswer } from '@/lib/groq'
import type { GeneratedQuestion } from '@/lib/groq'
import type { Prisma } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId, questionIndex, transcript } = body as {
      sessionId?: string
      questionIndex?: number
      transcript?: string
    }

    // --- Validate inputs ---
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 })
    }
    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      return NextResponse.json({ error: 'questionIndex must be a non-negative number.' }, { status: 400 })
    }
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'transcript is required.' }, { status: 400 })
    }

    // --- Fetch and verify session ownership ---
    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
    })

    if (!practiceSession) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
    }
    if (practiceSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    // --- Extract the question at the given index ---
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

    // --- Grade the answer ---
    const gradeResult = await gradeAnswer(part, topic, question.question, transcript.trim())

    // --- Append the new answer to session.answers ---
    const existingAnswers = Array.isArray(practiceSession.answers)
      ? (practiceSession.answers as object[])
      : []

    const newAnswer = {
      questionIndex,
      questionText: question.question,
      transcript: transcript.trim(),
      scores: gradeResult,
      gradedAt: new Date().toISOString(),
    }

    // Replace the answer at this index if it already exists, otherwise push
    const updatedAnswers = [...existingAnswers]
    const existingIdx = (updatedAnswers as Array<{ questionIndex: number }>).findIndex(
      (a) => a.questionIndex === questionIndex,
    )
    if (existingIdx !== -1) {
      updatedAnswers[existingIdx] = newAnswer
    } else {
      updatedAnswers.push(newAnswer)
    }

    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: { answers: updatedAnswers as unknown as Prisma.InputJsonValue },
    })

    return NextResponse.json({
      scores: gradeResult,
      feedback: {
        strengths: gradeResult.strengths,
        improvements: gradeResult.improvements,
        detailedFeedback: gradeResult.detailedFeedback,
      },
    })
  } catch (err) {
    console.error('[practice/grade] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
