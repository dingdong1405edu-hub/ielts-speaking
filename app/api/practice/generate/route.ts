import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateQuestions } from '@/lib/groq'
import { getUserUsage, incrementUsage } from '@/lib/usage'
import type { IELTSPart } from '@/lib/groq'

const VALID_PARTS: IELTSPart[] = ['PART1', 'PART2', 'PART3']
const FREE_MAX_COUNT = 10

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // --- Usage limit check ---
    const { canPractice, remaining } = await getUserUsage(session.user.id)
    if (!canPractice) {
      return Response.json(
        {
          error: 'LIMIT_REACHED',
          message:
            'Bạn đã dùng hết 25 lần miễn phí. Nâng cấp Premium để tiếp tục.',
        },
        { status: 403 },
      )
    }

    const body = await req.json()
    const { part, topic, count } = body as {
      part?: string
      topic?: string
      count?: number
    }

    // --- Validate part ---
    if (!part || !VALID_PARTS.includes(part as IELTSPart)) {
      return NextResponse.json(
        { error: `Invalid part. Must be one of: ${VALID_PARTS.join(', ')}.` },
        { status: 400 },
      )
    }

    // --- Validate topic ---
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 })
    }

    // --- Validate count ---
    const questionCount = typeof count === 'number' ? Math.floor(count) : 5
    if (questionCount < 1) {
      return NextResponse.json(
        { error: 'Count must be at least 1.' },
        { status: 400 },
      )
    }

    const userPlan = session.user.plan ?? 'FREE'
    if (userPlan === 'FREE' && questionCount > FREE_MAX_COUNT) {
      return NextResponse.json(
        {
          error: `FREE users can generate a maximum of ${FREE_MAX_COUNT} questions. Upgrade to PRO for unlimited questions.`,
        },
        { status: 403 },
      )
    }

    // --- Generate questions via Groq ---
    const questions = await generateQuestions(
      part as IELTSPart,
      topic.trim(),
      questionCount,
    )

    // --- Persist session to DB ---
    // Prisma Json fields require plain JSON-serialisable values; cast through
    // unknown to satisfy the InputJsonValue constraint.
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: session.user.id,
        type: 'TOPIC',
        part: part as IELTSPart,
        topic: topic.trim(),
        questions:
          questions as unknown as import('@prisma/client').Prisma.InputJsonValue,
        questionCount: questions.length,
        answers: [] as unknown as import('@prisma/client').Prisma.InputJsonValue,
      },
    })

    // --- Increment usage counter (non-blocking; errors are logged but don't
    //     fail the request so the user isn't penalised for a transient error) ---
    incrementUsage(session.user.id).catch((err) =>
      console.error('[practice/generate] incrementUsage error:', err),
    )

    return NextResponse.json(
      {
        sessionId: practiceSession.id,
        questions,
        remaining: remaining === Infinity ? null : remaining - 1,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[practice/generate] error:', err)
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    )
  }
}
