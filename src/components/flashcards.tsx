'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import toast from 'react-hot-toast'
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Brain,
  Sparkles
} from 'lucide-react'

interface Flashcard {
  id: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface FlashcardProps {
  flashcards: Flashcard[]
  studyPackId?: string
  onFlashcardsUpdated?: (flashcards: Flashcard[]) => void
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
}

export default function Flashcards({ flashcards, studyPackId, onFlashcardsUpdated }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set())
  const [correctCards, setCorrectCards] = useState<Set<string>>(new Set())
  const [isRegenerating, setIsRegenerating] = useState(false)

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No flashcards available</h3>
        <p className="text-muted-foreground">
          Flashcards will be generated automatically when the AI processes your content.
        </p>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]
  const progress = studiedCards.size / flashcards.length * 100
  const accuracy = studiedCards.size > 0 ? correctCards.size / studiedCards.size * 100 : 0

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowAnswer(false)
    }
  }

  const markCorrect = () => {
    setStudiedCards(prev => new Set(prev).add(currentCard.id))
    setCorrectCards(prev => new Set(prev).add(currentCard.id))
    if (currentIndex < flashcards.length - 1) {
      nextCard()
    }
  }

  const markIncorrect = () => {
    setStudiedCards(prev => new Set(prev).add(currentCard.id))
    setCorrectCards(prev => {
      const newSet = new Set(prev)
      newSet.delete(currentCard.id) // Remove if it was previously marked correct
      return newSet
    })
    if (currentIndex < flashcards.length - 1) {
      nextCard()
    }
  }

  const resetProgress = () => {
    setStudiedCards(new Set())
    setCorrectCards(new Set())
    setCurrentIndex(0)
    setShowAnswer(false)
  }

  const jumpToCard = (index: number) => {
    setCurrentIndex(index)
    setShowAnswer(false)
  }

  const regenerateFlashcards = async () => {
    if (!studyPackId) {
      toast.error('Cannot regenerate flashcards')
      return
    }

    try {
      setIsRegenerating(true)
      toast.loading('Regenerating flashcards with AI...', { id: 'regenerate' })

      const response = await fetch(`/api/study-packs/${studyPackId}/regenerate-flashcards`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to regenerate flashcards')
      }

      const data = await response.json()

      // Reset progress when flashcards are regenerated
      setStudiedCards(new Set())
      setCorrectCards(new Set())
      setCurrentIndex(0)
      setShowAnswer(false)

      // Update parent component with new flashcards
      if (onFlashcardsUpdated) {
        onFlashcardsUpdated(data.flashcards)
      }

      toast.success(`${data.count} new flashcards generated!`, { id: 'regenerate' })
    } catch (error: any) {
      console.error('Regenerate flashcards error:', error)
      toast.error(error.message || 'Failed to regenerate flashcards', { id: 'regenerate' })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Flashcards</h3>
            <p className="text-sm text-muted-foreground">
              Study with AI-generated flashcards
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {studyPackId && (
              <Button
                variant="default"
                onClick={regenerateFlashcards}
                disabled={isRegenerating}
                className="text-sm"
                size="sm"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                <span className="sm:hidden">Regen</span>
              </Button>
            )}
            <Button variant="outline" onClick={resetProgress} className="text-sm" size="sm">
              <RotateCcw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Reset Progress</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{currentIndex + 1}</div>
            <div className="text-xs text-muted-foreground">of {flashcards.length}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(progress)}%</div>
            <div className="text-xs text-muted-foreground">studied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(accuracy)}%</div>
            <div className="text-xs text-muted-foreground">accuracy</div>
          </div>
        </div>

        <Progress value={progress} className="h-2" />
      </div>

      {/* Main flashcard */}
      <Card className="flashcard min-h-[300px]">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <Badge
              variant="secondary"
              className={difficultyColors[currentCard.difficulty]}
            >
              {currentCard.difficulty}
            </Badge>
            <div className="flex items-center space-x-2">
              {studiedCards.has(currentCard.id) && (
                <Badge
                  variant="secondary"
                  className={correctCards.has(currentCard.id)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }
                >
                  {correctCards.has(currentCard.id) ? 'Correct' : 'Incorrect'}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Question */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Question
              </h4>
              <p className="text-lg leading-relaxed">{currentCard.question}</p>
            </div>

            {/* Answer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Answer
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Reveal
                    </>
                  )}
                </Button>
              </div>

              {showAnswer ? (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-lg leading-relaxed">{currentCard.answer}</p>
                </div>
              ) : (
                <div className="p-4 bg-muted/20 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground text-center">
                    Click "Reveal" to see the answer
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {showAnswer && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={markIncorrect}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Incorrect
            </Button>
            <Button
              onClick={markCorrect}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Correct
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Card navigation */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3">Quick Navigation</h4>
        <div className="flex flex-wrap gap-2">
          {flashcards.map((card, index) => (
            <Button
              key={card.id}
              variant={index === currentIndex ? "default" : "outline"}
              size="sm"
              onClick={() => jumpToCard(index)}
              className={`
                ${studiedCards.has(card.id)
                  ? correctCards.has(card.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : ''
                }
              `}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}