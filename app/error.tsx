'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to your error tracking service (e.g. Sentry) here
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          className="relative mb-6 flex items-center justify-center"
        >
          <div className="absolute w-24 h-24 rounded-full bg-red-500/10 blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-100 mb-3">Something went wrong</h1>
          <p className="text-slate-400 leading-relaxed mb-3">
            An unexpected error occurred. Don&apos;t worry — your progress is saved. Try refreshing
            the page or head back to the dashboard.
          </p>

          {/* Error message — only in development */}
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-4 rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3 text-left">
              <p className="text-xs font-mono text-red-400 break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-slate-600 mt-1">Digest: {error.digest}</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors duration-200"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </a>
        </motion.div>
      </div>
    </div>
  )
}
