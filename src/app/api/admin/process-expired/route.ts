import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { processExpiredSubscriptions } from '@/lib/subscriptions'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Add admin user check here if needed
    // For now, any logged-in user can trigger this (you may want to restrict this)

    console.log('Processing expired subscriptions...')
    const result = await processExpiredSubscriptions()

    return NextResponse.json({
      message: 'Expired subscriptions processed successfully',
      downgraded: result.downgraded,
      errors: result.errors
    })

  } catch (error) {
    console.error('Process expired subscriptions error:', error)
    return NextResponse.json({
      error: 'Failed to process expired subscriptions'
    }, { status: 500 })
  }
}