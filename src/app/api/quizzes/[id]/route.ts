import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db as prisma } from '@/lib/db'

/**
 * GET - Fetch a quiz by ID
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

    const quizId = params.id

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

    return NextResponse.json(quiz)

  } catch (error: any) {
    console.error('Get quiz error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete a quiz
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quizId = params.id

    // Verify ownership
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

    // Delete quiz (cascade deletes attempts)
    await prisma.quiz.delete({
      where: { id: quizId }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Delete quiz error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete quiz' },
      { status: 500 }
    )
  }
}
