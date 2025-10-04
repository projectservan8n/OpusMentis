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

    // Construct absolute file path based on environment
    const absolutePath = process.env.NODE_ENV === 'production'
      ? path.join('/app', filePath)  // Railway volume mounted at /app/uploads
      : path.join(process.cwd(), filePath)  // Local development

    // Check if file exists locally
    if (!fs.existsSync(absolutePath)) {
      // If running locally and file doesn't exist, proxy from production
      if (process.env.NODE_ENV !== 'production') {
        const productionUrl = `https://opusmentis.app/api/files/${filePath}`
        const response = await fetch(productionUrl, {
          headers: {
            'Cookie': request.headers.get('cookie') || ''
          }
        })

        if (!response.ok) {
          return NextResponse.json({ error: 'File not found on production server' }, { status: 404 })
        }

        const fileBuffer = await response.arrayBuffer()
        const contentType = response.headers.get('content-type') || 'application/octet-stream'

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': response.headers.get('content-disposition') || `inline; filename="${path.basename(filePath)}"`,
            'Cache-Control': 'private, max-age=31536000, immutable'
          }
        })
      }

      return NextResponse.json({ error: 'File not found on server' }, { status: 404 })
    }

    // Get file stats for size and range support
    const stats = fs.statSync(absolutePath)
    const fileSize = stats.size

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

    // Handle Range requests (required for Safari video/audio playback)
    const rangeHeader = request.headers.get('range')

    if (rangeHeader) {
      // Parse range header (e.g., "bytes=0-1023")
      const parts = rangeHeader.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunkSize = end - start + 1

      // Read only the requested range
      const fileStream = fs.createReadStream(absolutePath, { start, end })
      const chunks: Buffer[] = []

      for await (const chunk of fileStream) {
        chunks.push(chunk)
      }

      const fileBuffer = Buffer.concat(chunks)

      // Return 206 Partial Content with range headers
      return new NextResponse(fileBuffer, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Disposition': `inline; filename="${path.basename(filePath)}"`,
          'Cache-Control': 'private, max-age=31536000, immutable'
        }
      })
    }

    // No range request - return entire file
    const fileBuffer = fs.readFileSync(absolutePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
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
