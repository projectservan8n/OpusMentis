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
    const prompt = `
You are an AI study assistant. Analyze the following text and create comprehensive study materials.

Text to analyze:
${text}

Please generate a JSON response with the following structure:
{
  "summary": "A comprehensive summary of the main concepts and key points (2-3 paragraphs)",
  "topics": ["array", "of", "main", "topics", "covered"],
  "flashcards": [
    {
      "id": "unique-id",
      "question": "Clear, specific question",
      "answer": "Detailed answer",
      "difficulty": "easy|medium|hard"
    }
  ],
  "kanbanTasks": [
    {
      "id": "unique-id",
      "title": "Study task title",
      "description": "What to focus on",
      "column": "to-learn",
      "priority": "low|medium|high"
    }
  ]
}

Guidelines:
- Create 8-15 flashcards covering key concepts
- Include varying difficulty levels
- Generate 6-10 kanban tasks for structured learning
- All tasks start in "to-learn" column
- Focus on actionable, specific learning objectives
- Use clear, student-friendly language

Return only valid JSON, no additional text.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful AI study assistant that creates learning materials from text. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
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

export function chunkText(text: string, maxChunkSize: number = 3000): string[] {
  const sentences = text.split(/[.!?]+/)
  const chunks: string[] = []
  let currentChunk = ''

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence + '.'
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}