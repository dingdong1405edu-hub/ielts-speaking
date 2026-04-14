export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

const HSK_EXAMS = [
  { id: 'hsk1', level: 1, questions: 40, duration: 40, desc: 'Từ vựng cơ bản, nghe và đọc đơn giản', color: 'bg-green-50 border-green-200' },
  { id: 'hsk2', level: 2, questions: 60, duration: 55, desc: 'Mở rộng từ vựng, câu phức tạp hơn', color: 'bg-blue-50 border-blue-200' },
  { id: 'hsk3', level: 3, questions: 80, duration: 90, desc: 'Giao tiếp hàng ngày, thêm phần viết', color: 'bg-orange-50 border-orange-200' },
  { id: 'hsk4', level: 4, questions: 100, duration: 105, desc: 'Tiếng Trung nâng cao, nội dung đa dạng', color: 'bg-purple-50 border-purple-200' },
  { id: 'hsk5', level: 5, questions: 100, duration: 125, desc: 'Đọc hiểu sâu, viết luận', color: 'bg-red-50 border-red-200' },
  { id: 'hsk6', level: 6, questions: 101, duration: 140, desc: 'Trình độ cao nhất, tin tức và văn học', color: 'bg-gray-50 border-gray-200' },
]

export default async function ExamPage() {
  const session = await auth()
  const userId = session?.user.id ?? ''

  const results = userId
    ? await prisma.examResult.findMany({
        where: { userId },
        orderBy: { takenAt: 'desc' },
        take: 10,
      })
    : []

  const bestByLevel = results.reduce<Record<string, number>>((acc, r) => {
    if (!acc[r.examType] || r.score > acc[r.examType]) acc[r.examType] = r.score
    return acc
  }, {})

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-2xl font-black">Luyện thi HSK 🏆</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Thi thử toàn bộ 6 cấp độ HSK
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {HSK_EXAMS.map((exam) => {
          const best = bestByLevel[exam.id]
          return (
            <div
              key={exam.id}
              className={`rounded-2xl border-2 p-5 ${exam.color} hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={`hsk${exam.level}` as 'hsk1'} className="text-sm px-3">
                      HSK {exam.level}
                    </Badge>
                    {best !== undefined && (
                      <span className="text-xs font-bold text-muted-foreground">
                        Cao nhất: {best}/{exam.questions}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{exam.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span>📝 {exam.questions} câu</span>
                <span>⏱️ {exam.duration} phút</span>
              </div>

              <Link href={`/exam/${exam.id}`}>
                <button className="w-full py-3 bg-white rounded-xl border-2 border-current font-bold text-sm hover:shadow-sm transition-all active:scale-98">
                  {best !== undefined ? '📊 Thi lại' : '🚀 Bắt đầu thi'}
                </button>
              </Link>
            </div>
          )
        })}
      </div>

      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="font-black text-lg mb-4">Lịch sử thi gần đây</h2>
          <div className="space-y-2">
            {results.slice(0, 5).map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm capitalize">{r.examType.toUpperCase()}</span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(r.takenAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-foreground">{r.score}/{r.maxScore}</p>
                  <p className="text-xs text-primary font-bold">
                    {Math.round((r.score / r.maxScore) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
