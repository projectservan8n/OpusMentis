'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import QuestionCard from '@/components/question-card'
import {
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Download,
  Share2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

interface QuizAttempt {
  id: string
  quizId: string
  score: number
  totalPoints: number
  answers: Array<{ questionIndex: number; answer: string }>
  feedback: any[]
  timeSpent: number
  completedAt: string
  quiz: {
    id: string
    title: string
    difficulty: string
    questions: any[]
  }
}

export default function QuizResultsPage() {
  const params = useParams()
  const router = useRouter()
  const attemptId = params?.id as string

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)

  useEffect(() => {
    if (!attemptId) return

    const fetchAttempt = async () => {
      try {
        const response = await fetch(`/api/quiz-attempts/${attemptId}`)
        if (!response.ok) throw new Error('Failed to fetch results')

        const data = await response.json()
        setAttempt(data)
      } catch (error) {
        console.error('Error fetching results:', error)
        toast.error('Failed to load results')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchAttempt()
  }, [attemptId, router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!attempt) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg text-muted-foreground">Results not found</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const percentage = Math.round((attempt.score / attempt.totalPoints) * 100)
  const passed = percentage >= 60
  const timeSpentMinutes = Math.floor(attempt.timeSpent / 60)
  const timeSpentSeconds = attempt.timeSpent % 60

  // Calculate question type breakdown
  const questionTypeStats = attempt.quiz.questions.reduce((acc: any, q: any, idx: number) => {
    const feedback = attempt.feedback.find((f: any) => f.questionIndex === idx)
    const type = q.type

    if (!acc[type]) {
      acc[type] = { correct: 0, total: 0, points: 0, maxPoints: 0 }
    }

    acc[type].total++
    acc[type].maxPoints += q.points

    if (feedback) {
      if (feedback.isCorrect) acc[type].correct++
      acc[type].points += feedback.points || 0
    }

    return acc
  }, {})

  const currentQuestionData = attempt.quiz.questions[currentQuestion]
  const currentFeedback = attempt.feedback.find((f: any) => f.questionIndex === currentQuestion)
  const currentAnswer = attempt.answers.find((a: any) => a.questionIndex === currentQuestion)?.answer || ''

  const exportToPDF = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'export' })

      const response = await fetch(`/api/quiz-attempts/${attemptId}/export`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `quiz_results_${attempt.quiz.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF exported successfully!', { id: 'export' })
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export PDF', { id: 'export' })
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <Card className="border-2">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {passed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <Target className="h-16 w-16 text-blue-500" />
              )}
            </div>
            <CardTitle className="text-3xl">{attempt.quiz.title}</CardTitle>
            <CardDescription>
              Completed {formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {percentage}%
              </div>
              <p className="text-muted-foreground">
                {attempt.score} out of {attempt.totalPoints} points
              </p>
              <Badge
                variant={passed ? 'default' : 'destructive'}
                className="mt-2"
              >
                {passed ? 'Passed' : 'Needs Improvement'}
              </Badge>
            </div>

            <Progress value={percentage} className="h-3" />

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">
                    {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
                  </div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">
                    {attempt.feedback.filter((f: any) => f.isCorrect).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <div className="text-2xl font-bold">
                    {attempt.feedback.filter((f: any) => !f.isCorrect).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </CardContent>
              </Card>
            </div>

            {/* Question Type Breakdown */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance by Question Type
              </h3>
              {Object.entries(questionTypeStats).map(([type, stats]: [string, any]) => {
                const typePercentage = Math.round((stats.points / stats.maxPoints) * 100)
                const typeLabel = {
                  multipleChoice: 'Multiple Choice',
                  trueFalse: 'True/False',
                  shortAnswer: 'Short Answer',
                  essay: 'Essay'
                }[type] || type

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{typeLabel}</span>
                      <span className="text-muted-foreground">
                        {stats.correct}/{stats.total} correct • {stats.points}/{stats.maxPoints} pts
                      </span>
                    </div>
                    <Progress value={typePercentage} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>
              Review your answers and see detailed feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Navigation */}
            <div className="flex items-center justify-between pb-4 border-b">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2 overflow-x-auto max-w-xl">
                {attempt.quiz.questions.map((_: any, index: number) => {
                  const feedback = attempt.feedback.find((f: any) => f.questionIndex === index)
                  const isCorrect = feedback?.isCorrect

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                        index === currentQuestion
                          ? 'bg-primary text-primary-foreground'
                          : isCorrect
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {index + 1}
                    </button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestion(Math.min(attempt.quiz.questions.length - 1, currentQuestion + 1))}
                disabled={currentQuestion === attempt.quiz.questions.length - 1}
              >
                Next
              </Button>
            </div>

            {/* Current Question with Feedback */}
            <QuestionCard
              question={currentQuestionData}
              questionNumber={currentQuestion + 1}
              answer={currentAnswer}
              onAnswerChange={() => {}}
              showAnswer={true}
              isCorrect={currentFeedback?.isCorrect}
            />

            {/* AI Feedback for Subjective Questions */}
            {currentFeedback?.aiFeedback && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    AI Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {currentFeedback.aiFeedback}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="font-medium">Points Earned:</span>
                    <Badge variant="outline">
                      {currentFeedback.points}/{currentFeedback.maxPoints}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Want to improve your score?</h3>
                <p className="text-sm text-muted-foreground">
                  Review the material and try again
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/study-packs/${attempt.quiz.id}`)}
                >
                  Review Material
                </Button>
                <Button onClick={() => router.push(`/quizzes/${attempt.quizId}`)}>
                  Retake Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
