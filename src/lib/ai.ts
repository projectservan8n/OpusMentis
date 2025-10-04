import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Primary: OpenRouter with gpt-oss-20b (free tier)
// Fallback: OpenAI with gpt-4o-mini (paid)
const useOpenRouter = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'placeholder-key-for-build'

// Client for text generation (OpenRouter or OpenAI)
const openai = new OpenAI({
  apiKey: useOpenRouter
    ? process.env.OPENROUTER_API_KEY
    : process.env.OPENAI_API_KEY || 'placeholder-key-for-build',
  baseURL: useOpenRouter
    ? 'https://openrouter.ai/api/v1'
    : 'https://api.openai.com/v1',
  defaultHeaders: useOpenRouter
    ? {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://opusmentis.app',
        'X-Title': 'StudyFlow AI'
      }
    : undefined
})

// Google Gemini client for audio/video transcription (99% cheaper than Whisper!)
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'placeholder-key-for-build')

// Model selection based on provider
const AI_MODEL = useOpenRouter ? 'openai/gpt-oss-20b:free' : 'gpt-4o-mini'
const GEMINI_MODEL = 'gemini-2.5-flash' // For audio/video transcription - supports audio, video, image, text input

export interface StudyPackContent {
  summary: string
  topics: string[]
  flashcards: Array<{
    id: string
    question: string
    answer: string
    difficulty: 'easy' | 'medium' | 'hard'
  }>
  kanbanTasks: Array<{
    id: string
    title: string
    description: string
    column: 'to-learn' | 'learning' | 'mastered'
    priority: 'low' | 'medium' | 'high'
  }>
}

export async function transcribeAudio(audioBuffer: Buffer, filename?: string): Promise<string> {
  // Retry logic for network errors
  const maxRetries = 2
  let lastError: any

  // Determine MIME type from filename if provided
  let mimeType = 'audio/mpeg' // default
  if (filename) {
    const ext = filename.toLowerCase().split('.').pop()
    const mimeMap: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'm4a': 'audio/mp4',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'webm': 'video/webm'
    }
    mimeType = mimeMap[ext || ''] || 'audio/mpeg'
  }

  console.log(`Transcribing with MIME type: ${mimeType} (filename: ${filename})`)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use Google Gemini 1.5 Flash for audio/video transcription (48x cheaper than Whisper!)
      const model = gemini.getGenerativeModel({ model: GEMINI_MODEL })

      // Convert buffer to base64 for Gemini API
      const base64Audio = audioBuffer.toString('base64')

      // Send audio/video with prompt to transcribe with timestamps
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType
          }
        },
        `Please transcribe this ${mimeType.startsWith('video') ? 'video' : 'audio'} accurately with timestamps. Format each segment as:
[MM:SS] Transcribed text here
[MM:SS] Next segment here

Include timestamps approximately every 5-10 seconds or at natural speech breaks. Be as accurate as possible with the timing and transcription.`
      ])

      const response = await result.response
      const text = response.text()

      if (!text || text.trim().length === 0) {
        throw new Error('Gemini returned empty transcription')
      }

      return text.trim()
    } catch (error: any) {
      lastError = error
      console.error(`Audio transcription attempt ${attempt} failed:`, error)

      // Only retry on network errors (ECONNRESET, timeout, etc)
      const isNetworkError = error?.cause?.code === 'ECONNRESET' ||
                            error?.cause?.code === 'ETIMEDOUT' ||
                            error?.code === 'ECONNRESET' ||
                            error?.code === 'ETIMEDOUT' ||
                            error?.message?.includes('fetch failed')

      if (!isNetworkError || attempt === maxRetries) {
        throw new Error(`Failed to transcribe audio after ${attempt} attempt(s): ${error?.message || 'Unknown error'}`)
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }

  throw new Error(`Failed to transcribe audio: ${lastError?.message || 'Unknown error'}`)
}

export async function generateStudyContent(text: string): Promise<StudyPackContent> {
  try {
    // Optimized prompt with reduced token usage
    const prompt = `Analyze this text and create study materials as JSON:

${text}

JSON format:
{
  "summary": "2-3 paragraph summary of key concepts",
  "topics": ["main", "topics"],
  "flashcards": [{"id":"fc-1","question":"Q","answer":"A","difficulty":"easy|medium|hard"}],
  "kanbanTasks": [{"id":"t-1","title":"Task","description":"Focus","column":"to-learn","priority":"low|medium|high"}]
}

Requirements:
- 8-15 flashcards (varied difficulty)
- 6-10 tasks (all "to-learn", actionable)
- Clear, concise language`

    const completion = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: 'system',
          content: 'AI study assistant. Return only valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000, // Reduced from 4000
      ...(useOpenRouter ? {} : { response_format: { type: 'json_object' } }) // OpenRouter doesn't support response_format
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Clean response - remove markdown code blocks if present
    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }

    // Parse and validate JSON response
    let studyContent: StudyPackContent
    try {
      studyContent = JSON.parse(cleanedResponse) as StudyPackContent
    } catch (parseError) {
      console.error('JSON parsing failed. Response was:', cleanedResponse.substring(0, 500))
      console.error('Parse error:', parseError)
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }

    // Add IDs if missing
    studyContent.flashcards = studyContent.flashcards.map((card, index) => ({
      ...card,
      id: card.id || `flashcard-${index + 1}`
    }))

    studyContent.kanbanTasks = studyContent.kanbanTasks.map((task, index) => ({
      ...task,
      id: task.id || `task-${index + 1}`,
      column: 'to-learn' // Ensure all start in to-learn
    }))

    return studyContent

  } catch (error: any) {
    console.error('Study content generation failed:', error)
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      response: error?.response
    })

    // Return fallback content if AI fails
    return {
      summary: "Failed to generate AI summary. Please try uploading the file again.",
      topics: ["Error in processing"],
      flashcards: [
        {
          id: "error-1",
          question: "What should you do if processing fails?",
          answer: "Try uploading the file again or contact support.",
          difficulty: "easy"
        }
      ],
      kanbanTasks: [
        {
          id: "error-task-1",
          title: "Retry file upload",
          description: "Upload the file again to generate study materials",
          column: "to-learn",
          priority: "high"
        }
      ]
    }
  }
}

// Optimized chunking: 5000 chars = ~1250 tokens (4:1 ratio)
// Allows processing more content in fewer API calls
export function chunkText(text: string, maxChunkSize: number = 5000): string[] {
  // Clean extra whitespace to save tokens
  const cleanText = text.replace(/\s+/g, ' ').trim()
  const sentences = cleanText.split(/[.!?]+\s+/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) continue

    if (currentChunk.length + trimmedSentence.length + 2 > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = trimmedSentence
    } else {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.length > 0 ? chunks : [cleanText.substring(0, maxChunkSize)]
}