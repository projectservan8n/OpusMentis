'use client'

import { useState, useEffect } from 'react'
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
  Sparkles,
  Calendar,
  Zap,
  TrendingUp
} from 'lucide-react'

interface Flashcard {
  id: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface FlashcardReview {
  id: string
  flashcardId: string
  easeFactor: number
  interval: number
  repetitions: number
  nextReviewDate: string
  lastReviewDate: string | null
  lastReviewRating: string | null
  totalReviews: number
  correctReviews: number
  masteryLevel: 'learning' | 'young' | 'mature' | 'mastered'
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

const masteryColors = {
  learning: 'bg-gray-100 text-gray-800',
  young: 'bg-blue-100 text-blue-800',
  mature: 'bg-green-100 text-green-800',
  mastered: 'bg-purple-100 text-purple-800'
}

export default function Flashcards({ flashcards, studyPackId, onFlashcardsUpdated }: FlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set())
  const [correctCards, setCorrectCards] = useState<Set<string>>(new Set())
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [reviews, setReviews] = useState<Map<string, FlashcardReview>>(new Map())
  const [reviewStats, setReviewStats] = useState<any>(null)
  const [reviewMode, setReviewMode] = useState(false) // Only show due cards
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)

  // Fetch flashcard reviews on mount
  useEffect(() => {
    if (studyPackId) {
      fetchReviews()
    }
  }, [studyPackId])

