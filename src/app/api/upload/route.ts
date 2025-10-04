import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import {
  checkUploadLimits,
  logUsage,
  getUserSubscriptionTier,
  getMaxFileSizeForPlan
} from '@/lib/subscriptions'
import {
  saveUploadedFile,
  getFileType,
  isValidFileType,
  validateFileSize,
  extractTextFromPDF,
  extractTextFromImage,
  getMediaDuration,
  estimateProcessingTime
} from '@/lib/file-processing'
import {
  transcribeAudio,
  generateStudyContent,
  chunkText
} from '@/lib/ai'
import {
  checkRateLimit,
  detectDuplicateUpload,
  detectSuspiciousFile
} from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const fileType = getFileType(file.name)
    if (!isValidFileType(file.name)) {
      return NextResponse.json({
        error: 'Unsupported file type. Please upload PDF, audio, video, or image files.'
      }, { status: 400 })
    }

    // Get user's subscription tier from Clerk
    const subscriptionTier = await getUserSubscriptionTier(userId)

    // 1. Check rate limits (prevent abuse)
    const rateLimitCheck = await checkRateLimit(userId, subscriptionTier, file.size)
    if (!rateLimitCheck.allowed) {
      return NextResponse.json({
        error: rateLimitCheck.reason,
        retryAfter: rateLimitCheck.retryAfter
      }, { status: 429 })
    }

    // 2. Check for duplicate uploads
    const duplicateCheck = await detectDuplicateUpload(userId, file.name, file.size)
    if (duplicateCheck.isDuplicate) {
      return NextResponse.json({
        error: 'You uploaded this exact file in the last 24 hours. Please check your existing study packs.',
        existingStudyPackId: duplicateCheck.existingStudyPackId
      }, { status: 409 })
    }

    // 3. Detect suspicious files
    const suspiciousCheck = detectSuspiciousFile(fileType, file.size, file.name)
    if (suspiciousCheck.suspicious) {
      console.warn(`[SUSPICIOUS FILE] User ${userId}: ${suspiciousCheck.reason}`)
      // Don't block, but log for review
    }

    // 4. Validate file size for user's plan
    const maxFileSize = getMaxFileSizeForPlan(subscriptionTier)
    if (!validateFileSize(file.size, maxFileSize)) {
      return NextResponse.json({
        error: `File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit for ${subscriptionTier} plan`
      }, { status: 400 })
    }

    // Get actual file metadata for limit checking
    let actualPages: number | undefined
    let estimatedDuration: number | undefined
    const buffer = Buffer.from(await file.arrayBuffer())

    if (fileType === 'pdf') {
      // Get ACTUAL page count from PDF
      try {
        const pdfResult = await extractTextFromPDF(buffer)
        actualPages = pdfResult.metadata?.pageCount
      } catch (error) {
        console.error('Failed to get PDF page count:', error)
        return NextResponse.json({
          error: 'Failed to read PDF file. File may be corrupted.'
        }, { status: 400 })
      }
    } else if (fileType === 'audio' || fileType === 'video') {
      // Rough estimate: 1MB ≈ 1 minute for audio, 10MB ≈ 1 minute for video
      const multiplier = fileType === 'audio' ? 1 : 10
      estimatedDuration = Math.ceil(file.size / (1024 * 1024 * multiplier))
    }

    // Check upload limits with ACTUAL page count
    const limitCheck = await checkUploadLimits(
      userId,
      fileType,
      actualPages,
      estimatedDuration
    )

    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: limitCheck.reason,
        upgradeRequired: limitCheck.upgradeRequired
      }, { status: 403 })
    }

    // Save file (buffer already created above for PDF parsing)
    const filePath = await saveUploadedFile(buffer, file.name)

    // Create study pack record
    const studyPack = await db.studyPack.create({
      data: {
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        originalFileName: file.name,
        fileType,
        fileSize: file.size,
        filePath,
        userId,
        status: 'processing'
      }
    })

    // Log usage
    await logUsage(userId, 'upload', fileType, file.size)

    // Start processing asynchronously
    processFileAsync(studyPack.id, filePath, fileType, buffer, file.name)

    return NextResponse.json({
      studyPackId: studyPack.id,
      estimatedProcessingTime: estimateProcessingTime(file.size, fileType),
      message: 'File uploaded successfully. Processing will begin shortly.'
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Upload failed. Please try again.'
    }, { status: 500 })
  }
}

// Async processing function (MVP: runs in same process, production: queue system)
async function processFileAsync(studyPackId: string, filePath: string, fileType: string, buffer: Buffer, originalFileName?: string) {
  try {
    let extractedText = ''
    let processingError: string | null = null

    // Extract text based on file type
    switch (fileType) {
      case 'pdf':
        const pdfResult = await extractTextFromPDF(buffer)
        extractedText = pdfResult.text
        break

      case 'image':
        const imageResult = await extractTextFromImage(buffer)
        extractedText = imageResult.text
        break

      case 'audio':
      case 'video':
        extractedText = await transcribeAudio(buffer, originalFileName)
        break

      case 'text':
        extractedText = buffer.toString('utf-8')
        break

      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }

    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from the file')
    }

    // Generate study content with AI
    const studyContent = await generateStudyContent(extractedText)

    // Update study pack with results
    await db.studyPack.update({
      where: { id: studyPackId },
      data: {
        status: 'completed',
        summary: studyContent.summary,
        topics: JSON.stringify(studyContent.topics),
        flashcards: JSON.stringify(studyContent.flashcards),
        kanbanTasks: JSON.stringify(studyContent.kanbanTasks),
        transcript: extractedText, // Store raw transcript with timestamps for audio/video
        processingError: null
      }
    })

    // Log successful processing
    const studyPack = await db.studyPack.findUnique({
      where: { id: studyPackId },
      select: { userId: true }
    })

    if (studyPack) {
      await logUsage(studyPack.userId, 'process', fileType)
    }

  } catch (error) {
    console.error('Processing error:', error)

    // Update study pack with error
    await db.studyPack.update({
      where: { id: studyPackId },
      data: {
        status: 'failed',
        processingError: error instanceof Error ? error.message : 'Processing failed'
      }
    })
  }
}