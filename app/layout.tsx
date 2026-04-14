import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

// ---------------------------------------------------------------------------
// Font
// ---------------------------------------------------------------------------

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: 'IELTS Speak AI',
    template: '%s · IELTS Speak AI',
  },
  description:
    'AI-powered IELTS Speaking practice platform. Get instant band scores, detailed feedback, and improve your fluency with real exam simulations.',
  keywords: [
    'IELTS',
    'speaking practice',
    'AI feedback',
    'band score',
    'English exam',
    'IELTS preparation',
  ],
  authors: [{ name: 'IELTS Speak AI' }],
  creator: 'IELTS Speak AI',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'IELTS Speak AI — Practise Speaking. Score Higher.',
    description:
      'AI-powered IELTS Speaking practice. Real exam structure, instant band scores, personalised feedback.',
    siteName: 'IELTS Speak AI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IELTS Speak AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IELTS Speak AI — Practise Speaking. Score Higher.',
    description:
      'AI-powered IELTS Speaking practice. Real exam structure, instant band scores, personalised feedback.',
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#0B1120',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

// ---------------------------------------------------------------------------
// Root layout
// ---------------------------------------------------------------------------

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
