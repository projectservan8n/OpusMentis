import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get both personal packs AND organization packs
    const studyPacks = await db.studyPack.findMany({
      where: {
        OR: [
          { userId }, // My personal packs
          ...(orgId ? [{ organizationId: orgId }] : []) // Team packs if in an organization
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        originalFileName: true,
        fileType: true,
        fileSize: true,
        status: true,
        processingError: true,
        userId: true, // Include to show who owns it
        organizationId: true, // Include to show if shared
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