import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const type = searchParams.get('type')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '10')
  const skip = (page - 1) * limit

  try {
    const where = {
      userId: session.user.id,
      ...(type ? { type: type as never } : {}),
    }

    const [items, total, allHistory] = await Promise.all([
      prisma.lessonHistory.findMany({
        where,
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.lessonHistory.count({ where }),
      prisma.lessonHistory.findMany({
        where: { userId: session.user.id },
        select: { xpEarned: true, score: true },
      }),
    ])

    const totalXp = allHistory.reduce((s, h) => s + h.xpEarned, 0)
    const withScore = allHistory.filter((h) => h.score != null)
    const avgScore = withScore.length > 0
      ? Math.round(withScore.reduce((s, h) => s + (h.score ?? 0), 0) / withScore.length)
      : 0

    return NextResponse.json({
      data: {
        items: items.map((h) => ({ ...h, completedAt: h.completedAt.toISOString() })),
        total,
        stats: { totalLessons: allHistory.length, totalXp, avgScore },
      },
      error: null,
    })
  } catch (e) {
    console.error('History GET error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const body = await req.json()
    const { type, title, content, score, xpEarned } = body

    const history = await prisma.lessonHistory.create({
      data: {
        userId: session.user.id,
        type,
        title,
        content: content ?? {},
        score: score ?? null,
        xpEarned: xpEarned ?? 0,
      },
    })

    return NextResponse.json({ data: history, error: null }, { status: 201 })
  } catch (e) {
    console.error('History POST error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}
