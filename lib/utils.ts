import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names using clsx + tailwind-merge to handle
 * Tailwind CSS class conflicts correctly.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Formats a numeric band score into the official IELTS display format.
 * Scores are rounded to the nearest 0.5 as per IELTS scoring conventions.
 *
 * @example formatBandScore(6.5) => "Band 6.5"
 * @example formatBandScore(7)   => "Band 7.0"
 */
export function formatBandScore(score: number): string {
  // Clamp to valid IELTS band range [0, 9]
  const clamped = Math.max(0, Math.min(9, score))
  // Round to nearest 0.5
  const rounded = Math.round(clamped * 2) / 2
  return `Band ${rounded.toFixed(1)}`
}

/**
 * Returns a Tailwind CSS text-color class based on the IELTS band score.
 *
 * Score ranges:
 *  < 5.0   → red-500    (below modest)
 *  5.0–5.5 → orange-500 (modest)
 *  6.0–6.5 → yellow-500 (competent)
 *  7.0–7.5 → green-500  (good)
 *  8.0+    → blue-500   (very good / expert)
 */
export function getBandColor(score: number): string {
  if (score < 5) return 'text-red-500'
  if (score < 6) return 'text-orange-500'
  if (score < 7) return 'text-yellow-500'
  if (score < 8) return 'text-green-500'
  return 'text-blue-500'
}

/**
 * Returns Tailwind CSS background + text color classes based on the IELTS band score.
 * Useful for badge/pill components.
 */
export function getBandBgColor(score: number): string {
  if (score < 5) return 'bg-red-100 text-red-700'
  if (score < 6) return 'bg-orange-100 text-orange-700'
  if (score < 7) return 'bg-yellow-100 text-yellow-700'
  if (score < 8) return 'bg-green-100 text-green-700'
  return 'bg-blue-100 text-blue-700'
}

/**
 * Formats a duration given in seconds into a MM:SS display string.
 *
 * @example formatDuration(155) => "2:35"
 * @example formatDuration(60)  => "1:00"
 * @example formatDuration(9)   => "0:09"
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const totalSeconds = Math.floor(seconds)
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Maps common IELTS speaking topic names to representative emojis.
 * Falls back to a generic speech bubble emoji for unknown topics.
 */
export function getTopicEmoji(topic: string): string {
  const normalized = topic.toLowerCase().trim()

  const emojiMap: Record<string, string> = {
    // Personal & Social
    family: '👨‍👩‍👧‍👦',
    friends: '👫',
    relationships: '❤️',
    childhood: '🧒',
    education: '🎓',
    school: '🏫',
    university: '🏛️',
    work: '💼',
    job: '💼',
    career: '📈',

    // Lifestyle & Hobbies
    hobbies: '🎨',
    sports: '⚽',
    music: '🎵',
    reading: '📚',
    books: '📖',
    movies: '🎬',
    films: '🎥',
    cooking: '🍳',
    food: '🍜',
    travel: '✈️',
    holidays: '🏖️',
    shopping: '🛍️',
    fashion: '👗',
    photography: '📷',
    art: '🎨',
    games: '🎮',
    fitness: '💪',
    health: '🏥',

    // Environment & Nature
    nature: '🌿',
    environment: '🌍',
    animals: '🐾',
    weather: '🌤️',
    seasons: '🍂',
    plants: '🌱',

    // Technology & Society
    technology: '💻',
    internet: '🌐',
    social: '📱',
    'social media': '📱',
    media: '📺',
    news: '📰',
    politics: '🏛️',
    economy: '💰',
    money: '💵',
    business: '🏢',

    // Places & Home
    home: '🏠',
    house: '🏡',
    city: '🌆',
    countryside: '🌾',
    transport: '🚗',
    cities: '🌆',

    // Culture & Values
    culture: '🎭',
    tradition: '🏮',
    customs: '🎎',
    language: '🗣️',
    history: '📜',
    religion: '🕌',
    festivals: '🎉',

    // Abstract / Other
    dreams: '💭',
    future: '🔮',
    happiness: '😊',
    success: '🏆',
    leadership: '👑',
    teamwork: '🤝',
    creativity: '💡',
    science: '🔬',
    space: '🚀',
    time: '⏰',
    memory: '🧠',
  }

  // Exact match first
  if (emojiMap[normalized]) return emojiMap[normalized]

  // Partial match — return the first key whose name appears inside the topic string
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (normalized.includes(key)) return emoji
  }

  return '💬'
}
