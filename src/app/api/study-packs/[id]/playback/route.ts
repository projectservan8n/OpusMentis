import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch playback progress for a study pack
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const studyPack = await prisma.studyPack.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        lastPlaybackPosition: true,
        lastPlayedAt: true,
      },
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    return NextResponse.json({
      position: studyPack.lastPlaybackPosition || 0,
      lastPlayedAt: studyPack.lastPlayedAt,
    })
  } catch (error) {
    console.error('Error fetching playback progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playback progress' },
      { status: 500 }
    )
  }
}

// POST: Save playback progress for a study pack
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { position } = await request.json()

    if (typeof position !== 'number' || position < 0) {
      return NextResponse.json(
        { error: 'Invalid position value' },
        { status: 400 }
      )
    }

    // Verify ownership
    const studyPack = await prisma.studyPack.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    // Update playback position
    await prisma.studyPack.update({
      where: { id },
      data: {
        lastPlaybackPosition: position,
        lastPlayedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving playback progress:', error)
    return NextResponse.json(
      { error: 'Failed to save playback progress' },
      { status: 500 }
    )
  }
}
