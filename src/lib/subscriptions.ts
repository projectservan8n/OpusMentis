import { db } from './db'
import { clerkClient } from '@clerk/nextjs/server'
import {
  SubscriptionTier,
  ClerkSubscriptionTier,
  PlanLimits,
  PLAN_LIMITS,
  clerkTierToAppTier,
  appTierToClerkTier,
  getMaxFileSizeForPlan
} from './subscription-utils'

// Re-export client-safe utilities for backward compatibility
export type { SubscriptionTier, ClerkSubscriptionTier, PlanLimits }
export { PLAN_LIMITS, clerkTierToAppTier, appTierToClerkTier, getMaxFileSizeForPlan }

// Get user's subscription tier from Clerk metadata
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  try {
    const user = await clerkClient.users.getUser(userId)
    const clerkPlan = user.publicMetadata?.plan as string
    const currentTier = clerkTierToAppTier(clerkPlan || 'free_plan')

    // If user has a paid plan, check if it's expired
    if (currentTier !== 'free') {
      const isExpired = await checkUserSubscriptionExpiry(userId)
      if (isExpired) {
        // Auto-downgrade expired subscription
        await downgradeExpiredSubscription(userId)
        return 'free'
      }
    }

    return currentTier
  } catch (error) {
    console.error('Error getting user subscription tier:', error)
    return 'free'
  }
}

// Update user's subscription tier in Clerk metadata
export async function updateUserSubscriptionTier(userId: string, tier: SubscriptionTier) {
  try {
    const clerkTier = appTierToClerkTier(tier)

    // Calculate expiration date (30 days from now for paid plans)
    const expirationDate = tier === 'free' ? null : new Date()
    if (expirationDate && tier !== 'free') {
      expirationDate.setDate(expirationDate.getDate() + 30)
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: clerkTier
      },
      privateMetadata: {
        subscriptionExpiresAt: expirationDate?.toISOString() || null,
        subscriptionStartedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating user subscription tier:', error)
    throw new Error('Failed to update subscription tier')
  }
}

// Check if user's subscription has expired
export async function checkUserSubscriptionExpiry(userId: string): Promise<boolean> {
  try {
    const user = await clerkClient.users.getUser(userId)
    const expiresAt = user.privateMetadata?.subscriptionExpiresAt as string

    if (!expiresAt) {
      return false // Free plan or no expiration set
    }

    const expirationDate = new Date(expiresAt)
    return new Date() > expirationDate
  } catch (error) {
    console.error('Error checking subscription expiry:', error)
    return false
  }
}

// Get user's subscription expiration date
export async function getUserSubscriptionExpiry(userId: string): Promise<Date | null> {
  try {
    const user = await clerkClient.users.getUser(userId)
    const expiresAt = user.privateMetadata?.subscriptionExpiresAt as string

    return expiresAt ? new Date(expiresAt) : null
  } catch (error) {
    console.error('Error getting subscription expiry:', error)
    return null
  }
}

// Downgrade expired subscriptions to free
export async function downgradeExpiredSubscription(userId: string): Promise<void> {
  try {
    const isExpired = await checkUserSubscriptionExpiry(userId)

    if (isExpired) {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          plan: 'free_plan'
        },
        privateMetadata: {
          subscriptionExpiresAt: null,
          subscriptionStartedAt: null,
          lastDowngradedAt: new Date().toISOString()
        }
      })

      console.log(`Downgraded expired subscription for user: ${userId}`)
    }
  } catch (error) {
    console.error('Error downgrading expired subscription:', error)
    throw error
  }
}

// Check and downgrade all expired subscriptions (for admin/cron use)
export async function processExpiredSubscriptions(): Promise<{ downgraded: number; errors: number }> {
  let downgraded = 0
  let errors = 0

  try {
    // Get all users with active subscriptions
    const users = await clerkClient.users.getUserList({
      limit: 500 // Adjust as needed
    })

    for (const user of users.data) {
      try {
        const plan = user.publicMetadata?.plan as string

        // Skip free plans
        if (!plan || plan === 'free_plan') continue

        const isExpired = await checkUserSubscriptionExpiry(user.id)
        if (isExpired) {
          await downgradeExpiredSubscription(user.id)
          downgraded++
        }
      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error)
        errors++
      }
    }

    return { downgraded, errors }
  } catch (error) {
    console.error('Error processing expired subscriptions:', error)
    return { downgraded, errors: errors + 1 }
  }
}

export async function checkUploadLimits(
  userId: string,
  fileType: string,
  estimatedPages?: number,
  estimatedDurationMinutes?: number
): Promise<{ allowed: boolean; reason?: string; upgradeRequired?: SubscriptionTier }> {

  // Get user's current subscription tier from Clerk
  const subscriptionTier = await getUserSubscriptionTier(userId)
  const limits = PLAN_LIMITS[subscriptionTier]

  // Ensure user exists in our database for usage tracking
  let user = await db.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    user = await db.user.create({
      data: {
        id: userId,
        email: '', // Will be updated from Clerk webhook
      }
    })
  }

  // Check monthly upload limits (for free tier)
  if (limits.maxUploadsPerMonth > 0) {
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const uploadsThisMonth = await db.usageLog.count({
      where: {
        userId,
        action: 'upload',
        createdAt: { gte: currentMonth }
      }
    })

    if (uploadsThisMonth >= limits.maxUploadsPerMonth) {
      return {
        allowed: false,
        reason: `Monthly upload limit of ${limits.maxUploadsPerMonth} reached`,
        upgradeRequired: 'pro'
      }
    }
  }

  // Check PDF page limits
  if (fileType === 'pdf' && estimatedPages) {
    if (estimatedPages > limits.maxPdfPages) {
      return {
        allowed: false,
        reason: `PDF exceeds ${limits.maxPdfPages} page limit`,
        upgradeRequired: subscriptionTier === 'free' ? 'pro' : 'premium'
      }
    }
  }

  // Check audio/video duration limits
  if ((fileType === 'audio' || fileType === 'video') && estimatedDurationMinutes) {
    if (estimatedDurationMinutes > limits.maxAudioVideoMinutes) {
      return {
        allowed: false,
        reason: `${fileType} exceeds ${limits.maxAudioVideoMinutes} minute limit`,
        upgradeRequired: subscriptionTier === 'free' ? 'pro' : 'premium'
      }
    }
  }

  return { allowed: true }
}

export async function logUsage(
  userId: string,
  action: string,
  fileType?: string,
  fileSize?: number
) {
  await db.usageLog.create({
    data: {
      userId,
      action,
      fileType,
      fileSize
    }
  })
}

export async function resetMonthlyUsage(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return

  const now = new Date()
  const lastReset = user.lastResetDate

  // Check if we need to reset (new month)
  if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
    await db.user.update({
      where: { id: userId },
      data: {
        monthlyUploads: 0,
        lastResetDate: now
      }
    })
  }
}

