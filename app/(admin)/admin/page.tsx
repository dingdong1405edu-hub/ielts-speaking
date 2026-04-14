'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface Stats {
  userCount: number
  vocabCount: number
  grammarCount: number
  historyCount: number
  vocabByLevel: { level: number; count: number }[]
  grammarByLevel: { level: number; count: number }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((json) => { setStats(json.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  if (!stats) return <div className="text-center py-20 text-muted-foreground">Lỗi tải dữ liệu</div>

  return (
    <div>
      <h1 className="text-2xl font-black mb-6">Admin Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Người dùng" value={stats.userCount} icon="👥" color="bg-blue-50 border-blue-200" />
        <StatCard label="Từ vựng" value={stats.vocabCount} icon="📚" color="bg-green-50 border-green-200" href="/admin/vocabulary" />
        <StatCard label="Bài ngữ pháp" value={stats.grammarCount} icon="📝" color="bg-orange-50 border-orange-200" href="/admin/grammar" />
        <StatCard label="Lịch sử học" value={stats.historyCount} icon="📊" color="bg-purple-50 border-purple-200" />
      </div>

      {/* Breakdown tables */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-sm mb-4">Từ vựng theo HSK</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2">Cấp độ</th><th className="pb-2 text-right">Số từ</th>
            </tr></thead>
            <tbody>
              {[1,2,3,4,5,6].map((lv) => {
                const found = stats.vocabByLevel.find((v) => v.level === lv)
                return (
                  <tr key={lv} className="border-b border-border/50">
                    <td className="py-2 font-semibold">HSK {lv}</td>
                    <td className="py-2 text-right">{found?.count ?? 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-sm mb-4">Ngữ pháp theo HSK</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground border-b border-border">
              <th className="pb-2">Cấp độ</th><th className="pb-2 text-right">Số bài</th>
            </tr></thead>
            <tbody>
              {[1,2,3,4,5,6].map((lv) => {
                const found = stats.grammarByLevel.find((g) => g.level === lv)
                return (
                  <tr key={lv} className="border-b border-border/50">
                    <td className="py-2 font-semibold">HSK {lv}</td>
                    <td className="py-2 text-right">{found?.count ?? 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color, href }: {
  label: string; value: number; icon: string; color: string; href?: string
}) {
  const inner = (
    <div className={`rounded-2xl border-2 p-5 ${color} ${href ? 'hover:shadow-md transition-all cursor-pointer' : ''}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-3xl font-black text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground font-semibold mt-1">{label}</div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}
