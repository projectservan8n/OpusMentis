import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserSubscriptionTier, getUserSubscriptionExpiry, getUserBillingPeriod } from '@/lib/subscriptions'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tier = await getUserSubscriptionTier(userId)
    const expiresAt = await getUserSubscriptionExpiry(userId)
    const billingPeriod = await getUserBillingPeriod(userId)

    return NextResponse.json({
      tier,
      expiresAt: expiresAt?.toISOString() || null,
      billingPeriod: billingPeriod || 'monthly'
    })

  } catch (error) {
    console.error('Get subscription status error:', error)
    return NextResponse.json({
      error: 'Failed to get subscription status'
    }, { status: 500 })
  }
}