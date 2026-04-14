export type LessonType =
  | 'VOCABULARY'
  | 'GRAMMAR'
  | 'LISTENING'
  | 'SPEAKING'
  | 'READING'
  | 'WRITING'
  | 'EXAM'

export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
}

export interface VocabExample {
  sentence: string
  pinyin: string
  meaning: string
}

export interface VocabularyWord {
  id: string
  hanzi: string
  pinyin: string
  meaning: string
  hskLevel: number
  audioUrl?: string | null
  examples: VocabExample[]
  tags: string[]
}

export interface ContentBlock {
  type: 'heading' | 'text' | 'pattern' | 'example' | 'note' | 'tip'
  content: string
  pinyin?: string
  translation?: string
}

export interface Exercise {
  id: string
  type: 'multiple_choice' | 'fill_blank' | 'translation' | 'tone_select'
  question: string
  options?: string[]
  answer: string
  explanation?: string
}

export interface GrammarLesson {
  id: string
  title: string
  titleVi: string
  hskLevel: number
  content: ContentBlock[]
  exercises: Exercise[]
  order: number
}

export interface LessonHistoryItem {
  id: string
  userId: string
  type: LessonType
  title: string
  content: Record<string, unknown>
  score?: number | null
  xpEarned: number
  completedAt: string
}

export interface UserProgressItem {
  id: string
  vocabularyId?: string | null
  lessonId?: string | null
  masteryLevel: number
  nextReviewAt: string
  reviewCount: number
  vocabulary?: VocabularyWord
}

export interface ExamQuestion {
  id: string
  type: 'multiple_choice' | 'fill_blank' | 'listening' | 'reading'
  question: string
  options?: string[]
  answer: string
  audioUrl?: string
  passage?: string
  explanation?: string
}

export interface ExamConfig {
  id: string
  title: string
  level: string
  duration: number
  totalQuestions: number
  sections: ExamSection[]
}

export interface ExamSection {
  name: string
  nameVi: string
  questions: ExamQuestion[]
}

export interface SessionUser {
  id: string
  email: string
  name: string | null
  image: string | null
  xp: number
  streak: number
}

export interface DashboardStats {
  totalXp: number
  streak: number
  lessonsCompleted: number
  wordsLearned: number
}
