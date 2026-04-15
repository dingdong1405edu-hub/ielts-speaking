import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const saved = await prisma.savedVocab.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ data: saved, error: null })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { hanzi, pinyin, meaning, source } = await req.json()
  if (!hanzi) return NextResponse.json({ data: null, error: 'Thiếu từ vựng' }, { status: 400 })

  const saved = await prisma.savedVocab.upsert({
    where: { userId_hanzi: { userId: session.user.id, hanzi } },
    create: { userId: session.user.id, hanzi, pinyin: pinyin ?? '', meaning: meaning ?? '', source },
    update: { pinyin: pinyin ?? undefined, meaning: meaning ?? undefined },
  })
  return NextResponse.json({ data: saved, error: null })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const hanzi = searchParams.get('hanzi')
  if (!hanzi) return NextResponse.json({ data: null, error: 'Thiếu từ' }, { status: 400 })

  await prisma.savedVocab.deleteMany({ where: { userId: session.user.id, hanzi } })
  return NextResponse.json({ data: { deleted: true }, error: null })
}