  const fetchReviews = async () => {
    if (!studyPackId) return

    try {
      setIsLoadingReviews(true)
      const response = await fetch(`/api/flashcard-reviews?studyPackId=${studyPackId}`)
      if (response.ok) {
        const data = await response.json()
        const reviewMap = new Map<string, FlashcardReview>()
        data.reviews.forEach((r: FlashcardReview) => {
          reviewMap.set(r.flashcardId, r)
        })
        setReviews(reviewMap)
        setReviewStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  const recordReview = async (flashcardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!studyPackId) return

    try {
      const response = await fetch('/api/flashcard-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyPackId,
          flashcardId,
          rating
        })
      })

      if (response.ok) {
        const data = await response.json()
        const newReviews = new Map(reviews)
        newReviews.set(flashcardId, data.review)
        setReviews(newReviews)

        // Show next review info
        const days = data.nextReview.interval
        const dayText = days === 1 ? 'day' : 'days'
        toast.success(`Review recorded! Next review in ${days} ${dayText}`)

        // Refresh stats
        await fetchReviews()
      }
    } catch (error) {
      console.error('Failed to record review:', error)
      toast.error('Failed to record review')
    }
  }

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

  // Filter flashcards based on review mode
  const displayFlashcards = reviewMode && studyPackId
    ? flashcards.filter(card => {
        const review = reviews.get(card.id)
        if (!review) return true // New cards are always due
        return new Date(review.nextReviewDate) <= new Date()
      })
    : flashcards

  if (displayFlashcards.length === 0 && reviewMode) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
        <p className="text-muted-foreground mb-4">
          No flashcards are due for review right now.
        </p>
        <Button onClick={() => setReviewMode(false)}>
          View All Flashcards
        </Button>
      </div>
    )
  }

  const currentCard = displayFlashcards[currentIndex]
  const currentReview = reviews.get(currentCard.id)
  const progress = studiedCards.size / displayFlashcards.length * 100
  const accuracy = studiedCards.size > 0 ? correctCards.size / studiedCards.size * 100 : 0

  const nextCard = () => {
    if (currentIndex < displayFlashcards.length - 1) {
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

  const handleReviewRating = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const isCorrect = rating === 'good' || rating === 'easy'

    // Update local studied/correct state
    setStudiedCards(prev => new Set(prev).add(currentCard.id))
    if (isCorrect) {
      setCorrectCards(prev => new Set(prev).add(currentCard.id))
    } else {
      setCorrectCards(prev => {
        const newSet = new Set(prev)
        newSet.delete(currentCard.id)
        return newSet
      })
    }

    // Record review if studyPackId exists
    if (studyPackId) {
      await recordReview(currentCard.id, rating)
    }

    // Move to next card
    if (currentIndex < displayFlashcards.length - 1) {
      nextCard()
    }
  }

  const markCorrect = () => {
    setStudiedCards(prev => new Set(prev).add(currentCard.id))
    setCorrectCards(prev => new Set(prev).add(currentCard.id))
    if (currentIndex < displayFlashcards.length - 1) {
      nextCard()
    }
  }

  const markIncorrect = () => {
    setStudiedCards(prev => new Set(prev).add(currentCard.id))
    setCorrectCards(prev => {
      const newSet = new Set(prev)
      newSet.delete(currentCard.id)
      return newSet
    })
    if (currentIndex < displayFlashcards.length - 1) {
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
              {reviewMode ? 'Review due flashcards' : 'Study with AI-generated flashcards'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {studyPackId && reviewStats && (
              <Button
                variant={reviewMode ? "default" : "outline"}
                onClick={() => {
                  setReviewMode(!reviewMode)
                  setCurrentIndex(0)
                  setShowAnswer(false)
                }}
                className="text-sm"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  {reviewMode ? 'All Cards' : `Review (${reviewStats.dueCards})`}
                </span>
                <span className="sm:hidden">
                  {reviewMode ? 'All' : `Due (${reviewStats.dueCards})`}
                </span>
              </Button>
            )}
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

        {/* Stats with spaced repetition info */}
        {studyPackId && reviewStats && !isLoadingReviews ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{reviewStats.dueCards}</div>
              <div className="text-xs text-muted-foreground">Due Today</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{reviewStats.masteredCards}</div>
              <div className="text-xs text-muted-foreground">Mastered</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{currentIndex + 1}/{displayFlashcards.length}</div>
              <div className="text-xs text-muted-foreground">Current</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{reviewStats.accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{currentIndex + 1}</div>
              <div className="text-xs text-muted-foreground">of {displayFlashcards.length}</div>
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
        )}

        <Progress value={progress} className="h-2" />
      </div>

      {/* Main flashcard */}
      <Card className="flashcard min-h-[300px]">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={difficultyColors[currentCard.difficulty]}
              >
                {currentCard.difficulty}
              </Badge>
              {currentReview && (
                <Badge
                  variant="secondary"
                  className={masteryColors[currentReview.masteryLevel]}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {currentReview.masteryLevel}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {currentReview && (
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  {currentReview.totalReviews} reviews
                </Badge>
              )}
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
          studyPackId ? (
            // Spaced repetition mode with 4 buttons
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReviewRating('again')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Again
                <span className="hidden sm:inline ml-1 text-xs">&lt;1d</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReviewRating('hard')}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                Hard
                <span className="hidden sm:inline ml-1 text-xs">~1d</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReviewRating('good')}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                Good
                {currentReview && (
                  <span className="hidden sm:inline ml-1 text-xs">
                    ~{Math.ceil(currentReview.interval * currentReview.easeFactor)}d
                  </span>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => handleReviewRating('easy')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Easy
                {currentReview && (
                  <span className="hidden sm:inline ml-1 text-xs">
                    ~{Math.ceil(currentReview.interval * currentReview.easeFactor * 1.3)}d
                  </span>
                )}
              </Button>
            </div>
          ) : (
            // Simple correct/incorrect mode
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
          )
        )}

        <Button
          variant="outline"
          onClick={nextCard}
          disabled={currentIndex === displayFlashcards.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Card navigation */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-3">Quick Navigation</h4>
        <div className="flex flex-wrap gap-2">
          {displayFlashcards.map((card, index) => {
            const cardReview = reviews.get(card.id)
            return (
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
                    : cardReview?.masteryLevel === 'mastered'
                      ? 'border-purple-500 bg-purple-50'
                      : cardReview?.masteryLevel === 'mature'
                        ? 'border-green-500'
                        : ''
                  }
                `}
              >
                {index + 1}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}