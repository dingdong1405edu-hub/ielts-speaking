'use client'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import AudioRecorder from '@/components/speaking/AudioRecorder'
import PronunciationScore from '@/components/speaking/PronunciationScore'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/user-store'
import XPGain from '@/components/lesson/XPGain'

interface Sentence {
  text: string
  pinyin: string
  meaning: string
}

const SENTENCES_BY_LEVEL: Record<number, Sentence[]> = {
  1: [
    { text: '你好', pinyin: 'Nǐ hǎo', meaning: 'Xin chào' },
    { text: '谢谢你', pinyin: 'Xièxiè nǐ', meaning: 'Cảm ơn bạn' },
    { text: '我是学生', pinyin: 'Wǒ shì xuésheng', meaning: 'Tôi là học sinh' },
    { text: '你叫什么名字', pinyin: 'Nǐ jiào shénme míngzi', meaning: 'Bạn tên là gì?' },
    { text: '我很好', pinyin: 'Wǒ hěn hǎo', meaning: 'Tôi rất tốt' },
  ],
  2: [
    { text: '今天天气很好', pinyin: 'Jīntiān tiānqì hěn hǎo', meaning: 'Hôm nay thời tiết rất đẹp' },
    { text: '你在哪里工作', pinyin: 'Nǐ zài nǎlǐ gōngzuò', meaning: 'Bạn làm việc ở đâu?' },
    { text: '我喜欢学习汉语', pinyin: 'Wǒ xǐhuān xuéxí Hànyǔ', meaning: 'Tôi thích học tiếng Trung' },
  ],
  3: [
    { text: '我们一起去吃饭吧', pinyin: 'Wǒmen yīqǐ qù chīfàn ba', meaning: 'Chúng ta cùng đi ăn nhé' },
    { text: '这个问题很有趣', pinyin: 'Zhège wèntí hěn yǒuqù', meaning: 'Vấn đề này rất thú vị' },
  ],
}

export default function SpeakingPage() {
  const [level, setLevel] = useState(1)
  const [sentenceIndex, setSentenceIndex] = useState(0)
  const [phase, setPhase] = useState<'practice' | 'result'>('practice')
  const [scoreData, setScoreData] = useState<{ score: number; feedback: string; details: string[] } | null>(null)
  const { addXp, pendingXp, clearPendingXp } = useUserStore()

  const sentences = SENTENCES_BY_LEVEL[level] ?? SENTENCES_BY_LEVEL[1]
  const current = sentences[sentenceIndex % sentences.length]

  const handleResult = async (score: number, feedback: string, details: string[]) => {
    setScoreData({ score, feedback, details })
    setPhase('result')
    const xpEarned = Math.round(20 * (score / 100))
    try {
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'SPEAKING',
          title: `Phát âm: ${current.text}`,
          content: { sentence: current.text, pinyin: current.pinyin, score },
          score,
          xpEarned,
        }),
      })
      await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpToAdd: xpEarned }),
      })
      addXp(xpEarned)
    } catch { /* ignore */ }
  }

  const nextSentence = () => {
    setSentenceIndex((i) => i + 1)
    setPhase('practice')
    setScoreData(null)
  }

  return (
    <div className="page-container max-w-lg mx-auto">
      {pendingXp > 0 && <XPGain xp={pendingXp} onAnimationEnd={clearPendingXp} />}

      <div className="page-header">
        <h1 className="text-2xl font-black">Luyện nói 🗣️</h1>
        <p className="text-muted-foreground text-sm mt-1">AI chấm điểm phát âm của bạn</p>
      </div>

      {/* Level selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[1, 2, 3].map((l) => (
          <button
            key={l}
            onClick={() => { setLevel(l); setSentenceIndex(0); setPhase('practice'); setScoreData(null) }}
            className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
              level === l ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-white text-muted-foreground'
            }`}
          >
            HSK {l}
          </button>
        ))}
      </div>

      {/* Sentence info */}
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground font-semibold">
          Câu {(sentenceIndex % sentences.length) + 1}/{sentences.length}
        </p>
        <p className="text-sm text-muted-foreground mt-1">{current.meaning}</p>
      </div>

      {phase === 'practice' ? (
        <AudioRecorder
          targetText={current.text}
          targetPinyin={current.pinyin}
          onResult={handleResult}
        />
      ) : (
        scoreData && (
          <PronunciationScore
            score={scoreData.score}
            feedback={scoreData.feedback}
            details={scoreData.details}
            onRetry={() => { setPhase('practice'); setScoreData(null) }}
            onContinue={nextSentence}
          />
        )
      )}
    </div>
  )
}
