import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db as prisma } from '@/lib/db'
import OpenAI from 'openai'
import pdf from 'pdf-parse'
import fs from 'fs/promises'

// Primary: OpenRouter with gpt-oss-20b (free tier)
// Fallback: OpenAI with gpt-4o-mini (paid)
const useOpenRouter = process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'placeholder-key-for-build'

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

const AI_MODEL = useOpenRouter ? 'openai/gpt-oss-20b:free' : 'gpt-4o-mini'

interface QuestionType {
  multipleChoice: boolean
  trueFalse: boolean
  shortAnswer: boolean
  essay: boolean
}

interface QuizGenerationRequest {
  studyPackId: string
  title: string
  source: 'highlights' | 'chapters' | 'pages' | 'fullDocument'
  sourceDetails: any
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount: number
  questionTypes: QuestionType
}

/**
 * Generate context text based on quiz source
 */
async function getQuizContext(
  source: string,
  sourceDetails: any,
  studyPack: any
): Promise<string> {
  let context = ''

  if (source === 'highlights') {
    // Get highlights by IDs
    const highlights = await prisma.highlight.findMany({
      where: {
        id: { in: sourceDetails.highlightIds || [] },
        studyPackId: studyPack.id
      },
      orderBy: { pageNumber: 'asc' }
    })

    context = highlights
      .map(h => `[Page ${h.pageNumber}] ${h.text}${h.note ? `\nNote: ${h.note}` : ''}`)
      .join('\n\n')

  } else if (source === 'chapters') {
    // Get document structure and extract chapter content
    const structure = await prisma.documentStructure.findUnique({
      where: { studyPackId: studyPack.id }
    })

    if (!structure || !studyPack.filePath) {
      throw new Error('Document structure or file path not available')
    }

    // Read PDF and extract text from selected chapters
    const dataBuffer = await fs.readFile(studyPack.filePath)
    const pdfData = await pdf(dataBuffer)
    const fullText = pdfData.text

    // Get selected chapters from structure
    const chapters = structure.chapters as any[]
    const selectedChapters = chapters.filter(ch =>
      sourceDetails.chapters.includes(ch.title)
    )

    // Estimate text for selected chapters (simplified approach)
    const totalPages = pdfData.numpages
    const charsPerPage = Math.ceil(fullText.length / totalPages)

    selectedChapters.forEach(chapter => {
      const startChar = (chapter.startPage - 1) * charsPerPage
      const endChar = chapter.endPage * charsPerPage
      const chapterText = fullText.substring(startChar, Math.min(endChar, fullText.length))
      context += `\n\n=== ${chapter.title} ===\n${chapterText}`
    })

  } else if (source === 'pages') {
    // Extract text from page range
    if (!studyPack.filePath) {
      throw new Error('PDF file path not available')
    }

    const dataBuffer = await fs.readFile(studyPack.filePath)
    const pdfData = await pdf(dataBuffer)
    const fullText = pdfData.text

    const totalPages = pdfData.numpages
    const charsPerPage = Math.ceil(fullText.length / totalPages)

    const startChar = (sourceDetails.startPage - 1) * charsPerPage
    const endChar = sourceDetails.endPage * charsPerPage

    context = fullText.substring(startChar, Math.min(endChar, fullText.length))

  } else if (source === 'fullDocument') {
    // Use the existing summary or extract full text
    if (studyPack.summary) {
      context = studyPack.summary
    } else if (studyPack.filePath) {
      const dataBuffer = await fs.readFile(studyPack.filePath)
      const pdfData = await pdf(dataBuffer)
      // Limit to first 30000 chars for full document
      context = pdfData.text.substring(0, 30000)
    }
  }

  return context
}

/**
 * Generate quiz questions using GPT-4o-mini
 */
async function generateQuizQuestions(
  context: string,
  difficulty: string,
  questionCount: number,
  questionTypes: QuestionType
): Promise<any[]> {
  // Build question type instructions
  const enabledTypes = []
  if (questionTypes.multipleChoice) enabledTypes.push('Multiple Choice (4 options, 1 correct)')
  if (questionTypes.trueFalse) enabledTypes.push('True/False')
  if (questionTypes.shortAnswer) enabledTypes.push('Short Answer (1-2 sentences)')
  if (questionTypes.essay) enabledTypes.push('Essay (paragraph response)')

  const prompt = `
You are an expert educational assessment creator. Generate ${questionCount} quiz questions based on the following content.

Content to quiz on:
${context.substring(0, 15000)} ${context.length > 15000 ? '...[truncated]' : ''}

Requirements:
- Difficulty level: ${difficulty}
- Question types to include: ${enabledTypes.join(', ')}
- Mix the question types naturally
- Focus on key concepts and understanding
- For multiple choice: include 1 correct answer and 3 plausible distractors
- For true/false: include explanation why it's true or false
- For short answer: expect 1-2 sentence responses
- For essay: expect paragraph-length analytical responses

Return ONLY a JSON array with this exact structure:
[
  {
    "type": "multipleChoice" | "trueFalse" | "shortAnswer" | "essay",
    "question": "The question text",
    "options": ["A", "B", "C", "D"], // only for multipleChoice
    "correctAnswer": "A" | "True" | "False" | "Expected answer text",
    "explanation": "Why this is the correct answer",
    "points": 1-5 // based on difficulty and question type
  }
]

Guidelines for points:
- Multiple Choice: ${difficulty === 'easy' ? '1' : difficulty === 'medium' ? '2' : '3'} points
- True/False: ${difficulty === 'easy' ? '1' : difficulty === 'medium' ? '1' : '2'} points
- Short Answer: ${difficulty === 'easy' ? '2' : difficulty === 'medium' ? '3' : '4'} points
- Essay: ${difficulty === 'easy' ? '5' : difficulty === 'medium' ? '7' : '10'} points

Return ONLY valid JSON, no additional text.
`

  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an expert educational assessment creator. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 3000
  })

  const response = completion.choices[0]?.message?.content
  if (!response) {
    throw new Error('No response from OpenAI')
  }

  // Clean response
  let cleanedResponse = response.trim()
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '')
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '')
  }

  const questions = JSON.parse(cleanedResponse)
  return questions
}

/**
 * POST - Generate a new quiz
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: QuizGenerationRequest = await request.json()
    const {
      studyPackId,
      title,
      source,
      sourceDetails,
      difficulty,
      questionCount,
      questionTypes
    } = body

    // Validate request
    if (!studyPackId || !source || !difficulty || !questionCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify study pack ownership
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

    // Get context based on source
    const context = await getQuizContext(source, sourceDetails, studyPack)

    if (!context || context.trim().length < 50) {
      return NextResponse.json(
        { error: 'Insufficient content to generate quiz. Please check your source selection.' },
        { status: 400 }
      )
    }

    // Generate questions with AI
    const questions = await generateQuizQuestions(
      context,
      difficulty,
      questionCount,
      questionTypes
    )

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0)

    // Save quiz to database
    const quiz = await prisma.quiz.create({
      data: {
        studyPackId,
        userId,
        title,
        source,
        sourceDetails: sourceDetails as any,
        questions: questions as any,
        totalPoints,
        difficulty
      }
    })

    return NextResponse.json(quiz)

  } catch (error: any) {
    console.error('Quiz generation error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    })
    return NextResponse.json(
      { error: error.message || 'Failed to generate quiz' },
      { status: 500 }
    )
  }
}
