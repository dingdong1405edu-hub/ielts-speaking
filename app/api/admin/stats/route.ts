import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const [userCount, vocabCount, grammarCount, historyCount, vocabByLevel, grammarByLevel] =
    await Promise.all([
      prisma.user.count(),
      prisma.vocabulary.count(),
      prisma.grammarLesson.count(),
      prisma.lessonHistory.count(),
      prisma.vocabulary.groupBy({ by: ['hskLevel'], _count: true, orderBy: { hskLevel: 'asc' } }),
      prisma.grammarLesson.groupBy({ by: ['hskLevel'], _count: true, orderBy: { hskLevel: 'asc' } }),
    ])

  return NextResponse.json({
    data: {
      userCount,
      vocabCount,
      grammarCount,
      historyCount,
      vocabByLevel: vocabByLevel.map((v) => ({ level: v.hskLevel, count: v._count })),
      grammarByLevel: grammarByLevel.map((g) => ({ level: g.hskLevel, count: g._count })),
    },
    error: null,
  })
}
