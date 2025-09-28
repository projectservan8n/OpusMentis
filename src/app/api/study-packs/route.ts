import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studyPacks = await db.studyPack.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        description: true,
        originalFileName: true,
        fileType: true,
        fileSize: true,
        status: true,
        processingError: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            notes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(studyPacks)

  } catch (error) {
    console.error('Get study packs error:', error)
    return NextResponse.json({
      error: 'Failed to retrieve study packs'
    }, { status: 500 })
  }
}