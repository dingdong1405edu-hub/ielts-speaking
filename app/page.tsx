import Link from 'next/link'
import { Button } from '@/components/ui/button'

const features = [
  { icon: '📚', title: 'Flashcard thông minh', desc: 'Ôn tập từ vựng HSK 1-6 với thuật toán lặp cách quãng SM-2', gradient: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200/60' },
  { icon: '📝', title: 'Ngữ pháp AI', desc: 'AI giải thích ngữ pháp tiếng Việt, tự động sinh bài tập', gradient: 'from-indigo-500/10 to-purple-500/10', border: 'border-indigo-200/60' },
  { icon: '🎧', title: 'Luyện nghe', desc: 'Bài nghe theo trình độ, phụ đề và câu hỏi kiểm tra', gradient: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-200/60' },
  { icon: '🗣️', title: 'Luyện nói', desc: 'AI chấm điểm phát âm thời gian thực, phản hồi chi tiết', gradient: 'from-rose-500/10 to-pink-500/10', border: 'border-rose-200/60' },
  { icon: '📖', title: 'Luyện đọc', desc: 'Đoạn văn theo HSK, click từ tra nghĩa, câu hỏi đọc hiểu', gradient: 'from-sky-500/10 to-blue-500/10', border: 'border-sky-200/60' },
  { icon: '✏️', title: 'Luyện viết', desc: 'Sắp xếp câu, viết tự do và nhận phản hồi từ AI', gradient: 'from-violet-500/10 to-fuchsia-500/10', border: 'border-violet-200/60' },
]

const stats = [
  { value: '6', label: 'Cấp độ HSK', icon: '🎯' },
  { value: '5000+', label: 'Từ vựng', icon: '📚' },
  { value: 'AI', label: 'Chấm bài', icon: '🤖' },
  { value: '24/7', label: 'Gia sư AI', icon: '💬' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
              <span className="font-bold">D</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              DingDong<span className="text-primary">HSK</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Bắt đầu miễn phí</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-border/40 rounded-full px-4 py-2 text-sm font-medium text-foreground/70 mb-8 shadow-soft">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
                Powered by Groq AI &amp; Gemini
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
                Học tiếng Trung{' '}
                <span className="text-gradient">thông minh</span>
                <br />cùng AI
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
                Nền tảng học tiếng Trung toàn diện với AI, gamification
                và phương pháp khoa học. Từ HSK 1 đến HSK 6.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button size="xl" className="w-full sm:w-auto gap-2">
                    Bắt đầu miễn phí
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto">
                    Đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-elevated border border-border/40 p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/40">
              {stats.map((s) => (
                <div key={s.label} className="text-center py-6 px-4">
                  <span className="text-2xl mb-2 block">{s.icon}</span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground">{s.value}</div>
                  <div className="text-xs font-medium text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">Tính năng</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">Học đầy đủ 4 kỹ năng</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Nghe, Nói, Đọc, Viết cùng từ vựng và ngữ pháp — tất cả trong một nền tảng
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`group rounded-2xl border ${f.border} bg-gradient-to-br ${f.gradient} p-6 hover:shadow-card transition-all duration-300`}
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface border-y border-border/40 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Quy trình</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight">3 bước đơn giản</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Đăng ký miễn phí', desc: 'Tạo tài khoản và chọn trình độ HSK hiện tại', color: 'text-primary bg-primary/10 border-primary/20' },
              { step: '02', title: 'Học theo lộ trình', desc: 'Từ vựng, ngữ pháp, luyện tập với AI hướng dẫn', color: 'text-secondary bg-secondary/10 border-secondary/20' },
              { step: '03', title: 'Thi thử HSK', desc: 'Đề thi thử, báo cáo chi tiết, xuất PDF', color: 'text-accent-dark bg-accent/10 border-accent/20' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-14 h-14 rounded-2xl ${item.color} border flex items-center justify-center mx-auto mb-5`}>
                  <span className="text-lg font-extrabold">{item.step}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="gradient-primary rounded-3xl p-10 sm:p-14 text-white">
          <h2 className="text-3xl font-extrabold mb-4">Sẵn sàng học tiếng Trung?</h2>
          <p className="text-white/80 mb-8 max-w-sm mx-auto">
            Tham gia cùng DingDongHSK ngay hôm nay. Hoàn toàn miễn phí.
          </p>
          <Link href="/register">
            <Button size="xl" className="bg-white text-primary hover:bg-white/90 shadow-lg">
              Bắt đầu ngay
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center">
        <p className="text-sm font-bold text-foreground">
          DingDong<span className="text-primary">HSK</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">Học tiếng Trung thông minh với AI</p>
      </footer>
    </div>
  )
}
