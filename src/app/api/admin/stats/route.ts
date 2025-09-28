import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

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

    // Get real statistics from database
    const [
      totalUsers,
      totalStudyPacks,
      processingPacks,
      totalNotes,
      approvedPayments,
      pendingPayments
    ] = await Promise.all([
      // Total users in database
      db.user.count(),

      // Total study packs
      db.studyPack.count(),

      // Processing study packs
      db.studyPack.count({
        where: { status: 'processing' }
      }),

      // Total notes
      db.note.count(),

      // Approved payments (revenue indicator)
      db.paymentProof.count({
        where: { status: 'approved' }
      }),

      // Pending payments
      db.paymentProof.count({
        where: { status: 'pending' }
      })
    ])

    // Get revenue data (estimate based on approved payments)
    const revenueData = await db.paymentProof.findMany({
      where: {
        status: 'approved',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // This month
        }
      },
      select: {
        amount: true,
        planRequested: true
      }
    })

    // Calculate revenue this month
    const revenueThisMonth = revenueData.reduce((total, payment) => {
      const amount = parseFloat(payment.amount.replace(/[^\d.]/g, '')) || 0
      return total + amount
    }, 0)

    // Get subscription distribution
    const subscriptionStats = await db.user.groupBy({
      by: ['subscriptionTier'],
      _count: {
        subscriptionTier: true
      }
    })

    // Calculate active subscriptions (non-free users)
    const activeSubscriptions = subscriptionStats
      .filter(stat => stat.subscriptionTier !== 'free')
      .reduce((total, stat) => total + stat._count.subscriptionTier, 0)

    // Get recent activity (uploads this month)
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const uploadsThisMonth = await db.usageLog.count({
      where: {
        action: 'upload',
        createdAt: { gte: currentMonth }
      }
    })

    return NextResponse.json({
      totalUsers,
      totalStudyPacks,
      processingPacks,
      totalNotes,
      revenueThisMonth,
      activeSubscriptions,
      pendingPayments,
      uploadsThisMonth,
      subscriptionStats: subscriptionStats.reduce((acc, stat) => {
        acc[stat.subscriptionTier || 'free'] = stat._count.subscriptionTier
        return acc
      }, {} as Record<string, number>)
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({
      error: 'Failed to get admin statistics'
    }, { status: 500 })
  }
}