import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  // Last Monday
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const lastMonday = new Date(now)
  lastMonday.setDate(now.getDate() - daysSinceMonday)
  lastMonday.setHours(0, 0, 0, 0)

  // Aggregate activity logs for this week grouped by user
  const weekActivity = await prisma.activityLog.groupBy({
    by: ['userId'],
    where: { date: { gte: lastMonday } },
    _sum: { minutes: true, sessions: true },
    orderBy: { _sum: { minutes: 'desc' } },
    take: 10,
  })

  if (weekActivity.length === 0) {
    return NextResponse.json([])
  }

  const userIds = weekActivity.map((a) => a.userId)

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, image: true },
  })

  const userMap = new Map(users.map((u) => [u.id, u]))

  const leaderboard = weekActivity.map((activity, index) => {
    const user = userMap.get(activity.userId)
    return {
      rank: index + 1,
      userId: activity.userId,
      name: user?.name ?? 'Anonymous',
      image: user?.image ?? null,
      minutes: activity._sum.minutes ?? 0,
      sessions: activity._sum.sessions ?? 0,
    }
  })

  return NextResponse.json(leaderboard)
}
