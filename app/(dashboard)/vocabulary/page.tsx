'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import WordCard from '@/components/vocabulary/WordCard'
import type { VocabularyWord } from '@/types'

const HSK_LEVELS = ['Tất cả', 'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6']

export default function VocabularyPage() {
  const router = useRouter()
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [filtered, setFiltered] = useState<VocabularyWord[]>([])
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('Tất cả')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lvl = level === 'Tất cả' ? '' : level.replace('HSK ', '')
    fetch(`/api/vocabulary${lvl ? `?level=${lvl}` : ''}`)
      .then((r) => r.json())
      .then((json) => {
        setWords(json.data ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [level])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      q
        ? words.filter(
            (w) =>
              w.hanzi.includes(q) ||
              w.pinyin.toLowerCase().includes(q) ||
              w.meaning.toLowerCase().includes(q)
          )
        : words
    )
  }, [search, words])

  return (
    <div className="page-container">
      <div className="page-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black">Từ vựng</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} từ {level !== 'Tất cả' ? `(${level})` : ''}
          </p>
        </div>
        <Button onClick={() => router.push('/vocabulary/flashcard')}>
          📚 Ôn tập Flashcard
        </Button>
      </div>

      {/* Level tabs */}
      <div className="overflow-x-auto mb-5">
        <div className="flex gap-2 min-w-max pb-1">
          {HSK_LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border-2 whitespace-nowrap transition-all ${
                level === l
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-white text-muted-foreground hover:border-muted-foreground'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm chữ Hán, pinyin, nghĩa..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-bold text-foreground">Không tìm thấy từ nào</p>
          <p className="text-muted-foreground text-sm mt-1">Thử tìm từ khác hoặc chọn cấp độ khác</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <WordCard key={w.id} word={w} />
          ))}
        </div>
      )}
    </div>
  )
}
