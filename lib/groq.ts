import Groq from 'groq-sdk'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IELTSPart = 'PART1' | 'PART2' | 'PART3'

export interface GeneratedQuestion {
  id: string
  question: string
  part: IELTSPart
  topic: string
  hints?: string[]
}

export interface GradeScores {
  overall: number
  fluency: number
  vocabulary: number
  grammar: number
  pronunciation: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: string
}

export interface SampleAnswer {
  sampleAnswer: string
  bandIndicators: string[]
}

export interface VocabularyWord {
  word: string
  type: string        // noun, verb, adjective, phrase, etc.
  definition: string
  example: string
  ieltsRelevance: string
}

export interface VocabularyList {
  vocabulary: VocabularyWord[]
}

export interface SessionSummary {
  part: IELTSPart
  topic: string
  question: string
  transcript: string
  scores?: GradeScores
}

export interface FinalTestResult {
  overall: number
  fluency: number
  vocabulary: number
  grammar: number
  pronunciation: number
  summary: string
  strengths: string[]
  areasForImprovement: string[]
  partBreakdown: {
    part: IELTSPart
    score: number
    comment: string
  }[]
  recommendations: string[]
}

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const MODEL = 'llama-3.3-70b-versatile'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Strips markdown code fences and extracts raw JSON from a model response.
 * The model occasionally wraps JSON in ```json … ``` blocks.
 */
function extractJSON(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()
  // Fall back to the raw string
  return text.trim()
}

/**
 * Calls the Groq chat completions endpoint with a system prompt and user
 * message, then parses the JSON response.  Throws a descriptive error if
 * parsing fails so callers can surface it properly.
 */
