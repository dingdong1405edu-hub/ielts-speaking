'use client'
import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, Pencil, Trash2, X, Search, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface VocabItem {
  hanzi: string
  pinyin: string
  meaning: string
}

interface Question {
  question: string
  options: string[]
  answer: string
  explanation: string
}

interface Passage {
  id: string
  title: string
  titleVi: string
  hskLevel: number
  content: string
  pinyin: string
  translation: string
  vocabulary: VocabItem[]
  questions: Question[]
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  wordCount: number
  published: boolean
}

interface FormData {
  title: string
  titleVi: string
  hskLevel: number
  content: string
  pinyin: string
  translation: string
  vocabulary: VocabItem[]
  questions: Question[]
  tags: string
  difficulty: 'easy' | 'medium' | 'hard'
  published: boolean
}

const emptyVocab: VocabItem = { hanzi: '', pinyin: '', meaning: '' }
const emptyQuestion: Question = { question: '', options: ['', '', '', ''], answer: '', explanation: '' }

const emptyForm: FormData = {
  title: '',
  titleVi: '',
  hskLevel: 1,
  content: '',
  pinyin: '',
  translation: '',
  vocabulary: [{ ...emptyVocab }],
  questions: [{ ...emptyQuestion }],
  tags: '',
  difficulty: 'easy',
  published: false,
}

const difficultyLabels: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }
const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
}

