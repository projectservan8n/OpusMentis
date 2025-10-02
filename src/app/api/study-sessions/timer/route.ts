import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TIMER_PRESETS = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60
}

// GET /api/study-sessions/timer - Get active timer state
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studyPackId = searchParams.get('studyPackId')

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'studyPackId is required' },
        { status: 400 }
      )
    }

    // Get active timer for this study pack
    const activeTimer = await prisma.studySession.findFirst({
      where: {
        userId,
        studyPackId,
        isActive: true,
        completed: false
      },
      orderBy: { lastSync: 'desc' }
    })

    if (!activeTimer) {
      return NextResponse.json({ timer: null })
    }

    // Calculate actual time remaining based on last sync
    const now = new Date()
    const lastSync = new Date(activeTimer.lastSync)
    const elapsedSinceSync = Math.floor((now.getTime() - lastSync.getTime()) / 1000)

    let timeRemaining = activeTimer.timeRemaining
    if (!activeTimer.isPaused) {
      timeRemaining = Math.max(0, activeTimer.timeRemaining - elapsedSinceSync)
    }

    return NextResponse.json({
      timer: {
        ...activeTimer,
        timeRemaining,
        synced: true
      }
    })
  } catch (error) {
    console.error('Get timer state error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timer state' },
      { status: 500 }
    )
  }
}

// POST /api/study-sessions/timer - Start or resume timer
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studyPackId, sessionType, timeRemaining } = body

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'studyPackId is required' },
        { status: 400 }
      )
    }

    // Check if there's already an active timer for this study pack
    const existingTimer = await prisma.studySession.findFirst({
      where: {
        userId,
        studyPackId,
        isActive: true,
        completed: false
      }
    })

    if (existingTimer) {
      // Resume existing timer
      const updatedTimer = await prisma.studySession.update({
        where: { id: existingTimer.id },
        data: {
          isPaused: false,
          lastSync: new Date()
        }
      })

      return NextResponse.json({ timer: updatedTimer })
    }

    // Create new timer
    const defaultTime = TIMER_PRESETS[sessionType as keyof typeof TIMER_PRESETS] || TIMER_PRESETS.focus

    const newTimer = await prisma.studySession.create({
      data: {
        userId,
        studyPackId,
        sessionType: sessionType || 'focus',
        isActive: true,
        isPaused: false,
        timeRemaining: timeRemaining || defaultTime,
        lastSync: new Date()
      }
    })

    return NextResponse.json({ timer: newTimer })
  } catch (error) {
    console.error('Start timer error:', error)
    return NextResponse.json(
      { error: 'Failed to start timer' },
      { status: 500 }
    )
  }
}

// PATCH /api/study-sessions/timer - Update timer state (pause, sync, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studyPackId, timeRemaining, isPaused, sessionType } = body

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'studyPackId is required' },
        { status: 400 }
      )
    }

    // Find active timer
    const activeTimer = await prisma.studySession.findFirst({
      where: {
        userId,
        studyPackId,
        isActive: true,
        completed: false
      }
    })

    if (!activeTimer) {
      return NextResponse.json(
        { error: 'No active timer found' },
        { status: 404 }
      )
    }

    // Update timer state
    const updatedTimer = await prisma.studySession.update({
      where: { id: activeTimer.id },
      data: {
        ...(timeRemaining !== undefined && { timeRemaining }),
        ...(isPaused !== undefined && { isPaused }),
        ...(sessionType !== undefined && { sessionType }),
        lastSync: new Date()
      }
    })

    return NextResponse.json({ timer: updatedTimer })
  } catch (error) {
    console.error('Update timer error:', error)
    return NextResponse.json(
      { error: 'Failed to update timer' },
      { status: 500 }
    )
  }
}

// DELETE /api/study-sessions/timer - Stop timer
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const studyPackId = searchParams.get('studyPackId')
    const completed = searchParams.get('completed') === 'true'

    if (!studyPackId) {
      return NextResponse.json(
        { error: 'studyPackId is required' },
        { status: 400 }
      )
    }

    // Find and stop active timer
    const activeTimer = await prisma.studySession.findFirst({
      where: {
        userId,
        studyPackId,
        isActive: true,
        completed: false
      }
    })

    if (!activeTimer) {
      return NextResponse.json(
        { error: 'No active timer found' },
        { status: 404 }
      )
    }

    // Calculate final duration
    const now = new Date()
    const startTime = new Date(activeTimer.startedAt)
    const totalDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000) - activeTimer.pausedTime

    const stoppedTimer = await prisma.studySession.update({
      where: { id: activeTimer.id },
      data: {
        isActive: false,
        completed,
        endedAt: now,
        duration: totalDuration,
        lastSync: now
      }
    })

    // Update user progress if completed
    if (completed && activeTimer.sessionType === 'focus') {
      await prisma.userProgress.upsert({
        where: { userId },
        create: {
          userId,
          totalStudyTime: totalDuration,
          pomodorosCompleted: 1,
          lastStudyDate: now,
          currentStreak: 1,
          longestStreak: 1
        },
        update: {
          totalStudyTime: { increment: totalDuration },
          pomodorosCompleted: { increment: 1 },
          lastStudyDate: now
        }
      })
    }

    return NextResponse.json({ timer: stoppedTimer })
  } catch (error) {
    console.error('Stop timer error:', error)
    return NextResponse.json(
      { error: 'Failed to stop timer' },
      { status: 500 }
    )
  }
}
