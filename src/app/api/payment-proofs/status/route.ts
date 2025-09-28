import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check for pending and rejected payment proofs
    const pendingProof = await db.paymentProof.findFirst({
      where: {
        userId,
        status: 'pending'
      }
    })

    const rejectedProof = await db.paymentProof.findFirst({
      where: {
        userId,
        status: 'rejected'
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      hasPending: !!pendingProof,
      hasRejected: !!rejectedProof,
      pendingProof: pendingProof ? {
        id: pendingProof.id,
        planRequested: pendingProof.planRequested,
        amount: pendingProof.amount,
        createdAt: pendingProof.createdAt
      } : null,
      rejectedProof: rejectedProof ? {
        id: rejectedProof.id,
        planRequested: rejectedProof.planRequested,
        adminNotes: rejectedProof.adminNotes,
        updatedAt: rejectedProof.updatedAt
      } : null
    })

  } catch (error) {
    console.error('Payment proof status error:', error)
    return NextResponse.json({
      error: 'Failed to get payment proof status'
    }, { status: 500 })
  }
}