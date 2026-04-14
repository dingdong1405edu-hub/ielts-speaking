export interface ReviewCard {
  easeFactor: number
  interval: number
  repetitions: number
}

export interface ReviewResult {
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: Date
}

/**
 * SM-2 Algorithm
 * quality: 0-5 (0=complete blackout, 5=perfect recall)
 */
export function sm2(card: ReviewCard, quality: number): ReviewResult {
  let { easeFactor, interval, repetitions } = card

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  )

  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  return { easeFactor, interval, repetitions, nextReviewDate }
}

/** Convert 1-5 star rating to SM-2 quality (0-5) */
export function ratingToQuality(rating: number): number {
  const map: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 4, 5: 5 }
  return map[rating] ?? 3
}

export function isDue(nextReviewAt: Date | string): boolean {
  return new Date() >= new Date(nextReviewAt)
}

export function getXpForRating(rating: number): number {
  const map: Record<number, number> = { 1: 2, 2: 5, 3: 8, 4: 12, 5: 15 }
  return map[rating] ?? 5
}

export function getInitialCard(): ReviewCard {
  return { easeFactor: 2.5, interval: 0, repetitions: 0 }
}
