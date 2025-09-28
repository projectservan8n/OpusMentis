import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'
import { deleteFile } from '@/lib/file-processing'

// GET study pack details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studyPack = await db.studyPack.findFirst({
      where: {
        id: params.id,
        userId
      },
      include: {
        notes: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    // Parse JSON fields
    const response = {
      ...studyPack,
      topics: studyPack.topics ? JSON.parse(studyPack.topics) : [],
      flashcards: studyPack.flashcards ? JSON.parse(studyPack.flashcards) : [],
      kanbanTasks: studyPack.kanbanTasks ? JSON.parse(studyPack.kanbanTasks) : []
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Get study pack error:', error)
    return NextResponse.json({
      error: 'Failed to retrieve study pack'
    }, { status: 500 })
  }
}

// DELETE study pack
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studyPack = await db.studyPack.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    // Delete associated file if exists
    if (studyPack.filePath) {
      await deleteFile(studyPack.filePath)
    }

    // Delete study pack (cascade will delete notes)
    await db.studyPack.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Study pack deleted successfully' })

  } catch (error) {
    console.error('Delete study pack error:', error)
    return NextResponse.json({
      error: 'Failed to delete study pack'
    }, { status: 500 })
  }
}

// PATCH - Update kanban tasks or other fields
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
    const { kanbanTasks, title, description } = body

    const studyPack = await db.studyPack.findFirst({
      where: {
        id: params.id,
        userId
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    const updateData: any = {}

    if (kanbanTasks) {
      updateData.kanbanTasks = JSON.stringify(kanbanTasks)
    }

    if (title) {
      updateData.title = title
    }

    if (description !== undefined) {
      updateData.description = description
    }

    const updatedStudyPack = await db.studyPack.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(updatedStudyPack)

  } catch (error) {
    console.error('Update study pack error:', error)
    return NextResponse.json({
      error: 'Failed to update study pack'
    }, { status: 500 })
  }
}