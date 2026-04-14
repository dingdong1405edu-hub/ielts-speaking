import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { GradeScores } from '@/lib/groq'
import type { Prisma } from '@prisma/client'

interface AnswerRecord {
  questionIndex: number
  questionText: string
  transcript: string
  scores?: GradeScores
  gradedAt?: string
}

function averageScores(answers: AnswerRecord[]): GradeScores | null {
  const scored = answers.filter((a) => a.scores != null)
  if (scored.length === 0) return null

  const sum = scored.reduce(
    (acc, a) => {
      const s = a.scores!
      return {
        overall: acc.overall + s.overall,
        fluency: acc.fluency + s.fluency,
        vocabulary: acc.vocabulary + s.vocabulary,
        grammar: acc.grammar + s.grammar,
        pronunciation: acc.pronunciation + s.pronunciation,
      }
    },
    { overall: 0, fluency: 0, vocabulary: 0, grammar: 0, pronunciation: 0 },
  )

  const n = scored.length
  return {
    overall: Math.round((sum.overall / n) * 2) / 2,
    fluency: Math.round((sum.fluency / n) * 2) / 2,
    vocabulary: Math.round((sum.vocabulary / n) * 2) / 2,
    grammar: Math.round((sum.grammar / n) * 2) / 2,
    pronunciation: Math.round((sum.pronunciation / n) * 2) / 2,
    strengths: [],
    improvements: [],
    detailedFeedback: `Average scores across ${n} graded answer(s).`,
  }
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isYesterday(date: Date, today: Date): boolean {
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return isSameDay(date, yesterday)
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = body as { sessionId?: string }

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required.' }, { status: 400 })
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
    if (practiceSession.completed) {
      return NextResponse.json({ error: 'Session is already completed.' }, { status: 409 })
    }

    // --- Compute overall scores ---
    const answers = (
      Array.isArray(practiceSession.answers) ? practiceSession.answers : []
    ) as unknown as AnswerRecord[]

    const finalScores = averageScores(answers)
    const answeredCount = answers.length
    const questionCount = practiceSession.questionCount || answeredCount

    // --- Mark session as completed ---
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        completed: true,
        scores: finalScores != null
          ? (finalScores as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    })

    // --- XP: 50 per answered question ---
    const xpGained = answeredCount * 50

    // --- Activity log: find or create today's record ---
    const today = new Date()
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const estimatedMinutes = questionCount * 2

    await prisma.activityLog.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: todayDate,
        },
      },
      update: {
        minutes: { increment: estimatedMinutes },
        sessions: { increment: 1 },
      },
      create: {
        userId: session.user.id,
        date: todayDate,
        minutes: estimatedMinutes,
        sessions: 1,
      },
    })

    // --- Update user XP and streak ---
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, streak: true, lastActiveDate: true },
    })

    if (user) {
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null
      let newStreak = user.streak

      if (lastActive == null) {
        // First ever activity
        newStreak = 1
      } else if (isSameDay(lastActive, today)) {
        // Already active today — streak unchanged
        newStreak = user.streak
      } else if (isYesterday(lastActive, today)) {
        // Active yesterday → extend streak
        newStreak = user.streak + 1
      } else {
        // Gap of more than one day → reset streak
        newStreak = 1
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xp: { increment: xpGained },
          streak: newStreak,
          lastActiveDate: today,
        },
      })
    }

    const message =
      answeredCount === 0
        ? 'Session completed. No answers were graded.'
        : `Great work! You earned ${xpGained} XP for completing ${answeredCount} question(s).`

    return NextResponse.json({ finalScores, message })
  } catch (err) {
    console.error('[practice/complete] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
