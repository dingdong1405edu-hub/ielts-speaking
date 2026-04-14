import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateExamQuestions } from '@/lib/gemini'
import { getCached, setCached } from '@/lib/redis'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const level = searchParams.get('level') ?? '1'
  const count = Math.min(parseInt(searchParams.get('count') ?? '20'), 40)

  const cacheKey = `exam:questions:hsk${level}:${count}`
  const cached = await getCached(cacheKey)
  if (cached) return NextResponse.json({ data: cached, error: null })

  try {
    const words = await prisma.vocabulary.findMany({
      where: { hskLevel: parseInt(level) },
      take: 30,
    })

    if (words.length === 0) {
      return NextResponse.json({ data: [], error: null })
    }

    const wordList = words.slice(0, 15).map((w) => `${w.hanzi} (${w.pinyin}): ${w.meaning}`).join('\n')
    const result = await generateExamQuestions(wordList, parseInt(level), count)
    const questions = result.questions ?? []
    await setCached(cacheKey, questions, 3600)
    return NextResponse.json({ data: questions, error: null })
  } catch (e) {
    console.error('Exam GET error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi tạo đề thi' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const body = await req.json()
    const { examType, score, maxScore, details } = body

    const result = await prisma.examResult.create({
      data: {
        userId: session.user.id,
        examType,
        score,
        maxScore,
        details: details ?? {},
      },
    })

    return NextResponse.json({ data: result, error: null }, { status: 201 })
  } catch (e) {
    console.error('Exam POST error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi lưu kết quả' }, { status: 500 })
  }
}
