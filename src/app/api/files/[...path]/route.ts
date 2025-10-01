import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

/**
 * GET - Serve uploaded files (PDFs, images, etc.)
 * Path: /api/files/[...path]
 * Example: /api/files/uploads/1759318534347_Jeffrey_D._Sachs_Deep_Research.pdf
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Reconstruct the file path
    const filePath = params.path.join('/')

    // Security: Ensure the path is within uploads directory
    if (!filePath.startsWith('uploads/')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Verify user has access to this file by checking if they own a study pack with this file
    const studyPack = await db.studyPack.findFirst({
      where: {
        userId,
        filePath
      }
    })

    if (!studyPack) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 })
    }

    // Construct absolute file path
    const absolutePath = path.join(process.cwd(), filePath)

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return NextResponse.json({ error: 'File not found on server' }, { status: 404 })
    }

    // Read file
    const fileBuffer = fs.readFileSync(absolutePath)

    // Determine content type based on file extension
    const ext = path.extname(absolutePath).toLowerCase()
    const contentTypeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.wav': 'audio/wav',
      '.webm': 'video/webm'
    }

    const contentType = contentTypeMap[ext] || 'application/octet-stream'

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
        'Cache-Control': 'private, max-age=31536000, immutable'
      }
    })

  } catch (error: any) {
    console.error('File serving error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to serve file' },
      { status: 500 }
    )
  }
}
