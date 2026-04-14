import prisma from '@/lib/prisma'

export const FREE_LIMIT = 25

export interface UserUsage {
  sessionsUsed: number
  remaining: number | typeof Infinity
  isPremiumActive: boolean
  canPractice: boolean
  premiumUntil?: Date | null
}

export async function getUserUsage(userId: string): Promise<UserUsage> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { sessionsUsed: true, isPremium: true, premiumUntil: true },
  })
  if (!user) throw new Error('User not found')

  const isPremiumActive =
    user.isPremium && (!user.premiumUntil || user.premiumUntil > new Date())

  const remaining = isPremiumActive
    ? Infinity
    : Math.max(0, FREE_LIMIT - user.sessionsUsed)

  const canPractice = isPremiumActive || remaining > 0

  return {
    sessionsUsed: user.sessionsUsed,
    remaining,
    isPremiumActive,
    canPractice,
    premiumUntil: user.premiumUntil,
  }
}

export async function incrementUsage(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { sessionsUsed: { increment: 1 } },
  })
}
