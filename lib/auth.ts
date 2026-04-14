import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
      xp: number
      streak: number
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.password) return null
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!isValid) return null
        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On first sign-in, user object is present — fetch xp/streak from DB once
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { xp: true, streak: true },
        })
        if (dbUser) {
          token.xp = dbUser.xp
          token.streak = dbUser.streak
        } else {
          token.xp = 0
          token.streak = 0
        }
      }
      // Allow client to update xp/streak without full re-sign-in
      if (trigger === 'update' && session) {
        if (typeof session.xp === 'number') token.xp = session.xp
        if (typeof session.streak === 'number') token.streak = session.streak
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.xp = (token.xp as number) ?? 0
        session.user.streak = (token.streak as number) ?? 0
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { lastActiveAt: true, streak: true },
      })
      if (!dbUser) return
      const lastActive = new Date(dbUser.lastActiveAt)
      lastActive.setHours(0, 0, 0, 0)
      const diffDays = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      )
      let newStreak = dbUser.streak
      if (diffDays === 1) newStreak += 1
      else if (diffDays > 1) newStreak = 1
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date(), streak: newStreak },
      })
    },
  },
})
