import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getUserSubscriptionTier } from '@/lib/subscriptions'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studyPackId = params.id

    // Get study pack
    const studyPack = await db.studyPack.findUnique({
      where: { id: studyPackId }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    // Only owner can share
    if (studyPack.userId !== userId) {
      return NextResponse.json({ error: 'Only the owner can share this study pack' }, { status: 403 })
    }

    // Check if user has Premium tier
    const tier = await getUserSubscriptionTier(userId)
    if (tier !== 'premium') {
      return NextResponse.json({
        error: 'Team sharing is a Premium feature. Please upgrade to share with your team.',
        upgradeRequired: true
      }, { status: 403 })
    }

    // Must be in an organization
    if (!orgId) {
      return NextResponse.json({
        error: 'Please create or join an organization first to share study packs.'
      }, { status: 400 })
    }

    // Share with organization
    await db.studyPack.update({
      where: { id: studyPackId },
      data: { organizationId: orgId }
    })

    return NextResponse.json({
      message: 'Study pack shared with your team successfully!',
      organizationId: orgId
    })

  } catch (error) {
    console.error('Share study pack error:', error)
    return NextResponse.json({
      error: 'Failed to share study pack'
    }, { status: 500 })
  }
}

// Unshare from organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studyPackId = params.id

    // Get study pack
    const studyPack = await db.studyPack.findUnique({
      where: { id: studyPackId }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'Study pack not found' }, { status: 404 })
    }

    // Only owner can unshare
    if (studyPack.userId !== userId) {
      return NextResponse.json({ error: 'Only the owner can unshare this study pack' }, { status: 403 })
    }

    // Unshare (make it personal again)
    await db.studyPack.update({
      where: { id: studyPackId },
      data: { organizationId: null }
    })

    return NextResponse.json({
      message: 'Study pack is now private (unshared from team)'
    })

  } catch (error) {
    console.error('Unshare study pack error:', error)
    return NextResponse.json({
      error: 'Failed to unshare study pack'
    }, { status: 500 })
  }
}
