import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build'
})

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

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Create a temporary file for OpenAI Whisper
    const file = new File([new Uint8Array(audioBuffer)], 'audio.mp3', { type: 'audio/mpeg' })

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en' // MVP: English only, can be extended
    })

    return transcription.text
  } catch (error) {
    console.error('Audio transcription failed:', error)
    throw new Error('Failed to transcribe audio')
  }
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
      model: 'gpt-4o-mini',
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
      response_format: { type: 'json_object' }
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

  } catch (error) {
    console.error('Study content generation failed:', error)

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