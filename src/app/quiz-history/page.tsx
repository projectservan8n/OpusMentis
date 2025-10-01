'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Clock,
  Target,
  Calendar,
  ArrowRight,
  Loader2,
  Brain,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface QuizAttemptListItem {
  id: string
  quizId: string
  score: number
  totalPoints: number
  timeSpent: number
  completedAt: string
  quiz: {
    id: string
    title: string
    difficulty: string
    studyPack: {
      id: string
      title: string
    }
  }
  correctAnswers?: number
  totalQuestions?: number
}

export default function QuizHistoryPage() {
  const router = useRouter()
  const [attempts, setAttempts] = useState<QuizAttemptListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAttempts: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    bestScore: 0
  })

  useEffect(() => {
    fetchQuizHistory()
  }, [])

  const fetchQuizHistory = async () => {
    try {
      const response = await fetch('/api/quiz-attempts')
      if (!response.ok) throw new Error('Failed to fetch quiz history')

      const data = await response.json()
      setAttempts(data.attempts || [])

      // Calculate stats
      if (data.attempts && data.attempts.length > 0) {
        const totalAttempts = data.attempts.length
        const scores = data.attempts.map((a: QuizAttemptListItem) =>
          (a.score / a.totalPoints) * 100
        )
        const averageScore = scores.reduce((a: number, b: number) => a + b, 0) / totalAttempts
        const bestScore = Math.max(...scores)
        const totalTimeSpent = data.attempts.reduce(
          (acc: number, a: QuizAttemptListItem) => acc + (a.timeSpent || 0),
          0
        )

        setStats({
          totalAttempts,
          averageScore: Math.round(averageScore),
          totalTimeSpent,
          bestScore: Math.round(bestScore)
        })
      }
    } catch (error) {
      console.error('Error fetching quiz history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number, totalPoints: number) => {
    const percentage = (score / totalPoints) * 100
    if (percentage >= 90) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number, totalPoints: number) => {
    const percentage = (score / totalPoints) * 100
    if (percentage >= 90) return <Badge className="bg-green-100 text-green-700 border-0">Excellent</Badge>
    if (percentage >= 75) return <Badge className="bg-blue-100 text-blue-700 border-0">Good</Badge>
    if (percentage >= 60) return <Badge className="bg-yellow-100 text-yellow-700 border-0">Pass</Badge>
    return <Badge className="bg-red-100 text-red-700 border-0">Needs Improvement</Badge>
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  if (loading) {
    return (
      <DashboardLayout title="Quiz History" subtitle="Review your past quiz attempts">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Quiz History" subtitle="Review your past quiz attempts">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <div className="text-2xl font-bold">{stats.totalAttempts}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div className="text-2xl font-bold">{stats.bestScore}%</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                <div className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Attempts List */}
        {attempts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Brain className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Quiz History Yet</h3>
              <p className="text-muted-foreground text-center mb-6">
                Take your first quiz to start tracking your progress!
              </p>
              <Link href="/dashboard">
                <Button>
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Attempts</h2>
              <Badge variant="secondary">{attempts.length} total</Badge>
            </div>

            {attempts.map((attempt) => {
              const percentage = Math.round((attempt.score / attempt.totalPoints) * 100)
              const isPassing = percentage >= 60

              return (
                <Card key={attempt.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg">{attempt.quiz.title}</CardTitle>
                          <Badge variant="outline">{attempt.quiz.difficulty}</Badge>
                          {getScoreBadge(attempt.score, attempt.totalPoints)}
                        </div>
                        <CardDescription className="flex items-center gap-2">
                          <span>{attempt.quiz.studyPack.title}</span>
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className={`text-3xl font-bold ${getScoreColor(attempt.score, attempt.totalPoints)}`}>
                          {percentage}%
                        </div>
                        {isPassing ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{attempt.score} / {attempt.totalPoints} points</span>
                        </div>
                        {attempt.correctAnswers !== undefined && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>{attempt.correctAnswers} / {attempt.totalQuestions} correct</span>
                          </div>
                        )}
                        {attempt.timeSpent && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(attempt.timeSpent)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      <Link href={`/quiz-attempts/${attempt.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
