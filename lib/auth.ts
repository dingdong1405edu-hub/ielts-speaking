import NextAuth, { type DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import bcryptjs from 'bcryptjs'
import { z } from 'zod'
import prisma from './prisma'

// ---------------------------------------------------------------------------
// Module augmentation — extend the built-in session/JWT types so that
// `session.user.id` and `session.user.plan` are available without casting.
// ---------------------------------------------------------------------------
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      plan: string
    } & DefaultSession['user']
  }

  interface User {
    plan?: string
  }
}

// ---------------------------------------------------------------------------
// Credentials validation schema
// ---------------------------------------------------------------------------
const credentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// ---------------------------------------------------------------------------
// NextAuth v5 configuration
// ---------------------------------------------------------------------------
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'jwt',
    // 30-day rolling session
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        // Validate shape with Zod before touching the database
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              passwordHash: true,
              plan: true,
            },
          })

          if (!user || !user.passwordHash) return null

          const passwordMatch = await bcryptjs.compare(password, user.passwordHash)
          if (!passwordMatch) return null

          // Return a plain object — NextAuth stores this in the JWT via the
          // `jwt` callback below.
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            plan: user.plan,
          }
        } catch (error) {
          console.error('[auth] authorize error:', error)
          return null
        }
      },
    }),
  ],

  callbacks: {
    /**
     * Persist extra fields (id, plan) from the User object into the JWT
     * the first time the token is created (when `user` is present).
     */
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id as string
        token['plan'] = (user.plan as string) ?? 'FREE'
      }
      return token
    },

    /**
     * Expose id and plan on `session.user` so client components can read
     * them without an extra database round-trip.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.plan = (token['plan'] as string) ?? 'FREE'
      }
      return session
    },
  },
})
