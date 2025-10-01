import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { generateStudyContent } from '@/lib/ai'
import { extractTextFromPDF } from '@/lib/file-processing'
import fs from 'fs'
import path from 'path'

/**
 * POST - Regenerate flashcards for a study pack
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studyPackId = params.id

    // Verify study pack exists and user owns it
    const studyPack = await db.studyPack.findFirst({
      where: {
        id: studyPackId,
        userId
      }
    })

    if (!studyPack) {
      return NextResponse.json(
        { error: 'Study pack not found' },
        { status: 404 }
      )
    }

    if (!studyPack.filePath) {
      return NextResponse.json(
        { error: 'No file associated with this study pack' },
        { status: 400 }
      )
    }

    // Construct absolute file path
    const absolutePath = process.env.NODE_ENV === 'production'
      ? path.join('/app', studyPack.filePath)
      : path.join(process.cwd(), studyPack.filePath)

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json(
        { error: 'Original file not found on server' },
        { status: 404 }
      )
    }

    // Read file and extract text
    let text: string

    if (studyPack.fileType === 'pdf') {
      const buffer = fs.readFileSync(absolutePath)
      const result = await extractTextFromPDF(buffer)
      text = result.text
    } else {
      return NextResponse.json(
        { error: 'Flashcard regeneration is currently only supported for PDF files' },
        { status: 400 }
      )
    }

    // Limit text to prevent token overflow (first 10000 chars)
    const truncatedText = text.substring(0, 10000)

    // Generate new study content with AI
    const studyContent = await generateStudyContent(truncatedText)

    // Update only the flashcards in the database
    const updatedStudyPack = await db.studyPack.update({
      where: { id: studyPackId },
      data: {
        flashcards: studyContent.flashcards as any
      }
    })

    return NextResponse.json({
      message: 'Flashcards regenerated successfully',
      flashcards: studyContent.flashcards,
      count: studyContent.flashcards.length
    })

  } catch (error: any) {
    console.error('Flashcard regeneration error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate flashcards' },
      { status: 500 }
    )
  }
}