export default function AdminReadingPage() {
  const [passages, setPassages] = useState<Passage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [level, setLevel] = useState('')

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [saving, setSaving] = useState(false)

  // Section toggles
  const [showContentSection, setShowContentSection] = useState(true)
  const [showVocabSection, setShowVocabSection] = useState(false)
  const [showQuestionsSection, setShowQuestionsSection] = useState(false)

  const fetchPassages = useCallback(async () => {
    setLoading(true)
    const params = level ? `?level=${level}` : ''
    const res = await fetch(`/api/admin/reading${params}`)
    const json = await res.json()
    if (json.data) {
      setPassages(json.data.passages)
      setTotal(json.data.total)
    }
    setLoading(false)
  }, [level])

  useEffect(() => { fetchPassages() }, [fetchPassages])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, vocabulary: [{ ...emptyVocab }], questions: [{ ...emptyQuestion }] })
    setShowContentSection(true)
    setShowVocabSection(false)
    setShowQuestionsSection(false)
    setShowModal(true)
  }

  const openEdit = (p: Passage) => {
    setEditingId(p.id)
    setForm({
      title: p.title,
      titleVi: p.titleVi,
      hskLevel: p.hskLevel,
      content: p.content,
      pinyin: p.pinyin,
      translation: p.translation,
      vocabulary: p.vocabulary.length > 0 ? p.vocabulary : [{ ...emptyVocab }],
      questions: p.questions.length > 0 ? p.questions.map((q) => ({
        ...q,
        options: q.options.length >= 4 ? q.options : [...q.options, ...Array(4 - q.options.length).fill('')],
      })) : [{ ...emptyQuestion }],
      tags: p.tags.join(', '),
      difficulty: p.difficulty,
      published: p.published,
    })
    setShowContentSection(true)
    setShowVocabSection(false)
    setShowQuestionsSection(false)
    setShowModal(true)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Xoá bài đọc "${title}"?`)) return
    const res = await fetch(`/api/admin/reading?id=${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Đã xoá'); fetchPassages() }
    else toast.error('Lỗi xoá')
  }

  const handleTogglePublished = async (p: Passage) => {
    const res = await fetch('/api/admin/reading', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, published: !p.published }),
    })
    const json = await res.json()
    if (json.error) toast.error(json.error)
    else {
      toast.success(p.published ? 'Đã ẩn bài đọc' : 'Đã xuất bản bài đọc')
      fetchPassages()
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      title: form.title.trim(),
      titleVi: form.titleVi.trim(),
      hskLevel: form.hskLevel,
      content: form.content.trim(),
      pinyin: form.pinyin.trim(),
      translation: form.translation.trim(),
      vocabulary: form.vocabulary.filter((v) => v.hanzi.trim()),
      questions: form.questions
        .filter((q) => q.question.trim())
        .map((q) => ({
          ...q,
          options: q.options.filter((o) => o.trim()),
        })),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      difficulty: form.difficulty,
      published: form.published,
    }

    const method = editingId ? 'PUT' : 'POST'
    const res = await fetch('/api/admin/reading', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()

    if (json.error) toast.error(json.error)
    else {
      toast.success(editingId ? 'Đã cập nhật' : 'Đã thêm')
      setShowModal(false)
      fetchPassages()
    }
    setSaving(false)
  }

  // Vocabulary helpers
  const updateVocab = (idx: number, field: keyof VocabItem, value: string) => {
    const updated = [...form.vocabulary]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, vocabulary: updated })
  }
  const addVocab = () => setForm({ ...form, vocabulary: [...form.vocabulary, { ...emptyVocab }] })
  const removeVocab = (idx: number) => setForm({ ...form, vocabulary: form.vocabulary.filter((_, i) => i !== idx) })

  // Question helpers
  const updateQuestion = (idx: number, field: string, value: string) => {
    const updated = [...form.questions]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, questions: updated })
  }
  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    const updated = [...form.questions]
    const opts = [...updated[qIdx].options]
    opts[oIdx] = value
    updated[qIdx] = { ...updated[qIdx], options: opts }
    setForm({ ...form, questions: updated })
  }
  const addQuestion = () => setForm({ ...form, questions: [...form.questions, { ...emptyQuestion, options: ['', '', '', ''] }] })
  const removeQuestion = (idx: number) => setForm({ ...form, questions: form.questions.filter((_, i) => i !== idx) })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Quản lý Bài đọc</h1>
          <p className="text-muted-foreground text-sm">{total} bài đọc trong database</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Thêm bài đọc</Button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          className="h-10 px-3 rounded-xl border border-border text-sm font-semibold bg-white"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        >
          <option value="">Tất cả HSK</option>
          {[1, 2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>HSK {l}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {passages.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={`hsk${p.hskLevel}` as 'hsk1'}>HSK {p.hskLevel}</Badge>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColors[p.difficulty]}`}>
                    {difficultyLabels[p.difficulty]}
                  </span>
                  {!p.published && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Nháp</span>
                  )}
                </div>
                <p className="font-bold text-sm truncate">{p.titleVi}</p>
                <p className="text-xs text-muted-foreground truncate">{p.title}</p>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground flex-shrink-0">
                <span>{p.wordCount} từ</span>
                <span>{p.questions.length} câu hỏi</span>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleTogglePublished(p)}
                  className={`p-2 rounded-lg transition-colors ${p.published ? 'hover:bg-yellow-50 text-yellow-600' : 'hover:bg-green-50 text-green-600'}`}
                  title={p.published ? 'Ẩn bài đọc' : 'Xuất bản bài đọc'}
                >
                  {p.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id, p.titleVi)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
          {passages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">Chưa có bài đọc nào</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl my-8 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black">{editingId ? 'Sửa bài đọc' : 'Thêm bài đọc mới'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-surface"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-5">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <Label>Tiêu đề (CN)</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="我的家" className="font-chinese text-lg" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <Label>Tiêu đề (VI) *</Label>
                  <Input value={form.titleVi} onChange={(e) => setForm({ ...form, titleVi: e.target.value })} placeholder="Gia đình tôi" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>HSK Level</Label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-border text-sm bg-white"
                    value={form.hskLevel}
                    onChange={(e) => setForm({ ...form, hskLevel: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map((l) => <option key={l} value={l}>HSK {l}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Độ khó</Label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-border text-sm bg-white"
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
                <div>
                  <Label>Tags (phẩy phân cách)</Label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="gia đình, sinh hoạt" />
                </div>
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, published: !form.published })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.published ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.published ? 'translate-x-5' : ''}`} />
                </button>
                <Label className="cursor-pointer" onClick={() => setForm({ ...form, published: !form.published })}>
                  {form.published ? 'Đã xuất bản' : 'Bản nháp'}
                </Label>
              </div>

              {/* Content section (collapsible) */}
              <div>
                <button onClick={() => setShowContentSection(!showContentSection)} className="flex items-center gap-2 font-bold text-sm mb-3 w-full text-left">
                  {showContentSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Nội dung bài đọc
                </button>
                {showContentSection && (
                  <div className="space-y-3">
                    <div>
                      <Label>Nội dung tiếng Trung *</Label>
                      <textarea
                        className="w-full border border-border rounded-xl p-3 text-sm min-h-[120px] resize-y bg-white font-chinese"
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        placeholder="我叫小明，今年二十岁。我家有四口人：爸爸、妈妈、姐姐和我..."
                      />
                    </div>
                    <div>
                      <Label>Pinyin</Label>
                      <textarea
                        className="w-full border border-border rounded-xl p-3 text-sm min-h-[80px] resize-y bg-white"
                        value={form.pinyin}
                        onChange={(e) => setForm({ ...form, pinyin: e.target.value })}
                        placeholder="Wǒ jiào Xiǎo Míng, jīnnián èrshí suì..."
                      />
                    </div>
                    <div>
                      <Label>Bản dịch tiếng Việt</Label>
                      <textarea
                        className="w-full border border-border rounded-xl p-3 text-sm min-h-[80px] resize-y bg-white"
                        value={form.translation}
                        onChange={(e) => setForm({ ...form, translation: e.target.value })}
                        placeholder="Tôi tên là Tiểu Minh, năm nay 20 tuổi..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Vocabulary section (collapsible) */}
              <div>
                <button onClick={() => setShowVocabSection(!showVocabSection)} className="flex items-center gap-2 font-bold text-sm mb-3 w-full text-left">
                  {showVocabSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Từ vựng ({form.vocabulary.filter((v) => v.hanzi.trim()).length})
                </button>
                {showVocabSection && (
                  <div className="space-y-2">
                    {form.vocabulary.map((v, i) => (
                      <div key={i} className="bg-surface rounded-xl p-3 relative">
                        {form.vocabulary.length > 1 && (
                          <button onClick={() => removeVocab(i)} className="absolute top-2 right-2 text-muted-foreground hover:text-red-500">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                          <Input placeholder="Hanzi" value={v.hanzi} onChange={(e) => updateVocab(i, 'hanzi', e.target.value)} className="font-chinese" />
                          <Input placeholder="Pinyin" value={v.pinyin} onChange={(e) => updateVocab(i, 'pinyin', e.target.value)} />
                          <Input placeholder="Nghĩa" value={v.meaning} onChange={(e) => updateVocab(i, 'meaning', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <button onClick={addVocab} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-white transition-colors">
                      + Thêm từ vựng
                    </button>
                  </div>
                )}
              </div>

              {/* Questions section (collapsible) */}
              <div>
                <button onClick={() => setShowQuestionsSection(!showQuestionsSection)} className="flex items-center gap-2 font-bold text-sm mb-3 w-full text-left">
                  {showQuestionsSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Câu hỏi ({form.questions.filter((q) => q.question.trim()).length})
                </button>
                {showQuestionsSection && (
                  <div className="space-y-3">
                    {form.questions.map((q, i) => (
                      <div key={i} className="rounded-xl border border-border p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-muted-foreground">Câu hỏi {i + 1}</span>
                          <button onClick={() => removeQuestion(i)} className="p-1 rounded hover:bg-red-50 text-red-500"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <Input className="mb-2" placeholder="Nội dung câu hỏi" value={q.question} onChange={(e) => updateQuestion(i, 'question', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {q.options.map((opt, oi) => (
                            <Input key={oi} placeholder={`Lựa chọn ${String.fromCharCode(65 + oi)}`} value={opt} onChange={(e) => updateOption(i, oi, e.target.value)} />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input placeholder="Đáp án đúng" value={q.answer} onChange={(e) => updateQuestion(i, 'answer', e.target.value)} />
                          <Input placeholder="Giải thích" value={q.explanation} onChange={(e) => updateQuestion(i, 'explanation', e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <button onClick={addQuestion} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:bg-white transition-colors">
                      + Thêm câu hỏi
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button className="flex-1" onClick={handleSave} disabled={saving || !form.titleVi || !form.content}>
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
