'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function signInAction(email: string, password: string) {
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
          return { error: 'Invalid email or password.' }
        default:
          return { error: 'Something went wrong. Please try again.' }
      }
    }
    // signIn throws a redirect — re-throw so Next.js handles it
    throw err
  }
}
