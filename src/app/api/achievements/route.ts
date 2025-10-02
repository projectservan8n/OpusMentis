import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/achievements - Get user's achievements
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier')

    const where: any = { userId }
    if (tier) {
      where.tier = tier
    }

    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: { unlockedAt: 'desc' }
    })

    // Group by tier
    const grouped = {
      bronze: achievements.filter(a => a.tier === 'bronze'),
      silver: achievements.filter(a => a.tier === 'silver'),
      gold: achievements.filter(a => a.tier === 'gold'),
      platinum: achievements.filter(a => a.tier === 'platinum')
    }

    // Get available achievements (not yet unlocked)
    const unlockedTypes = achievements.map(a => a.type)
    const availableAchievements = getAvailableAchievements().filter(
      a => !unlockedTypes.includes(a.type)
    )

    return NextResponse.json({
      achievements,
      grouped,
      stats: {
        total: achievements.length,
        bronze: grouped.bronze.length,
        silver: grouped.silver.length,
        gold: grouped.gold.length,
        platinum: grouped.platinum.length
      },
      available: availableAchievements
    })
  } catch (error) {
    console.error('Get achievements error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}

// Helper function to get all available achievements
function getAvailableAchievements() {
  return [
    // Study streaks
    { type: 'study_streak_7', title: '7 Day Streak', description: 'Study for 7 consecutive days', icon: '🔥', tier: 'bronze' },
    { type: 'study_streak_30', title: '30 Day Streak', description: 'Study for 30 consecutive days', icon: '🔥', tier: 'silver' },
    { type: 'study_streak_100', title: '100 Day Streak', description: 'Study for 100 consecutive days', icon: '🔥', tier: 'gold' },
    { type: 'study_streak_365', title: '365 Day Streak', description: 'Study for 365 consecutive days', icon: '🔥', tier: 'platinum' },

    // Pomodoros
    { type: 'pomodoro_10', title: 'Pomodoro Beginner', description: 'Complete 10 Pomodoro sessions', icon: '🍅', tier: 'bronze' },
    { type: 'pomodoro_50', title: 'Pomodoro Master', description: 'Complete 50 Pomodoro sessions', icon: '🍅', tier: 'silver' },
    { type: 'pomodoro_100', title: 'Pomodoro Legend', description: 'Complete 100 Pomodoro sessions', icon: '🍅', tier: 'gold' },
    { type: 'pomodoro_500', title: 'Pomodoro God', description: 'Complete 500 Pomodoro sessions', icon: '🍅', tier: 'platinum' },

    // Study time
    { type: 'study_time_10', title: '10 Hours Scholar', description: 'Study for 10 total hours', icon: '📚', tier: 'bronze' },
    { type: 'study_time_50', title: '50 Hours Expert', description: 'Study for 50 total hours', icon: '📚', tier: 'silver' },
    { type: 'study_time_100', title: '100 Hours Master', description: 'Study for 100 total hours', icon: '📚', tier: 'gold' },
    { type: 'study_time_500', title: '500 Hours Sage', description: 'Study for 500 total hours', icon: '📚', tier: 'platinum' },

    // Flashcard reviews
    { type: 'flashcard_reviews_50', title: 'Flashcard Novice', description: 'Review 50 flashcards', icon: '📇', tier: 'bronze' },
    { type: 'flashcard_reviews_200', title: 'Flashcard Expert', description: 'Review 200 flashcards', icon: '📇', tier: 'silver' },
    { type: 'flashcard_reviews_500', title: 'Flashcard Master', description: 'Review 500 flashcards', icon: '📇', tier: 'gold' },
    { type: 'flashcard_reviews_1000', title: 'Flashcard Legend', description: 'Review 1000 flashcards', icon: '📇', tier: 'platinum' },

    // Flashcard mastery
    { type: 'flashcard_mastery_25', title: 'Memory Builder', description: 'Master 25 flashcards', icon: '🧠', tier: 'bronze' },
    { type: 'flashcard_mastery_100', title: 'Memory Architect', description: 'Master 100 flashcards', icon: '🧠', tier: 'silver' },
    { type: 'flashcard_mastery_250', title: 'Memory Genius', description: 'Master 250 flashcards', icon: '🧠', tier: 'gold' },
    { type: 'flashcard_mastery_500', title: 'Memory God', description: 'Master 500 flashcards', icon: '🧠', tier: 'platinum' },

    // Kanban
    { type: 'kanban_tasks_50', title: 'Task Starter', description: 'Complete 50 Kanban tasks', icon: '✅', tier: 'bronze' },
    { type: 'kanban_tasks_200', title: 'Task Manager', description: 'Complete 200 Kanban tasks', icon: '✅', tier: 'silver' },
    { type: 'kanban_tasks_500', title: 'Task Master', description: 'Complete 500 Kanban tasks', icon: '✅', tier: 'gold' },

    // Quizzes
    { type: 'quiz_taken_10', title: 'Quiz Taker', description: 'Take 10 quizzes', icon: '📝', tier: 'bronze' },
    { type: 'quiz_taken_50', title: 'Quiz Expert', description: 'Take 50 quizzes', icon: '📝', tier: 'silver' },
    { type: 'quiz_perfect_score', title: 'Perfect Score', description: 'Get 100% on a quiz', icon: '💯', tier: 'gold' },
    { type: 'quiz_average_90', title: 'Quiz Master', description: 'Maintain 90%+ average across 10+ quizzes', icon: '🏆', tier: 'gold' },

    // Special
    { type: 'early_bird', title: 'Early Bird', description: 'Study before 6 AM', icon: '🌅', tier: 'silver' },
    { type: 'night_owl', title: 'Night Owl', description: 'Study after 11 PM', icon: '🦉', tier: 'silver' },
    { type: 'study_pack_creator', title: 'Content Creator', description: 'Create 25 study packs', icon: '📦', tier: 'gold' }
  ]
}
