import { create } from 'zustand'
import type { Exercise, VocabularyWord } from '@/types'

interface LessonStore {
  currentLesson: string | null
  currentQuestion: number
  totalQuestions: number
  score: number
  isComplete: boolean
  answers: Record<string, boolean>
  reviewWords: VocabularyWord[]
  currentExercise: Exercise | null

  setCurrentLesson: (id: string | null) => void
  nextQuestion: () => void
  setTotalQuestions: (n: number) => void
  addScore: (points: number) => void
  recordAnswer: (questionId: string, correct: boolean) => void
  setComplete: (complete: boolean) => void
  setReviewWords: (words: VocabularyWord[]) => void
  setCurrentExercise: (exercise: Exercise | null) => void
  resetLesson: () => void
}

export const useLessonStore = create<LessonStore>()((set) => ({
  currentLesson: null,
  currentQuestion: 0,
  totalQuestions: 0,
  score: 0,
  isComplete: false,
  answers: {},
  reviewWords: [],
  currentExercise: null,

  setCurrentLesson: (id) => set({ currentLesson: id }),
  nextQuestion: () =>
    set((state) => ({ currentQuestion: state.currentQuestion + 1 })),
  setTotalQuestions: (n) => set({ totalQuestions: n }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  recordAnswer: (questionId, correct) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: correct },
    })),
  setComplete: (complete) => set({ isComplete: complete }),
  setReviewWords: (words) => set({ reviewWords: words }),
  setCurrentExercise: (exercise) => set({ currentExercise: exercise }),
  resetLesson: () =>
    set({
      currentLesson: null,
      currentQuestion: 0,
      totalQuestions: 0,
      score: 0,
      isComplete: false,
      answers: {},
      reviewWords: [],
      currentExercise: null,
    }),
}))
