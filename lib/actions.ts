'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function signInAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',
    })
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return { error: 'Email hoặc mật khẩu không đúng.' }
        default:
          return { error: 'Đã có lỗi xảy ra. Vui lòng thử lại.' }
      }
    }
    // signIn throws a NEXT_REDIRECT on success — re-throw so Next.js handles it
    throw err
  }
}
