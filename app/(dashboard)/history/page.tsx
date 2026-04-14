'use client'
import { useState, useEffect } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { LessonHistoryItem, LessonType } from '@/types'
import { getLessonTypeIcon, getLessonTypeLabel, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TYPES: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'VOCABULARY', label: '📚 Từ vựng' },
  { value: 'GRAMMAR', label: '📝 Ngữ pháp' },
  { value: 'LISTENING', label: '🎧 Nghe' },
  { value: 'SPEAKING', label: '🗣️ Nói' },
  { value: 'READING', label: '📖 Đọc' },
  { value: 'WRITING', label: '✏️ Viết' },
  { value: 'EXAM', label: '🏆 Thi' },
]

const PAGE_SIZE = 10

export default function HistoryPage() {
  const [history, setHistory] = useState<LessonHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [exporting, setExporting] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalLessons: 0, totalXp: 0, avgScore: 0 })

  const fetchHistory = async (type: string, p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) })
      if (type !== 'all') params.set('type', type)
      const res = await fetch(`/api/history?${params}`)
      const json = await res.json()
      setHistory(json.data?.items ?? [])
      setTotal(json.data?.total ?? 0)
      setStats(json.data?.stats ?? { totalLessons: 0, totalXp: 0, avgScore: 0 })
    } catch {
      toast.error('Không thể tải lịch sử')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(typeFilter, page)
  }, [typeFilter, page])

  const handleExportPDF = async (item: LessonHistoryItem) => {
    setExporting(item.id)
    try {
      const { generateLessonPDF } = await import('@/lib/pdf')
      await generateLessonPDF(item)
      toast.success('Đã xuất PDF!')
    } catch {
      toast.error('Không thể xuất PDF')
    } finally {
      setExporting(null)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="text-2xl font-black">Lịch sử học tập 📜</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-border p-4 text-center">
          <p className="font-black text-xl text-foreground">{stats.totalLessons}</p>
          <p className="text-xs text-muted-foreground font-semibold">Bài học</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-4 text-center">
          <p className="font-black text-xl text-primary">{stats.totalXp}</p>
          <p className="text-xs text-muted-foreground font-semibold">Tổng XP</p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-4 text-center">
          <p className="font-black text-xl text-secondary">{stats.avgScore}%</p>
          <p className="text-xs text-muted-foreground font-semibold">TB điểm</p>
        </div>
      </div>

      {/* Type filter */}
      <div className="overflow-x-auto mb-5">
        <div className="flex gap-2 min-w-max pb-1">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => { setTypeFilter(t.value); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-bold border-2 whitespace-nowrap transition-all',
                typeFilter === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-white text-muted-foreground hover:border-muted-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-border">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-bold text-foreground">Chưa có lịch sử học tập</p>
          <p className="text-muted-foreground text-sm mt-1">Hãy bắt đầu học ngay!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                {getLessonTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">{getLessonTypeLabel(item.type)}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatDate(item.completedAt)}</span>
                  {item.score != null && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs font-bold text-foreground">{item.score}/100</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs font-bold text-primary">+{item.xpEarned} XP</span>
                <button
                  onClick={() => handleExportPDF(item)}
                  disabled={exporting === item.id}
                  className="p-2 rounded-xl hover:bg-surface transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                  title="Xuất PDF"
                >
                  {exporting === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Trước
          </Button>
          <span className="text-sm text-muted-foreground font-semibold">
            {page}/{totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Tiếp →
          </Button>
        </div>
      )}
    </div>
  )
}
