import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const PAGE_SIZE = 20

// ---------------------------------------------------------------------------
// GET /api/vocabulary?search=&topic=&page=
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const search = searchParams.get('search')?.trim() ?? ''
    const topic = searchParams.get('topic')?.trim() ?? ''
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const skip = (page - 1) * PAGE_SIZE

    const where = {
      userId: session.user.id,
      ...(search.length > 0
        ? {
            OR: [
              { word: { contains: search, mode: 'insensitive' as const } },
              { definition: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(topic.length > 0
        ? { topic: { contains: topic, mode: 'insensitive' as const } }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.vocabEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.vocabEntry.count({ where }),
    ])

    return NextResponse.json({
      vocabulary: items,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    })
  } catch (err) {
    console.error('[vocabulary GET] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/vocabulary
// Body: { word, type, definition, example, topic, sessionId? }
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const body = await req.json()
    const { word, type, definition, example, topic, sessionId } = body as {
      word?: string
      type?: string
      definition?: string
      example?: string
      topic?: string
      sessionId?: string
    }

    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      return NextResponse.json({ error: 'word is required.' }, { status: 400 })
    }
    if (!definition || typeof definition !== 'string' || definition.trim().length === 0) {
      return NextResponse.json({ error: 'definition is required.' }, { status: 400 })
    }

    const entry = await prisma.vocabEntry.create({
      data: {
        userId: session.user.id,
        word: word.trim(),
        type: type?.trim() ?? null,
        definition: definition.trim(),
        example: example?.trim() ?? null,
        topic: topic?.trim() ?? null,
        sessionId: sessionId ?? null,
      },
    })

    return NextResponse.json({ entry }, { status: 201 })
  } catch (err) {
    console.error('[vocabulary POST] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/vocabulary?id=xxx
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const id = req.nextUrl.searchParams.get('id')?.trim()
    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required.' }, { status: 400 })
    }

    // Verify ownership before deleting
    const entry = await prisma.vocabEntry.findUnique({ where: { id } })
    if (!entry) {
      return NextResponse.json({ error: 'Vocabulary entry not found.' }, { status: 404 })
    }
    if (entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    await prisma.vocabEntry.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[vocabulary DELETE] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
