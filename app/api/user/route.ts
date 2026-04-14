import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ---------------------------------------------------------------------------
// GET /api/user
// Returns the current user's profile
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        xp: true,
        streak: true,
        lastActiveDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (err) {
    console.error('[user GET] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/user
// Body: { name?, image? }
// Updates the user's display name and/or avatar image URL
// ---------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { name, image } = body as { name?: string; image?: string }

    // Build update payload — only include provided fields
    const data: { name?: string; image?: string } = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json({ error: 'name must be a non-empty string.' }, { status: 400 })
      }
      data.name = name.trim()
    }

    if (image !== undefined) {
      if (typeof image !== 'string' || image.trim().length === 0) {
        return NextResponse.json({ error: 'image must be a non-empty string.' }, { status: 400 })
      }
      // Basic URL validation
      try {
        new URL(image.trim())
      } catch {
        return NextResponse.json({ error: 'image must be a valid URL.' }, { status: 400 })
      }
      data.image = image.trim()
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'At least one field (name or image) must be provided.' },
        { status: 400 },
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true,
        xp: true,
        streak: true,
        lastActiveDate: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (err) {
    console.error('[user PATCH] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
