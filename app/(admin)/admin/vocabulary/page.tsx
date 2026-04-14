'use client'
import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, Pencil, Trash2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Vocab {
  id: string
  hanzi: string
  pinyin: string
  meaning: string
  hskLevel: number
  audioUrl: string | null
  examples: { sentence: string; pinyin: string; meaning: string }[]
  tags: string[]
}

interface FormData {
  hanzi: string
  pinyin: string
  meaning: string
  hskLevel: number
  audioUrl: string
  examples: { sentence: string; pinyin: string; meaning: string }[]
  tags: string
}

const emptyForm: FormData = { hanzi: '', pinyin: '', meaning: '', hskLevel: 1, audioUrl: '', examples: [{ sentence: '', pinyin: '', meaning: '' }], tags: '' }

export default function AdminVocabularyPage() {
  const [words, setWords] = useState<Vocab[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchWords = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (level) params.set('level', level)
    if (search) params.set('search', search)
    params.set('page', String(page))
    params.set('limit', '50')

    const res = await fetch(`/api/admin/vocabulary?${params}`)
    const json = await res.json()
    if (json.data) {
      setWords(json.data.words)
      setTotal(json.data.total)
    }
    setLoading(false)
  }, [level, search, page])

  useEffect(() => { fetchWords() }, [fetchWords])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (w: Vocab) => {
    setEditingId(w.id)
    setForm({
      hanzi: w.hanzi,
      pinyin: w.pinyin,
      meaning: w.meaning,
      hskLevel: w.hskLevel,
      audioUrl: w.audioUrl ?? '',
      examples: w.examples.length > 0 ? w.examples : [{ sentence: '', pinyin: '', meaning: '' }],
      tags: w.tags.join(', '),
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string, hanzi: string) => {
    if (!confirm(`Xoá từ "${hanzi}"?`)) return
    const res = await fetch(`/api/admin/vocabulary?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Đã xoá'); fetchWords() }
    else toast.error('Lỗi xoá')
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      ...( editingId ? { id: editingId } : {} ),
      hanzi: form.hanzi.trim(),
      pinyin: form.pinyin.trim(),
      meaning: form.meaning.trim(),
      hskLevel: form.hskLevel,
      audioUrl: form.audioUrl.trim() || undefined,
      examples: form.examples.filter((e) => e.sentence.trim()),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch('/api/admin/vocabulary', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()

    if (json.error) {
      toast.error(json.error)
    } else {
      toast.success(editingId ? 'Đã cập nhật' : 'Đã thêm')
      setShowModal(false)
      fetchWords()
    }
    setSaving(false)
  }

  const updateExample = (idx: number, field: string, value: string) => {
    const updated = [...form.examples]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, examples: updated })
  }

  const addExample = () => setForm({ ...form, examples: [...form.examples, { sentence: '', pinyin: '', meaning: '' }] })
  const removeExample = (idx: number) => setForm({ ...form, examples: form.examples.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Quản lý Từ vựng</h1>
          <p className="text-muted-foreground text-sm">{total} từ trong database</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Thêm từ</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm hanzi, pinyin, nghĩa..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="h-10 px-3 rounded-xl border border-border text-sm font-semibold bg-white"
          value={level}
          onChange={(e) => { setLevel(e.target.value); setPage(1) }}
        >
          <option value="">Tất cả HSK</option>
          {[1,2,3,4,5,6].map((l) => <option key={l} value={l}>HSK {l}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Hanzi</th>
                <th className="px-4 py-3">Pinyin</th>
                <th className="px-4 py-3">Nghĩa</th>
                <th className="px-4 py-3">HSK</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {words.map((w) => (
                <tr key={w.id} className="border-b border-border/50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-chinese text-lg font-bold">{w.hanzi}</td>
                  <td className="px-4 py-3 text-secondary">{w.pinyin}</td>
                  <td className="px-4 py-3">{w.meaning}</td>
                  <td className="px-4 py-3">
                    <Badge variant={`hsk${w.hskLevel}` as 'hsk1'}>HSK {w.hskLevel}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {w.tags.map((t) => <span key={t} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{t}</span>)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(w)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(w.id, w.hanzi)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {words.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Chưa có từ vựng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 50 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</Button>
          <span className="text-sm text-muted-foreground py-2">Trang {page}/{Math.ceil(total / 50)}</span>
          <Button variant="outline" size="sm" disabled={page * 50 >= total} onClick={() => setPage(page + 1)}>Sau</Button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">{editingId ? 'Sửa từ vựng' : 'Thêm từ vựng mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-surface"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Hanzi *</Label>
                  <Input value={form.hanzi} onChange={(e) => setForm({ ...form, hanzi: e.target.value })} placeholder="你好" className="font-chinese text-lg" />
                </div>
                <div>
                  <Label>Pinyin *</Label>
                  <Input value={form.pinyin} onChange={(e) => setForm({ ...form, pinyin: e.target.value })} placeholder="nǐ hǎo" />
                </div>
              </div>

              <div>
                <Label>Nghĩa tiếng Việt *</Label>
                <Input value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} placeholder="Xin chào" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>HSK Level</Label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-border text-sm bg-white"
                    value={form.hskLevel}
                    onChange={(e) => setForm({ ...form, hskLevel: parseInt(e.target.value) })}
                  >
                    {[1,2,3,4,5,6].map((l) => <option key={l} value={l}>HSK {l}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Tags (phẩy phân cách)</Label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="danh từ, gia đình" />
                </div>
              </div>

              {/* Examples */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Ví dụ</Label>
                  <button onClick={addExample} className="text-xs text-primary font-bold hover:underline">+ Thêm ví dụ</button>
                </div>
                {form.examples.map((ex, i) => (
                  <div key={i} className="bg-surface rounded-xl p-3 mb-2 space-y-2 relative">
                    {form.examples.length > 1 && (
                      <button onClick={() => removeExample(i)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Input placeholder="Câu ví dụ (汉字)" value={ex.sentence} onChange={(e) => updateExample(i, 'sentence', e.target.value)} className="font-chinese" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Pinyin" value={ex.pinyin} onChange={(e) => updateExample(i, 'pinyin', e.target.value)} />
                      <Input placeholder="Nghĩa" value={ex.meaning} onChange={(e) => updateExample(i, 'meaning', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handleSave} disabled={saving || !form.hanzi || !form.pinyin || !form.meaning}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  {editingId ? 'Cập nhật' : 'Thêm mới'}
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)}>Huỷ</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
