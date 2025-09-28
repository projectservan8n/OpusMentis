import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

// GET notes for a study pack
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the study pack
    const studyPack = await db.studyPack.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    const notes = await db.note.findMany({
      where: {
        studyPackId: params.id,
        userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(notes)

  } catch (error) {
    console.error('Get notes error:', error)
    return NextResponse.json({
      error: 'Failed to retrieve notes'
    }, { status: 500 })
  }
}

// POST - Create new note
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, section } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
    }

    // Verify user owns the study pack
    const studyPack = await db.studyPack.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    const note = await db.note.create({
      data: {
        content: content.trim(),
        section: section || 'general',
        userId,
        studyPackId: params.id
      }
    })

    return NextResponse.json(note)

  } catch (error) {
    console.error('Create note error:', error)
    return NextResponse.json({
      error: 'Failed to create note'
    }, { status: 500 })
  }
}