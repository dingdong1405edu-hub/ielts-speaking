import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const level = searchParams.get('level')
  const id = searchParams.get('id')

  try {
    if (id) {
      const passage = await prisma.readingPassage.findUnique({ where: { id } })
      if (!passage) return NextResponse.json({ data: null, error: 'Không tìm thấy' }, { status: 404 })
      return NextResponse.json({ data: passage, error: null })
    }

    const where: Record<string, unknown> = { published: true }
    if (level) where.hskLevel = parseInt(level)

    const passages = await prisma.readingPassage.findMany({
      where,
      orderBy: [{ hskLevel: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, title: true, titleVi: true, hskLevel: true, difficulty: true, wordCount: true, tags: true },
    })

    return NextResponse.json({ data: passages, error: null })
  } catch (e) {
    console.error('Reading error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}
