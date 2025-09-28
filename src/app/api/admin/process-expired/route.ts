import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { processExpiredSubscriptions } from '@/lib/subscriptions'

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

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

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