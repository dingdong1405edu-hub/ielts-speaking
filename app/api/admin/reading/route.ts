import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'

const passageSchema = z.object({
  title: z.string().min(1),
  titleVi: z.string().min(1),
  hskLevel: z.number().int().min(1).max(6),
  content: z.string().min(1),
  pinyin: z.string().min(1),
  translation: z.string().min(1),
  vocabulary: z.array(z.object({ hanzi: z.string(), pinyin: z.string(), meaning: z.string() })).default([]),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
    explanation: z.string().optional(),
  })).default([]),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  wordCount: z.number().int().default(0),
  published: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const { searchParams } = req.nextUrl
  const level = searchParams.get('level')
  const where: Record<string, unknown> = {}
  if (level) where.hskLevel = parseInt(level)

  const [passages, total] = await Promise.all([
    prisma.readingPassage.findMany({ where, orderBy: [{ hskLevel: 'asc' }, { createdAt: 'desc' }] }),
    prisma.readingPassage.count({ where }),
  ])

  return NextResponse.json({ data: { passages, total }, error: null })
}

export async function POST(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const body = await req.json()
  const parsed = passageSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ data: null, error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() }, { status: 400 })

  const data = { ...parsed.data, wordCount: parsed.data.content.replace(/[\s\n]/g, '').length }
  const passage = await prisma.readingPassage.create({ data })
  return NextResponse.json({ data: passage, error: null }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const body = await req.json()
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ data: null, error: 'Thiếu ID' }, { status: 400 })

  const parsed = passageSchema.safeParse(rest)
  if (!parsed.success) return NextResponse.json({ data: null, error: 'Dữ liệu không hợp lệ' }, { status: 400 })

  const data = { ...parsed.data, wordCount: parsed.data.content.replace(/[\s\n]/g, '').length }
  const passage = await prisma.readingPassage.update({ where: { id }, data })
  return NextResponse.json({ data: passage, error: null })
}

export async function DELETE(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ data: null, error: 'Thiếu ID' }, { status: 400 })

  await prisma.readingPassage.delete({ where: { id } })
  return NextResponse.json({ data: { deleted: true }, error: null })
}
