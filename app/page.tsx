'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  Mic,
  Zap,
  MessageSquare,
  Trophy,
  ArrowRight,
  Star,
  CheckCircle,
  Users,
  BookOpen,
  TrendingUp,
  Play,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
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
// Data
// ---------------------------------------------------------------------------
const features = [
  {
    icon: Zap,
    title: 'AI-Powered Grading',
    description:
      'Get instant band scores across all four IELTS criteria — Fluency, Lexical Resource, Grammar, and Pronunciation — powered by state-of-the-art AI.',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/20',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Feedback',
    description:
      'Speak your answer and receive detailed, actionable feedback within seconds. Identify weaknesses and improve faster than any textbook can offer.',
    gradient: 'from-indigo-500 to-blue-500',
    glow: 'shadow-indigo-500/20',
  },
  {
    icon: Trophy,
    title: 'Gamified Learning',
    description:
      'Earn XP, maintain streaks, and climb leaderboards with our Duolingo-style learning path designed specifically for IELTS Speaking.',
    gradient: 'from-violet-500 to-purple-500',
    glow: 'shadow-violet-500/20',
  },
]

const steps = [
  {
    step: '01',
    icon: Mic,
    title: 'Record Your Answer',
    description: 'Choose a topic, read the prompt, and record your spoken response — just like the real exam.',
  },
  {
    step: '02',
    icon: Zap,
    title: 'AI Analyses Your Speech',
    description: 'Our AI transcribes and evaluates your answer against official IELTS band descriptors.',
  },
  {
    step: '03',
    icon: TrendingUp,
    title: 'Improve with Feedback',
    description: 'Review detailed feedback, model answers, and vocabulary suggestions to level up your score.',
  },
]

const stats = [
  { value: '10,000+', label: 'Active learners', icon: Users },
  { value: '4M+', label: 'Questions answered', icon: BookOpen },
  { value: '+1.5', label: 'Avg band improvement', icon: TrendingUp },
]

const testimonials = [
  {
    name: 'Aisha Rahman',
    role: 'Scored Band 8.0',
    country: 'Bangladesh',
    avatar: 'AR',
    quote:
      'I was stuck at 6.5 for two attempts. After 6 weeks with IELTS Speaking AI, I finally hit 8.0. The feedback is incredibly specific — nothing like what I got from YouTube videos.',
  },
  {
    name: 'Dmitri Volkov',
    role: 'Scored Band 7.5',
    country: 'Russia',
    avatar: 'DV',
    quote:
      'The streak system kept me practising every single day. My fluency improved dramatically. Worth every penny of the Pro plan.',
  },
  {
    name: 'Mei-Ling Chen',
    role: 'Scored Band 7.0',
    country: 'China',
    avatar: 'MC',
    quote:
      "I used to freeze when speaking. The beginner lessons helped me build confidence step by step. Now I don't fear Part 2 at all!",
  },
]

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#0a0a1a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">IELTS Speaking AI</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
          <Link href="#features" className="transition hover:text-white">Features</Link>
          <Link href="#how-it-works" className="transition hover:text-white">How it works</Link>
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white md:block"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Header />

      {/* ------------------------------------------------------------------ */}
      {/* HERO                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 60%)' }}
          />
          <div
            className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 60%)' }}
          />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-300"
          >
            <Star className="h-3.5 w-3.5 fill-current" />
            Trusted by 10,000+ IELTS candidates
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
          >
            Master{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              IELTS Speaking
            </span>
            <br />
            with AI
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl"
          >
            Practice real IELTS Speaking questions, get instant AI band scores, and unlock
            personalised feedback — all in one gamified platform that adapts to your level.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/register"
              className="group flex h-14 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-violet-500"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/pricing"
              className="flex h-14 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <Play className="h-4 w-4" />
              View pricing
            </Link>
          </motion.div>

          {/* Social proof avatars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-12 flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {['AR', 'DV', 'MC', 'JK', 'TP'].map((initials, i) => (
                <div
                  key={initials}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0a0a1a] text-xs font-bold"
                  style={{
                    background: `hsl(${(i * 60 + 240) % 360}, 70%, 55%)`,
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">4,000+</span> students practised this week
            </p>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* STATS BAR                                                            */}
      {/* ------------------------------------------------------------------ */}
      <Section className="border-y border-white/[0.06] bg-white/[0.02] py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-6 sm:grid-cols-3">
          {stats.map(({ value, label, icon: Icon }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10">
                <Icon className="h-6 w-6 text-indigo-400" />
              </div>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {value}
              </p>
              <p className="text-sm text-slate-400">{label}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* FEATURES                                                             */}
      {/* ------------------------------------------------------------------ */}
      <Section id="features" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeUp} className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-400">
              Features
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                ace the exam
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, gradient, glow }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl ${glow} backdrop-blur transition-shadow hover:shadow-2xl`}
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-3 text-xl font-bold">{title}</h3>
                <p className="leading-relaxed text-slate-400">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* HOW IT WORKS                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeUp} className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-violet-400">
              How it works
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              From practice to{' '}
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                band score
              </span>{' '}
              in minutes
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map(({ step, icon: Icon, title, description }) => (
              <motion.div key={step} variants={fadeUp} className="relative flex flex-col items-start gap-4">
                {/* Connector line (md+) */}
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                    <Icon className="h-7 w-7 text-violet-400" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold">
                    {step}
                  </span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">{title}</h3>
                  <p className="leading-relaxed text-slate-400">{description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* TESTIMONIALS                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div variants={fadeUp} className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-400">
              Success stories
            </p>
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Real results from{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                real students
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map(({ name, role, country, avatar, quote }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
              >
                {/* Stars */}
                <div className="mb-5 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-slate-300">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-xs text-slate-400">
                      {role} &bull; {country}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* CTA                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <Section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/60 via-violet-900/60 to-purple-900/60 p-12 backdrop-blur-xl"
          >
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.4) 0%, transparent 60%)' }}
            />
            <motion.div variants={fadeUp}>
              <h2 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
                Ready to crack{' '}
                <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                  Band 7+?
                </span>
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-slate-300">
                Join thousands of test-takers who improved their speaking band score with our
                AI-powered platform. Start free — no credit card required.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/register"
                  className="group flex h-14 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-violet-400"
                >
                  Start practising free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/pricing"
                  className="flex h-14 items-center gap-2 rounded-xl border border-white/20 px-8 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
                >
                  See pricing
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      {/* FOOTER                                                               */}
      {/* ------------------------------------------------------------------ */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
              <Mic className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-300">IELTS Speaking AI</span>
          </div>
          <p>&copy; {new Date().getFullYear()} IELTS Speaking AI. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/pricing" className="transition hover:text-slate-300">Pricing</Link>
            <Link href="/login" className="transition hover:text-slate-300">Login</Link>
            <Link href="/register" className="transition hover:text-slate-300">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
