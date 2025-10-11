'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Target, BookOpen, Trophy } from 'lucide-react'

interface StudyProgressProps {
  flashcardsTotal: number
  flashcardsReviewed: number
  kanbanTasks: any[]
  notesCount: number
  studyTimeMinutes: number
}

export default function StudyProgress({
  flashcardsTotal,
  flashcardsReviewed,
  kanbanTasks,
  notesCount,
  studyTimeMinutes
}: StudyProgressProps) {
  // Calculate kanban completion
  const completedTasks = kanbanTasks.filter(task => task.status === 'done').length
  const totalTasks = kanbanTasks.length
  const kanbanProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Calculate flashcard progress
  const flashcardProgress = flashcardsTotal > 0 ? (flashcardsReviewed / flashcardsTotal) * 100 : 0

  // Calculate overall completion (average of all metrics)
  const overallProgress = Math.round(
    ((kanbanProgress + flashcardProgress) / 2)
  )

  // Format study time
  const formatStudyTime = (minutes: number) => {
    // Handle NaN or invalid values
    if (!minutes || isNaN(minutes) || minutes === 0) return '0m'
    if (minutes < 60) return `${Math.floor(minutes)}m`
    const hours = Math.floor(minutes / 60)
    const mins = Math.floor(minutes % 60)
    return `${hours}h ${mins}m`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4" />
          Study Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium">Overall Completion</span>
            <span className="text-xs font-bold text-primary">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Progress Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Flashcards */}
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-1 mb-1">
              <BookOpen className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Flashcards</span>
            </div>
            <div className="text-base font-bold text-blue-700">
              {flashcardsReviewed}/{flashcardsTotal}
            </div>
            <Progress value={flashcardProgress} className="h-1 mt-1" />
          </div>

          {/* Kanban Tasks */}
          <div className="p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-900">Tasks</span>
            </div>
            <div className="text-base font-bold text-green-700">
              {completedTasks}/{totalTasks}
            </div>
            <Progress value={kanbanProgress} className="h-1 mt-1" />
          </div>

          {/* Notes */}
          <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-1 mb-1">
              <BookOpen className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-900">Notes</span>
            </div>
            <div className="text-base font-bold text-purple-700">
              {notesCount}
            </div>
            <p className="text-[10px] text-purple-600 mt-0.5">notes taken</p>
          </div>

          {/* Study Time */}
          <div className="p-2 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="h-3 w-3 text-orange-600" />
              <span className="text-xs font-medium text-orange-900">Time</span>
            </div>
            <div className="text-base font-bold text-orange-700">
              {formatStudyTime(studyTimeMinutes)}
            </div>
            <p className="text-[10px] text-orange-600 mt-0.5">studied</p>
          </div>
        </div>

        {/* Achievement Badges */}
        {overallProgress === 100 && (
          <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-900">
              Study Pack Completed! 🎉
            </span>
          </div>
        )}
        {studyTimeMinutes >= 60 && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
            <Trophy className="h-3 w-3 mr-1" />
            1+ Hour Studied
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
