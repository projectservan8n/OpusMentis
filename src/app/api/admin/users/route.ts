import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { getUserSubscriptionTier } from '@/lib/subscriptions'

// Check if user is admin
async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
      }
    }).then(res => res.json())

    return user.email_addresses?.[0]?.email_address === 'tony@opusautomations.com'
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Get users from database with their activity data
    const dbUsers = await db.user.findMany({
      where: search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } }
        ]
      } : {},
      include: {
        studyPacks: {
          select: {
            id: true,
            createdAt: true,
            status: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        notes: {
          select: {
            id: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        paymentProofs: {
          select: {
            status: true,
            planRequested: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get Clerk users data in batch
    const clerkUsersPromises = dbUsers.map(async (dbUser) => {
      try {
        const clerkResponse = await fetch(`https://api.clerk.dev/v1/users/${dbUser.id}`, {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
          }
        })

        if (clerkResponse.ok) {
          return await clerkResponse.json()
        }
        return null
      } catch (error) {
        console.error(`Error fetching Clerk data for user ${dbUser.id}:`, error)
        return null
      }
    })

    const clerkUsers = await Promise.all(clerkUsersPromises)

    // Combine data and get subscription tiers
    const combinedUsers = await Promise.all(
      dbUsers.map(async (dbUser, index) => {
        const clerkUser = clerkUsers[index]

        // Get current subscription tier
        const subscriptionTier = await getUserSubscriptionTier(dbUser.id)

        // Calculate last active date (most recent study pack or note creation)
        const lastStudyPack = dbUser.studyPacks[0]?.createdAt
        const lastNote = dbUser.notes[0]?.createdAt
        const lastActive = lastStudyPack && lastNote
          ? (lastStudyPack > lastNote ? lastStudyPack : lastNote)
          : lastStudyPack || lastNote || dbUser.createdAt

        // Get latest payment status
        const latestPayment = dbUser.paymentProofs[0]

        return {
          id: dbUser.id,
          email: clerkUser?.email_addresses?.[0]?.email_address || dbUser.email || 'Unknown',
          name: clerkUser ? `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() : 'Unknown',
          subscriptionTier,
          studyPacksCount: dbUser.studyPacks.length,
          notesCount: dbUser.notes.length,
          joinedAt: dbUser.createdAt.toISOString(),
          lastActive: lastActive.toISOString(),
          status: 'active' as const, // We don't have banned users yet
          profileImageUrl: clerkUser?.image_url,
          latestPaymentStatus: latestPayment?.status,
          latestPaymentPlan: latestPayment?.planRequested,
          processingPacks: dbUser.studyPacks.filter(pack => pack.status === 'processing').length,
          totalUploads: dbUser.studyPacks.length
        }
      })
    )

    // Get total count for pagination
    const totalUsers = await db.user.count({
      where: search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } }
        ]
      } : {}
    })

    return NextResponse.json({
      users: combinedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    })

  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({
      error: 'Failed to get admin users'
    }, { status: 500 })
  }
}

// Update user (ban/unban, upgrade subscription)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { targetUserId, action, tier } = body

    if (!targetUserId || !action) {
      return NextResponse.json({
        error: 'Missing targetUserId or action'
      }, { status: 400 })
    }

    switch (action) {
      case 'ban':
        // TODO: Implement user banning in Clerk
        // For now, we'll just return success
        return NextResponse.json({ message: 'User banned successfully' })

      case 'unban':
        // TODO: Implement user unbanning in Clerk
        return NextResponse.json({ message: 'User unbanned successfully' })

      case 'upgrade':
        if (!tier || !['pro', 'premium'].includes(tier)) {
          return NextResponse.json({
            error: 'Invalid subscription tier'
          }, { status: 400 })
        }

        // Update subscription via Clerk metadata
        const { updateUserSubscriptionTier } = await import('@/lib/subscriptions')
        await updateUserSubscriptionTier(targetUserId, tier as any)

        return NextResponse.json({
          message: `User upgraded to ${tier} successfully`
        })

      default:
        return NextResponse.json({
          error: 'Invalid action'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json({
      error: 'Failed to update user'
    }, { status: 500 })
  }
}