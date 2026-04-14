'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Mic,
  ArrowLeft,
  Check,
  Building2,
  Smartphone,
  Clock,
  Loader2,
  CheckCircle2,
  Copy,
  CheckCheck,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Plan config
// ---------------------------------------------------------------------------
const PLANS: Record<string, { label: string; price: number; months: number; saving?: string }> = {
  '1m': { label: '1 tháng Premium', price: 100_000, months: 1 },
  '2m': { label: '2 tháng Premium', price: 180_000, months: 2, saving: 'Tiết kiệm 20,000 ₫' },
  '3m': { label: '3 tháng Premium', price: 240_000, months: 3, saving: 'Tiết kiệm 60,000 ₫' },
}

const BANK_INFO = {
  bank: 'Vietcombank (VCB)',
  account: '1234567890',
  owner: 'NGUYEN VAN A',
  zalo: '0909XXXXXX',
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫'
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      className="ml-2 inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-0.5 text-xs text-slate-300 transition hover:bg-white/20"
    >
      {copied ? <CheckCheck className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Đã sao chép' : 'Sao chép'}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
// Wrap inner component in Suspense to satisfy Next.js useSearchParams rules
export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#0B1120] text-slate-400 text-sm">Đang tải…</div>}>
      <UpgradePageInner />
    </Suspense>
  )
}

