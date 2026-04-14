import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const { searchParams } = new URL(request.url)
  const months = Math.min(12, Math.max(1, parseInt(searchParams.get('months') ?? '3', 10)))

  const since = new Date()
  since.setMonth(since.getMonth() - months)
  since.setHours(0, 0, 0, 0)

  const logs = await prisma.activityLog.findMany({
    where: { userId, date: { gte: since } },
    select: { date: true, minutes: true, sessions: true },
    orderBy: { date: 'asc' },
  })

  const data = logs.map((log) => ({
    date: log.date.toISOString().split('T')[0],
    minutes: log.minutes,
    sessions: log.sessions,
  }))

  return NextResponse.json(data)
}
