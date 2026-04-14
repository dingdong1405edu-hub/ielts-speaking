'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Loader2, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Tiny reusable input
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
  hint,
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
  hint?: string
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
          className={`w-full rounded-xl border bg-white/[0.05] py-3 pl-10 pr-10 text-sm text-white placeholder-slate-600 outline-none transition focus:ring-2 ${
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
              : 'border-white/10 focus:border-blue-500 focus:ring-blue-500/20'
          }`}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-400">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {!error && hint && <p className="text-xs text-slate-600">{hint}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Password strength bar
// ---------------------------------------------------------------------------
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const len = password.length
  const hasUpper = /[A-Z]/.test(password)
  const hasNum = /[0-9]/.test(password)
  const score = (len >= 8 ? 1 : 0) + (len >= 12 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0)
  const labels = ['Yếu', 'Trung bình', 'Khá mạnh', 'Mạnh']
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : 'bg-white/10'}`}
          />
        ))}
      </div>
      <span className="text-xs text-slate-400">{labels[score - 1] ?? ''}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Register page
// ---------------------------------------------------------------------------
export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function setField(key: keyof typeof form) {
    return (v: string) => {
      setForm((prev) => ({ ...prev, [key]: v }))
      if (errors[key]) setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
    }
  }

  function validate(): Record<string, string> {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên.'
    if (!form.email.trim()) e.email = 'Vui lòng nhập email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ.'
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu.'
    else if (form.password.length < 8) e.password = 'Mật khẩu cần ít nhất 8 ký tự.'
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp.'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError('')
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setServerError(data.error ?? 'Đăng ký thất bại. Vui lòng thử lại.')
        return
      }
      setSuccess(true)
      setTimeout(() => router.push('/login?registered=1'), 1800)
    } catch {
      setServerError('Đã có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center"
      >
        <CheckCircle2 className="h-14 w-14 text-emerald-400" />
        <div>
          <h2 className="text-xl font-bold text-white">Đăng ký thành công!</h2>
          <p className="mt-2 text-sm text-slate-400">Đang chuyển sang trang đăng nhập…</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Tạo tài khoản miễn phí</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Bắt đầu 25 lần luyện tập miễn phí — không cần thẻ tín dụng
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Server error */}
          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{serverError}</span>
            </motion.div>
          )}

          {/* Name */}
          <FormInput
            id="name"
            label="Họ và tên"
            type="text"
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            value={form.name}
            onChange={setField('name')}
            icon={User}
            error={errors.name}
          />

          {/* Email */}
          <FormInput
            id="email"
            label="Địa chỉ email"
            type="email"
            placeholder="ban@example.com"
            autoComplete="email"
            value={form.email}
            onChange={setField('email')}
            icon={Mail}
            error={errors.email}
          />

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <FormInput
              id="password"
              label="Mật khẩu"
              type={showPw ? 'text' : 'password'}
              placeholder="Tối thiểu 8 ký tự"
              autoComplete="new-password"
              value={form.password}
              onChange={setField('password')}
              icon={Lock}
              error={errors.password}
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
            {form.password && <PasswordStrength password={form.password} />}
          </div>

          {/* Confirm password */}
          <FormInput
            id="confirm"
            label="Xác nhận mật khẩu"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            value={form.confirm}
            onChange={setField('confirm')}
            icon={Lock}
            error={errors.confirm}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-slate-500 transition hover:text-slate-300"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                Đang tạo tài khoản…
              </>
            ) : (
              'Tạo tài khoản'
            )}
          </motion.button>
        </form>
      </div>

      {/* Login link */}
      <p className="mt-6 text-center text-sm text-slate-400">
        Đã có tài khoản?{' '}
        <Link
          href="/login"
          className="font-semibold text-blue-400 underline underline-offset-4 transition hover:text-blue-300"
        >
          Đăng nhập
        </Link>
      </p>
    </motion.div>
  )
}
