import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-hero flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white text-xl shadow-sm group-hover:shadow-md transition-shadow">
          <span className="font-bold">D</span>
        </div>
        <span className="font-extrabold text-xl tracking-tight">
          DingDong<span className="text-primary">HSK</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-border/40 shadow-elevated p-8">
        {children}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Học tiếng Trung thông minh cùng AI
      </p>
    </div>
  )
}
