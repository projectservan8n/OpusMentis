import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// SM-2 Spaced Repetition Algorithm
function calculateNextReview(rating: 'again' | 'hard' | 'good' | 'easy', review: any) {
  let easeFactor = review.easeFactor
  let interval = review.interval
  let repetitions = review.repetitions

  // Update ease factor based on rating
  const qualityMap = {
    again: 0,
    hard: 1,
    good: 3,
    easy: 4
  }
  const quality = qualityMap[rating]

  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))

  // Calculate new interval
  if (quality < 3) {
    // Failed - restart
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  }

  // Calculate next review date
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + interval)

  // Determine mastery level
  let masteryLevel = 'learning'
  if (repetitions >= 8 && interval >= 21) {
    masteryLevel = 'mastered'
  } else if (repetitions >= 4 && interval >= 6) {
    masteryLevel = 'mature'
  } else if (repetitions >= 2) {
    masteryLevel = 'young'
  }

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
    masteryLevel
  }
}

// GET /api/flashcard-reviews - Get flashcard reviews for a study pack or due cards
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studyPackId = searchParams.get('studyPackId')
    const dueOnly = searchParams.get('dueOnly') === 'true'

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'studyPackId is required' },
        { status: 400 }
      )
    }

    const where: any = {
      userId,
      studyPackId
    }

    if (dueOnly) {
      where.nextReviewDate = {
        lte: new Date()
      }
    }

    const reviews = await prisma.flashcardReview.findMany({
      where,
      orderBy: { nextReviewDate: 'asc' }
    })

    // Get study pack flashcards
    const studyPack = await prisma.studyPack.findUnique({
      where: { id: studyPackId },
      select: { flashcards: true }
    })

    const flashcards = studyPack?.flashcards ?
      (typeof studyPack.flashcards === 'string' ? JSON.parse(studyPack.flashcards) : studyPack.flashcards) : []

    // Calculate stats
    const totalCards = flashcards.length
    const reviewedCards = reviews.length
    const dueCards = reviews.filter(r => new Date(r.nextReviewDate) <= new Date()).length
    const masteredCards = reviews.filter(r => r.masteryLevel === 'mastered').length

    return NextResponse.json({
      reviews,
      stats: {
        totalCards,
        reviewedCards,
        dueCards,
        masteredCards,
        accuracy: reviews.length > 0
          ? Math.round((reviews.reduce((acc, r) => acc + r.correctReviews, 0) /
              reviews.reduce((acc, r) => acc + r.totalReviews, 0)) * 100)
          : 0
      }
    })
  } catch (error) {
    console.error('Get flashcard reviews error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flashcard reviews' },
      { status: 500 }
    )
  }
}

// POST /api/flashcard-reviews - Record a flashcard review
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studyPackId, flashcardId, rating } = body

    if (!studyPackId || !flashcardId || !rating) {
      return NextResponse.json(
        { error: 'studyPackId, flashcardId, and rating are required' },
        { status: 400 }
      )
    }

    if (!['again', 'hard', 'good', 'easy'].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be: again, hard, good, or easy' },
        { status: 400 }
      )
    }

    // Get or create review
    let review = await prisma.flashcardReview.findUnique({
      where: {
        userId_studyPackId_flashcardId: {
          userId,
          studyPackId,
          flashcardId
        }
      }
    })

    if (!review) {
      // First review
      review = await prisma.flashcardReview.create({
        data: {
          userId,
          studyPackId,
          flashcardId
        }
      })
    }

    // Calculate next review using SM-2 algorithm
    const nextReview = calculateNextReview(rating as any, review)
    const isCorrect = rating === 'good' || rating === 'easy'

    // Update review
    const updatedReview = await prisma.flashcardReview.update({
      where: { id: review.id },
      data: {
        ...nextReview,
        lastReviewDate: new Date(),
        lastReviewRating: rating,
        totalReviews: { increment: 1 },
        correctReviews: isCorrect ? { increment: 1 } : review.correctReviews
      }
    })

    // Update user progress
    const userProgress = await prisma.userProgress.upsert({
      where: { userId },
      create: {
        userId,
        totalFlashcardsReviewed: 1,
        totalFlashcardsMastered: nextReview.masteryLevel === 'mastered' ? 1 : 0
      },
      update: {
        totalFlashcardsReviewed: { increment: 1 },
        ...(nextReview.masteryLevel === 'mastered' &&
            review.masteryLevel !== 'mastered' && {
          totalFlashcardsMastered: { increment: 1 }
        })
      }
    })

    // Check for flashcard achievements
    await checkFlashcardAchievements(userId, userProgress)

    return NextResponse.json({
      review: updatedReview,
      nextReview: {
        interval: nextReview.interval,
        nextReviewDate: nextReview.nextReviewDate,
        masteryLevel: nextReview.masteryLevel
      }
    })
  } catch (error) {
    console.error('Create flashcard review error:', error)
    return NextResponse.json(
      { error: 'Failed to record flashcard review' },
      { status: 500 }
    )
  }
}

// Helper function to check and award flashcard achievements
async function checkFlashcardAchievements(userId: string, progress: any) {
  const achievements = []

  // Flashcard review achievements
  if (progress.totalFlashcardsReviewed === 50) {
    achievements.push({
      userId,
      type: 'flashcard_reviews_50',
      title: 'Flashcard Novice',
      description: 'Reviewed 50 flashcards',
      icon: '📇',
      tier: 'bronze'
    })
  } else if (progress.totalFlashcardsReviewed === 200) {
    achievements.push({
      userId,
      type: 'flashcard_reviews_200',
      title: 'Flashcard Expert',
      description: 'Reviewed 200 flashcards',
      icon: '📇',
      tier: 'silver'
    })
  } else if (progress.totalFlashcardsReviewed === 500) {
    achievements.push({
      userId,
      type: 'flashcard_reviews_500',
      title: 'Flashcard Master',
      description: 'Reviewed 500 flashcards',
      icon: '📇',
      tier: 'gold'
    })
  }

  // Mastery achievements
  if (progress.totalFlashcardsMastered === 25) {
    achievements.push({
      userId,
      type: 'flashcard_mastery_25',
      title: 'Memory Builder',
      description: 'Mastered 25 flashcards',
      icon: '🧠',
      tier: 'bronze'
    })
  } else if (progress.totalFlashcardsMastered === 100) {
    achievements.push({
      userId,
      type: 'flashcard_mastery_100',
      title: 'Memory Architect',
      description: 'Mastered 100 flashcards',
      icon: '🧠',
      tier: 'silver'
    })
  } else if (progress.totalFlashcardsMastered === 250) {
    achievements.push({
      userId,
      type: 'flashcard_mastery_250',
      title: 'Memory Genius',
      description: 'Mastered 250 flashcards',
      icon: '🧠',
      tier: 'gold'
    })
  }

  // Create achievements if they don't exist
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: {
        userId_type: {
          userId,
          type: achievement.type
        }
      },
      create: achievement,
      update: {}
    })
  }
}
