import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { z } from 'zod'

const contentBlockSchema = z.object({
  type: z.enum(['heading', 'text', 'pattern', 'example', 'note', 'tip']),
  content: z.string(),
  pinyin: z.string().optional(),
  translation: z.string().optional(),
})

const exerciseSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'fill_blank']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  answer: z.string(),
  explanation: z.string().optional(),
})

const lessonSchema = z.object({
  title: z.string().min(1),
  titleVi: z.string().min(1),
  hskLevel: z.number().int().min(1).max(6),
  order: z.number().int().min(1),
  content: z.array(contentBlockSchema).default([]),
  exercises: z.array(exerciseSchema).default([]),
})

export async function GET(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const { searchParams } = req.nextUrl
  const level = searchParams.get('level')

  const where: Record<string, unknown> = {}
  if (level) where.hskLevel = parseInt(level)

  const [lessons, total] = await Promise.all([
    prisma.grammarLesson.findMany({
      where,
      orderBy: [{ hskLevel: 'asc' }, { order: 'asc' }],
    }),
    prisma.grammarLesson.count({ where }),
  ])

  return NextResponse.json({ data: { lessons, total }, error: null })
}

export async function POST(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const body = await req.json()
  const parsed = lessonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() }, { status: 400 })
  }

  const lesson = await prisma.grammarLesson.create({ data: parsed.data })
  return NextResponse.json({ data: lesson, error: null }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const body = await req.json()
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ data: null, error: 'Thiếu ID' }, { status: 400 })

  const parsed = lessonSchema.safeParse(rest)
  if (!parsed.success) {
    return NextResponse.json({ data: null, error: 'Dữ liệu không hợp lệ', details: parsed.error.flatten() }, { status: 400 })
  }

  const lesson = await prisma.grammarLesson.update({ where: { id }, data: parsed.data })
  return NextResponse.json({ data: lesson, error: null })
}

export async function DELETE(req: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) return NextResponse.json({ data: null, error }, { status })

  const { searchParams } = req.nextUrl
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ data: null, error: 'Thiếu ID' }, { status: 400 })

  await prisma.grammarLesson.delete({ where: { id } })
  return NextResponse.json({ data: { deleted: true }, error: null })
}
