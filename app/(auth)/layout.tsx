import { Mic, CheckCircle } from 'lucide-react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Auth layout — split panel (left decorative / right form)
// ---------------------------------------------------------------------------
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0B1120]">
      {/* ================================================================ */}
      {/* LEFT PANEL — decorative, hidden on mobile                         */}
      {/* ================================================================ */}
      <div className="relative hidden w-[45%] flex-shrink-0 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, #0d1b3e 0%, #0f2554 35%, #1a1260 65%, #0d0a2e 100%)',
          }}
        />

        {/* Mesh overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        {/* Floating orb top-right */}
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 65%)' }}
        />
        {/* Floating orb bottom-left */}
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 65%)' }}
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/40">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">IELTS Speaking AI</span>
          </Link>
        </div>

        {/* Middle: headline + bullets */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl">
              Master IELTS Speaking
              <br />
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                với AI thông minh
              </span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-blue-200/70">
              Hơn 10,000 học viên đã cải thiện band score nhờ phản hồi AI tức thì và lộ trình
              luyện tập có hệ thống.
            </p>
          </div>

          <ul className="space-y-3.5">
            {[
              'AI chấm điểm theo đúng chuẩn IELTS thật',
              'Phản hồi chi tiết: Fluency, Vocab, Grammar, Pronunciation',
              'Luyện tập không giới hạn với Premium',
              'Theo dõi tiến độ và cải thiện từng ngày',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-blue-100/80">
                <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400" />
                {item}
              </li>
            ))}
          </ul>

          {/* Stats mini bar */}
          <div className="flex gap-8 border-t border-white/10 pt-6">
            {[
              { v: '10K+', l: 'Học viên' },
              { v: '500K+', l: 'Câu trả lời' },
              { v: '+1.5', l: 'Band TB' },
            ].map(({ v, l }) => (
              <div key={l}>
                <p className="text-xl font-bold text-white">{v}</p>
                <p className="text-xs text-blue-300/70">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: copyright */}
        <p className="relative z-10 text-xs text-blue-300/40">
          &copy; {new Date().getFullYear()} IELTS Speaking AI
        </p>
      </div>

      {/* ================================================================ */}
      {/* RIGHT PANEL — form                                                */}
      {/* ================================================================ */}
      <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
        {/* Mobile-only logo */}
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">IELTS Speaking AI</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
