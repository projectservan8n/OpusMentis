import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db as prisma } from '@/lib/db'

/**
 * GET - Fetch a quiz attempt with full quiz details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const attemptId = params.id

    // Fetch attempt with quiz
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      },
      include: {
        quiz: true
      }
    })

    if (!attempt) {
      return NextResponse.json(
        { error: 'Quiz attempt not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(attempt)

  } catch (error: any) {
    console.error('Get quiz attempt error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quiz attempt' },
      { status: 500 }
    )
  }
}
