import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  try {
    const lesson = await prisma.grammarLesson.findUnique({
      where: { id: params.lessonId },
    })
    if (!lesson) return NextResponse.json({ data: null, error: 'Không tìm thấy bài học' }, { status: 404 })

    return NextResponse.json({
      data: {
        ...lesson,
        content: Array.isArray(lesson.content) ? lesson.content : [],
        exercises: Array.isArray(lesson.exercises) ? lesson.exercises : [],
      },
      error: null,
    })
  } catch (e) {
    console.error('Lesson error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}
