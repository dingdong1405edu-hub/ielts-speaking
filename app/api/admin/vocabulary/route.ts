import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'

const vocabSchema = z.object({
  hanzi: z.string().min(1),
  pinyin: z.string().min(1),
  meaning: z.string().min(1),
  hskLevel: z.number().int().min(1).max(6),
  audioUrl: z.string().optional(),
  examples: z.array(z.object({
    sentence: z.string(),
    pinyin: z.string(),
    meaning: z.string(),
  })).default([]),
  tags: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const { searchParams } = req.nextUrl
  const level = searchParams.get('level')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  const where: Record<string, unknown> = {}
  if (level) where.hskLevel = parseInt(level)
  if (search) where.OR = [
    { hanzi: { contains: search } },
    { pinyin: { contains: search, mode: 'insensitive' } },
    { meaning: { contains: search, mode: 'insensitive' } },
  ]

  const [words, total] = await Promise.all([
    prisma.vocabulary.findMany({
      where,
      orderBy: [{ hskLevel: 'asc' }, { hanzi: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vocabulary.count({ where }),
  ])

  return NextResponse.json({ data: { words, total, page, limit }, error: null })
}

export async function POST(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const body = await req.json()
  const parsed = vocabSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() }, { status: 400 })
  }

  const word = await prisma.vocabulary.create({ data: parsed.data })
  return NextResponse.json({ data: word, error: null }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const body = await req.json()
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ data: null, error: 'Thiếu ID' }, { status: 400 })

  const parsed = vocabSchema.safeParse(rest)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: 'Dữ liệu không hợp lệ' }, { status: 400 })
  }

  const word = await prisma.vocabulary.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ data: word, error: null })
}

export async function DELETE(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ data: null, error: 'Thiếu ID' }, { status: 400 })

  await prisma.vocabulary.delete({ where: { id } })
  return NextResponse.json({ data: { deleted: true }, error: null })
}
