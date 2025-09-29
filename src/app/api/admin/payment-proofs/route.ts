import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { updateUserSubscriptionTier } from '@/lib/subscriptions'
import { notifyPaymentApproval, notifyPaymentRejection } from '@/lib/discord'

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
    const status = searchParams.get('status') || 'pending'

    const paymentProofs = await db.paymentProof.findMany({
      where: {
        status: status as any
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get Clerk user data for each payment proof
    const proofsWithUserData = await Promise.all(
      paymentProofs.map(async (proof) => {
        try {
          const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${proof.userId}`, {
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
            }
          }).then(res => res.json())

          return {
            ...proof,
            clerkUser: {
              firstName: clerkUser.first_name,
              lastName: clerkUser.last_name,
              email: clerkUser.email_addresses?.[0]?.email_address,
              imageUrl: clerkUser.image_url
            }
          }
        } catch {
          return {
            ...proof,
            clerkUser: {
              firstName: 'Unknown',
              lastName: 'User',
              email: 'unknown@email.com',
              imageUrl: null
            }
          }
        }
      })
    )

    return NextResponse.json(proofsWithUserData)

  } catch (error) {
    console.error('Admin get payment proofs error:', error)
    return NextResponse.json({
      error: 'Failed to get payment proofs'
    }, { status: 500 })
  }
}

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
    const { paymentProofId, action, adminNotes } = body

    if (!paymentProofId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({
        error: 'Invalid paymentProofId or action'
      }, { status: 400 })
    }

    // Get the payment proof
    const paymentProof = await db.paymentProof.findUnique({
      where: { id: paymentProofId }
    })

    if (!paymentProof) {
      return NextResponse.json({
        error: 'Payment proof not found'
      }, { status: 404 })
    }

    if (paymentProof.status !== 'pending') {
      return NextResponse.json({
        error: 'Payment proof is not pending'
      }, { status: 400 })
    }

    // Get user data from Clerk for Discord notification
    const clerkUser = await fetch(`https://api.clerk.dev/v1/users/${paymentProof.userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
      }
    }).then(res => res.json()).catch(() => null)

    const userEmail = clerkUser?.email_addresses?.[0]?.email_address || 'Unknown'
    const userName = clerkUser ? `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || 'Unknown User' : 'Unknown User'

    if (action === 'approve') {
      // Update payment proof status
      await db.paymentProof.update({
        where: { id: paymentProofId },
        data: {
          status: 'approved',
          adminNotes: adminNotes || 'Payment approved'
        }
      })

      // Update user's subscription tier in Clerk metadata
      await updateUserSubscriptionTier(paymentProof.userId, paymentProof.planRequested as any)

      // Send Discord notification
      try {
        await notifyPaymentApproval(
          userEmail,
          userName,
          paymentProof.planRequested,
          paymentProof.amount,
          paymentProof.referenceNumber || undefined
        )
      } catch (error) {
        console.error('Failed to send Discord approval notification:', error)
        // Don't fail the request if Discord notification fails
      }

      return NextResponse.json({
        message: 'Payment approved and user upgraded successfully'
      })

    } else if (action === 'reject') {
      // Update payment proof status
      await db.paymentProof.update({
        where: { id: paymentProofId },
        data: {
          status: 'rejected',
          adminNotes: adminNotes || 'Payment rejected'
        }
      })

      // Send Discord notification
      try {
        await notifyPaymentRejection(
          userEmail,
          userName,
          paymentProof.planRequested,
          paymentProof.amount,
          adminNotes || 'Payment rejected',
          paymentProof.referenceNumber || undefined
        )
      } catch (error) {
        console.error('Failed to send Discord rejection notification:', error)
        // Don't fail the request if Discord notification fails
      }

      return NextResponse.json({
        message: 'Payment rejected successfully'
      })
    }

  } catch (error) {
    console.error('Admin update payment proof error:', error)
    return NextResponse.json({
      error: 'Failed to update payment proof'
    }, { status: 500 })
  }
}