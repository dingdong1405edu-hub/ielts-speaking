'use client'
import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, Pencil, Trash2, X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ContentBlock {
  type: 'heading' | 'text' | 'pattern' | 'example' | 'note' | 'tip'
  content: string
  pinyin?: string
  translation?: string
}

interface Exercise {
  id: string
  type: 'multiple_choice' | 'fill_blank'
  question: string
  options?: string[]
  answer: string
  explanation?: string
}

interface Lesson {
  id: string
  title: string
  titleVi: string
  hskLevel: number
  order: number
  content: ContentBlock[]
  exercises: Exercise[]
}

const emptyBlock: ContentBlock = { type: 'text', content: '' }
const emptyExercise: Exercise = { id: '', type: 'multiple_choice', question: '', options: ['', '', '', ''], answer: '', explanation: '' }

export default function AdminGrammarPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Form
  const [title, setTitle] = useState('')
  const [titleVi, setTitleVi] = useState('')
  const [hskLevel, setHskLevel] = useState(1)
  const [order, setOrder] = useState(1)
  const [content, setContent] = useState<ContentBlock[]>([{ ...emptyBlock }])
  const [exercises, setExercises] = useState<Exercise[]>([])

  // Section toggles
  const [showContent, setShowContent] = useState(true)
  const [showExercises, setShowExercises] = useState(true)

  const fetchLessons = useCallback(async () => {
    setLoading(true)
    const params = level ? `?level=${level}` : ''
    const res = await fetch(`/api/admin/grammar${params}`)
    const json = await res.json()
    if (json.data) {
      setLessons(json.data.lessons.map((l: Lesson) => ({
        ...l,
        content: Array.isArray(l.content) ? l.content : [],
        exercises: Array.isArray(l.exercises) ? l.exercises : [],
      })))
    }
    setLoading(false)
  }, [level])

  useEffect(() => { fetchLessons() }, [fetchLessons])

  const resetForm = () => {
    setTitle(''); setTitleVi(''); setHskLevel(1); setOrder(1)
    setContent([{ ...emptyBlock }]); setExercises([])
    setEditingId(null)
  }

  const openCreate = () => { resetForm(); setShowModal(true) }

  const openEdit = (l: Lesson) => {
    setEditingId(l.id)
    setTitle(l.title); setTitleVi(l.titleVi); setHskLevel(l.hskLevel); setOrder(l.order)
    setContent(l.content.length > 0 ? l.content : [{ ...emptyBlock }])
    setExercises(l.exercises)
    setShowModal(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xoá bài "${name}"?`)) return
    const res = await fetch(`/api/admin/grammar?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Đã xoá'); fetchLessons() }
    else toast.error('Lỗi xoá')
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      title: title.trim(),
      titleVi: titleVi.trim(),
      hskLevel,
      order,
      content: content.filter((b) => b.content.trim()),
      exercises: exercises.filter((e) => e.question.trim()).map((e, i) => ({
        ...e,
        id: e.id || `ex${i + 1}`,
        options: e.type === 'multiple_choice' ? (e.options ?? []).filter((o) => o.trim()) : undefined,
      })),
    }

    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch('/api/admin/grammar', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()

    if (json.error) toast.error(json.error)
    else { toast.success(editingId ? 'Đã cập nhật' : 'Đã thêm'); setShowModal(false); fetchLessons() }
    setSaving(false)
  }

  // Content block helpers
  const updateBlock = (i: number, key: string, value: string) => {
    const updated = [...content]
    updated[i] = { ...updated[i], [key]: value }
    setContent(updated)
  }
  const addBlock = (type: ContentBlock['type']) => setContent([...content, { type, content: '' }])
  const removeBlock = (i: number) => setContent(content.filter((_, idx) => idx !== i))
  const moveBlock = (i: number, dir: -1 | 1) => {
    const arr = [...content]; const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    setContent(arr)
  }

  // Exercise helpers
  const updateExercise = (i: number, key: string, value: unknown) => {
    const updated = [...exercises]
    updated[i] = { ...updated[i], [key]: value }
    setExercises(updated)
  }
  const addExercise = (type: Exercise['type']) => {
    setExercises([...exercises, {
      ...emptyExercise,
      id: `ex${exercises.length + 1}`,
      type,
      options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
    }])
  }
  const removeExercise = (i: number) => setExercises(exercises.filter((_, idx) => idx !== i))
  const updateOption = (eIdx: number, oIdx: number, value: string) => {
    const ex = { ...exercises[eIdx] }
    const opts = [...(ex.options ?? [])]
    opts[oIdx] = value
    ex.options = opts
    const updated = [...exercises]
    updated[eIdx] = ex
    setExercises(updated)
  }

  const blockTypeLabels: Record<string, string> = {
    heading: 'Tiêu đề', text: 'Văn bản', pattern: 'Mẫu câu',
    example: 'Ví dụ', note: 'Ghi chú', tip: 'Mẹo',
  }
  const blockTypeColors: Record<string, string> = {
    heading: 'bg-gray-100', text: 'bg-white', pattern: 'bg-yellow-50',
    example: 'bg-green-50', note: 'bg-blue-50', tip: 'bg-emerald-50',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Quản lý Ngữ pháp</h1>
          <p className="text-muted-foreground text-sm">{lessons.length} bài học</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Thêm bài</Button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          className="h-10 px-3 rounded-xl border border-border text-sm font-semibold bg-white"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Tất cả HSK</option>
          {[1,2,3,4,5,6].map((l) => <option key={l} value={l}>HSK {l}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {lessons.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={`hsk${l.hskLevel}` as 'hsk1'}>HSK {l.hskLevel}</Badge>
                  <span className="text-xs text-muted-foreground">#{l.order}</span>
                </div>
                <p className="font-bold text-sm truncate">{l.titleVi}</p>
                <p className="text-xs text-muted-foreground truncate">{l.title}</p>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground flex-shrink-0">
                <span>{(l.content as ContentBlock[]).length} blocks</span>
                <span>{(l.exercises as Exercise[]).length} bài tập</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => openEdit(l)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(l.id, l.titleVi)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {lessons.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Chưa có bài ngữ pháp nào</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black">{editingId ? 'Sửa bài ngữ pháp' : 'Thêm bài ngữ pháp'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-surface"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-5">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <Label>Tiêu đề (EN)</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="是 shì - To Be" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label>Tiêu đề (VI) *</Label>
                  <Input value={titleVi} onChange={(e) => setTitleVi(e.target.value)} placeholder="Động từ 是 — Là" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>HSK Level</Label>
                  <select className="w-full h-10 px-3 rounded-xl border border-border text-sm bg-white" value={hskLevel} onChange={(e) => setHskLevel(parseInt(e.target.value))}>
                    {[1,2,3,4,5,6].map((l) => <option key={l} value={l}>HSK {l}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Thứ tự</Label>
                  <Input type="number" min={1} value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 1)} />
                </div>
              </div>

              {/* Content blocks */}
              <div>
                <button onClick={() => setShowContent(!showContent)} className="flex items-center gap-2 font-bold text-sm mb-3 w-full text-left">
                  {showContent ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Nội dung bài học ({content.length} blocks)
                </button>
                {showContent && (
                  <div className="space-y-2">
                    {content.map((block, i) => (
                      <div key={i} className={`rounded-xl border border-border p-3 ${blockTypeColors[block.type] ?? 'bg-white'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <select
                            className="text-xs font-bold px-2 py-1 rounded border border-border bg-white"
                            value={block.type}
                            onChange={(e) => updateBlock(i, 'type', e.target.value)}
                          >
                            {Object.entries(blockTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                          <div className="flex-1" />
                          <button onClick={() => moveBlock(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-white/80 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                          <button onClick={() => moveBlock(i, 1)} disabled={i === content.length - 1} className="p-1 rounded hover:bg-white/80 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                          <button onClick={() => removeBlock(i)} className="p-1 rounded hover:bg-red-50 text-red-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <textarea
                          className="w-full border border-border rounded-lg p-2 text-sm min-h-[60px] resize-y bg-white"
                          value={block.content}
                          onChange={(e) => updateBlock(i, 'content', e.target.value)}
                          placeholder="Nội dung..."
                        />
                        {(block.type === 'pattern' || block.type === 'example') && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Input placeholder="Pinyin" value={block.pinyin ?? ''} onChange={(e) => updateBlock(i, 'pinyin', e.target.value)} />
                            <Input placeholder="Dịch nghĩa" value={block.translation ?? ''} onChange={(e) => updateBlock(i, 'translation', e.target.value)} />
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(blockTypeLabels).map(([k, v]) => (
                        <button key={k} onClick={() => addBlock(k as ContentBlock['type'])} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-white transition-colors">
                          + {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Exercises */}
              <div>
                <button onClick={() => setShowExercises(!showExercises)} className="flex items-center gap-2 font-bold text-sm mb-3 w-full text-left">
                  {showExercises ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Bài tập ({exercises.length})
                </button>
                {showExercises && (
                  <div className="space-y-3">
                    {exercises.map((ex, i) => (
                      <div key={i} className="rounded-xl border border-border p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-muted-foreground">Bài tập {i + 1} — {ex.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Điền từ'}</span>
                          <button onClick={() => removeExercise(i)} className="p-1 rounded hover:bg-red-50 text-red-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <Input className="mb-2" placeholder="Câu hỏi" value={ex.question} onChange={(e) => updateExercise(i, 'question', e.target.value)} />
                        {ex.type === 'multiple_choice' && (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {(ex.options ?? []).map((opt, oi) => (
                              <Input key={oi} placeholder={`Đáp án ${oi + 1}`} value={opt} onChange={(e) => updateOption(i, oi, e.target.value)} />
                            ))}
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Đáp án đúng" value={ex.answer} onChange={(e) => updateExercise(i, 'answer', e.target.value)} />
                          <Input placeholder="Giải thích" value={ex.explanation ?? ''} onChange={(e) => updateExercise(i, 'explanation', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <button onClick={() => addExercise('multiple_choice')} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-white">
                        + Trắc nghiệm
                      </button>
                      <button onClick={() => addExercise('fill_blank')} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-white">
                        + Điền từ
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button className="flex-1" onClick={handleSave} disabled={saving || !titleVi}>
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
