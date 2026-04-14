import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, image: true, xp: true, streak: true, createdAt: true },
    })
    return NextResponse.json({ data: user, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const body = await req.json()
    const { xpToAdd, name } = body

    const updates: Record<string, unknown> = {}
    if (name) updates.name = name
    if (xpToAdd) updates.xp = { increment: xpToAdd }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
      select: { id: true, xp: true, streak: true },
    })
    return NextResponse.json({ data: user, error: null })
  } catch (e) {
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}
