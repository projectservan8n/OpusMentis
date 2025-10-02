import pdfParse from 'pdf-parse'
import path from 'path'
import fs from 'fs/promises'

export interface ProcessedFile {
  text: string
  metadata: {
    pageCount?: number
    duration?: number // in seconds for audio/video
    wordCount: number
  }
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ProcessedFile> {
  try {
    const data = await pdfParse(buffer)

    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        wordCount: data.text.split(/\s+/).length
      }
    }
  } catch (error) {
    console.error('PDF parsing failed:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export async function extractTextFromImage(buffer: Buffer): Promise<ProcessedFile> {
  try {
    // Use GPT-4o Vision for better image understanding
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build'
    })

    // Convert buffer to base64
    const base64Image = buffer.toString('base64')
    const imageDataUrl = `data:image/jpeg;base64,${base64Image}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract all text from this image. If it contains diagrams, charts, or handwritten notes, describe them clearly. If it contains formulas or equations, transcribe them accurately. Return only the extracted text and descriptions, no additional commentary.'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
                detail: 'high' // High detail for better accuracy
              }
            }
          ]
        }
      ],
      max_tokens: 2000
    })

    const extractedText = response.choices[0]?.message?.content || ''

    return {
      text: extractedText.trim(),
      metadata: {
        wordCount: extractedText.trim().split(/\s+/).length
      }
    }
  } catch (error) {
    console.error('Image analysis failed:', error)
    throw new Error('Failed to extract text from image')
  }
}

// MVP: Basic file type detection
export function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()

  const typeMap: Record<string, string> = {
    '.pdf': 'pdf',
    '.doc': 'document',
    '.docx': 'document',
    '.txt': 'text',
    '.mp3': 'audio',
    '.wav': 'audio',
    '.m4a': 'audio',
    '.mp4': 'video',
    '.mov': 'video',
    '.avi': 'video',
    '.webm': 'video',
    '.jpg': 'image',
    '.jpeg': 'image',
    '.png': 'image',
    '.gif': 'image',
    '.bmp': 'image'
  }

  return typeMap[ext] || 'unknown'
}

export function isValidFileType(filename: string): boolean {
  const fileType = getFileType(filename)
  return ['pdf', 'document', 'text', 'audio', 'video', 'image'].includes(fileType)
}

export function estimateProcessingTime(fileSize: number, fileType: string): number {
  // Estimates in seconds based on file type and size
  const baseTime = {
    pdf: 5,
    document: 3,
    text: 1,
    audio: 30, // Whisper processing time
    video: 60, // Video + Whisper processing
    image: 10  // OCR processing
  }

  const sizeMultiplier = Math.ceil(fileSize / (1024 * 1024)) // Per MB
  return (baseTime[fileType as keyof typeof baseTime] || 10) * Math.max(1, sizeMultiplier)
}

// File storage using Railway Volume (mounted at /app/uploads)
export async function saveUploadedFile(buffer: Buffer, filename: string): Promise<string> {
  // Use /app/uploads for Railway Volume, fallback to local for development
  const uploadsDir = process.env.NODE_ENV === 'production'
    ? '/app/uploads'
    : path.join(process.cwd(), 'uploads')

  try {
    await fs.access(uploadsDir)
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true })
  }

  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  const timestamp = Date.now()
  const savedFilename = `${timestamp}_${sanitizedFilename}`
  const filePath = path.join(uploadsDir, savedFilename)

  await fs.writeFile(filePath, buffer)

  console.log(`File saved to: ${filePath}`)

  // Return relative path for database storage (e.g., "uploads/123_file.pdf")
  const relativePath = `uploads/${savedFilename}`
  return relativePath
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath)
  } catch (error) {
    console.error('Failed to delete file:', error)
    // Don't throw - file might already be deleted
  }
}

// Get file duration for audio/video (requires ffmpeg)
export async function getMediaDuration(filePath: string): Promise<number> {
  // MVP: Return estimated duration, real implementation would use ffprobe
  try {
    const stats = await fs.stat(filePath)
    // Rough estimate: 1MB ≈ 1 minute for audio, 10MB ≈ 1 minute for video
    return Math.ceil(stats.size / (1024 * 1024))
  } catch {
    return 0
  }
}

export function validateFileSize(size: number, maxSize: number = 50 * 1024 * 1024): boolean {
  return size <= maxSize
}

