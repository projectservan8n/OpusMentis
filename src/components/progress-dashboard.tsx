'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Flame,
  Clock,
  Brain,
  CheckCircle,
  TrendingUp,
  Calendar,
  Target,
  Award,
  Zap
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Achievement {
  id: string
  type: string
  title: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  unlockedAt: string
}

interface UserProgress {
  totalStudyTime: number
  currentStreak: number
  longestStreak: number
  lastStudyDate: string | null
  totalFlashcardsReviewed: number
  totalFlashcardsMastered: number
  totalKanbanCompleted: number
  totalQuizzesTaken: number
  totalQuizScore: number
  pomodorosCompleted: number
}

interface ProgressData {
  progress: UserProgress
  achievements: Achievement[]
  weeklyStats: {
    studyTime: number
    sessions: number
    daily: Array<{
      date: string
      studyTime: number
      sessions: number
    }>
  }
  flashcardStats: {
    learning: number
    young: number
    mature: number
    mastered: number
  }
}

const tierColors = {
  bronze: 'bg-orange-100 text-orange-800 border-orange-300',
  silver: 'bg-gray-100 text-gray-800 border-gray-300',
  gold: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  platinum: 'bg-purple-100 text-purple-800 border-purple-300'
}

const tierIcons = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  platinum: '💎'
}

export default function ProgressDashboard() {
  const [data, setData] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/user-progress')
      if (response.ok) {
        const progressData = await response.json()
        setData(progressData)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-pulse">Loading progress...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No progress data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { progress, achievements, weeklyStats, flashcardStats } = data

  // Calculate weekly goal progress (target: 5 hours/week)
  const weeklyGoal = 5 * 3600 // 5 hours in seconds
  const weeklyProgress = Math.min((weeklyStats.studyTime / weeklyGoal) * 100, 100)

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-bold">{progress.currentStreak}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold">{Math.floor(progress.totalStudyTime / 3600)}</p>
                <p className="text-xs text-muted-foreground">hours</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pomodoros</p>
                <p className="text-2xl font-bold">{progress.pomodorosCompleted}</p>
                <p className="text-xs text-muted-foreground">sessions</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Achievements</p>
                <p className="text-2xl font-bold">{achievements.length}</p>
                <p className="text-xs text-muted-foreground">unlocked</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week
          </CardTitle>
          <CardDescription>
            {formatTime(weeklyStats.studyTime)} of 5 hours goal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={weeklyProgress} className="h-2" />

          <div className="grid grid-cols-7 gap-2">
            {weeklyStats.daily.map((day, index) => {
              const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
              const hasActivity = day.studyTime > 0
              const intensity = Math.min((day.studyTime / 3600) * 100, 100) // Max 1 hour = 100%

              return (
                <div key={index} className="text-center">
                  <div
                    className={`h-16 rounded-lg mb-1 ${
                      hasActivity
                        ? intensity > 66 ? 'bg-green-500'
                        : intensity > 33 ? 'bg-green-300'
                        : 'bg-green-100'
                        : 'bg-muted'
                    }`}
                    title={`${dayName}: ${formatTime(day.studyTime)}`}
                  />
                  <p className="text-xs text-muted-foreground">{dayName}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Mastery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Flashcard Mastery
          </CardTitle>
          <CardDescription>
            {progress.totalFlashcardsMastered} cards mastered out of {progress.totalFlashcardsReviewed} reviewed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Learning</span>
                <span className="text-sm font-medium">{flashcardStats.learning}</span>
              </div>
              <Progress value={(flashcardStats.learning / (progress.totalFlashcardsReviewed || 1)) * 100} className="h-2 bg-gray-100" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Young</span>
                <span className="text-sm font-medium">{flashcardStats.young}</span>
              </div>
              <Progress value={(flashcardStats.young / (progress.totalFlashcardsReviewed || 1)) * 100} className="h-2 bg-blue-100" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Mature</span>
                <span className="text-sm font-medium">{flashcardStats.mature}</span>
              </div>
              <Progress value={(flashcardStats.mature / (progress.totalFlashcardsReviewed || 1)) * 100} className="h-2 bg-green-100" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Mastered</span>
                <span className="text-sm font-medium">{flashcardStats.mastered}</span>
              </div>
              <Progress value={(flashcardStats.mastered / (progress.totalFlashcardsReviewed || 1)) * 100} className="h-2 bg-purple-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements ({achievements.length})
          </CardTitle>
          <CardDescription>
            Your study milestones and badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.slice(0, 6).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${tierColors[achievement.tier]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <span className="text-xs">{tierIcons[achievement.tier]}</span>
                      </div>
                      <p className="text-sm mb-2">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Unlocked {formatDistanceToNow(new Date(achievement.unlockedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Start studying to unlock achievements!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4" />
              Kanban Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{progress.totalKanbanCompleted}</div>
            <p className="text-sm text-muted-foreground">tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              Quiz Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {progress.totalQuizzesTaken > 0 ? Math.round(progress.totalQuizScore) : 0}%
            </div>
            <p className="text-sm text-muted-foreground">
              average across {progress.totalQuizzesTaken} quizzes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Longest Streak */}
      {progress.longestStreak > 0 && (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold">Longest Study Streak</h4>
                <p className="text-2xl font-bold text-primary">
                  {progress.longestStreak} days
                </p>
                <p className="text-sm text-muted-foreground">
                  Keep it up! Current streak: {progress.currentStreak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
