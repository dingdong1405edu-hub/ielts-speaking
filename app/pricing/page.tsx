'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, type Variants } from 'framer-motion'
import {
  Check,
  Mic,
  ArrowRight,
  Star,
  Zap,
  Building2,
  Smartphone,
  Clock,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function InView({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const premiumFeatures = [
  'Luyện tập không giới hạn',
  'Full IELTS Test mode (cả 3 parts liên tiếp)',
  'AI chấm điểm 4 tiêu chí chi tiết',
  'Phản hồi tức thì cho từng câu trả lời',
  'PDF báo cáo kết quả',
  'Ưu tiên xử lý AI (kết quả nhanh hơn)',
  'Sổ từ vựng không giới hạn',
  'Theo dõi tiến độ và streak hàng ngày',
]

const plans = [
  {
    id: 'free',
    name: 'Miễn phí',
    price: '0 ₫',
    priceNote: 'Không cần thanh toán',
    tag: null,
    color: 'border-white/10',
    cta: 'Bắt đầu ngay',
    href: '/register',
    ctaClass: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
    highlight: false,
    features: [
      { label: '25 lần luyện tập', ok: true },
      { label: 'AI chấm điểm overall', ok: true },
      { label: 'Part 1, 2 & 3', ok: true },
      { label: 'Full IELTS Test mode', ok: false },
      { label: 'PDF báo cáo kết quả', ok: false },
      { label: 'Sổ từ vựng không giới hạn', ok: false },
      { label: 'Ưu tiên xử lý AI', ok: false },
    ],
  },
  {
    id: '1m',
    name: '1 tháng Premium',
    price: '100,000 ₫',
    priceNote: 'Thanh toán chuyển khoản',
    tag: null,
    color: 'border-blue-500/40',
    cta: 'Đăng ký ngay',
    href: '/upgrade?plan=1m',
    ctaClass: 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30',
    highlight: false,
    features: [
      { label: 'Luyện tập không giới hạn', ok: true },
      { label: 'AI chấm điểm 4 tiêu chí', ok: true },
      { label: 'Full IELTS Test mode', ok: true },
      { label: 'PDF báo cáo kết quả', ok: true },
      { label: 'Sổ từ vựng không giới hạn', ok: true },
      { label: 'Ưu tiên xử lý AI', ok: true },
      { label: 'Tiết kiệm so với gói 3 tháng', ok: false },
    ],
  },
  {
    id: '2m',
    name: '2 tháng Premium',
    price: '180,000 ₫',
    priceNote: 'Tiết kiệm 20,000 ₫',
    tag: 'Phổ biến nhất',
    color: 'border-emerald-500/50',
    cta: 'Đăng ký ngay',
    href: '/upgrade?plan=2m',
    ctaClass: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30',
    highlight: true,
    features: [
      { label: 'Luyện tập không giới hạn', ok: true },
      { label: 'AI chấm điểm 4 tiêu chí', ok: true },
      { label: 'Full IELTS Test mode', ok: true },
      { label: 'PDF báo cáo kết quả', ok: true },
      { label: 'Sổ từ vựng không giới hạn', ok: true },
      { label: 'Ưu tiên xử lý AI', ok: true },
      { label: 'Tiết kiệm 20,000 ₫ vs gói 1 tháng', ok: true },
    ],
  },
  {
    id: '3m',
    name: '3 tháng Premium',
    price: '240,000 ₫',
    priceNote: 'Tiết kiệm 60,000 ₫',
    tag: null,
    color: 'border-violet-500/40',
    cta: 'Đăng ký ngay',
    href: '/upgrade?plan=3m',
    ctaClass: 'bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-600/30',
    highlight: false,
    features: [
      { label: 'Luyện tập không giới hạn', ok: true },
      { label: 'AI chấm điểm 4 tiêu chí', ok: true },
      { label: 'Full IELTS Test mode', ok: true },
      { label: 'PDF báo cáo kết quả', ok: true },
      { label: 'Sổ từ vựng không giới hạn', ok: true },
      { label: 'Ưu tiên xử lý AI', ok: true },
      { label: 'Tiết kiệm 60,000 ₫ — rẻ nhất', ok: true },
    ],
  },
]

const paymentSteps = [
  {
    n: 1,
    icon: Zap,
    title: 'Chọn gói phù hợp',
    desc: 'Chọn gói 1, 2 hoặc 3 tháng tùy nhu cầu luyện tập.',
  },
  {
    n: 2,
    icon: Building2,
    title: 'Chuyển khoản ngân hàng',
    desc: 'Ngân hàng: Vietcombank · Số TK: 1234567890 · Chủ TK: NGUYEN VAN A',
  },
  {
    n: 3,
    icon: Smartphone,
    title: 'Gửi ảnh chụp qua Zalo',
    desc: 'Gửi ảnh chụp màn hình giao dịch qua Zalo: 0909XXXXXX kèm email tài khoản.',
  },
  {
    n: 4,
    icon: Clock,
    title: 'Kích hoạt trong 24 giờ',
    desc: 'Chúng tôi xác nhận và kích hoạt tài khoản Premium trong vòng 24 giờ.',
  },
]

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#0B1120]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white md:text-base">IELTS Speaking AI</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
          <Link href="/" className="transition-colors hover:text-white">Trang chủ</Link>
          <Link href="#plans" className="transition-colors hover:text-white">Các gói</Link>
          <Link href="#payment" className="transition-colors hover:text-white">Cách thanh toán</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white md:block"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
          >
            Dùng miễn phí
          </Link>
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Plan card
// ---------------------------------------------------------------------------
function PlanCard({ plan }: { plan: (typeof plans)[number] }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative flex flex-col rounded-2xl border ${plan.color} bg-white/[0.04] p-7 backdrop-blur transition-all hover:bg-white/[0.07] ${plan.highlight ? 'shadow-xl shadow-emerald-500/10' : ''}`}
    >
      {/* Popular badge */}
      {plan.tag && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
            <Star className="h-3 w-3 fill-current" />
            {plan.tag}
          </span>
        </div>
      )}

      <div className="mb-1 text-sm font-semibold text-slate-400">{plan.name}</div>
      <div className="mb-1 text-3xl font-extrabold text-white">{plan.price}</div>
      <div className="mb-6 text-xs font-medium text-emerald-400">{plan.priceNote}</div>

      <Link
        href={plan.href}
        className={`mb-7 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${plan.ctaClass}`}
      >
        {plan.cta}
        <ArrowRight className="h-4 w-4" />
      </Link>

      <ul className="flex flex-col gap-3">
        {plan.features.map(({ label, ok }) => (
          <li key={label} className="flex items-start gap-2.5">
            {ok ? (
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <span className="mt-0.5 h-4 w-4 flex-shrink-0 text-center text-xs leading-4 text-slate-700">—</span>
            )}
            <span className={`text-sm ${ok ? 'text-slate-200' : 'text-slate-600'}`}>{label}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <Header />

      {/* ================================================================ */}
      {/* HERO                                                              */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden pt-32 pb-16 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 65%)' }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-5 md:px-8">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400"
          >
            Bảng giá
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
          >
            Giá minh bạch,{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              không phí ẩn
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-lg text-slate-400"
          >
            Thanh toán chuyển khoản ngân hàng nội địa — an toàn, nhanh chóng, không cần thẻ quốc tế.
          </motion.p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* PLANS                                                             */}
      {/* ================================================================ */}
      <InView id="plans" className="mx-auto max-w-6xl px-5 pb-24 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} />
          ))}
        </div>

        {/* Premium features callout */}
        <motion.div
          variants={fadeUp}
          className="mt-10 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8"
        >
          <h3 className="mb-5 text-center text-lg font-bold text-white">
            Tất cả gói Premium bao gồm
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {premiumFeatures.map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                {f}
              </div>
            ))}
          </div>
        </motion.div>
      </InView>

      {/* ================================================================ */}
      {/* PAYMENT STEPS                                                     */}
      {/* ================================================================ */}
      <InView id="payment" className="mx-auto max-w-5xl px-5 pb-24 md:px-8">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Cách{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              thanh toán
            </span>
          </h2>
          <p className="mt-3 text-slate-400">Đơn giản — hoàn toàn bằng ngân hàng nội địa Việt Nam</p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {paymentSteps.map(({ n, icon: Icon, title, desc }) => (
            <motion.div
              key={n}
              variants={fadeUp}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="relative inline-flex">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                  <Icon className="h-6 w-6 text-blue-400" />
                </div>
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {n}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <p className="text-xs leading-relaxed text-slate-400">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bank info box */}
        <motion.div
          variants={fadeUp}
          className="mt-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6"
        >
          <h4 className="mb-4 font-semibold text-amber-300">Thông tin chuyển khoản</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Ngân hàng', value: 'Vietcombank (VCB)' },
              { label: 'Số tài khoản', value: '1234567890' },
              { label: 'Chủ tài khoản', value: 'NGUYEN VAN A' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-white/5 p-4">
                <p className="mb-0.5 text-xs text-slate-500">{label}</p>
                <p className="font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Nội dung chuyển khoản: <span className="font-mono text-amber-300">[Email của bạn] + [Gói mua]</span>
            &nbsp;— ví dụ: <span className="font-mono text-slate-300">ban@gmail.com 2m</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Sau khi chuyển khoản, gửi ảnh chụp màn hình qua Zalo:{' '}
            <span className="font-semibold text-white">0909XXXXXX</span>
          </p>
        </motion.div>
      </InView>

      {/* ================================================================ */}
      {/* BOTTOM CTA                                                        */}
      {/* ================================================================ */}
      <InView className="pb-24">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/60 via-violet-950/60 to-slate-900/60 p-10 backdrop-blur-xl sm:p-14"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.35) 0%, transparent 65%)' }}
            />
            <motion.h2 variants={fadeUp} className="relative mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Chưa chắc? Dùng{' '}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                miễn phí trước
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="relative mx-auto mb-8 max-w-md text-slate-300">
              25 lần luyện tập miễn phí, không cần thẻ tín dụng. Upgrade bất cứ khi nào bạn sẵn sàng.
            </motion.p>
            <motion.div variants={fadeUp} className="relative flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500"
              >
                Bắt đầu miễn phí
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#plans"
                className="flex h-12 items-center gap-2 rounded-xl border border-white/20 px-8 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                Xem các gói Premium
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </InView>

      {/* ================================================================ */}
      {/* FOOTER                                                            */}
      {/* ================================================================ */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-slate-500 sm:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <Mic className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-300">IELTS Speaking AI</span>
          </div>
          <p>&copy; {new Date().getFullYear()} IELTS Speaking AI. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/" className="transition hover:text-slate-300">Trang chủ</Link>
            <Link href="/login" className="transition hover:text-slate-300">Đăng nhập</Link>
            <Link href="/register" className="transition hover:text-slate-300">Đăng ký</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
