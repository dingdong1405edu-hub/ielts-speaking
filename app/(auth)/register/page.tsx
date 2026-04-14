'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(50),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })
      const json = await res.json()
      if (json.error) {
        toast.error(json.error)
      } else {
        toast.success('Đăng ký thành công! Đang chuyển đến trang đăng nhập...')
        setTimeout(() => router.push('/login'), 1500)
      }
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-1">Tạo tài khoản</h1>
      <p className="text-muted-foreground text-sm mb-6">Bắt đầu hành trình học tiếng Trung! 🐉</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Họ tên</Label>
          <Input id="name" placeholder="Nguyễn Văn A" {...register('name')} />
          {errors.name && <p className="text-danger text-xs">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="example@email.com" {...register('email')} />
          {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Mật khẩu</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Tối thiểu 6 ký tự"
              className="pr-11"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-danger text-xs">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-danger text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang tạo...</> : '🚀 Tạo tài khoản'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-5">
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
