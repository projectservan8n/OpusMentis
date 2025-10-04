'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  Clock,
  Wifi,
  WifiOff
} from 'lucide-react'

interface StudyTimerProps {
  studyPackId: string
  onSessionComplete?: (duration: number) => void
}

type TimerMode = 'focus' | 'short_break' | 'long_break'

const TIMER_PRESETS = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60
}

const SYNC_INTERVAL = 3000 // Sync every 3 seconds
const POLL_INTERVAL = 5000 // Poll for updates every 5 seconds

export default function StudyTimer({ studyPackId, onSessionComplete }: StudyTimerProps) {
  const [mode, setMode] = useState<TimerMode>('focus')
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [synced, setSynced] = useState(true)
  const [loading, setLoading] = useState(true)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
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

  // Fetch timer state from server
  const fetchTimerState = useCallback(async () => {
    try {
      const response = await fetch(`/api/study-sessions/timer?studyPackId=${studyPackId}`)
      if (!response.ok) throw new Error('Failed to fetch timer')

      const data = await response.json()

      if (data.timer) {
        const timer = data.timer
        setMode(timer.sessionType as TimerMode)
        setTimeLeft(timer.timeRemaining)
        setIsRunning(timer.isActive && !timer.isPaused)
        setSynced(true)
      } else {
        // No active timer - set to focus mode with default time
        setMode('focus')
        setTimeLeft(TIMER_PRESETS.focus)
        setIsRunning(false)
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch timer state:', error)
      setSynced(false)
      setLoading(false)
    }
  }, [studyPackId])

  // Initial load
  useEffect(() => {
    fetchTimerState()
  }, [fetchTimerState])

  // Polling for updates when running (to sync across devices)
  // Don't poll when stopped to avoid overwriting user's mode selection
  useEffect(() => {
    if (isRunning) {
      pollIntervalRef.current = setInterval(() => {
        fetchTimerState()
      }, POLL_INTERVAL)

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
      }
    }
  }, [isRunning, fetchTimerState])

  // Sync timer state to server
  const syncTimerState = useCallback(async () => {
    if (!isRunning) return

    try {
      await fetch('/api/study-sessions/timer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyPackId,
          timeRemaining: timeLeft,
          isPaused: false,
          sessionType: mode
        })
      })
      setSynced(true)
    } catch (error) {
      console.error('Failed to sync timer:', error)
      setSynced(false)
    }
  }, [studyPackId, timeLeft, mode, isRunning])

  // Auto-sync every SYNC_INTERVAL
  useEffect(() => {
    if (isRunning) {
      syncIntervalRef.current = setInterval(() => {
        syncTimerState()
      }, SYNC_INTERVAL)

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current)
        }
      }
    }
  }, [isRunning, syncTimerState])

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

  // Start or resume timer
  const startTimer = async () => {
    try {
      const response = await fetch('/api/study-sessions/timer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyPackId,
          sessionType: mode,
          timeRemaining: timeLeft
        })
      })

      if (!response.ok) throw new Error('Failed to start timer')

      setIsRunning(true)
      setSynced(true)
      notificationShownRef.current = false
    } catch (error) {
      console.error('Failed to start timer:', error)
      toast.error('Failed to start timer')
      setSynced(false)
    }
  }

  // Pause timer
  const pauseTimer = async () => {
    try {
      await fetch('/api/study-sessions/timer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyPackId,
          timeRemaining: timeLeft,
          isPaused: true,
          sessionType: mode
        })
      })

      setIsRunning(false)
      setSynced(true)
    } catch (error) {
      console.error('Failed to pause timer:', error)
      toast.error('Failed to pause timer')
      setSynced(false)
    }
  }

  // Reset timer
  const resetTimer = async () => {
    try {
      // Stop current timer
      await fetch(`/api/study-sessions/timer?studyPackId=${studyPackId}&completed=false`, {
        method: 'DELETE'
      })

      setTimeLeft(TIMER_PRESETS[mode])
      setIsRunning(false)
      setSynced(true)
      notificationShownRef.current = false
    } catch (error) {
      console.error('Failed to reset timer:', error)
      toast.error('Failed to reset timer')
    }
  }

  // Handle timer completion
  const handleTimerComplete = async () => {
    setIsRunning(false)

    // Stop timer in database
    try {
      await fetch(`/api/study-sessions/timer?studyPackId=${studyPackId}&completed=true`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('Failed to complete timer:', error)
    }

    if (mode === 'focus' && !notificationShownRef.current) {
      const newCount = pomodoroCount + 1
      setPomodoroCount(newCount)

      showNotification('🎉 Pomodoro Complete!', `Great job! You've completed ${newCount} Pomodoros today.`)
      toast.success(`Pomodoro ${newCount} complete! Time for a break.`)
      notificationShownRef.current = true

      onSessionComplete?.(TIMER_PRESETS.focus)

      // Auto-switch to break
      if (newCount % 4 === 0) {
        setMode('long_break')
        setTimeLeft(TIMER_PRESETS.long_break)
      } else {
        setMode('short_break')
        setTimeLeft(TIMER_PRESETS.short_break)
      }
    } else if (mode !== 'focus') {
      showNotification('✅ Break Complete!', 'Ready to focus again?')
      toast.success('Break time over! Ready for another session?')
      setMode('focus')
      setTimeLeft(TIMER_PRESETS.focus)
    }
  }

  // Change mode
  const changeMode = (newMode: TimerMode) => {
    if (isRunning) {
      toast.error('Stop the timer before changing modes')
      return
    }
    setMode(newMode)
    setTimeLeft(TIMER_PRESETS[newMode])
    notificationShownRef.current = false
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Study Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* Compact Header with Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Study Timer</span>
            {synced ? (
              <Wifi className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3 text-red-500" />
            )}
          </div>
          <Badge variant={mode === 'focus' ? 'default' : 'secondary'} className="text-xs">
            {mode === 'focus' ? 'Focus' : mode === 'short_break' ? 'Short Break' : 'Long Break'}
          </Badge>
        </div>

        {/* Compact Timer Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold tabular-nums">
            {formatTime(timeLeft)}
          </div>
          <Progress value={progress} className="h-1 mt-2" />
        </div>

        {/* Compact Controls */}
        <div className="flex gap-2">
          {!isRunning ? (
            <Button onClick={startTimer} className="flex-1" size="sm">
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="secondary" className="flex-1" size="sm">
              <Pause className="h-3 w-3 mr-1" />
              Pause
            </Button>
          )}
          <Button onClick={resetTimer} variant="outline" size="sm">
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        {/* Mode Selector - Minimized */}
        <div className="flex gap-1">
          <Button
            variant={mode === 'focus' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeMode('focus')}
            className="flex-1 h-7 text-xs"
          >
            Focus
          </Button>
          <Button
            variant={mode === 'short_break' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeMode('short_break')}
            className="flex-1 h-7 text-xs"
          >
            Short
          </Button>
          <Button
            variant={mode === 'long_break' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => changeMode('long_break')}
            className="flex-1 h-7 text-xs"
          >
            Long
          </Button>
        </div>

        {/* Pomodoro Counter - Compact */}
        {pomodoroCount > 0 && (
          <div className="text-center text-xs text-muted-foreground">
            🍅 {pomodoroCount} today
          </div>
        )}
      </CardContent>
    </Card>
  )
}
