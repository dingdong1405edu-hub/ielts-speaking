import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCached, setCached } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const level = searchParams.get('level')
  const review = searchParams.get('review') === 'true'

  const cacheKey = `vocab:${level ?? 'all'}:${session.user.id}:${review}`
  const cached = await getCached(cacheKey)
  if (cached) return NextResponse.json({ data: cached, error: null })

  try {
    if (review) {
      // Words due for spaced repetition review
      const progress = await prisma.userProgress.findMany({
        where: {
          userId: session.user.id,
          vocabularyId: { not: null },
          nextReviewAt: { lte: new Date() },
        },
        include: { vocabulary: true },
        take: 20,
      })

      let words = progress.map((p) => p.vocabulary).filter(Boolean)

      // If no words due, return all words for this level
      if (words.length === 0) {
        const allWords = await prisma.vocabulary.findMany({
          where: level ? { hskLevel: parseInt(level) } : undefined,
          take: 20,
          orderBy: { hskLevel: 'asc' },
        })
        words = allWords
      }

      const formatted = words.map((w) => ({
        ...w,
        examples: Array.isArray(w!.examples) ? w!.examples : [],
        tags: w!.tags ?? [],
      }))
      await setCached(cacheKey, formatted, 60)
      return NextResponse.json({ data: formatted, error: null })
    }

    const words = await prisma.vocabulary.findMany({
      where: level ? { hskLevel: parseInt(level) } : undefined,
      orderBy: [{ hskLevel: 'asc' }, { hanzi: 'asc' }],
      take: 200,
    })

    const formatted = words.map((w) => ({
      ...w,
      examples: Array.isArray(w.examples) ? w.examples : [],
      tags: w.tags ?? [],
    }))
    await setCached(cacheKey, formatted, 300)
    return NextResponse.json({ data: formatted, error: null })
  } catch (e) {
    console.error('Vocabulary error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}
