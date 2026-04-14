import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sm2, ratingToQuality, getInitialCard } from '@/lib/spaced-repetition'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const body = await req.json()
    const { results, type } = body as {
      results: Array<{ wordId: string; rating: number }>
      type: 'vocabulary' | 'grammar'
    }

    const updates = await Promise.all(
      results.map(async ({ wordId, rating }) => {
        const existing = await prisma.userProgress.findFirst({
          where: {
            userId: session.user.id,
            ...(type === 'vocabulary' ? { vocabularyId: wordId } : { lessonId: wordId }),
          },
        })

        const card = existing
          ? { easeFactor: 2.5, interval: existing.masteryLevel, repetitions: existing.reviewCount }
          : getInitialCard()

        const quality = ratingToQuality(rating)
        const result = sm2(card, quality)

        return prisma.userProgress.upsert({
          where: existing?.id
            ? { id: existing.id }
            : type === 'vocabulary'
            ? { userId_vocabularyId: { userId: session.user.id, vocabularyId: wordId } }
            : { userId_lessonId: { userId: session.user.id, lessonId: wordId } },
          create: {
            userId: session.user.id,
            ...(type === 'vocabulary' ? { vocabularyId: wordId } : { lessonId: wordId }),
            masteryLevel: result.interval,
            nextReviewAt: result.nextReviewDate,
            reviewCount: result.repetitions,
          },
          update: {
            masteryLevel: result.interval,
            nextReviewAt: result.nextReviewDate,
            reviewCount: result.repetitions,
          },
        })
      })
    )

    return NextResponse.json({ data: { updated: updates.length }, error: null })
  } catch (e) {
    console.error('Progress error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}
