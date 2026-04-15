'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, BookOpen, Bookmark, BookmarkCheck, Download, ChevronDown, ChevronRight, Eye, EyeOff, CheckCircle2, XCircle, ArrowLeft, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUserStore } from '@/store/user-store'
import XPGain from '@/components/lesson/XPGain'
import jsPDF from 'jspdf'

interface VocabItem { hanzi: string; pinyin: string; meaning: string }
interface Question { question: string; options: string[]; answer: string; explanation?: string }
interface Passage {
  id: string; title: string; titleVi: string; hskLevel: number; difficulty: string
  content: string; pinyin: string; translation: string; wordCount: number
  vocabulary: VocabItem[]; questions: Question[]; tags: string[]
}
interface PassageListItem {
  id: string; title: string; titleVi: string; hskLevel: number
  difficulty: string; wordCount: number; tags: string[]
}

type Phase = 'browse' | 'reading' | 'quiz' | 'results'

const diffLabel: Record<string, string> = { easy: 'Dễ', medium: 'Trung bình', hard: 'Khó' }
const diffColor: Record<string, string> = { easy: 'bg-emerald-50 text-emerald-700 border-emerald-200', medium: 'bg-amber-50 text-amber-700 border-amber-200', hard: 'bg-rose-50 text-rose-700 border-rose-200' }

