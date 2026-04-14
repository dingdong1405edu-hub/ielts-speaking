import Groq from 'groq-sdk'

export const GROQ_MODEL = 'llama-3.3-70b-versatile'
export const GROQ_FAST_MODEL = 'llama-3.1-8b-instant'

let _groq: Groq | null = null
function getGroq(): Groq {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  }
  return _groq
}

function extractJSON(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) return jsonMatch[1].trim()
  const braceMatch = text.match(/(\{[\s\S]*\})/)
  if (braceMatch) return braceMatch[1]
  return text.trim()
}

export async function generateJSON<T>(prompt: string, temperature = 0.3): Promise<T> {
  const response = await getGroq().chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      {
        role: 'system',
        content: 'Bạn là trợ lý dạy tiếng Trung. Chỉ trả về JSON hợp lệ, không có văn bản khác.',
      },
      { role: 'user', content: prompt },
    ],
    temperature,
    max_tokens: 2000,
  })
  const content = response.choices[0]?.message?.content ?? '{}'
  return JSON.parse(extractJSON(content)) as T
}

export async function generateText(prompt: string, temperature = 0.5): Promise<string> {
  const response = await getGroq().chat.completions.create({
    model: GROQ_MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: 1500,
  })
  return response.choices[0]?.message?.content ?? ''
}

export function createChatStream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemPrompt: string
) {
  return getGroq().chat.completions.create({
    model: GROQ_FAST_MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    stream: true,
    temperature: 0.7,
    max_tokens: 800,
  })
}

export async function explainGrammar(pattern: string, hskLevel: number) {
  const prompt = `Giải thích mẫu ngữ pháp tiếng Trung "${pattern}" (HSK ${hskLevel}) bằng tiếng Việt.
Trả về JSON:
{
  "title": "tên mẫu câu",
  "structure": "cấu trúc ngữ pháp",
  "explanation": "giải thích chi tiết bằng tiếng Việt",
  "examples": [{"chinese":"câu ví dụ","pinyin":"phiên âm","vietnamese":"nghĩa tiếng Việt"}],
  "commonMistakes": ["lỗi thường gặp 1"],
  "tip": "mẹo ghi nhớ"
}`
  return generateJSON(prompt)
}

export async function generateReadingPassage(hskLevel: number) {
  const prompt = `Tạo đoạn văn tiếng Trung ngắn (80-120 chữ) cho trình độ HSK ${hskLevel}.
Trả về JSON:
{
  "title": "tiêu đề tiếng Trung",
  "titleVi": "tiêu đề tiếng Việt",
  "content": "nội dung tiếng Trung",
  "pinyin": "phiên âm toàn bộ",
  "translation": "dịch nghĩa tiếng Việt",
  "vocabulary": [{"hanzi":"từ","pinyin":"phiên âm","meaning":"nghĩa"}],
  "questions": [{"question":"câu hỏi tiếng Việt","options":["A","B","C","D"],"answer":"đáp án đúng","explanation":"giải thích"}]
}`
  return generateJSON(prompt, 0.5)
}

export async function generateListeningExercise(hskLevel: number) {
  const prompt = `Tạo bài luyện nghe tiếng Trung HSK ${hskLevel}.
Trả về JSON:
{
  "title": "tiêu đề",
  "script": "kịch bản tiếng Trung (2-4 câu)",
  "pinyin": "phiên âm toàn bộ",
  "translation": "dịch tiếng Việt",
  "questions": [{"question":"câu hỏi tiếng Việt","options":["A","B","C","D"],"answer":"đáp án đúng","explanation":"giải thích"}]
}`
  return generateJSON(prompt, 0.5)
}
