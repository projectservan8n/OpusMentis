import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

/**
 * GET - Debug endpoint to check file storage status
 * This helps verify if files are actually stored in the Railway volume
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (you can add admin check here if needed)
    // For now, anyone authenticated can check

    const uploadsDir = process.env.NODE_ENV === 'production'
      ? '/app/uploads'
      : path.join(process.cwd(), 'uploads')

    // Check if uploads directory exists
    const dirExists = fs.existsSync(uploadsDir)

    let files: string[] = []
    let fileDetails: any[] = []

    if (dirExists) {
      files = fs.readdirSync(uploadsDir)
      fileDetails = files.map(file => {
        const filePath = path.join(uploadsDir, file)
        const stats = fs.statSync(filePath)
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        }
      })
    }

    // Get all study packs from database
    const studyPacks = await db.studyPack.findMany({
      select: {
        id: true,
        title: true,
        filePath: true,
        fileSize: true,
        createdAt: true,
        userId: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    })

    // Check which database files actually exist on disk
    const dbFileStatus = studyPacks.map(pack => {
      if (!pack.filePath) {
        return {
          ...pack,
          fileExists: false,
          reason: 'No file path in database'
        }
      }

      // Construct absolute path
      let absolutePath: string

      // Handle both old and new path formats
      if (pack.filePath.startsWith('app/uploads/')) {
        // Old format: app/uploads/file.pdf
        absolutePath = process.env.NODE_ENV === 'production'
          ? `/${pack.filePath}` // /app/uploads/file.pdf
          : path.join(process.cwd(), pack.filePath.replace('app/', '')) // ./uploads/file.pdf
      } else if (pack.filePath.startsWith('uploads/')) {
        // New format: uploads/file.pdf
        absolutePath = process.env.NODE_ENV === 'production'
          ? path.join('/app', pack.filePath) // /app/uploads/file.pdf
          : path.join(process.cwd(), pack.filePath) // ./uploads/file.pdf
      } else if (pack.filePath.startsWith('/app/uploads/')) {
        // Absolute path format
        absolutePath = pack.filePath
      } else {
        return {
          ...pack,
          fileExists: false,
          reason: 'Invalid path format'
        }
      }

      const exists = fs.existsSync(absolutePath)

      return {
        id: pack.id,
        title: pack.title,
        dbPath: pack.filePath,
        absolutePath,
        fileExists: exists,
        fileSize: pack.fileSize,
        createdAt: pack.createdAt
      }
    })

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      uploadsDirectory: uploadsDir,
      directoryExists: dirExists,
      filesOnDisk: files.length,
      fileDetails: fileDetails.slice(0, 10), // First 10 files
      databaseRecords: studyPacks.length,
      fileStatus: dbFileStatus,
      summary: {
        totalFilesOnDisk: files.length,
        totalDbRecords: studyPacks.length,
        filesExisting: dbFileStatus.filter(f => f.fileExists).length,
        filesMissing: dbFileStatus.filter(f => !f.fileExists).length
      }
    })

  } catch (error: any) {
    console.error('Storage debug error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check storage' },
      { status: 500 }
    )
  }
}
