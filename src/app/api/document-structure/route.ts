import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db as prisma } from '@/lib/db'
import { analyzePDFDocument } from '@/lib/document-analyzer'

/**
 * POST - Analyze document structure for a study pack
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studyPackId } = body

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'studyPackId is required' },
        { status: 400 }
      )
    }

    // Verify study pack exists and user owns it
    const studyPack = await prisma.studyPack.findFirst({
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

    // Only analyze PDF files
    if (studyPack.fileType !== 'pdf') {
      return NextResponse.json(
        { error: 'Only PDF files can be analyzed for structure' },
        { status: 400 }
      )
    }

    if (!studyPack.filePath) {
      return NextResponse.json(
        { error: 'PDF file path not found' },
        { status: 400 }
      )
    }

    // Check if structure already exists
    const existingStructure = await prisma.documentStructure.findUnique({
      where: { studyPackId }
    })

    if (existingStructure) {
      return NextResponse.json(existingStructure)
    }

    // Analyze PDF document
    const structure = await analyzePDFDocument(studyPack.filePath)

    // Save to database
    const documentStructure = await prisma.documentStructure.create({
      data: {
        studyPackId,
        chapters: structure.chapters as any,
        sections: structure.sections as any,
        keyTerms: structure.keyTerms as any,
        totalPages: structure.totalPages
      }
    })

    return NextResponse.json(documentStructure)

  } catch (error: any) {
    console.error('Document structure analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze document structure' },
      { status: 500 }
    )
  }
}

/**
 * GET - Fetch document structure for a study pack
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const studyPackId = request.nextUrl.searchParams.get('studyPackId')

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'studyPackId is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const studyPack = await prisma.studyPack.findFirst({
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

    // Get document structure
    const structure = await prisma.documentStructure.findUnique({
      where: { studyPackId }
    })

    if (!structure) {
      return NextResponse.json(
        { error: 'Document structure not found. Please analyze the document first.' },
        { status: 404 }
      )
    }

    return NextResponse.json(structure)

  } catch (error: any) {
    console.error('Get document structure error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch document structure' },
      { status: 500 }
    )
  }
}
