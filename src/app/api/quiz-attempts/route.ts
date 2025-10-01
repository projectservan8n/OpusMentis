import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db as prisma } from '@/lib/db'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder-key-for-build'
})

interface SubmitAttemptRequest {
  quizId: string
  answers: Array<{
    questionIndex: number
    answer: string
  }>
  timeSpent: number
}

/**
 * Auto-grade Multiple Choice and True/False questions
 */
function autoGradeObjective(
  questions: any[],
  answers: Array<{ questionIndex: number; answer: string }>
): { score: number; feedback: any[] } {
  let score = 0
  const feedback: any[] = []

  answers.forEach(({ questionIndex, answer }) => {
    const question = questions[questionIndex]
    if (!question) return

    if (question.type === 'multipleChoice' || question.type === 'trueFalse') {
      const isCorrect = answer === question.correctAnswer
      if (isCorrect) {
        score += question.points
      }

      feedback.push({
        questionIndex,
        isCorrect,
        userAnswer: answer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        points: isCorrect ? question.points : 0,
        maxPoints: question.points
      })
    }
  })

  return { score, feedback }
}

/**
 * AI-grade Short Answer questions
 */
async function gradeShortAnswer(
  question: any,
  userAnswer: string
): Promise<{ points: number; feedback: string; isCorrect: boolean }> {
  try {
    const prompt = `
You are grading a short answer question. Be fair and encouraging.

Question: ${question.question}
Expected Answer: ${question.correctAnswer}
Student Answer: ${userAnswer}

Grade the student's answer and provide feedback:
1. Is the answer correct? (Consider partial credit for partially correct answers)
2. What points were covered correctly?
3. What was missing or incorrect?
4. Encouraging feedback

Return ONLY a JSON object:
{
  "pointsEarned": 0-${question.points} (award partial credit if appropriate),
  "feedback": "Your empathetic, encouraging feedback here",
  "isCorrect": true/false
}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an empathetic educator who grades fairly and provides encouraging feedback. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from AI')

    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }

    const result = JSON.parse(cleanedResponse)

    return {
      points: result.pointsEarned,
      feedback: result.feedback,
      isCorrect: result.isCorrect
    }
  } catch (error) {
    console.error('Short answer grading error:', error)
    // Fallback: award half credit
    return {
      points: Math.floor(question.points / 2),
      feedback: 'Your answer shows effort. Please review the explanation below.',
      isCorrect: false
    }
  }
}

/**
 * AI-grade Essay questions
 */
async function gradeEssay(
  question: any,
  userAnswer: string
): Promise<{ points: number; feedback: string; isCorrect: boolean }> {
  try {
    const prompt = `
You are grading an essay question. Be empathetic, encouraging, and fair.

Question: ${question.question}
Key Points to Cover: ${question.correctAnswer}
Student Essay: ${userAnswer}

Grade the essay comprehensively:
1. Content accuracy (are key points covered?)
2. Understanding depth (does the student understand the concepts?)
3. Writing clarity
4. Completeness

Provide detailed, encouraging feedback that:
- Highlights what the student did well
- Explains what could be improved
- Encourages continued learning

Return ONLY a JSON object:
{
  "pointsEarned": 0-${question.points} (be generous with partial credit),
  "feedback": "Your detailed, empathetic, encouraging feedback (3-4 sentences)",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an empathetic educator who grades essays fairly and provides encouraging, detailed feedback. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) throw new Error('No response from AI')

    let cleanedResponse = response.trim()
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/```\s*$/, '')
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }

    const result = JSON.parse(cleanedResponse)

    return {
      points: result.pointsEarned,
      feedback: `${result.feedback}\n\nStrengths: ${result.strengths.join(', ')}\n\nAreas for improvement: ${result.improvements.join(', ')}`,
      isCorrect: result.pointsEarned >= question.points * 0.7 // 70% threshold
    }
  } catch (error) {
    console.error('Essay grading error:', error)
    // Fallback: award most points for effort
    return {
      points: Math.floor(question.points * 0.75),
      feedback: 'Thank you for your thoughtful response. Your essay shows good effort and understanding. Please review the key points below to deepen your knowledge.',
      isCorrect: true
    }
  }
}

/**
 * POST - Submit quiz attempt and get AI grading
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SubmitAttemptRequest = await request.json()
    const { quizId, answers, timeSpent } = body

    // Fetch quiz
    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        userId
      }
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    const questions = quiz.questions as any[]

    // Grade objective questions immediately
    const { score: objectiveScore, feedback: objectiveFeedback } = autoGradeObjective(
      questions,
      answers
    )

    let totalScore = objectiveScore
    const allFeedback = [...objectiveFeedback]

    // Grade subjective questions with AI
    for (const { questionIndex, answer } of answers) {
      const question = questions[questionIndex]
      if (!question) continue

      if (question.type === 'shortAnswer') {
        const result = await gradeShortAnswer(question, answer)
        totalScore += result.points

        allFeedback.push({
          questionIndex,
          isCorrect: result.isCorrect,
          userAnswer: answer,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          aiFeedback: result.feedback,
          points: result.points,
          maxPoints: question.points
        })
      } else if (question.type === 'essay') {
        const result = await gradeEssay(question, answer)
        totalScore += result.points

        allFeedback.push({
          questionIndex,
          isCorrect: result.isCorrect,
          userAnswer: answer,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          aiFeedback: result.feedback,
          points: result.points,
          maxPoints: question.points
        })
      }
    }

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        answers: answers as any,
        score: totalScore,
        totalPoints: quiz.totalPoints,
        feedback: allFeedback as any,
        timeSpent,
        startedAt: new Date(Date.now() - timeSpent * 1000),
        completedAt: new Date()
      }
    })

    return NextResponse.json(attempt)

  } catch (error: any) {
    console.error('Quiz attempt submission error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit quiz attempt' },
      { status: 500 }
    )
  }
}
