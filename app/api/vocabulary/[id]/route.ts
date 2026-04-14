import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ---------------------------------------------------------------------------
// PATCH /api/vocabulary/[id]
// Body: { learned?: boolean, word?, type?, definition?, example?, topic? }
// Partial update of a vocabulary entry
// ---------------------------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { id } = await params

    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 })
    }

    // Verify ownership
    const entry = await prisma.vocabEntry.findUnique({ where: { id } })
    if (!entry) {
      return NextResponse.json({ error: 'Vocabulary entry not found.' }, { status: 404 })
    }
    if (entry.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
    }

    const body = await req.json()
    const { learned, word, type, definition, example, topic } = body as {
      learned?: boolean
      word?: string
      type?: string
      definition?: string
      example?: string
      topic?: string
    }

    // Build update data — only include defined fields
    const data: Record<string, unknown> = {}
    if (learned !== undefined && typeof learned === 'boolean') data.learned = learned
    if (word !== undefined && typeof word === 'string') data.word = word.trim()
    if (type !== undefined) data.type = typeof type === 'string' ? type.trim() : null
    if (definition !== undefined && typeof definition === 'string') data.definition = definition.trim()
    if (example !== undefined) data.example = typeof example === 'string' ? example.trim() : null
    if (topic !== undefined) data.topic = typeof topic === 'string' ? topic.trim() : null

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 })
    }

    const updated = await prisma.vocabEntry.update({
      where: { id },
      data,
    })

    return NextResponse.json({ entry: updated })
  } catch (err) {
    console.error('[vocabulary PATCH] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
