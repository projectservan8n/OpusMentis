'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2 } from 'lucide-react'

interface Question {
  type: 'multipleChoice' | 'trueFalse' | 'shortAnswer' | 'essay'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  points: number
}

interface QuestionCardProps {
  question: Question
  questionNumber: number
  answer: string
  onAnswerChange: (answer: string) => void
  showAnswer?: boolean
  isCorrect?: boolean
}

export default function QuestionCard({
  question,
  questionNumber,
  answer,
  onAnswerChange,
  showAnswer = false,
  isCorrect
}: QuestionCardProps) {
  const getQuestionTypeLabel = () => {
    switch (question.type) {
      case 'multipleChoice':
        return 'Multiple Choice'
      case 'trueFalse':
        return 'True/False'
      case 'shortAnswer':
        return 'Short Answer'
      case 'essay':
        return 'Essay'
    }
  }

  const getQuestionTypeColor = () => {
    switch (question.type) {
      case 'multipleChoice':
        return 'bg-blue-500'
      case 'trueFalse':
        return 'bg-green-500'
      case 'shortAnswer':
        return 'bg-purple-500'
      case 'essay':
        return 'bg-orange-500'
    }
  }

  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-4">
        {/* Question Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={`${getQuestionTypeColor()} text-white`}>
                {getQuestionTypeLabel()}
              </Badge>
              <Badge variant="outline">{question.points} pts</Badge>
              {showAnswer && isCorrect !== undefined && (
                <Badge variant={isCorrect ? 'default' : 'destructive'}>
                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-medium leading-relaxed">
              {questionNumber}. {question.question}
            </h3>
          </div>
        </div>

        {/* Answer Area */}
        <div className="space-y-3">
          {question.type === 'multipleChoice' && (
            <div className="space-y-2">
              {question.options?.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index) // A, B, C, D
                const isSelected = answer === optionLetter
                const isCorrectOption = showAnswer && question.correctAnswer === optionLetter

                return (
                  <button
                    key={index}
                    onClick={() => !showAnswer && onAnswerChange(optionLetter)}
                    disabled={showAnswer}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      showAnswer
                        ? isCorrectOption
                          ? 'border-green-500 bg-green-50'
                          : isSelected
                          ? 'border-red-500 bg-red-50'
                          : 'border-border bg-muted/30'
                        : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                          showAnswer && isCorrectOption
                            ? 'bg-green-500 text-white'
                            : isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {optionLetter}
                      </div>
                      <span className="flex-1">{option}</span>
                      {showAnswer && isCorrectOption && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {question.type === 'trueFalse' && (
            <div className="flex gap-4">
              {['True', 'False'].map((option) => {
                const isSelected = answer === option
                const isCorrectOption = showAnswer && question.correctAnswer === option

                return (
                  <button
                    key={option}
                    onClick={() => !showAnswer && onAnswerChange(option)}
                    disabled={showAnswer}
                    className={`flex-1 p-4 rounded-lg border-2 font-medium transition-all ${
                      showAnswer
                        ? isCorrectOption
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : isSelected
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-border bg-muted/30'
                        : isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {option}
                      {showAnswer && isCorrectOption && (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {question.type === 'shortAnswer' && (
            <div className="space-y-2">
              <Label htmlFor={`answer-${questionNumber}`}>
                Your Answer (1-2 sentences)
              </Label>
              <Textarea
                id={`answer-${questionNumber}`}
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={showAnswer}
                placeholder="Type your answer here..."
                rows={3}
                className={showAnswer ? 'bg-muted/30' : ''}
              />
              {showAnswer && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-1">Expected Answer:</p>
                  <p className="text-sm text-green-800">{question.correctAnswer}</p>
                </div>
              )}
            </div>
          )}

          {question.type === 'essay' && (
            <div className="space-y-2">
              <Label htmlFor={`answer-${questionNumber}`}>
                Your Essay Response (Paragraph-length)
              </Label>
              <Textarea
                id={`answer-${questionNumber}`}
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                disabled={showAnswer}
                placeholder="Write your detailed response here..."
                rows={8}
                className={`font-sans ${showAnswer ? 'bg-muted/30' : ''}`}
              />
              {showAnswer && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Key Points to Cover:</p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">
                    {question.correctAnswer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explanation (shown after submission) */}
        {showAnswer && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-2">Explanation:</p>
            <p className="text-sm leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
