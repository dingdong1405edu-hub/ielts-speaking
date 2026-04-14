'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Check, X, Mic, Zap, ArrowRight, Star } from 'lucide-react'

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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
const plans = [
  {
    name: 'Free',
    price: null,
    priceLabel: '$0',
    period: 'forever',
    description: 'Perfect for getting started and trying out our AI feedback.',
    gradient: 'from-slate-600 to-slate-700',
    borderColor: 'border-white/10',
    popular: false,
    cta: 'Start for free',
    ctaStyle: 'border border-white/20 bg-white/5 text-white hover:bg-white/10',
    features: [
      { label: '5 practice sessions / month', included: true },
      { label: 'AI band score (overall only)', included: true },
      { label: 'Parts 1, 2 & 3 questions', included: true },
      { label: 'Basic vocabulary suggestions', included: true },
      { label: 'Detailed per-criterion scores', included: false },
      { label: 'Sample model answers', included: false },
      { label: 'Full mock test mode', included: false },
      { label: 'PDF score report export', included: false },
      { label: 'Streak & XP leaderboard', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    name: 'Pro',
    price: 9.99,
    priceLabel: '$9.99',
    period: 'per month',
    description: 'For serious test-takers who want fast, comprehensive improvement.',
    gradient: 'from-indigo-600 to-violet-600',
    borderColor: 'border-indigo-500/50',
    popular: true,
    cta: 'Get Pro',
    ctaStyle:
      'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-violet-500',
    features: [
      { label: 'Unlimited practice sessions', included: true },
      { label: 'Full AI band score (all 4 criteria)', included: true },
      { label: 'Parts 1, 2 & 3 questions', included: true },
      { label: 'Advanced vocabulary & phrases', included: true },
      { label: 'Detailed per-criterion scores', included: true },
      { label: 'Sample model answers', included: true },
      { label: 'Full mock test mode', included: true },
      { label: 'PDF score report export', included: true },
      { label: 'Streak & XP leaderboard', included: true },
      { label: 'Priority support', included: false },
    ],
  },
  {
    name: 'Premium',
    price: 19.99,
    priceLabel: '$19.99',
    period: 'per month',
    description: 'For those who want the ultimate preparation experience with dedicated support.',
    gradient: 'from-amber-500 to-orange-500',
    borderColor: 'border-amber-500/40',
    popular: false,
    cta: 'Get Premium',
    ctaStyle:
      'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-orange-400',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'Unlimited practice sessions', included: true },
      { label: 'Full AI band score (all 4 criteria)', included: true },
      { label: 'Parts 1, 2 & 3 questions', included: true },
      { label: 'Advanced vocabulary & phrases', included: true },
      { label: 'Detailed per-criterion scores', included: true },
      { label: 'Sample model answers', included: true },
      { label: 'Full mock test mode', included: true },
      { label: 'PDF score report export', included: true },
      { label: 'Streak & XP leaderboard', included: true },
      // extra Premium features
      { label: 'Human tutor review (2/mo)', included: true },
      { label: 'Priority 24/7 support', included: true },
    ],
  },
]

const faqs = [
  {
    q: 'Can I cancel at any time?',
    a: 'Yes — cancel with one click from your account settings. You keep access until the end of your billing period.',
  },
  {
    q: 'Is there a free trial for Pro?',
    a: 'The Free plan lets you experience core features indefinitely. We plan to add a 7-day Pro trial soon.',
  },
  {
    q: 'How accurate is the AI band scoring?',
    a: 'Our model is trained on thousands of human-marked IELTS responses and correlates strongly with official examiner scores (±0.5 band).',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards, as well as PayPal, via our Stripe-powered checkout.',
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
            Start free
          </Link>
        </div>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Plan card
// ---------------------------------------------------------------------------
function PlanCard({
  plan,
  index,
}: {
  plan: (typeof plans)[number]
  index: number
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`relative flex flex-col rounded-2xl border ${plan.borderColor} bg-white/5 p-8 backdrop-blur transition-shadow hover:shadow-2xl ${plan.popular ? 'shadow-xl shadow-indigo-500/20' : ''}`}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/40">
            <Star className="h-3 w-3 fill-current" />
            Most Popular
          </div>
        </div>
      )}

      {/* Plan name + gradient pill */}
      <div className={`mb-4 inline-flex items-center gap-2 self-start rounded-lg bg-gradient-to-r ${plan.gradient} px-3 py-1 text-sm font-bold text-white`}>
        <Zap className="h-3.5 w-3.5" />
        {plan.name}
      </div>

      {/* Price */}
      <div className="mb-2 flex items-end gap-1">
        <span className="text-5xl font-extrabold">{plan.priceLabel}</span>
        {plan.price && (
          <span className="mb-2 text-slate-400">/{plan.period}</span>
        )}
      </div>
      {!plan.price && (
        <p className="mb-2 text-slate-400">{plan.period}</p>
      )}

      <p className="mb-6 text-sm leading-relaxed text-slate-400">{plan.description}</p>

      {/* CTA */}
      <Link
        href="/register"
        className={`group mb-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${plan.ctaStyle}`}
      >
        {plan.cta}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Features */}
      <ul className="flex flex-col gap-3">
        {plan.features.map(({ label, included }) => (
          <li key={label} className="flex items-start gap-3">
            {included ? (
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600" />
            )}
            <span className={`text-sm ${included ? 'text-slate-200' : 'text-slate-600'}`}>
              {label}
            </span>
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
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-16">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 60%)' }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-400"
          >
            Pricing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-extrabold tracking-tight md:text-6xl"
          >
            Simple,{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              transparent
            </span>{' '}
            pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-lg text-slate-400"
          >
            Choose the plan that matches your ambition. Upgrade or cancel at any time.
          </motion.p>
        </div>
      </section>

      {/* Plans */}
      <AnimatedSection className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mt-8 grid gap-8 md:grid-cols-3 md:items-start">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>
      </AnimatedSection>

      {/* FAQ */}
      <AnimatedSection className="mx-auto max-w-3xl px-6 pb-24">
        <motion.div variants={fadeUp} className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            Frequently asked{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
        </motion.div>
        <div className="flex flex-col gap-4">
          {faqs.map(({ q, a }) => (
            <motion.div
              key={q}
              variants={fadeUp}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <h3 className="mb-2 font-semibold">{q}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{a}</p>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* Bottom CTA */}
      <AnimatedSection className="pb-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/60 via-violet-900/60 to-purple-900/60 p-12 backdrop-blur-xl"
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
              style={{ background: 'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.4) 0%, transparent 60%)' }}
            />
            <motion.h2 variants={fadeUp} className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Not sure which plan?{' '}
              <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                Start free.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="mx-auto mb-8 max-w-md text-slate-300">
              Try all core features at no cost. Upgrade when you&apos;re ready to go all-in.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/register"
                className="group inline-flex h-14 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition hover:from-indigo-400 hover:to-violet-400"
              >
                Create free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Footer */}
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
            <Link href="/" className="transition hover:text-slate-300">Home</Link>
            <Link href="/login" className="transition hover:text-slate-300">Login</Link>
            <Link href="/register" className="transition hover:text-slate-300">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
