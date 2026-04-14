import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session)
    return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    // Get all grammar lesson completions for this user, grouped by lessonId with best score
    const history = await prisma.lessonHistory.findMany({
      where: {
        userId: session.user.id,
        type: 'GRAMMAR',
      },
      select: {
        content: true,
        score: true,
      },
    })

    // Build a map of lessonId -> bestScore
    const progressMap = new Map<string, number>()

    for (const entry of history) {
      const content = entry.content as Record<string, unknown>
      const lessonId = content?.lessonId as string | undefined
      if (!lessonId) continue

      const score = entry.score ?? 0
      const existing = progressMap.get(lessonId) ?? 0
      if (score > existing) {
        progressMap.set(lessonId, score)
      }
    }

    const progress = Array.from(progressMap.entries()).map(([lessonId, bestScore]) => ({
      lessonId,
      bestScore,
    }))

    return NextResponse.json({ data: progress, error: null })
  } catch (e) {
    console.error('Grammar progress error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}