function UpgradePageInner() {
  const searchParams = useSearchParams()
  const planKey = (searchParams.get('plan') ?? '1m') as keyof typeof PLANS
  const plan = PLANS[planKey] ?? PLANS['1m']

  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState('')

  // Pre-populate transfer note
  useEffect(() => {
    setNote(`Premium ${planKey}`)
  }, [planKey])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey, transferNote: note }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.')
        return
      }
      setOrderId(data.orderId)
      setSuccess(true)
    } catch {
      setError('Không kết nối được máy chủ. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1120] px-5 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.93 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center"
        >
          <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-emerald-400" />
          <h2 className="mb-3 text-2xl font-extrabold text-white">Đã ghi nhận yêu cầu!</h2>
          <p className="mb-2 text-slate-300">
            Chúng tôi sẽ xác nhận và kích hoạt tài khoản Premium của bạn trong vòng{' '}
            <span className="font-semibold text-emerald-400">24 giờ</span>.
          </p>
          {orderId && (
            <p className="mb-6 text-xs text-slate-500">
              Mã đơn: <span className="font-mono text-slate-400">{orderId}</span>
            </p>
          )}
          <p className="mb-8 text-sm text-slate-400">
            Nếu sau 24h chưa kích hoạt, vui lòng nhắn lại qua Zalo{' '}
            <span className="font-semibold text-white">{BANK_INFO.zalo}</span> kèm mã đơn hàng.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500"
          >
            Về trang luyện tập
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Main flow ──
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      {/* Minimal header */}
      <header className="border-b border-white/[0.07] bg-[#0B1120]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Mic className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">IELTS Speaking AI</span>
          </Link>
          <Link
            href="/pricing"
            className="flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại bảng giá
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight">Đăng ký Premium</h1>
          <p className="mb-10 text-slate-400">Hoàn thành thanh toán để kích hoạt tài khoản Premium</p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* ============================================================ */}
          {/* Left: bank info + form                                        */}
          {/* ============================================================ */}
          <div className="space-y-6">
            {/* Steps */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-7"
            >
              <h2 className="mb-6 text-lg font-bold">Hướng dẫn thanh toán</h2>
              <div className="space-y-5">
                {[
                  {
                    n: 1,
                    icon: Building2,
                    title: 'Chuyển khoản ngân hàng',
                    body: (
                      <div className="mt-3 space-y-2.5 rounded-xl bg-white/5 p-4">
                        {[
                          { label: 'Ngân hàng', value: BANK_INFO.bank },
                          { label: 'Số tài khoản', value: BANK_INFO.account },
                          { label: 'Chủ tài khoản', value: BANK_INFO.owner },
                          {
                            label: 'Số tiền',
                            value: formatVND(plan.price),
                            highlight: true,
                          },
                        ].map(({ label, value, highlight }) => (
                          <div key={label} className="flex items-center justify-between gap-4 text-sm">
                            <span className="text-slate-500">{label}</span>
                            <span className={`font-semibold ${highlight ? 'text-emerald-400 text-base' : 'text-white'}`}>
                              {value}
                              {label === 'Số tài khoản' && <CopyButton text={value} />}
                            </span>
                          </div>
                        ))}
                        <div className="border-t border-white/10 pt-2.5 text-sm">
                          <span className="text-slate-500">Nội dung CK: </span>
                          <span className="font-mono text-blue-300">
                            [email của bạn] Premium {planKey}
                          </span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    n: 2,
                    icon: Smartphone,
                    title: `Gửi ảnh chụp qua Zalo: ${BANK_INFO.zalo}`,
                    body: (
                      <p className="mt-2 text-sm text-slate-400">
                        Gửi ảnh chụp màn hình giao dịch thành công kèm email tài khoản của bạn.
                      </p>
                    ),
                  },
                  {
                    n: 3,
                    icon: Clock,
                    title: 'Kích hoạt trong 24 giờ',
                    body: (
                      <p className="mt-2 text-sm text-slate-400">
                        Sau khi xác nhận, chúng tôi sẽ kích hoạt Premium và gửi thông báo.
                      </p>
                    ),
                  },
                ].map(({ n, icon: Icon, title, body }) => (
                  <div key={n} className="flex gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                        <Icon className="h-5 w-5 text-blue-400" />
                      </div>
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
                        {n}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{title}</p>
                      {body}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Submit form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-7"
            >
              <h2 className="mb-2 text-lg font-bold">Xác nhận đã chuyển khoản</h2>
              <p className="mb-5 text-sm text-slate-400">
                Sau khi chuyển khoản, nhấn xác nhận để chúng tôi kiểm tra và kích hoạt tài khoản.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300" htmlFor="note">
                    Ghi chú (tuỳ chọn)
                  </label>
                  <textarea
                    id="note"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Đã CK lúc 14:30, nội dung: ban@gmail.com Premium 2m"
                    className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.015 }}
                  whileTap={{ scale: loading ? 1 : 0.985 }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý…
                    </>
                  ) : (
                    'Tôi đã chuyển khoản'
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* ============================================================ */}
          {/* Right: order summary                                          */}
          {/* ============================================================ */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="h-fit rounded-2xl border border-blue-500/30 bg-blue-500/5 p-7"
          >
            <h2 className="mb-5 text-lg font-bold">Tóm tắt đơn hàng</h2>

            {/* Plan selector */}
            <div className="mb-6 flex flex-col gap-2">
              {Object.entries(PLANS).map(([key, p]) => (
                <Link
                  key={key}
                  href={`/upgrade?plan=${key}`}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${
                    planKey === key
                      ? 'border-blue-500/60 bg-blue-500/15 text-white'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span className="font-medium">{p.label}</span>
                  <span className={planKey === key ? 'font-bold text-blue-300' : ''}>
                    {formatVND(p.price)}
                  </span>
                </Link>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-3 border-t border-white/10 pt-5">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Gói đã chọn</span>
                <span className="font-semibold text-white">{plan.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Thời hạn</span>
                <span className="text-white">{plan.months} tháng</span>
              </div>
              {plan.saving && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Tiết kiệm</span>
                  <span className="font-semibold text-emerald-400">{plan.saving}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="font-semibold text-white">Tổng thanh toán</span>
                <span className="text-2xl font-extrabold text-blue-300">{formatVND(plan.price)}</span>
              </div>
            </div>

            {/* What you get */}
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Bao gồm</p>
              <ul className="space-y-2">
                {[
                  'Luyện tập không giới hạn',
                  'Full IELTS Test mode',
                  'AI chấm 4 tiêu chí',
                  'PDF báo cáo kết quả',
                  'Ưu tiên xử lý AI',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-slate-500">
              Kích hoạt trong 24 giờ sau khi xác nhận chuyển khoản. Mọi thắc mắc liên hệ Zalo{' '}
              <span className="text-slate-400">{BANK_INFO.zalo}</span>.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
