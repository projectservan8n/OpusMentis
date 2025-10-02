'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import toast from 'react-hot-toast'
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Coffee,
  Trophy,
  Clock
} from 'lucide-react'

interface StudyTimerProps {
  studyPackId: string
  onSessionComplete?: (duration: number) => void
}

type TimerMode = 'focus' | 'short_break' | 'long_break'

const TIMER_PRESETS = {
  focus: 25 * 60, // 25 minutes
  short_break: 5 * 60, // 5 minutes
  long_break: 15 * 60 // 15 minutes
}

export default function StudyTimer({ studyPackId, onSessionComplete }: StudyTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [pausedTime, setPausedTime] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const notificationShownRef = useRef(false)

  // Calculate progress percentage
  const progress = ((TIMER_PRESETS[mode] - timeLeft) / TIMER_PRESETS[mode]) * 100

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Show browser notification
  const showNotification = (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'study-timer'
      })
    }
  }

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  // Start a new session
  const startSession = async () => {
    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyPackId,
          sessionType: mode
        })
      })

      if (response.ok) {
        const session = await response.json()
        setSessionId(session.id)
        setStartTime(new Date())
        setIsRunning(true)
        notificationShownRef.current = false
      }
    } catch (error) {
      console.error('Failed to start session:', error)
      toast.error('Failed to start timer')
    }
  }

  // Update session on server
  const updateSession = async (completed: boolean = false) => {
    if (!sessionId || !startTime) return

    const now = new Date()
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000) - pausedTime

    try {
      await fetch(`/api/study-sessions?id=${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          completed,
          pausedTime,
          endedAt: completed ? now.toISOString() : undefined
        })
      })

      if (completed && onSessionComplete) {
        onSessionComplete(duration)
      }
    } catch (error) {
      console.error('Failed to update session:', error)
    }
  }

  // Handle timer completion
  const handleTimerComplete = async () => {
    setIsRunning(false)

    if (!notificationShownRef.current) {
      notificationShownRef.current = true

      if (mode === 'focus') {
        const newCount = pomodoroCount + 1
        setPomodoroCount(newCount)
        await updateSession(true)

        showNotification(
          '🎉 Pomodoro Complete!',
          `Great job! You've completed ${newCount} Pomodoro${newCount > 1 ? 's' : ''} today.`
        )
        toast.success(`Pomodoro #${newCount} complete! Time for a break.`)

        // Auto-switch to break
        if (newCount % 4 === 0) {
          setMode('long_break')
          setTimeLeft(TIMER_PRESETS.long_break)
          toast('Taking a long break! You deserve it.', { icon: '☕' })
        } else {
          setMode('short_break')
          setTimeLeft(TIMER_PRESETS.short_break)
          toast('Taking a short break!', { icon: '☕' })
        }
      } else {
        showNotification(
          '✨ Break Complete!',
          'Ready to get back to studying?'
        )
        toast.success('Break complete! Ready for another Pomodoro?')
        setMode('focus')
        setTimeLeft(TIMER_PRESETS.focus)
      }

      setSessionId(null)
      setStartTime(null)
      setPausedTime(0)
    }
  }

  // Toggle play/pause
  const toggleTimer = async () => {
    if (isRunning) {
      // Pause
      const now = new Date()
      if (startTime) {
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        setPausedTime(prev => prev + elapsed)
      }
      await updateSession(false)
      setIsRunning(false)
    } else {
      // Resume or start
      if (sessionId) {
        // Resume existing session
        setStartTime(new Date())
        setIsRunning(true)
      } else {
        // Start new session
        await startSession()
      }
    }
  }

  // Reset timer
  const resetTimer = async () => {
    if (sessionId && isRunning) {
      await updateSession(false)
    }
    setIsRunning(false)
    setTimeLeft(TIMER_PRESETS[mode])
    setSessionId(null)
    setStartTime(null)
    setPausedTime(0)
    notificationShownRef.current = false
  }

  // Switch mode
  const switchMode = (newMode: TimerMode) => {
    if (isRunning) {
      toast.error('Stop the timer before switching modes')
      return
    }
    setMode(newMode)
    setTimeLeft(TIMER_PRESETS[newMode])
    resetTimer()
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Study Timer
          </CardTitle>
          {pomodoroCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Trophy className="h-3 w-3" />
              {pomodoroCount} {pomodoroCount === 1 ? 'Pomodoro' : 'Pomodoros'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode selector */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'focus' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('focus')}
            disabled={isRunning}
            className="flex-1"
          >
            <Clock className="h-4 w-4 mr-2" />
            Focus
          </Button>
          <Button
            variant={mode === 'short_break' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('short_break')}
            disabled={isRunning}
            className="flex-1"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Short Break
          </Button>
          <Button
            variant={mode === 'long_break' ? 'default' : 'outline'}
            size="sm"
            onClick={() => switchMode('long_break')}
            disabled={isRunning}
            className="flex-1"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Long Break
          </Button>
        </div>

        {/* Timer display */}
        <div className="text-center space-y-4">
          <div
            className={`text-6xl font-bold font-mono ${
              mode === 'focus' ? 'text-primary' : 'text-green-600'
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          <Progress value={progress} className="h-2" />

          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={toggleTimer}
              size="lg"
              className="w-32"
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  {sessionId ? 'Resume' : 'Start'}
                </>
              )}
            </Button>

            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Info text */}
        <div className="text-center text-sm text-muted-foreground">
          {mode === 'focus' && (
            <p>Focus on your studies for {TIMER_PRESETS.focus / 60} minutes</p>
          )}
          {mode === 'short_break' && (
            <p>Take a {TIMER_PRESETS.short_break / 60} minute break</p>
          )}
          {mode === 'long_break' && (
            <p>Take a {TIMER_PRESETS.long_break / 60} minute break</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
