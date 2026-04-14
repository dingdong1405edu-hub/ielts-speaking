import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ---------------------------------------------------------------------------
// GET /api/user/beginner-progress
// Returns the completed lesson IDs and total XP for the current user.
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const [progress, user] = await Promise.all([
      prisma.beginnerProgress.findMany({
        where: { userId: session.user.id, completed: true },
        select: { lessonId: true, xpEarned: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, streak: true },
      }),
    ])

    return NextResponse.json({
      completedLessons: progress.map((p) => p.lessonId),
      totalXP: user?.xp ?? 0,
      streak: user?.streak ?? 0,
    })
  } catch (err) {
    console.error('[beginner-progress GET] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/user/beginner-progress
// Body: { lessonId: string; xpEarned?: number }
// Upserts a BeginnerProgress record, awards XP to the user, updates streak.
// Returns: { completedLessons: string[]; totalXP: number }
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { lessonId, xpEarned: xpReward } = body as {
      lessonId?: string
      xpEarned?: number
    }

    if (!lessonId || typeof lessonId !== 'string' || lessonId.trim().length === 0) {
      return NextResponse.json({ error: 'lessonId is required.' }, { status: 400 })
    }

    const xpEarned = typeof xpReward === 'number' && xpReward > 0 ? Math.floor(xpReward) : 10
    const cleanLessonId = lessonId.trim()

    // Upsert the progress record (idempotent)
    await prisma.beginnerProgress.upsert({
      where: {
        userId_lessonId: { userId: session.user.id, lessonId: cleanLessonId },
      },
      update: { completed: true, xpEarned },
      create: {
        userId: session.user.id,
        lessonId: cleanLessonId,
        completed: true,
        xpEarned,
      },
    })

    // -- Streak logic --
    const now = new Date()
    const todayUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    )

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true, streak: true, lastActiveDate: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    let newStreak = user.streak
    if (user.lastActiveDate) {
      const lastActiveDate = new Date(user.lastActiveDate)
      const lastActiveUTC = new Date(
        Date.UTC(
          lastActiveDate.getUTCFullYear(),
          lastActiveDate.getUTCMonth(),
          lastActiveDate.getUTCDate(),
        ),
      )
      const diffDays = Math.round(
        (todayUTC.getTime() - lastActiveUTC.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (diffDays === 0) {
        newStreak = user.streak // same day, keep
      } else if (diffDays === 1) {
        newStreak = user.streak + 1 // yesterday → extend
      } else {
        newStreak = 1 // gap → reset
      }
    } else {
      newStreak = 1 // first-ever activity
    }

    // Award XP and update streak
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        xp: { increment: xpEarned },
        streak: newStreak,
        lastActiveDate: now,
      },
    })

    // Fetch fresh data for the response
    const [updatedProgress, updatedUser] = await Promise.all([
      prisma.beginnerProgress.findMany({
        where: { userId: session.user.id, completed: true },
        select: { lessonId: true },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { xp: true, streak: true },
      }),
    ])

    return NextResponse.json({
      completedLessons: updatedProgress.map((p) => p.lessonId),
      totalXP: updatedUser?.xp ?? 0,
      streak: updatedUser?.streak ?? newStreak,
      xpEarned,
    })
  } catch (err) {
    console.error('[beginner-progress POST] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
