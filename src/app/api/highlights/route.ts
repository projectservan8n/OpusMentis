import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db as prisma } from '@/lib/db'

// GET /api/highlights?studyPackId=xxx - Get all highlights for a study pack
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const studyPackId = searchParams.get('studyPackId')

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'studyPackId is required' },
        { status: 400 }
      )
    }

    // Verify study pack belongs to user
    const studyPack = await prisma.studyPack.findFirst({
      where: {
        id: studyPackId,
        userId
      }
    })

    if (!studyPack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Get all highlights for this study pack
    const highlights = await prisma.highlight.findMany({
      where: {
        studyPackId,
        userId
      },
      orderBy: [
        { pageNumber: 'asc' },
        { createdAt: 'asc' }
      ]
    })

    return NextResponse.json(highlights)

  } catch (error) {
    console.error('Error fetching highlights:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/highlights - Create a new highlight
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      studyPackId,
      pageNumber,
      coordinates,
      color,
      text,
      note
    } = body

    // Validation
    if (!studyPackId || !pageNumber || !coordinates || !color || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify study pack belongs to user
    const studyPack = await prisma.studyPack.findFirst({
      where: {
        id: studyPackId,
        userId
      }
    })

    if (!studyPack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    // Create highlight
    const highlight = await prisma.highlight.create({
      data: {
        studyPackId,
        userId,
        pageNumber: parseInt(pageNumber),
        coordinates,
        color,
        text,
        note: note || null
      }
    })

    return NextResponse.json(highlight, { status: 201 })

  } catch (error) {
    console.error('Error creating highlight:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/highlights?id=xxx - Delete a highlight
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const highlightId = searchParams.get('id')

    if (!highlightId) {
      return NextResponse.json(
        { error: 'Highlight ID is required' },
        { status: 400 }
      )
    }

    // Verify highlight belongs to user
    const highlight = await prisma.highlight.findFirst({
      where: {
        id: highlightId,
        userId
      }
    })

    if (!highlight) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      )
    }

    // Delete highlight
    await prisma.highlight.delete({
      where: { id: highlightId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting highlight:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/highlights?id=xxx - Update highlight note
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const highlightId = searchParams.get('id')

    if (!highlightId) {
      return NextResponse.json(
        { error: 'Highlight ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { note } = body

    // Verify highlight belongs to user
    const highlight = await prisma.highlight.findFirst({
      where: {
        id: highlightId,
        userId
      }
    })

    if (!highlight) {
      return NextResponse.json(
        { error: 'Highlight not found' },
        { status: 404 }
      )
    }

    // Update highlight
    const updated = await prisma.highlight.update({
      where: { id: highlightId },
      data: { note: note || null }
    })

    return NextResponse.json(updated)

  } catch (error) {
    console.error('Error updating highlight:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
