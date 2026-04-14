import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: vi })
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm dd/MM/yyyy', { locale: vi })
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi })
}

export function getHskColor(level: number): string {
  const colors: Record<number, string> = {
    1: '#4CAF50',
    2: '#2196F3',
    3: '#FF9800',
    4: '#9C27B0',
    5: '#F44336',
    6: '#607D8B',
  }
  return colors[level] ?? '#9E9E9E'
}

export function getHskBadgeClass(level: number): string {
  const classes: Record<number, string> = {
    1: 'hsk-badge-1',
    2: 'hsk-badge-2',
    3: 'hsk-badge-3',
    4: 'hsk-badge-4',
    5: 'hsk-badge-5',
    6: 'hsk-badge-6',
  }
  return classes[level] ?? 'hsk-badge-1'
}

export function getLessonTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    VOCABULARY: 'Từ vựng',
    GRAMMAR: 'Ngữ pháp',
    LISTENING: 'Nghe',
    SPEAKING: 'Nói',
    READING: 'Đọc',
    WRITING: 'Viết',
    EXAM: 'Luyện thi',
  }
  return labels[type] ?? type
}

export function getLessonTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    VOCABULARY: '📚',
    GRAMMAR: '📝',
    LISTENING: '🎧',
    SPEAKING: '🗣️',
    READING: '📖',
    WRITING: '✏️',
    EXAM: '🏆',
  }
  return icons[type] ?? '📚'
}

export function calculateLevel(xp: number): {
  level: number
  progress: number
  nextLevelXp: number
  currentLevelXp: number
} {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500]
  let level = 1
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) { level = i + 1; break }
  }
  const idx = Math.min(level - 1, thresholds.length - 1)
  const nextIdx = Math.min(level, thresholds.length - 1)
  const currentLevelXp = thresholds[idx]
  const nextLevelXp = thresholds[nextIdx]
  const progress =
    nextLevelXp > currentLevelXp
      ? ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100
      : 100
  return { level, progress: Math.min(100, Math.max(0, progress)), nextLevelXp, currentLevelXp }
}

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function getXpForActivity(type: string, score?: number): number {
  const base: Record<string, number> = {
    VOCABULARY: 10,
    GRAMMAR: 15,
    LISTENING: 12,
    SPEAKING: 20,
    READING: 12,
    WRITING: 15,
    EXAM: 30,
  }
  const b = base[type] ?? 10
  if (score !== undefined) return Math.round(b * (score / 100))
  return b
}
