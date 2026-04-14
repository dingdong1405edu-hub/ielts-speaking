'use client'

import type { LessonHistoryItem } from '@/types'
import { getLessonTypeLabel, formatDate } from './utils'

export async function generateLessonPDF(lesson: LessonHistoryItem): Promise<void> {
  // Dynamic import to keep out of server bundle
  const jsPDF = (await import('jspdf')).default

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 0

  // Header banner
  doc.setFillColor(88, 204, 2)
  doc.rect(0, 0, pageWidth, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('DingDongHSK', margin, 18)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(getLessonTypeLabel(lesson.type), pageWidth - margin, 18, { align: 'right' })

  y = 38

  // Title
  doc.setTextColor(44, 44, 44)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(lesson.title, margin, y)
  y += 8

  // Meta row
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Ngày học: ${formatDate(lesson.completedAt)}`, margin, y)
  if (lesson.score != null) {
    doc.text(`Điểm: ${lesson.score}/100`, pageWidth / 2, y, { align: 'center' })
  }
  doc.text(`+${lesson.xpEarned} XP`, pageWidth - margin, y, { align: 'right' })
  y += 5

  // Divider
  doc.setDrawColor(229, 229, 229)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  doc.setTextColor(44, 44, 44)
  doc.setFontSize(11)
  const content = lesson.content

  // Vocabulary section
  if (Array.isArray(content.vocabulary)) {
    doc.setFont('helvetica', 'bold')
    doc.text('Từ vựng đã học:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    for (const w of content.vocabulary as Array<{ hanzi: string; pinyin: string; meaning: string }>) {
      if (y > 270) { doc.addPage(); y = margin }
      doc.text(`• ${w.hanzi}  (${w.pinyin}) — ${w.meaning}`, margin + 4, y)
      y += 6
    }
    y += 4
  }

  // Notes section
  if (content.notes) {
    if (y > 250) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.text('Ghi chú:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const lines = doc.splitTextToSize(String(content.notes), pageWidth - margin * 2 - 4)
    doc.text(lines, margin + 4, y)
    y += lines.length * 6 + 4
  }

  // Score breakdown
  if (content.answers && typeof content.answers === 'object') {
    if (y > 240) { doc.addPage(); y = margin }
    doc.setFont('helvetica', 'bold')
    doc.text('Kết quả bài tập:', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const answers = content.answers as Record<string, boolean>
    const total = Object.keys(answers).length
    const correct = Object.values(answers).filter(Boolean).length
    doc.text(`Đúng: ${correct}/${total} câu`, margin + 4, y)
    y += 6
  }

  // Page footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(180, 180, 180)
    doc.text(
      `DingDongHSK — Trang ${i}/${pageCount}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    )
  }

  doc.save(`${lesson.title.replace(/\s+/g, '_')}_${formatDate(lesson.completedAt)}.pdf`)
}
