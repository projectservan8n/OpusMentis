import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/study-sessions - Get user's study sessions
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studyPackId = searchParams.get('studyPackId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { userId }
    if (studyPackId) {
      where.studyPackId = studyPackId
    }

    const sessions = await prisma.studySession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Calculate stats
    const totalStudyTime = sessions.reduce((acc, s) => acc + s.duration, 0)
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.completed).length

    return NextResponse.json({
      sessions,
      stats: {
        totalStudyTime,
        totalSessions,
        completedSessions,
        averageSessionTime: totalSessions > 0 ? Math.round(totalStudyTime / totalSessions) : 0
      }
    })
  } catch (error) {
    console.error('Get study sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch study sessions' },
      { status: 500 }
    )
  }
}

// POST /api/study-sessions - Create a new study session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studyPackId, sessionType } = body

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'studyPackId is required' },
        { status: 400 }
      )
    }

    // Verify user owns or has access to the study pack
    const studyPack = await prisma.studyPack.findFirst({
      where: {
        id: studyPackId,
        OR: [
          { userId },
          { organizationId: { not: null } } // Team shared packs
        ]
      }
    })

    if (!studyPack) {
      return NextResponse.json(
        { error: 'Study pack not found or access denied' },
        { status: 404 }
      )
    }

    const session = await prisma.studySession.create({
      data: {
        userId,
        studyPackId,
        sessionType: sessionType || 'focus'
      }
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Create study session error:', error)
    return NextResponse.json(
      { error: 'Failed to create study session' },
      { status: 500 }
    )
  }
}

// PATCH /api/study-sessions?id={sessionId} - Update a study session
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { duration, completed, pausedTime, endedAt } = body

    // Verify session belongs to user
    const session = await prisma.studySession.findFirst({
      where: { id: sessionId, userId }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const updatedSession = await prisma.studySession.update({
      where: { id: sessionId },
      data: {
        ...(duration !== undefined && { duration }),
        ...(completed !== undefined && { completed }),
        ...(pausedTime !== undefined && { pausedTime }),
        ...(endedAt !== undefined && { endedAt: new Date(endedAt) })
      }
    })

    // Update user progress stats
    if (completed && session.sessionType === 'focus') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const userProgress = await prisma.userProgress.upsert({
        where: { userId },
        create: {
          userId,
          totalStudyTime: duration || 0,
          pomodorosCompleted: 1,
          lastStudyDate: new Date(),
          currentStreak: 1,
          longestStreak: 1
        },
        update: {
          totalStudyTime: {
            increment: duration || 0
          },
          pomodorosCompleted: {
            increment: 1
          },
          lastStudyDate: new Date()
        }
      })

      // Update streak
      if (userProgress.lastStudyDate) {
        const lastStudy = new Date(userProgress.lastStudyDate)
        lastStudy.setHours(0, 0, 0, 0)
        const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 1) {
          // Consecutive day
          await prisma.userProgress.update({
            where: { userId },
            data: {
              currentStreak: { increment: 1 },
              longestStreak: Math.max(userProgress.currentStreak + 1, userProgress.longestStreak)
            }
          })
        } else if (daysDiff > 1) {
          // Streak broken
          await prisma.userProgress.update({
            where: { userId },
            data: {
              currentStreak: 1
            }
          })
        }
      }

      // Check for achievements
      await checkAchievements(userId, userProgress)
    }

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Update study session error:', error)
    return NextResponse.json(
      { error: 'Failed to update study session' },
      { status: 500 }
    )
  }
}

// Helper function to check and award achievements
async function checkAchievements(userId: string, progress: any) {
  const achievements = []

  // Study streak achievements
  if (progress.currentStreak === 7) {
    achievements.push({
      userId,
      type: 'study_streak_7',
      title: '7 Day Streak',
      description: 'Studied for 7 consecutive days',
      icon: '🔥',
      tier: 'bronze'
    })
  } else if (progress.currentStreak === 30) {
    achievements.push({
      userId,
      type: 'study_streak_30',
      title: '30 Day Streak',
      description: 'Studied for 30 consecutive days',
      icon: '🔥',
      tier: 'gold'
    })
  }

  // Pomodoro achievements
  if (progress.pomodorosCompleted === 10) {
    achievements.push({
      userId,
      type: 'pomodoro_10',
      title: 'Pomodoro Beginner',
      description: 'Completed 10 Pomodoro sessions',
      icon: '🍅',
      tier: 'bronze'
    })
  } else if (progress.pomodorosCompleted === 50) {
    achievements.push({
      userId,
      type: 'pomodoro_50',
      title: 'Pomodoro Master',
      description: 'Completed 50 Pomodoro sessions',
      icon: '🍅',
      tier: 'silver'
    })
  } else if (progress.pomodorosCompleted === 100) {
    achievements.push({
      userId,
      type: 'pomodoro_100',
      title: 'Pomodoro Legend',
      description: 'Completed 100 Pomodoro sessions',
      icon: '🍅',
      tier: 'gold'
    })
  }

  // Study time achievements (in hours)
  const hours = Math.floor(progress.totalStudyTime / 3600)
  if (hours === 10) {
    achievements.push({
      userId,
      type: 'study_time_10',
      title: '10 Hours Scholar',
      description: 'Studied for 10 total hours',
      icon: '📚',
      tier: 'bronze'
    })
  } else if (hours === 50) {
    achievements.push({
      userId,
      type: 'study_time_50',
      title: '50 Hours Expert',
      description: 'Studied for 50 total hours',
      icon: '📚',
      tier: 'silver'
    })
  } else if (hours === 100) {
    achievements.push({
      userId,
      type: 'study_time_100',
      title: '100 Hours Master',
      description: 'Studied for 100 total hours',
      icon: '📚',
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
      update: {} // Don't update if already exists
    })
  }
}
