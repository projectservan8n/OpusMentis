// Client-safe subscription utilities that don't depend on server-only imports

export type SubscriptionTier = 'free' | 'pro' | 'premium'
export type ClerkSubscriptionTier = 'free_plan' | 'pro' | 'premium'

export interface PlanLimits {
  maxUploadsPerMonth: number
  maxPdfPages: number
  maxAudioVideoMinutes: number
  canExportFlashcards: boolean
  canShareTeams: boolean
}

// Helper functions to convert between Clerk and app naming conventions
export function clerkTierToAppTier(clerkTier: string): SubscriptionTier {
  switch (clerkTier) {
    case 'free_plan':
      return 'free'
    case 'pro':
      return 'pro'
    case 'premium':
      return 'premium'
    default:
      return 'free'
  }
}

export function appTierToClerkTier(appTier: SubscriptionTier): ClerkSubscriptionTier {
  switch (appTier) {
    case 'free':
      return 'free_plan'
    case 'pro':
      return 'pro'
    case 'premium':
      return 'premium'
    default:
      return 'free_plan'
  }
}

export const PLAN_LIMITS: Record<SubscriptionTier, PlanLimits> = {
  free: {
    maxUploadsPerMonth: 20,
    maxPdfPages: 50,
    maxAudioVideoMinutes: 30,
    canExportFlashcards: false,
    canShareTeams: false
  },
  pro: {
    maxUploadsPerMonth: 200,
    maxPdfPages: 200,
    maxAudioVideoMinutes: 180,
    canExportFlashcards: true,
    canShareTeams: false
  },
  premium: {
    maxUploadsPerMonth: 1000,
    maxPdfPages: 500,
    maxAudioVideoMinutes: 600,
    canExportFlashcards: true,
    canShareTeams: true
  }
}

// Get file size limit based on subscription tier
export function getMaxFileSizeForPlan(subscriptionTier: SubscriptionTier): number {
  const limits = {
    free: 100 * 1024 * 1024,   // 100MB
    pro: 250 * 1024 * 1024,    // 250MB
    premium: 500 * 1024 * 1024 // 500MB
  }

  return limits[subscriptionTier] || limits.free
}