import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUpgradePricing } from '@/lib/subscriptions'
import type { SubscriptionTier } from '@/lib/subscription-utils'

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetTier = searchParams.get('tier') as SubscriptionTier
    const targetBillingPeriod = searchParams.get('billingPeriod') as 'monthly' | 'annual'
    const annualPrice = parseInt(searchParams.get('annualPrice') || '0')
    const monthlyPrice = parseInt(searchParams.get('monthlyPrice') || '0')

    if (!targetTier || !targetBillingPeriod || !annualPrice || !monthlyPrice) {
      return NextResponse.json(
        { error: 'Missing required parameters: tier, billingPeriod, annualPrice, monthlyPrice' },
        { status: 400 }
      )
    }

    const pricing = await getUpgradePricing(
      userId,
      targetTier,
      targetBillingPeriod,
      annualPrice,
      monthlyPrice
    )

    return NextResponse.json(pricing)

  } catch (error) {
    console.error('Get upgrade pricing error:', error)
    return NextResponse.json(
      { error: 'Failed to calculate upgrade pricing' },
      { status: 500 }
    )
  }
}
