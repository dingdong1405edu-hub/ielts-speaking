'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatTutorProps {
  context?: string
}

export default function AIChatTutor({ context }: AIChatTutorProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || streaming) return

    setInput('')
    const contextPrefix = context && messages.length === 0 ? `(Đang học: ${context})\n` : ''
    const userMsg: Message = { role: 'user', content: contextPrefix + text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setStreaming(true)

    try {
      const res = await fetch('/api/ai/chat-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      })

      if (!res.ok || !res.body) throw new Error('Lỗi kết nối')

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        full += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: full }
          return updated
        })
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!' },
      ])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-full shadow-lg hover:bg-primary-dark transition-all font-bold text-sm"
        >
          <MessageCircle className="w-5 h-5" />
          Hỏi AI
        </button>
      )}

      {open && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-96 h-[70vh] md:h-[500px] bg-white rounded-t-2xl md:rounded-2xl border border-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <p className="font-bold text-sm">Gia sư AI</p>
                <p className="text-xs text-muted-foreground">
                  {context ? `Đang học: ${context}` : 'Hỏi bất kỳ điều gì về tiếng Trung'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">💬</div>
                <p className="font-bold text-sm">Chào! Tôi là gia sư AI của bạn.</p>
                <p className="text-xs text-muted-foreground mt-1 px-4">
                  Hỏi tôi về ngữ pháp, từ vựng, hoặc bất kỳ điều gì về tiếng Trung!
                </p>
                {context && (
                  <div className="mt-3 mx-4 bg-primary/5 border border-primary/20 rounded-xl p-2">
                    <p className="text-xs text-primary font-semibold">Gợi ý: Hỏi về &ldquo;{context}&rdquo;</p>
                  </div>
                )}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <span className="text-lg mr-1.5 flex-shrink-0 self-end mb-0.5">🤖</span>
                )}
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-surface text-foreground rounded-tl-sm border border-border'
                  }`}
                >
                  {msg.content ||
                    (streaming && i === messages.length - 1 ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      ''
                    ))}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Nhập câu hỏi..."
              disabled={streaming}
              className="flex-1 h-10 px-3 rounded-xl border border-border text-sm focus:outline-none focus:border-primary disabled:opacity-50 bg-white"
            />
            <Button
              size="sm"
              onClick={send}
              disabled={streaming || !input.trim()}
              className="h-10 w-10 p-0 flex-shrink-0"
            >
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
