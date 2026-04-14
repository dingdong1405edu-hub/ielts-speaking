import type { Metadata } from 'next'
import './globals.css'
import SessionProvider from '@/components/providers/SessionProvider'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'DingDongHSK — Học tiếng Trung với AI',
  description: 'Nền tảng học tiếng Trung thông minh với AI, flashcard, luyện nghe nói đọc viết và thi HSK',
  keywords: ['tiếng Trung', 'HSK', 'học tiếng Trung', 'AI', 'flashcard'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen">
        <SessionProvider>
          {children}
          <Toaster richColors position="top-center" duration={3000} />
        </SessionProvider>
      </body>
    </html>
  )
}
