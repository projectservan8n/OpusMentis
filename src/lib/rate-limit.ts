// Rate limiting and abuse prevention
import { db } from '@/lib/db'

export interface RateLimitConfig {
  maxUploadsPerHour: number
  maxUploadsPerDay: number
  maxFileSizePerHour: number // in bytes
  suspiciousThreshold: number // triggers review
}

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  free: {
    maxUploadsPerHour: 10,
    maxUploadsPerDay: 20,
    maxFileSizePerHour: 500 * 1024 * 1024, // 500MB per hour
    suspiciousThreshold: 15 // 15 uploads in quick succession
  },
  pro: {
    maxUploadsPerHour: 50,
    maxUploadsPerDay: 200,
    maxFileSizePerHour: 5 * 1024 * 1024 * 1024, // 5GB per hour
    suspiciousThreshold: 50
  },
  premium: {
    maxUploadsPerHour: 100,
    maxUploadsPerDay: 500,
    maxFileSizePerHour: 10 * 1024 * 1024 * 1024, // 10GB per hour
    suspiciousThreshold: 100
  }
}

export async function checkRateLimit(
  userId: string,
  tier: string,
  fileSize: number
): Promise<{ allowed: boolean; reason?: string; retryAfter?: number }> {
  const config = RATE_LIMITS[tier] || RATE_LIMITS.free

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Check uploads in last hour
  const uploadsLastHour = await db.usageLog.count({
    where: {
      userId,
      action: 'upload',
      createdAt: { gte: oneHourAgo }
    }
  })

  if (uploadsLastHour >= config.maxUploadsPerHour) {
    const oldestUpload = await db.usageLog.findFirst({
      where: {
        userId,
        action: 'upload',
        createdAt: { gte: oneHourAgo }
      },
      orderBy: { createdAt: 'asc' }
    })

    const retryAfter = oldestUpload
      ? Math.ceil((new Date(oldestUpload.createdAt).getTime() + 60 * 60 * 1000 - now.getTime()) / 1000)
      : 3600

    return {
      allowed: false,
      reason: `Rate limit exceeded. Maximum ${config.maxUploadsPerHour} uploads per hour. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      retryAfter
    }
  }

  // Check uploads in last day
  const uploadsLastDay = await db.usageLog.count({
    where: {
      userId,
      action: 'upload',
      createdAt: { gte: oneDayAgo }
    }
  })

  if (uploadsLastDay >= config.maxUploadsPerDay) {
    return {
      allowed: false,
      reason: `Daily upload limit reached (${config.maxUploadsPerDay}). Resets at midnight Pacific time.`
    }
  }

  // Check total file size in last hour
  const uploadsWithSize = await db.usageLog.findMany({
    where: {
      userId,
      action: 'upload',
      createdAt: { gte: oneHourAgo }
    },
    select: { fileSize: true }
  })

  const totalSizeLastHour = uploadsWithSize.reduce((sum, log) => sum + (log.fileSize || 0), 0)

  if (totalSizeLastHour + fileSize > config.maxFileSizePerHour) {
    return {
      allowed: false,
      reason: `Hourly bandwidth limit exceeded. Maximum ${Math.round(config.maxFileSizePerHour / (1024 * 1024))}MB per hour.`
    }
  }

  // Detect suspicious patterns (many uploads in short time)
  const uploadsLast5Min = await db.usageLog.count({
    where: {
      userId,
      action: 'upload',
      createdAt: { gte: new Date(now.getTime() - 5 * 60 * 1000) }
    }
  })

  if (uploadsLast5Min >= config.suspiciousThreshold) {
    // Log for admin review but don't block (could be legitimate batch upload)
    console.warn(`[ABUSE WARNING] User ${userId} uploaded ${uploadsLast5Min} files in 5 minutes`)

    // Flag user for review
    await flagUserForReview(userId, 'rapid_uploads', {
      uploadsInLast5Min: uploadsLast5Min,
      tier
    })
  }

  return { allowed: true }
}

async function flagUserForReview(userId: string, reason: string, metadata: any) {
  // Create a flag in the database for admin review
  try {
    await db.usageLog.create({
      data: {
        userId,
        action: 'flagged_for_review',
        fileType: reason,
        fileSize: JSON.stringify(metadata).length
      }
    })
  } catch (error) {
    console.error('Failed to flag user:', error)
  }
}

// Detect duplicate file uploads (same file uploaded multiple times)
export async function detectDuplicateUpload(
  userId: string,
  fileName: string,
  fileSize: number
): Promise<{ isDuplicate: boolean; existingStudyPackId?: string }> {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const duplicateStudyPack = await db.studyPack.findFirst({
    where: {
      userId,
      originalFileName: fileName,
      fileSize,
      createdAt: { gte: last24Hours }
    },
    select: { id: true }
  })

  if (duplicateStudyPack) {
    return {
      isDuplicate: true,
      existingStudyPackId: duplicateStudyPack.id
    }
  }

  return { isDuplicate: false }
}

// Check for suspicious content (e.g., empty files, too small, too large for content type)
export function detectSuspiciousFile(
  fileType: string,
  fileSize: number,
  fileName: string
): { suspicious: boolean; reason?: string } {
  // Empty or near-empty files
  if (fileSize < 100) {
    return { suspicious: true, reason: 'File too small (possibly empty)' }
  }

  // Suspiciously large PDFs (>50MB is unusual for text PDFs)
  if (fileType === 'pdf' && fileSize > 50 * 1024 * 1024) {
    console.warn(`Large PDF detected: ${fileName} (${fileSize} bytes)`)
  }

  // Videos that are too small (likely corrupted or fake)
  if (fileType === 'video' && fileSize < 1024 * 1024) {
    return { suspicious: true, reason: 'Video file suspiciously small' }
  }

  // Check for unusual file names (random characters, potential spam)
  const hasWeirdChars = /[^\w\s\-\.\(\)]/g.test(fileName)
  if (hasWeirdChars) {
    console.warn(`Unusual filename detected: ${fileName}`)
  }

  return { suspicious: false }
}
