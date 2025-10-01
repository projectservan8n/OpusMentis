'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Clock,
  Save,
  Send,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import QuestionCard from '@/components/question-card'

interface Question {
  type: 'multipleChoice' | 'trueFalse' | 'shortAnswer' | 'essay'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  points: number
}

interface Quiz {
  id: string
  title: string
  difficulty: string
  questions: Question[]
  totalPoints: number
  createdAt: string
}

interface Answer {
  questionIndex: number
  answer: string
}

export default function QuizTakingPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params?.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [startTime, setStartTime] = useState<Date>(new Date())
  const [autoSaving, setAutoSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Load quiz
  useEffect(() => {
    if (!quizId) return

    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${quizId}`)
        if (!response.ok) throw new Error('Failed to fetch quiz')

        const data = await response.json()
        setQuiz(data)
        setStartTime(new Date())
      } catch (error) {
        console.error('Error fetching quiz:', error)
        toast.error('Failed to load quiz')
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId, router])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!quiz) return

    const interval = setInterval(() => {
      handleAutoSave()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [quiz, answers])

  const handleAutoSave = async () => {
    if (Object.keys(answers).length === 0) return

    setAutoSaving(true)
    try {
      // Save draft to local storage
      localStorage.setItem(
        `quiz-${quizId}-draft`,
        JSON.stringify({
          answers,
          timestamp: new Date().toISOString()
        })
      )
      setAutoSaving(false)
    } catch (error) {
      console.error('Auto-save failed:', error)
      setAutoSaving(false)
    }
  }

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    if (!quiz) return

    // Check if all questions are answered
    const unansweredCount = quiz.questions.length - Object.keys(answers).length
    if (unansweredCount > 0) {
      const confirm = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Submit anyway?`
      )
      if (!confirm) return
    }

    setSubmitting(true)

    try {
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)

      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers: Object.entries(answers).map(([index, answer]) => ({
            questionIndex: parseInt(index),
            answer
          })),
          timeSpent
        })
      })

      if (!response.ok) throw new Error('Failed to submit quiz')

      const attempt = await response.json()

      // Clear draft
      localStorage.removeItem(`quiz-${quizId}-draft`)

      // Redirect to results
      toast.success('Quiz submitted!')
      router.push(`/quiz-attempts/${attempt.id}`)

    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!quiz) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <p className="text-lg text-muted-foreground">Quiz not found</p>
          <Button onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100
  const answeredCount = Object.keys(answers).length
  const currentQuestionData = quiz.questions[currentQuestion]

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Exit Quiz
          </Button>
          <div className="flex items-center gap-2">
            {autoSaving && (
              <Badge variant="outline" className="gap-1">
                <Save className="h-3 w-3" />
                Saving...
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {Math.floor((new Date().getTime() - startTime.getTime()) / 60000)} min
            </Badge>
          </div>
        </div>

        {/* Quiz Info */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </CardDescription>
              </div>
              <Badge>{quiz.difficulty}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {answeredCount}/{quiz.questions.length} answered
                </span>
              </div>
              <Progress value={progress} />
            </div>

            {/* Question */}
            <QuestionCard
              question={currentQuestionData}
              questionNumber={currentQuestion + 1}
              answer={answers[currentQuestion] || ''}
              onAnswerChange={(answer) => handleAnswerChange(currentQuestion, answer)}
            />

            {/* Navigation */}
            <div className="flex flex-col gap-4 pt-4 border-t">
              {/* Quick Jump Navigation - Hidden on mobile, scrollable on larger screens */}
              <div className="hidden lg:block overflow-x-auto">
                <div className="flex items-center gap-2 min-w-min px-1 py-2">
                  {quiz.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                        index === currentQuestion
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                          : answers[index]
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                      title={`Question ${index + 1}${answers[index] ? ' (Answered)' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Previous/Next Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Button>

                <div className="text-sm text-muted-foreground font-medium">
                  {currentQuestion + 1} / {quiz.questions.length}
                </div>

                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Submitting...</span>
                        <span className="sm:hidden">Submit</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Submit Quiz</span>
                        <span className="sm:hidden">Submit</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    <span className="hidden sm:inline mr-2">Next</span>
                    <span className="sm:hidden mr-2">Next</span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Answer Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`aspect-square rounded flex items-center justify-center text-xs font-medium transition-colors ${
                    index === currentQuestion
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  } ${
                    answers[index]
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  title={answers[index] ? 'Answered' : 'Not answered'}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
