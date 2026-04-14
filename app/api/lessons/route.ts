import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const level = searchParams.get('level')

  try {
    const lessons = await prisma.grammarLesson.findMany({
      where: level ? { hskLevel: parseInt(level) } : undefined,
      orderBy: [{ hskLevel: 'asc' }, { order: 'asc' }],
    })

    const formatted = lessons.map((l) => ({
      ...l,
      content: Array.isArray(l.content) ? l.content : [],
      exercises: Array.isArray(l.exercises) ? l.exercises : [],
    }))

    return NextResponse.json({ data: formatted, error: null })
  } catch (e) {
    console.error('Lessons error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}
