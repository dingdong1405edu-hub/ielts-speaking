import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getLessonTypeLabel, formatDate } from '@/lib/utils'

// Server-side PDF generation using basic HTML → PDF approach
// Client-side uses jsPDF directly (lib/pdf.ts); this route is for server export
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ data: null, error: 'Chưa đăng nhập' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const historyId = searchParams.get('id')
  if (!historyId) return NextResponse.json({ data: null, error: 'Thiếu id' }, { status: 400 })

  try {
    const history = await prisma.lessonHistory.findFirst({
      where: { id: historyId, userId: session.user.id },
    })

    if (!history) {
      return NextResponse.json({ data: null, error: 'Không tìm thấy bài học' }, { status: 404 })
    }

    // Return lesson data for client-side PDF generation
    return NextResponse.json({
      data: {
        ...history,
        completedAt: history.completedAt.toISOString(),
      },
      error: null,
    })
  } catch (e) {
    console.error('Export PDF error:', e)
    return NextResponse.json({ data: null, error: 'Lỗi server' }, { status: 500 })
  }
}
