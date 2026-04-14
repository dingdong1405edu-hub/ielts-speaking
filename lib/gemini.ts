import { GoogleGenerativeAI } from '@google/generative-ai'

let _genAI: GoogleGenerativeAI | null = null
function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    _genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
  }
  return _genAI
}

const FALLBACK_MODELS = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-lite', 'gemini-2.0-flash']

async function callGemini(prompt: string, systemInstruction: string, temperature = 0.3): Promise<string> {
  let lastError: unknown = null
  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = getGenAI().getGenerativeModel({
        model: modelName,
        systemInstruction,
        generationConfig: { temperature, maxOutputTokens: 4096 },
      })
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (e) {
      lastError = e
      const msg = String(e)
      // Only retry on transient errors (429, 503), not on auth/validation errors
      if (!msg.includes('429') && !msg.includes('503') && !msg.includes('high demand')) {
        throw e
      }
    }
  }
  throw lastError
}

function extractJSON(text: string): string {
  // Try to extract JSON from markdown code blocks or raw text
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) return jsonMatch[1].trim()
  // Try to find raw JSON object/array
  const braceMatch = text.match(/(\{[\s\S]*\})/)
  if (braceMatch) return braceMatch[1]
  const bracketMatch = text.match(/(\[[\s\S]*\])/)
  if (bracketMatch) return bracketMatch[1]
  return text.trim()
}

async function geminiJSON<T>(prompt: string, systemInstruction: string, temperature = 0.3): Promise<T> {
  const raw = await callGemini(prompt, systemInstruction + '\nChỉ trả về JSON hợp lệ, không markdown, không giải thích thêm.', temperature)
  const cleaned = extractJSON(raw)
  return JSON.parse(cleaned) as T
}

// --- Exam question generation (needs accuracy) ---
export async function generateExamQuestions(
  wordList: string,
  level: number,
  count: number
) {
  const prompt = `Tạo ${count} câu hỏi thi HSK ${level} dựa trên từ vựng sau:
${wordList}

Yêu cầu:
- Câu hỏi đa dạng: hỏi nghĩa từ, chọn từ đúng, điền vào chỗ trống, hiểu câu
- Đáp án đúng (answer) PHẢI là một trong 4 options
- Mỗi câu có giải thích ngắn

Trả về JSON:
{"questions":[{
  "id": "q1",
  "type": "multiple_choice",
  "question": "câu hỏi",
  "options": ["A", "B", "C", "D"],
  "answer": "đáp án đúng (chính xác 1 trong 4 options)",
  "explanation": "giải thích ngắn"
}]}`

  return geminiJSON<{ questions: unknown[] }>(
    prompt,
    'Bạn là giáo viên tiếng Trung chuyên nghiệp. Tạo câu hỏi thi HSK chính xác, đáp án phải đúng 100%.'
  )
}

// --- Quiz generation (needs accuracy) ---
export async function generateQuiz(
  words: { hanzi: string; meaning: string }[],
  count = 5
) {
  const wordList = words.map((w) => `${w.hanzi}: ${w.meaning}`).join('\n')
  const prompt = `Tạo ${count} câu hỏi trắc nghiệm từ danh sách từ vựng tiếng Trung:
${wordList}

Yêu cầu:
- Đáp án đúng (answer) PHẢI là một trong 4 options
- Có giải thích ngắn cho mỗi câu

Trả về JSON:
{"questions":[{
  "id":"q1",
  "type":"multiple_choice",
  "question":"câu hỏi bằng tiếng Việt",
  "options":["A","B","C","D"],
  "answer":"đáp án đúng",
  "explanation":"giải thích"
}]}`

  return geminiJSON<{ questions: unknown[] }>(
    prompt,
    'Bạn là giáo viên tiếng Trung. Tạo câu hỏi trắc nghiệm chính xác, đáp án phải nằm trong options.'
  )
}

// --- Grade writing (needs accuracy) ---
export async function gradeWriting(text: string, topic: string, hskLevel: number) {
  const prompt = `Chấm điểm bài viết tiếng Trung HSK ${hskLevel}.
Chủ đề: ${topic}
Bài làm: ${text}

Chấm trên thang 100 điểm. Nhận xét bằng tiếng Việt.

Trả về JSON:
{
  "score": 85,
  "feedback": "nhận xét chung bằng tiếng Việt",
  "corrections": [{"original":"phần sai","corrected":"sửa đúng","explanation":"giải thích"}],
  "suggestions": ["gợi ý cải thiện 1", "gợi ý 2"]
}`

  return geminiJSON<{
    score: number
    feedback: string
    corrections: { original: string; corrected: string; explanation: string }[]
    suggestions: string[]
  }>(
    prompt,
    'Bạn là giáo viên tiếng Trung giàu kinh nghiệm. Chấm bài công bằng, chính xác. Nhận xét bằng tiếng Việt.'
  )
}

// --- Enhanced pronunciation feedback (after Deepgram transcription) ---
export async function analyzePronunciation(
  transcribed: string,
  target: string,
  score: number
) {
  const prompt = `Phân tích phát âm tiếng Trung:
Câu mẫu: ${target}
Học viên nói: ${transcribed}
Điểm tương đồng: ${score}/100

Đưa ra nhận xét cụ thể bằng tiếng Việt, gợi ý cải thiện.

Trả về JSON:
{
  "feedback": "nhận xét ngắn gọn",
  "details": ["chi tiết 1", "chi tiết 2"],
  "toneAdvice": "lời khuyên về thanh điệu"
}`

  return geminiJSON<{
    feedback: string
    details: string[]
    toneAdvice: string
  }>(
    prompt,
    'Bạn là chuyên gia phát âm tiếng Trung. Nhận xét chính xác, hữu ích, bằng tiếng Việt.'
  )
}
