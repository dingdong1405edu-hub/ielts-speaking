'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, Sparkles, Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UsageLimitModalProps {
  open: boolean
  onClose: () => void
}

const PLANS = [
  {
    duration: '1 tháng',
    price: '100,000',
    perMonth: '100,000',
    highlight: false,
  },
  {
    duration: '2 tháng',
    price: '180,000',
    perMonth: '90,000',
    highlight: false,
  },
  {
    duration: '3 tháng',
    price: '240,000',
    perMonth: '80,000',
    highlight: true,
    badge: 'Tiết kiệm nhất',
  },
] as const

const BENEFITS = [
  'Luyện tập không giới hạn',
  'Phản hồi AI chi tiết hơn',
  'Phân tích giọng nói nâng cao',
  'Ưu tiên hỗ trợ',
]

export function UsageLimitModal({ open, onClose }: UsageLimitModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 text-center border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-7 h-7 text-blue-400" />
          </div>
          <h2
            className="text-lg font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Bạn đã dùng hết 25 lần miễn phí
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Chúc mừng bạn đã hoàn thành{' '}
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              25 buổi luyện tập miễn phí!
            </span>
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Nâng cấp Premium để tiếp tục hành trình cải thiện IELTS Speaking của bạn.
          </p>
        </div>

        {/* Benefits list */}
        <div className="px-6 py-4">
          <ul className="grid grid-cols-2 gap-y-2 gap-x-3">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {b}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Plan cards */}
        <div
          className="px-6 pb-5 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider mt-4 mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Chọn gói phù hợp
          </p>
          <div className="flex gap-2">
            {PLANS.map((plan) => (
              <div
                key={plan.duration}
                className="relative flex-1 rounded-xl border p-3 text-center"
                style={
                  plan.highlight
                    ? {
                        background:
                          'color-mix(in srgb, var(--bg-surface) 60%, #3b82f6 40%)',
                        borderColor: '#3b82f6',
                      }
                    : {
                        background: 'var(--bg-surface)',
                        borderColor: 'var(--border)',
                      }
                }
              >
                {plan.highlight && 'badge' in plan && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <p
                  className="text-xs font-medium mb-1"
                  style={{
                    color: plan.highlight ? '#93c5fd' : 'var(--text-muted)',
                  }}
                >
                  {plan.duration}
                </p>
                <p
                  className="text-sm font-bold"
                  style={{
                    color: plan.highlight ? '#dbeafe' : 'var(--text-primary)',
                  }}
                >
                  {plan.price}
                  <span
                    className="text-[10px] font-normal"
                    style={{
                      color: plan.highlight ? '#93c5fd' : 'var(--text-muted)',
                    }}
                  >
                    đ
                  </span>
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{
                    color: plan.highlight ? '#93c5fd' : 'var(--text-muted)',
                  }}
                >
                  {plan.perMonth}đ/tháng
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div
          className="px-6 pb-6 flex flex-col gap-2 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <Link href="/pricing" className="w-full mt-4">
            <Button className="w-full gap-2 font-semibold">
              <Sparkles className="w-4 h-4" />
              Xem chi tiết gói Premium
            </Button>
          </Link>
          <button
            onClick={onClose}
            className="w-full py-2 text-sm transition-colors duration-150"
            style={{ color: 'var(--text-muted)' }}
          >
            Có thể sau
          </button>
        </div>
      </div>
    </div>
  )
}