async function callGroqJSON<T>(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.7,
): Promise<T> {
  const response = await groqClient.chat.completions.create({
    model: MODEL,
    temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
  })

  const raw = response.choices[0]?.message?.content ?? ''

  try {
    return JSON.parse(extractJSON(raw)) as T
  } catch {
    throw new Error(
      `Groq returned invalid JSON.\nRaw response:\n${raw}`,
    )
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates IELTS speaking questions for a given part and topic.
 *
 * @param part   - IELTS part identifier (PART1 | PART2 | PART3)
 * @param topic  - The speaking topic (e.g. "Technology", "Family")
 * @param count  - Number of questions to generate (default 5)
 * @returns      Array of question objects
 */
export async function generateQuestions(
  part: IELTSPart,
  topic: string,
  count: number = 5,
): Promise<GeneratedQuestion[]> {
  const partDescriptions: Record<IELTSPart, string> = {
    PART1: 'Short, conversational questions about familiar topics and personal experiences (1–2 min answers)',
    PART2: 'A longer individual long-turn cue card topic where the candidate speaks for 1–2 minutes',
    PART3: 'Abstract, analytical discussion questions linked to the Part 2 topic (2–3 min answers)',
  }

  const system = `You are an expert IELTS examiner with 15+ years of experience.
Generate authentic IELTS Speaking ${part} questions for the topic "${topic}".
${partDescriptions[part]}

Return ONLY a valid JSON object with this exact structure:
{
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "part": "${part}",
      "topic": "${topic}",
      "hints": ["hint1", "hint2"]
    }
  ]
}`

  const user = `Generate ${count} varied, authentic IELTS ${part} questions about "${topic}".
Each question should test different aspects of the topic. For PART2, provide the full cue card text including bullet points.`

  const data = await callGroqJSON<{ questions: GeneratedQuestion[] }>(system, user, 0.8)

  if (!Array.isArray(data.questions)) {
    throw new Error('generateQuestions: unexpected response shape')
  }

  return data.questions
}

/**
 * Grades a candidate's spoken answer for an IELTS speaking question.
 *
 * @param part        - IELTS part (PART1 | PART2 | PART3)
 * @param topic       - Speaking topic
 * @param question    - The question that was asked
 * @param transcript  - Verbatim transcript of the candidate's answer
 * @returns           Scores and feedback object
 */
export async function gradeAnswer(
  part: IELTSPart,
  topic: string,
  question: string,
  transcript: string,
): Promise<GradeScores> {
  const system = `You are a certified IELTS examiner.
Grade the following spoken response using the official IELTS Speaking band descriptors.

IELTS Speaking is assessed on four equally-weighted criteria:
1. Fluency & Coherence (FC)
2. Lexical Resource (LR) — vocabulary
3. Grammatical Range & Accuracy (GRA) — grammar
4. Pronunciation (P)

The overall band score is the average of the four criteria, rounded to the nearest 0.5.
All individual scores must be between 0.0 and 9.0, in increments of 0.5.

Return ONLY a valid JSON object with this exact structure:
{
  "overall": <number>,
  "fluency": <number>,
  "vocabulary": <number>,
  "grammar": <number>,
  "pronunciation": <number>,
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "detailedFeedback": "<paragraph of detailed examiner-style feedback>"
}`

  const user = `Part: ${part}
Topic: ${topic}
Question: ${question}

Candidate's answer (transcript):
"""
${transcript}
"""

Provide a fair, detailed IELTS Speaking assessment.`

  const data = await callGroqJSON<GradeScores>(system, user, 0.3)

  // Validate required numeric fields
  const numericFields = ['overall', 'fluency', 'vocabulary', 'grammar', 'pronunciation'] as const
  for (const field of numericFields) {
    if (typeof data[field] !== 'number') {
      throw new Error(`gradeAnswer: missing or invalid field "${field}"`)
    }
  }

  return data
}

/**
 * Generates a Band 7–8 sample answer for an IELTS speaking question.
 *
 * @param part      - IELTS part (PART1 | PART2 | PART3)
 * @param topic     - Speaking topic
 * @param question  - The question to answer
 * @returns         Sample answer with band indicator annotations
 */
export async function generateSampleAnswer(
  part: IELTSPart,
  topic: string,
  question: string,
): Promise<SampleAnswer> {
  const system = `You are an expert IELTS speaking coach who writes model answers.
Generate a natural, fluent Band 7–8 spoken response to the given IELTS ${part} question.

The sample answer should:
- Sound natural and spoken (not overly formal or written)
- Demonstrate strong lexical resource (varied, precise vocabulary)
- Show grammatical range (mix of simple and complex structures)
- Be appropriately timed (PART1: ~45–90s, PART2: ~1.5–2min, PART3: ~60–120s)
- Include cohesive devices and signposting language

Return ONLY a valid JSON object with this exact structure:
{
  "sampleAnswer": "<the full spoken response as a string>",
  "bandIndicators": [
    "<specific feature that contributes to Band 7-8 rating>",
    "<another feature>",
    "<another feature>"
  ]
}`

  const user = `Part: ${part}
Topic: ${topic}
Question: ${question}

Write a natural Band 7–8 model spoken answer and explain what makes it high-scoring.`

  const data = await callGroqJSON<SampleAnswer>(system, user, 0.7)

  if (typeof data.sampleAnswer !== 'string' || !Array.isArray(data.bandIndicators)) {
    throw new Error('generateSampleAnswer: unexpected response shape')
  }

  return data
}

/**
 * Generates topic-specific IELTS vocabulary with definitions and examples.
 *
 * @param topic  - The IELTS speaking topic
 * @returns      A list of vocabulary items with definitions and examples
 */
export async function generateVocabulary(topic: string): Promise<VocabularyList> {
  const system = `You are an expert IELTS vocabulary coach.
Generate useful, high-frequency IELTS vocabulary for the given topic.

For each word/phrase, provide:
- The word or phrase itself
- Its word type (noun, verb, adjective, adverb, phrase, idiom, collocation)
- A clear, student-friendly definition
- A natural example sentence in the context of IELTS speaking
- A note on why it is particularly useful for IELTS (ieltsRelevance)

Aim for a mix of: topic-specific nouns/verbs, useful adjectives/adverbs, advanced collocations, and idiomatic expressions.

Return ONLY a valid JSON object with this exact structure:
{
  "vocabulary": [
    {
      "word": "<word or phrase>",
      "type": "<word type>",
      "definition": "<clear definition>",
      "example": "<example sentence>",
      "ieltsRelevance": "<why this is useful for IELTS>"
    }
  ]
}`

  const user = `Generate 15 highly useful IELTS vocabulary items for the topic: "${topic}".
Include a range of word types and difficulty levels (B2–C1).`

  const data = await callGroqJSON<VocabularyList>(system, user, 0.6)

  if (!Array.isArray(data.vocabulary)) {
    throw new Error('generateVocabulary: unexpected response shape')
  }

  return data
}

/**
 * Grades a complete IELTS full speaking test holistically across all parts.
 *
 * @param sessions  - Array of session summaries (one per question answered)
 * @returns         Holistic final test result with part breakdown
 */
export async function gradeFinalTest(sessions: SessionSummary[]): Promise<FinalTestResult> {
  if (sessions.length === 0) {
    throw new Error('gradeFinalTest: no sessions provided')
  }

  const sessionSummaries = sessions.map((s, i) => {
    const scores = s.scores
      ? `Scores — Overall: ${s.scores.overall}, Fluency: ${s.scores.fluency}, Vocab: ${s.scores.vocabulary}, Grammar: ${s.scores.grammar}, Pronunciation: ${s.scores.pronunciation}`
      : 'No individual scores recorded'

    return `--- Question ${i + 1} (${s.part}, Topic: ${s.topic}) ---
Question: ${s.question}
Answer: ${s.transcript.slice(0, 600)}${s.transcript.length > 600 ? '...' : ''}
${scores}`
  }).join('\n\n')

  const system = `You are a senior IELTS examiner conducting a final holistic assessment of a complete IELTS Speaking test.

Review all parts of the test and provide an overall band score using the official IELTS holistic marking approach.
The overall band score should reflect consistent performance across the whole test, not just a simple average.

Return ONLY a valid JSON object with this exact structure:
{
  "overall": <number 0-9, increments of 0.5>,
  "fluency": <number>,
  "vocabulary": <number>,
  "grammar": <number>,
  "pronunciation": <number>,
  "summary": "<2-3 sentence examiner summary of the candidate's overall performance>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "areasForImprovement": ["<area 1>", "<area 2>", "<area 3>"],
  "partBreakdown": [
    { "part": "PART1", "score": <number>, "comment": "<brief comment>" },
    { "part": "PART2", "score": <number>, "comment": "<brief comment>" },
    { "part": "PART3", "score": <number>, "comment": "<brief comment>" }
  ],
  "recommendations": ["<specific study recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
}`

  const user = `Full IELTS Speaking Test — Candidate Responses:

${sessionSummaries}

Provide a comprehensive holistic assessment of the candidate's performance across the entire test.`

  const data = await callGroqJSON<FinalTestResult>(system, user, 0.3)

  if (typeof data.overall !== 'number') {
    throw new Error('gradeFinalTest: missing overall score in response')
  }

  return data
}
