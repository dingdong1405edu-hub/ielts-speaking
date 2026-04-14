'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2, User, Mail, Star, Flame, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { calculateLevel } from '@/lib/utils'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ totalLessons: 0, totalXp: 0, avgScore: 0 })

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
    fetch('/api/history?limit=1')
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.stats) setStats(json.data.stats)
      })
      .catch(() => {})
  }, [session])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      await update({ name })
      toast.success('Đã cập nhật hồ sơ!')
    } catch {
      toast.error('Không thể cập nhật')
    } finally {
      setSaving(false)
    }
  }

  if (!session) return null

  const xp = session.user.xp ?? 0
  const { level, progress, nextLevelXp } = calculateLevel(xp)

  return (
    <div className="page-container max-w-lg mx-auto">
      <div className="page-header">
        <h1 className="text-2xl font-black">Hồ sơ của tôi</h1>
      </div>

      {/* Avatar & basic info */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-5 text-center">
        <Avatar className="w-20 h-20 mx-auto mb-3">
          <AvatarImage src={session.user.image ?? ''} />
          <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
            {(session.user.name?.[0] ?? session.user.email?.[0] ?? 'U').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="font-black text-xl">{session.user.name ?? 'Người dùng'}</h2>
        <p className="text-muted-foreground text-sm">{session.user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: <Flame className="w-5 h-5 text-orange-500" />, value: session.user.streak ?? 0, label: 'Streak' },
          { icon: <Star className="w-5 h-5 text-yellow-500" />, value: xp, label: 'XP' },
          { icon: <Trophy className="w-5 h-5 text-primary" />, value: stats.totalLessons, label: 'Bài học' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-4 text-center">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <p className="font-black text-xl">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Level */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">Cấp độ {level}</span>
          <span className="text-sm text-primary font-bold">{xp}/{nextLevelXp} XP</span>
        </div>
        <div className="h-3 bg-surface rounded-full border border-border overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Còn {nextLevelXp - xp} XP để lên cấp {level + 1}
        </p>
      </div>

      {/* Edit name */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h3 className="font-bold mb-4">Chỉnh sửa hồ sơ</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Họ tên</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={session.user.email ?? ''} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
          </div>
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="w-full">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang lưu...</> : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  )
}
