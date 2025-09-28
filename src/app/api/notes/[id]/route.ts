import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

// PATCH - Update note
export async function PATCH(
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

    const note = await db.note.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const updatedNote = await db.note.update({
      where: { id: params.id },
      data: {
        content: content.trim(),
        section: section || note.section
      }
    })

    return NextResponse.json(updatedNote)

  } catch (error) {
    console.error('Update note error:', error)
    return NextResponse.json({
      error: 'Failed to update note'
    }, { status: 500 })
  }
}

// DELETE note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const note = await db.note.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    await db.note.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Note deleted successfully' })

  } catch (error) {
    console.error('Delete note error:', error)
    return NextResponse.json({
      error: 'Failed to delete note'
    }, { status: 500 })
  }
}