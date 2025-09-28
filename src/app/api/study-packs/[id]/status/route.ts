import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

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
      select: {
        id: true,
        title: true,
        status: true,
        processingError: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    return NextResponse.json(studyPack)

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({
      error: 'Failed to check status'
    }, { status: 500 })
  }
}