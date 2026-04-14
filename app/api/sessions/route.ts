import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { SessionType } from '@prisma/client'

const PAGE_SIZE = 10
const VALID_TYPES: SessionType[] = ['TOPIC', 'BEGINNER', 'FULL_TEST']

// ---------------------------------------------------------------------------
// GET /api/sessions?type=TOPIC|BEGINNER|FULL_TEST&page=1
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const typeParam = searchParams.get('type')?.toUpperCase() as SessionType | null
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const skip = (page - 1) * PAGE_SIZE

    if (typeParam && !VALID_TYPES.includes(typeParam)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}.` },
        { status: 400 },
      )
    }

    const where = {
      userId: session.user.id,
      ...(typeParam ? { type: typeParam } : {}),
    }

    const [sessions, total] = await Promise.all([
      prisma.practiceSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: PAGE_SIZE,
        select: {
          id: true,
          type: true,
          part: true,
          topic: true,
          questionCount: true,
          scores: true,
          completed: true,
          duration: true,
          createdAt: true,
          // Return answer count from the answers JSON array length via a
          // lightweight select — we derive it client-side from answers.
          answers: true,
        },
      }),
      prisma.practiceSession.count({ where }),
    ])

    // Attach a derived `answeredCount` summary without sending full transcripts
    const sessionSummaries = sessions.map((s) => {
      const answers = Array.isArray(s.answers) ? s.answers : []
      return {
        id: s.id,
        type: s.type,
        part: s.part,
        topic: s.topic,
        questionCount: s.questionCount,
        answeredCount: answers.length,
        scores: s.scores,
        completed: s.completed,
        duration: s.duration,
        createdAt: s.createdAt,
      }
    })

    return NextResponse.json({
      sessions: sessionSummaries,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    })
  } catch (err) {
    console.error('[sessions GET] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
