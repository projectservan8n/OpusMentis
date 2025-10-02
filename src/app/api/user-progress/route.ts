import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/user-progress - Get user's progress and achievements
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create user progress
    const progress = await prisma.userProgress.upsert({
      where: { userId },
      create: {
        userId
      },
      update: {}
    })

    // Get achievements
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' }
    })

    // Get recent study sessions
    const recentSessions = await prisma.studySession.findMany({
      where: {
        userId,
        completed: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Fetch study pack details separately
    const studyPackIds = [...new Set(recentSessions.map(s => s.studyPackId))]
    const studyPacks = await prisma.studyPack.findMany({
      where: { id: { in: studyPackIds } },
      select: { id: true, title: true }
    })
    const studyPackMap = new Map(studyPacks.map(sp => [sp.id, sp]))

    const sessionsWithPacks = recentSessions.map(session => ({
      ...session,
      studyPack: studyPackMap.get(session.studyPackId)
    }))

    // Calculate weekly stats
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const weekSessions = await prisma.studySession.findMany({
      where: {
        userId,
        completed: true,
        createdAt: {
          gte: weekAgo
        }
      }
    })

    const weeklyStudyTime = weekSessions.reduce((acc, s) => acc + s.duration, 0)

    // Get daily study time for last 7 days
    const dailyStats = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      day.setHours(0, 0, 0, 0)

      const nextDay = new Date(day)
      nextDay.setDate(nextDay.getDate() + 1)

      const daySessions = await prisma.studySession.findMany({
        where: {
          userId,
          completed: true,
          createdAt: {
            gte: day,
            lt: nextDay
          }
        }
      })

      const dayTime = daySessions.reduce((acc, s) => acc + s.duration, 0)

      dailyStats.push({
        date: day.toISOString().split('T')[0],
        studyTime: dayTime,
        sessions: daySessions.length
      })
    }

    // Get flashcard mastery breakdown
    const flashcardReviews = await prisma.flashcardReview.findMany({
      where: { userId },
      select: { masteryLevel: true }
    })

    const masteryBreakdown = {
      learning: flashcardReviews.filter(r => r.masteryLevel === 'learning').length,
      young: flashcardReviews.filter(r => r.masteryLevel === 'young').length,
      mature: flashcardReviews.filter(r => r.masteryLevel === 'mature').length,
      mastered: flashcardReviews.filter(r => r.masteryLevel === 'mastered').length
    }

    return NextResponse.json({
      progress,
      achievements,
      recentSessions: sessionsWithPacks,
      weeklyStats: {
        studyTime: weeklyStudyTime,
        sessions: weekSessions.length,
        daily: dailyStats
      },
      flashcardStats: masteryBreakdown
    })
  } catch (error) {
    console.error('Get user progress error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    )
  }
}
