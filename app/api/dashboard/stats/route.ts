import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  // Last Monday (start of current week)
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const lastMonday = new Date(now)
  lastMonday.setDate(now.getDate() - daysSinceMonday)
  lastMonday.setHours(0, 0, 0, 0)

  const [
    totalSessions,
    completedSessions,
    user,
    totalVocab,
    weekActivity,
  ] = await Promise.all([
    // Total sessions
    prisma.practiceSession.count({
      where: { userId },
    }),
    // Sessions with scores for band calc
    prisma.practiceSession.findMany({
      where: { userId, completed: true },
      select: { scores: true },
    }),
    // User for streak
    prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true },
    }),
    // Vocab count
    prisma.vocabEntry.count({
      where: { userId },
    }),
    // Sessions this week
    prisma.activityLog.aggregate({
      where: { userId, date: { gte: lastMonday } },
      _sum: { sessions: true },
    }),
  ])

  // Compute average and best band score
  let avgBand = 0
  let bestBand = 0

  const bandScores: number[] = []
  for (const session of completedSessions) {
    if (!session.scores) continue
    const scores = session.scores as Record<string, number>
    const values = Object.values(scores).filter(
      (v) => typeof v === 'number' && !isNaN(v)
    )
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      bandScores.push(avg)
    }
  }

  if (bandScores.length > 0) {
    avgBand =
      Math.round(
        (bandScores.reduce((a, b) => a + b, 0) / bandScores.length) * 2
      ) / 2
    bestBand = Math.round(Math.max(...bandScores) * 2) / 2
  }

  return NextResponse.json({
    totalSessions,
    avgBand,
    bestBand,
    streak: user?.streak ?? 0,
    totalVocab,
    sessionsThisWeek: weekActivity._sum.sessions ?? 0,
  })
}
