/**
 * Prisma seed script — creates a development test user.
 *
 * Usage:
 *   npx ts-node prisma/seed.ts
 *
 * Or add to package.json:
 *   "prisma": { "seed": "npx ts-node prisma/seed.ts" }
 * Then run: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database…')

  // ── Test user ──────────────────────────────────────────────────────────────
  const testEmail = 'test@ielts-speak.ai'
  const testPassword = 'Password123!'
  const passwordHash = await bcryptjs.hash(testPassword, 12)

  const testUser = await prisma.user.upsert({
    where: { email: testEmail },
    update: {
      name: 'Test Student',
      passwordHash,
    },
    create: {
      email: testEmail,
      name: 'Test Student',
      passwordHash,
      plan: 'PRO',
      xp: 500,
      streak: 3,
      lastActiveDate: new Date(),
    },
  })

  console.log(`Test user upserted: ${testUser.email} (id: ${testUser.id})`)

  // ── Beginner progress stubs ────────────────────────────────────────────────
  const lessonIds = ['intro-1', 'intro-2', 'part1-basics', 'pronunciation-1']

  for (const lessonId of lessonIds) {
    await prisma.beginnerProgress.upsert({
      where: {
        userId_lessonId: { userId: testUser.id, lessonId },
      },
      update: {},
      create: {
        userId: testUser.id,
        lessonId,
        completed: true,
        xpEarned: 50,
      },
    })
  }

  console.log(`Created ${lessonIds.length} beginner progress records`)

  // ── Activity log for today ─────────────────────────────────────────────────
  const today = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  await prisma.activityLog.upsert({
    where: {
      userId_date: { userId: testUser.id, date: todayDate },
    },
    update: { minutes: 20, sessions: 2 },
    create: {
      userId: testUser.id,
      date: todayDate,
      minutes: 20,
      sessions: 2,
    },
  })

  console.log('Activity log for today created')

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\nSeed complete.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Email:    ${testEmail}`)
  console.log(`Password: ${testPassword}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
