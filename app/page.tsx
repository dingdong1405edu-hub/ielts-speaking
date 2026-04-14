'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView, type Variants } from 'framer-motion'
import {
  Mic,
  Zap,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
  Play,
  Star,
  ChevronRight,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function InView({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.section
      id={id}
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.section>
  )
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#0B1120]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white md:text-base">IELTS Speaking AI</span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
          <Link href="#features" className="transition-colors hover:text-white">Tính năng</Link>
          <Link href="#how-it-works" className="transition-colors hover:text-white">Cách hoạt động</Link>
          <Link href="/pricing" className="transition-colors hover:text-white">Bảng giá</Link>
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white md:block"
          >
            Đăng nhập
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500"
          >
            Bắt đầu miễn phí
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Hero mockup card
// ---------------------------------------------------------------------------
function MockupCard() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="relative mx-auto w-full max-w-sm rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl"
    >
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-400">
          IELTS Part 2
        </span>
      </div>

      {/* Question */}
      <div className="mb-4 rounded-xl bg-white/5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Câu hỏi</p>
        <p className="text-sm text-slate-200 leading-relaxed">
          Describe a place you have visited that you found particularly interesting.
        </p>
      </div>

      {/* Waveform */}
      <div className="mb-4 flex items-center justify-center gap-1 h-10">
        {[4, 7, 5, 9, 6, 8, 4, 10, 7, 5, 9, 6, 8, 4, 7].map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-blue-500 animate-waveform"
            style={{ height: `${h * 4}px`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Fluency', score: '7.5', color: 'text-emerald-400' },
          { label: 'Vocabulary', score: '7.0', color: 'text-blue-400' },
          { label: 'Grammar', score: '6.5', color: 'text-violet-400' },
          { label: 'Overall', score: '7.0', color: 'text-amber-400' },
        ].map(({ label, score, color }) => (
          <div key={label} className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{score}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const stats = [
  { value: '10,000+', label: 'Học viên đang luyện tập', icon: Users },
  { value: '500,000+', label: 'Câu trả lời đã phân tích', icon: BookOpen },
  { value: '+1.5 band', label: 'Cải thiện trung bình', icon: TrendingUp },
]

const features = [
  {
    icon: Zap,
    title: 'AI chấm điểm nghiêm khắc',
    description:
      'Điểm band score theo đúng 4 tiêu chí IELTS thật: Fluency, Vocabulary, Grammar và Pronunciation. Không nể nang, không làm đẹp.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Phản hồi tức thì',
    description:
      'Nói xong là có nhận xét chi tiết ngay — fluency, từ vựng, ngữ pháp, phát âm. Biết lỗi sai và biết cách sửa ngay lập tức.',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Luyện tập có hệ thống',
    description:
      'Lộ trình từng bước rõ ràng như Duolingo — từ beginner đến band 8. Streak hàng ngày, XP điểm thưởng, theo dõi tiến độ.',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10',
    ring: 'ring-violet-500/20',
  },
]

const steps = [
  {
    n: '01',
    icon: BookOpen,
    title: 'Chọn chủ đề & part',
    desc: 'Chọn Part 1, 2 hoặc 3. Hệ thống tự gợi ý chủ đề phù hợp trình độ của bạn.',
  },
  {
    n: '02',
    icon: Mic,
    title: 'Nói và ghi âm',
    desc: 'Đọc câu hỏi, chuẩn bị 1 phút rồi nói. Giao diện đơn giản như phòng thi thật.',
  },
  {
    n: '03',
    icon: Star,
    title: 'Nhận điểm + phản hồi AI',
    desc: 'AI phân tích giọng nói, cho điểm theo từng tiêu chí và gợi ý câu trả lời mẫu.',
  },
]

const pricingTeaser = [
  {
    name: 'Miễn phí',
    price: '0 ₫',
    desc: '25 lần luyện tập',
    color: 'border-white/10',
    cta: 'Bắt đầu ngay',
    href: '/register',
    ctaClass: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
    popular: false,
  },
  {
    name: '1 tháng',
    price: '100,000 ₫',
    desc: 'Luyện tập không giới hạn',
    color: 'border-blue-500/50',
    cta: 'Đăng ký ngay',
    href: '/upgrade?plan=1m',
    ctaClass: 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30',
    popular: false,
  },
  {
    name: '2 tháng',
    price: '180,000 ₫',
    desc: 'Tiết kiệm 20,000 ₫',
    color: 'border-emerald-500/40',
    cta: 'Đăng ký ngay',
    href: '/upgrade?plan=2m',
    ctaClass: 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/30',
    popular: true,
  },
]

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <Header />

      {/* ================================================================ */}
      {/* HERO                                                              */}
      {/* ================================================================ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/4 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 65%)' }}
          />
          <div
            className="absolute right-1/4 bottom-1/4 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 65%)' }}
          />
          {/* Mesh grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-0">
          {/* Left: text */}
          <div>
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300"
            >
              <Star className="h-3.5 w-3.5 fill-current" />
              Tin dùng bởi 10,000+ học viên IELTS
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-5xl lg:text-6xl"
            >
              Nói tiếng Anh{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                tự tin hơn
              </span>
              <br />
              cùng{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                AI
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg"
            >
              Luyện tập Speaking IELTS với AI chấm điểm theo chuẩn thật. Nhận phản hồi tức thì,
              cải thiện từng tiêu chí và tự tin bước vào phòng thi.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/register"
                className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-base font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500"
              >
                Bắt đầu miễn phí
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                <Play className="h-4 w-4 fill-current" />
                Xem các gói
              </Link>
            </motion.div>

            {/* Mini social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-8 flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {['NT', 'LM', 'PH', 'BT', 'VN'].map((init, i) => (
                  <div
                    key={init}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0B1120] text-xs font-bold"
                    style={{ background: `hsl(${(i * 55 + 200) % 360}, 65%, 50%)` }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-white">3,500+</span> học viên luyện tập tuần này
              </p>
            </motion.div>
          </div>

          {/* Right: mockup */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="hidden md:block"
          >
            <MockupCard />
          </motion.div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* STATS BAR                                                         */}
      {/* ================================================================ */}
      <InView className="border-y border-white/[0.07] bg-white/[0.02] py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-5 sm:grid-cols-3 md:px-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex flex-col items-center gap-3 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <Icon className="h-6 w-6 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {value}
              </p>
              <p className="text-sm text-slate-400">{label}</p>
            </motion.div>
          ))}
        </div>
      </InView>

      {/* ================================================================ */}
      {/* FEATURES                                                          */}
      {/* ================================================================ */}
      <InView id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Tính năng
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Tất cả những gì bạn cần để{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                đạt band mục tiêu
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, color, bg, ring }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`rounded-2xl border border-white/10 bg-white/[0.04] p-7 ring-1 ${ring} backdrop-blur transition-all hover:bg-white/[0.07]`}
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2.5 text-lg font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </InView>

      {/* ================================================================ */}
      {/* HOW IT WORKS                                                      */}
      {/* ================================================================ */}
      <InView id="how-it-works" className="py-24 bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-400">
              Cách hoạt động
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              3 bước đơn giản để{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                cải thiện Speaking
              </span>
            </h2>
          </motion.div>

          <div className="relative grid gap-10 md:grid-cols-3">
            {/* Connector lines on desktop */}
            <div className="pointer-events-none absolute top-8 left-1/3 right-1/3 hidden h-px bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-purple-500/30 md:block" />

            {steps.map(({ n, icon: Icon, title, desc }) => (
              <motion.div key={n} variants={fadeUp} className="flex flex-col items-start gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur">
                    <Icon className="h-7 w-7 text-blue-400" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white">
                    {n}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </InView>

      {/* ================================================================ */}
      {/* PRICING TEASER                                                    */}
      {/* ================================================================ */}
      <InView className="py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <motion.div variants={fadeUp} className="mb-14 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-emerald-400">
              Bảng giá
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Giá rõ ràng,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                không phí ẩn
              </span>
            </h2>
            <p className="mt-4 text-slate-400">Thanh toán chuyển khoản ngân hàng, kích hoạt trong 24 giờ</p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {pricingTeaser.map(({ name, price, desc, color, cta, href, ctaClass, popular }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`relative flex flex-col rounded-2xl border ${color} bg-white/[0.04] p-7 backdrop-blur transition-all hover:bg-white/[0.07]`}
              >
                {popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-1 text-xs font-bold text-white shadow-lg">
                      <Star className="h-3 w-3 fill-current" />
                      Phổ biến nhất
                    </span>
                  </div>
                )}
                <p className="mb-1 text-sm font-semibold text-slate-400">{name}</p>
                <p className="mb-1 text-3xl font-extrabold">{price}</p>
                <p className="mb-6 text-sm text-emerald-400">{desc}</p>
                <ul className="mb-6 flex flex-col gap-2">
                  {['Luyện tập không giới hạn', 'AI chấm điểm 4 tiêu chí', 'Phản hồi chi tiết tức thì'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={`mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${ctaClass}`}
                >
                  {cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div variants={fadeUp} className="mt-8 text-center">
            <Link href="/pricing" className="text-sm text-blue-400 transition hover:text-blue-300 underline underline-offset-4">
              Xem đầy đủ tính năng từng gói →
            </Link>
          </motion.div>
        </div>
      </InView>

      {/* ================================================================ */}
      {/* BOTTOM CTA                                                        */}
      {/* ================================================================ */}
      <InView className="py-24">
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-950/60 via-violet-950/60 to-slate-900/60 p-10 backdrop-blur-xl sm:p-14"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-50"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(59,130,246,0.3) 0%, transparent 65%)' }}
            />
            <motion.h2 variants={fadeUp} className="relative mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Sẵn sàng tăng{' '}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                band score?
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="relative mx-auto mb-8 max-w-lg text-slate-300">
              Bắt đầu miễn phí với 25 lần luyện tập. Không cần thẻ tín dụng, không phí ẩn.
            </motion.p>
            <motion.div variants={fadeUp} className="relative flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="group flex h-13 items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-500"
              >
                Bắt đầu luyện tập ngay
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="flex h-13 items-center gap-2 rounded-xl border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
              >
                Xem bảng giá
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
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-blue-700">
              <Mic className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-300">IELTS Speaking AI</span>
          </div>
          <p>&copy; {new Date().getFullYear()} IELTS Speaking AI. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/pricing" className="transition hover:text-slate-300">Bảng giá</Link>
            <Link href="/login" className="transition hover:text-slate-300">Đăng nhập</Link>
            <Link href="/register" className="transition hover:text-slate-300">Đăng ký</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