export default function ReadingPage() {
  const [list, setList] = useState<PassageListItem[]>([])
  const [passage, setPassage] = useState<Passage | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPassage, setLoadingPassage] = useState(false)
  const [level, setLevel] = useState<string>('')
  const [phase, setPhase] = useState<Phase>('browse')

  // Reading state
  const [showPinyin, setShowPinyin] = useState(false)
  const [showTranslation, setShowTranslation] = useState(false)
  const [highlights, setHighlights] = useState<Set<string>>(new Set())
  const [tooltip, setTooltip] = useState<{ x: number; y: number; vocab: VocabItem } | null>(null)
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set())
  const contentRef = useRef<HTMLDivElement>(null)

  // Quiz state
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const { addXp, pendingXp, clearPendingXp } = useUserStore()

  // Fetch passage list
  const fetchList = useCallback(async () => {
    setLoading(true)
    const params = level ? `?level=${level}` : ''
    const res = await fetch(`/api/reading${params}`)
    const json = await res.json()
    if (json.data) setList(json.data)
    setLoading(false)
  }, [level])

  useEffect(() => { fetchList() }, [fetchList])

  // Fetch saved vocab
  useEffect(() => {
    fetch('/api/saved-vocab').then(r => r.json()).then(json => {
      if (json.data) setSavedWords(new Set(json.data.map((v: VocabItem) => v.hanzi)))
    }).catch(() => {})
  }, [])

  const openPassage = async (id: string) => {
    setLoadingPassage(true)
    const res = await fetch(`/api/reading?id=${id}`)
    const json = await res.json()
    if (json.data) {
      setPassage(json.data)
      setPhase('reading')
      setHighlights(new Set())
      setShowPinyin(false)
      setShowTranslation(false)
      setQIdx(0)
      setAnswers(new Array(json.data.questions.length).fill(null))
      setScore(0)
      setShowExplanation(false)
    }
    setLoadingPassage(false)
  }

  // Word click → tooltip with vocab lookup
  const handleCharClick = (char: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!passage) return
    const vocab = passage.vocabulary.find(v => v.hanzi === char || char.includes(v.hanzi) || v.hanzi.includes(char))
    if (vocab) {
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const containerRect = contentRef.current?.getBoundingClientRect()
      setTooltip({
        x: rect.left - (containerRect?.left ?? 0) + rect.width / 2,
        y: rect.top - (containerRect?.top ?? 0) - 8,
        vocab,
      })
    }
  }

  // Highlight toggle
  const toggleHighlight = (text: string) => {
    setHighlights(prev => {
      const next = new Set(prev)
      if (next.has(text)) next.delete(text); else next.add(text)
      return next
    })
  }

  // Save vocab
  const saveVocab = async (vocab: VocabItem) => {
    const res = await fetch('/api/saved-vocab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vocab, source: `reading:${passage?.id}` }),
    })
    if (res.ok) {
      setSavedWords(prev => new Set(prev).add(vocab.hanzi))
      toast.success(`Đã lưu "${vocab.hanzi}"`)
    }
  }

  const unsaveVocab = async (hanzi: string) => {
    await fetch(`/api/saved-vocab?hanzi=${encodeURIComponent(hanzi)}`, { method: 'DELETE' })
    setSavedWords(prev => { const n = new Set(prev); n.delete(hanzi); return n })
    toast.success(`Đã bỏ lưu "${hanzi}"`)
  }

  // Quiz answer
  const selectAnswer = (option: string) => {
    if (answers[qIdx] !== null || !passage) return
    const newAnswers = [...answers]
    newAnswers[qIdx] = option
    setAnswers(newAnswers)
    const correct = option === passage.questions[qIdx].answer
    if (correct) setScore(s => s + 1)
    setShowExplanation(true)
  }

  const nextQuestion = async () => {
    if (!passage) return
    setShowExplanation(false)
    if (qIdx + 1 >= passage.questions.length) {
      // Complete
      const finalScore = Math.round((score / passage.questions.length) * 100)
      const xpEarned = Math.round(15 * (finalScore / 100)) + 5
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'READING', title: passage.titleVi, content: { passageId: passage.id, answers, highlights: Array.from(highlights) }, score: finalScore, xpEarned }),
        })
        await fetch('/api/user', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ xpToAdd: xpEarned }) })
        addXp(xpEarned)
      } catch {}
      setPhase('results')
    } else {
      setQIdx(i => i + 1)
    }
  }

  // PDF Export
  const exportPDF = () => {
    if (!passage) return
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const margin = 20
    const pageWidth = 210 - 2 * margin
    let y = margin

    // Header
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('DingDongHSK - Reading Result', margin, y)
    y += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`HSK ${passage.hskLevel} | ${diffLabel[passage.difficulty]} | ${passage.wordCount} words`, margin, y)
    y += 8

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(passage.titleVi, margin, y)
    y += 10

    // Score
    const finalScore = passage.questions.length > 0 ? Math.round((score / passage.questions.length) * 100) : 0
    doc.setFontSize(12)
    doc.text(`Score: ${finalScore}% (${score}/${passage.questions.length})`, margin, y)
    y += 10

    // Translation
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Vietnamese Translation:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const transLines = doc.splitTextToSize(passage.translation, pageWidth)
    doc.text(transLines, margin, y)
    y += transLines.length * 5 + 8

    // Saved vocabulary
    const savedVocabList = passage.vocabulary.filter(v => savedWords.has(v.hanzi))
    if (savedVocabList.length > 0) {
      if (y > 250) { doc.addPage(); y = margin }
      doc.setFont('helvetica', 'bold')
      doc.text(`Saved Vocabulary (${savedVocabList.length}):`, margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      savedVocabList.forEach(v => {
        if (y > 275) { doc.addPage(); y = margin }
        doc.text(`${v.pinyin} - ${v.meaning}`, margin, y)
        y += 5
      })
      y += 5
    }

    // Questions & answers
    if (y > 240) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.text('Questions:', margin, y)
    y += 6
    passage.questions.forEach((q, i) => {
      if (y > 260) { doc.addPage(); y = margin }
      doc.setFont('helvetica', 'normal')
      const isCorrect = answers[i] === q.answer
      doc.text(`${i + 1}. ${q.question}`, margin, y)
      y += 5
      doc.text(`   Your answer: ${answers[i] ?? 'N/A'} ${isCorrect ? '(Correct)' : `(Wrong - Correct: ${q.answer})`}`, margin, y)
      y += 5
      if (q.explanation) {
        const expLines = doc.splitTextToSize(`   ${q.explanation}`, pageWidth - 5)
        doc.text(expLines, margin, y)
        y += expLines.length * 4 + 3
      }
    })

    // Footer
    doc.setFontSize(8)
    doc.text(`Generated by DingDongHSK - ${new Date().toLocaleDateString('vi-VN')}`, margin, 290)

    doc.save(`reading-${passage.hskLevel}-${passage.id.substring(0, 8)}.pdf`)
    toast.success('Đã xuất PDF!')
  }

  // ===== RENDER =====

  if (phase === 'browse') {
    return (
      <div className="page-container">
        {pendingXp > 0 && <XPGain xp={pendingXp} onAnimationEnd={clearPendingXp} />}
        <div className="page-header">
          <h1 className="text-2xl font-extrabold tracking-tight">Luyện đọc</h1>
          <p className="text-muted-foreground text-sm mt-1">Chọn bài đọc theo trình độ HSK</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button onClick={() => setLevel('')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${!level ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-muted-foreground hover:bg-surface'}`}>
            Tất cả
          </button>
          {[1,2,3,4,5,6].map(l => (
            <button key={l} onClick={() => setLevel(String(l))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${level === String(l) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-muted-foreground hover:bg-surface'}`}>
              HSK {l}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Chưa có bài đọc nào cho cấp độ này</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(p => (
              <button key={p.id} onClick={() => openPassage(p.id)} disabled={loadingPassage}
                className="card card-hover w-full text-left p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-lg flex-shrink-0 shadow-sm">
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={`hsk${p.hskLevel}` as 'hsk1'}>HSK {p.hskLevel}</Badge>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffColor[p.difficulty]}`}>
                      {diffLabel[p.difficulty]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{p.wordCount} chữ</span>
                  </div>
                  <p className="font-semibold text-sm text-foreground truncate">{p.titleVi}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.title}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!passage) return null

  // === READING PHASE ===
  if (phase === 'reading') {
    return (
      <div className="page-container max-w-3xl" onClick={() => setTooltip(null)}>
        <button onClick={() => { setPhase('browse'); setPassage(null) }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={`hsk${passage.hskLevel}` as 'hsk1'}>HSK {passage.hskLevel}</Badge>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${diffColor[passage.difficulty]}`}>
              {diffLabel[passage.difficulty]}
            </span>
            <span className="text-xs text-muted-foreground">{passage.wordCount} chữ</span>
          </div>
          <h1 className="text-xl font-extrabold">{passage.titleVi}</h1>
          <p className="text-muted-foreground text-sm">{passage.title}</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setShowPinyin(!showPinyin)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${showPinyin ? 'border-secondary bg-secondary/10 text-secondary' : 'border-border text-muted-foreground hover:bg-surface'}`}>
            {showPinyin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} Pinyin
          </button>
          <button onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${showTranslation ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-surface'}`}>
            {showTranslation ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} Dịch nghĩa
          </button>
        </div>

        {/* Passage content */}
        <div ref={contentRef} className="card p-6 mb-4 relative" onClick={e => e.stopPropagation()}>
          <p className="font-chinese text-xl leading-[2.2] text-foreground">
            {passage.content.split('').map((char, i) => {
              const isHighlighted = highlights.has(char)
              const isSpace = /[\s\n]/.test(char)
              if (char === '\n') return <br key={i} />
              if (isSpace) return <span key={i}>{char}</span>
              return (
                <span key={i}
                  onClick={e => handleCharClick(char, e)}
                  onDoubleClick={() => toggleHighlight(char)}
                  className={`cursor-pointer transition-all duration-100 rounded-sm px-[1px] ${isHighlighted ? 'bg-amber-200/70 text-amber-900' : 'hover:bg-primary/10 hover:text-primary'}`}
                >{char}</span>
              )
            })}
          </p>

          {/* Tooltip */}
          {tooltip && (
            <div className="absolute z-20 animate-fade-in" style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, -100%)' }}>
              <div className="bg-foreground text-white text-xs rounded-xl px-4 py-2.5 shadow-elevated whitespace-nowrap flex items-center gap-3">
                <div>
                  <span className="font-chinese text-sm font-bold">{tooltip.vocab.hanzi}</span>
                  <span className="text-white/60 ml-2">{tooltip.vocab.pinyin}</span>
                </div>
                <span className="text-white/40">|</span>
                <span>{tooltip.vocab.meaning}</span>
                <button onClick={() => savedWords.has(tooltip.vocab.hanzi) ? unsaveVocab(tooltip.vocab.hanzi) : saveVocab(tooltip.vocab)}
                  className="ml-1 p-1 rounded hover:bg-white/20 transition-colors">
                  {savedWords.has(tooltip.vocab.hanzi) ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="w-2 h-2 bg-foreground rotate-45 mx-auto -mt-1" />
            </div>
          )}

          {showPinyin && <p className="text-secondary text-sm mt-4 leading-relaxed border-t border-border/40 pt-4">{passage.pinyin}</p>}
          {showTranslation && <p className="text-muted-foreground text-sm mt-4 leading-relaxed border-t border-border/40 pt-4 italic">{passage.translation}</p>}
        </div>

        <p className="text-[11px] text-muted-foreground mb-4">
          Click vào từ để xem nghĩa. Double-click để highlight. Nhấn bookmark để lưu từ vựng.
        </p>

        {/* Vocabulary panel */}
        <details className="card p-4 mb-4">
          <summary className="cursor-pointer font-semibold text-sm select-none flex items-center gap-2">
            <ChevronDown className="w-4 h-4" />
            Từ vựng ({passage.vocabulary.length})
          </summary>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {passage.vocabulary.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-border/40">
                <div className="flex-1 min-w-0">
                  <span className="font-chinese font-bold text-foreground">{v.hanzi}</span>
                  <span className="text-xs text-secondary ml-2">{v.pinyin}</span>
                  <p className="text-xs text-muted-foreground truncate">{v.meaning}</p>
                </div>
                <button onClick={() => savedWords.has(v.hanzi) ? unsaveVocab(v.hanzi) : saveVocab(v)}
                  className={`p-1.5 rounded-lg transition-colors ${savedWords.has(v.hanzi) ? 'text-amber-500 bg-amber-50' : 'text-muted-foreground hover:bg-surface'}`}>
                  {savedWords.has(v.hanzi) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </details>

        {passage.questions.length > 0 && (
          <Button size="lg" className="w-full" onClick={() => setPhase('quiz')}>
            Làm bài tập ({passage.questions.length} câu)
          </Button>
        )}
      </div>
    )
  }

  // === QUIZ PHASE ===
  if (phase === 'quiz') {
    const q = passage.questions[qIdx]
    const userAnswer = answers[qIdx]
    return (
      <div className="page-container max-w-2xl">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold text-muted-foreground">{qIdx + 1}/{passage.questions.length}</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((qIdx + 1) / passage.questions.length) * 100}%` }} />
          </div>
        </div>

        <h2 className="font-bold text-lg mb-5">{q.question}</h2>

        <div className="space-y-2 mb-6">
          {q.options.map((opt, i) => {
            const isSelected = userAnswer === opt
            const isCorrect = opt === q.answer
            const answered = userAnswer !== null
            let cls = 'border-border bg-white text-foreground hover:border-primary/40 hover:bg-primary/5'
            if (answered && isCorrect) cls = 'border-emerald-400 bg-emerald-50 text-emerald-800'
            else if (answered && isSelected && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-800'
            else if (answered) cls = 'border-border bg-muted/50 text-muted-foreground'

            return (
              <button key={i} onClick={() => selectAnswer(opt)} disabled={answered}
                className={`w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition-all ${cls} ${!answered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}>
                <span className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {answered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto flex-shrink-0" />}
                  {answered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500 ml-auto flex-shrink-0" />}
                </span>
              </button>
            )
          })}
        </div>

        {showExplanation && q.explanation && (
          <div className="card p-4 mb-4 bg-surface border-border/40 animate-fade-in">
            <p className="text-sm text-foreground"><span className="font-semibold">Giải thích:</span> {q.explanation}</p>
          </div>
        )}

        {userAnswer !== null && (
          <Button className="w-full" onClick={nextQuestion}>
            {qIdx + 1 >= passage.questions.length ? 'Xem kết quả' : 'Câu tiếp theo'}
          </Button>
        )}
      </div>
    )
  }

  // === RESULTS PHASE ===
  const finalScore = passage.questions.length > 0 ? Math.round((score / passage.questions.length) * 100) : 100
  const savedList = passage.vocabulary.filter(v => savedWords.has(v.hanzi))

  return (
    <div className="page-container max-w-2xl">
      {pendingXp > 0 && <XPGain xp={pendingXp} onAnimationEnd={clearPendingXp} />}

      <div className="text-center mb-8 animate-fade-in">
        <div className="text-5xl mb-3">{finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-extrabold mb-1">Hoàn thành!</h2>
        <p className="text-muted-foreground text-sm">{passage.titleVi}</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-primary">{finalScore}%</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Điểm số</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-secondary">{score}/{passage.questions.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Đúng</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-amber-600">{savedList.length}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Từ đã lưu</div>
        </div>
      </div>

      {/* Saved vocab */}
      {savedList.length > 0 && (
        <div className="card p-4 mb-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Từ vựng đã lưu</h3>
          <div className="space-y-1.5">
            {savedList.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-surface">
                <span className="font-chinese font-bold">{v.hanzi}</span>
                <span className="text-xs text-secondary">{v.pinyin}</span>
                <span className="text-xs text-muted-foreground flex-1">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question review */}
      <details className="card p-4 mb-6">
        <summary className="cursor-pointer font-semibold text-sm select-none">Xem lại câu trả lời</summary>
        <div className="mt-3 space-y-3">
          {passage.questions.map((q, i) => {
            const correct = answers[i] === q.answer
            return (
              <div key={i} className={`p-3 rounded-xl border ${correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <p className="text-sm font-medium mb-1">{i + 1}. {q.question}</p>
                <p className="text-xs">{correct ? <span className="text-emerald-700">Đúng: {q.answer}</span> : <span className="text-red-700">Sai: {answers[i]} → Đúng: {q.answer}</span>}</p>
                {q.explanation && <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>}
              </div>
            )
          })}
        </div>
      </details>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={exportPDF}>
          <Download className="w-4 h-4 mr-2" /> Xuất PDF
        </Button>
        <Button className="flex-1" onClick={() => { setPhase('browse'); setPassage(null) }}>
          Bài khác
        </Button>
      </div>
    </div>
  )
}
