'use client'

import Link from 'next/link'
import { Sparkles, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react'
import { FREE_LIMIT } from '@/lib/usage'

interface UsageBannerProps {
  sessionsUsed: number
  isPremiumActive: boolean
  premiumUntil?: Date | null
}

function formatExpiry(date: Date): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function UsageBanner({
  sessionsUsed,
  isPremiumActive,
  premiumUntil,
}: UsageBannerProps) {
  const remaining = isPremiumActive
    ? Infinity
    : Math.max(0, FREE_LIMIT - sessionsUsed)
  const pct = Math.min(100, (sessionsUsed / FREE_LIMIT) * 100)

  // ── Premium active ────────────────────────────────────────────────────────
  if (isPremiumActive) {
    return (
      <div
        className="flex items-center gap-3 rounded-xl border px-4 py-3"
        style={{
          background: 'color-mix(in srgb, var(--bg-card) 90%, #22c55e 10%)',
          borderColor: 'color-mix(in srgb, var(--border) 50%, #22c55e 50%)',
        }}
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-400">
            Premium đang hoạt động
          </p>
          {premiumUntil && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Hết hạn: {formatExpiry(new Date(premiumUntil))}
            </p>
          )}
        </div>
        <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      </div>
    )
  }

  // ── Limit exhausted ───────────────────────────────────────────────────────
  if (remaining === 0) {
    return (
      <div
        className="rounded-xl border px-4 py-4"
        style={{
          background: 'color-mix(in srgb, var(--bg-card) 85%, #ef4444 15%)',
          borderColor: 'color-mix(in srgb, var(--border) 40%, #ef4444 60%)',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center mt-0.5">
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-400">
              Bạn đã dùng hết {FREE_LIMIT} lần miễn phí
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Nâng cấp Premium để luyện tập không giới hạn và nhận phản hồi chi tiết hơn.
            </p>
          </div>
        </div>

        {/* Full progress bar */}
        <div
          className="mt-3 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          <div className="h-full w-full rounded-full bg-red-500" />
        </div>

        <Link
          href="/pricing"
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-400 text-white transition-colors duration-150"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Nâng cấp Premium ngay
        </Link>
      </div>
    )
  }

  // ── Warning — 5 or fewer left ─────────────────────────────────────────────
  if (remaining <= 5) {
    return (
      <div
        className="rounded-xl border px-4 py-4"
        style={{
          background: 'color-mix(in srgb, var(--bg-card) 88%, #f59e0b 12%)',
          borderColor: 'color-mix(in srgb, var(--border) 50%, #f59e0b 50%)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center mt-0.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-400">
                Còn {remaining}/{FREE_LIMIT} lần luyện tập miễn phí
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Bạn sắp hết lượt. Nâng cấp để không bị gián đoạn.
              </p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="flex-shrink-0 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors duration-150"
          >
            <Sparkles className="w-3 h-3" />
            Nâng cấp
          </Link>
        </div>

        {/* Progress bar */}
        <div
          className="mt-3 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--border)' }}
        >
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    )
  }

  // ── Comfortable — more than 5 remaining ───────────────────────────────────
  return (
    <div
      className="flex items-center gap-3 rounded-xl border px-4 py-3"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: 'color-mix(in srgb, var(--bg-surface) 60%, #3b82f6 40%)' }}
      >
        <Sparkles className="w-4 h-4 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Còn <span className="font-semibold text-blue-400">{remaining}/{FREE_LIMIT}</span> lần luyện tập miễn phí
        </p>
      </div>

      {/* Compact progress bar */}
      <div
        className="w-24 h-1.5 rounded-full overflow-hidden flex-shrink-0"
        style={{ background: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
