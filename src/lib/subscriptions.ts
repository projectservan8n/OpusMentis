import { db } from './db'
import { clerkClient } from '@clerk/nextjs'

export type SubscriptionTier = 'free' | 'pro' | 'premium'

export interface PlanLimits {
  maxUploadsPerMonth: number
  maxPdfPages: number
  maxAudioVideoMinutes: number
  canExportFlashcards: boolean
  canShareTeams: boolean
}

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  free: {
    maxUploadsPerMonth: 3,
    maxPdfPages: 10,
    maxAudioVideoMinutes: 10,
    canExportFlashcards: false,
    canShareTeams: false
  },
  pro: {
    maxUploadsPerMonth: -1, // unlimited
    maxPdfPages: 50,
    maxAudioVideoMinutes: 60,
    canExportFlashcards: true,
    canShareTeams: false
  },
  premium: {
    maxUploadsPerMonth: -1, // unlimited
    maxPdfPages: 200,
    maxAudioVideoMinutes: 180,
    canExportFlashcards: true,
    canShareTeams: true
  }
}

// Get user's subscription tier from Clerk metadata
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  try {
    const user = await clerkClient.users.getUser(userId)
    const plan = user.publicMetadata?.plan as SubscriptionTier
    return plan || 'free'
  } catch (error) {
    console.error('Error getting user subscription tier:', error)
    return 'free'
  }
}

// Update user's subscription tier in Clerk metadata
export async function updateUserSubscriptionTier(userId: string, tier: SubscriptionTier) {
  try {
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        plan: tier
      }
    })
  } catch (error) {
    console.error('Error updating user subscription tier:', error)
    throw new Error('Failed to update subscription tier')
  }
}

export async function checkUploadLimits(
  userId: string,
  fileType: string,
  fileSize: number,
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

// Get file size limit based on subscription tier
export function getMaxFileSizeForPlan(subscriptionTier: SubscriptionTier): number {
  const limits = {
    free: 10 * 1024 * 1024,   // 10MB
    pro: 50 * 1024 * 1024,    // 50MB
    premium: 200 * 1024 * 1024 // 200MB
  }

  return limits[subscriptionTier] || limits.free
}