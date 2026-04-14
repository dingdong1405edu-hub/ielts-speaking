'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { signInAction } from '@/lib/actions'
import Link from 'next/link'
import { Loader2, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'

// ---------------------------------------------------------------------------
// Input component
// ---------------------------------------------------------------------------
function FormInput({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  value,
  onChange,
  icon: Icon,
  error,
  rightSlot,
}: {
  id: string
  label: string
  type: string
  placeholder: string
  autoComplete: string
  value: string
  onChange: (v: string) => void
  icon: React.ElementType
  error?: string
  rightSlot?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-white/[0.05] py-3 pl-10 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-2 ${rightSlot ? 'pr-11' : 'pr-4'} ${
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && <p className="flex items-center gap-1 text-xs text-red-400"><AlertCircle className="h-3 w-3" />{error}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Login page
// ---------------------------------------------------------------------------
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData()
    formData.set('email', email)
    formData.set('password', password)

    try {
      const result = await signInAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch {
      // signIn throws a NEXT_REDIRECT on success — that's expected, ignore it
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Chào mừng trở lại</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Đăng nhập để tiếp tục luyện tập IELTS Speaking
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Email */}
          <FormInput
            id="email"
            label="Địa chỉ email"
            type="email"
            placeholder="ban@example.com"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            icon={Mail}
          />

          {/* Password */}
          <FormInput
            id="password"
            label="Mật khẩu"
            type={showPw ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            icon={Lock}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="text-slate-500 transition hover:text-slate-300"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.015 }}
            whileTap={{ scale: loading ? 1 : 0.985 }}
            className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang đăng nhập…
              </>
            ) : (
              'Đăng nhập'
            )}
          </motion.button>
        </form>
      </div>

      {/* Register link */}
      <p className="mt-6 text-center text-sm text-slate-400">
        Chưa có tài khoản?{' '}
        <Link
          href="/register"
          className="font-semibold text-blue-400 underline underline-offset-4 transition hover:text-blue-300"
        >
          Đăng ký ngay
        </Link>
      </p>
    </motion.div>
  )
}
