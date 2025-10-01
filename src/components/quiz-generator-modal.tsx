'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FileQuestion,
  Highlighter,
  BookOpen,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { Chapter, Section } from '@/lib/document-analyzer'
import { Highlight } from '@/types/highlight'

interface QuizGeneratorModalProps {
  open: boolean
  onClose: () => void
  studyPackId: string
  highlights?: Highlight[]
  documentStructure?: {
    chapters: Chapter[]
    sections: Section[]
    totalPages: number
  }
  onQuizGenerated?: (quizId: string) => void
}

type QuizSource = 'highlights' | 'chapters' | 'pages' | 'fullDocument'

export default function QuizGeneratorModal({
  open,
  onClose,
  studyPackId,
  highlights = [],
  documentStructure,
  onQuizGenerated
}: QuizGeneratorModalProps) {
  const [source, setSource] = useState<QuizSource>('highlights')
  const [quizTitle, setQuizTitle] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [questionCount, setQuestionCount] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)

  // Question types
  const [includeMultipleChoice, setIncludeMultipleChoice] = useState(true)
  const [includeTrueFalse, setIncludeTrueFalse] = useState(true)
  const [includeShortAnswer, setIncludeShortAnswer] = useState(false)
  const [includeEssay, setIncludeEssay] = useState(false)

  // Source-specific state
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>('all')
  const [selectedChapters, setSelectedChapters] = useState<string[]>([])
  const [pageRange, setPageRange] = useState({ start: 1, end: documentStructure?.totalPages || 1 })

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      // Build source details based on selected source
      let sourceDetails: any = {}

      if (source === 'highlights') {
        const filteredHighlights = selectedHighlightColor === 'all'
          ? highlights
          : highlights.filter(h => h.color === selectedHighlightColor)

        sourceDetails = {
          highlightIds: filteredHighlights.map(h => h.id),
          color: selectedHighlightColor
        }
      } else if (source === 'chapters') {
        sourceDetails = {
          chapters: selectedChapters
        }
      } else if (source === 'pages') {
        sourceDetails = {
          startPage: pageRange.start,
          endPage: pageRange.end
        }
      }

      // Call quiz generation API
      const response = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyPackId,
          title: quizTitle || `Quiz - ${new Date().toLocaleDateString()}`,
          source,
          sourceDetails,
          difficulty,
          questionCount,
          questionTypes: {
            multipleChoice: includeMultipleChoice,
            trueFalse: includeTrueFalse,
            shortAnswer: includeShortAnswer,
            essay: includeEssay
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate quiz')
      }

      const quiz = await response.json()

      onQuizGenerated?.(quiz.id)
      onClose()
    } catch (error) {
      console.error('Quiz generation error:', error)
      alert('Failed to generate quiz. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const highlightColors = [
    { name: 'all', label: 'All Colors', count: highlights.length },
    { name: 'yellow', label: 'Yellow', count: highlights.filter(h => h.color === 'yellow').length },
    { name: 'green', label: 'Green', count: highlights.filter(h => h.color === 'green').length },
    { name: 'blue', label: 'Blue', count: highlights.filter(h => h.color === 'blue').length },
    { name: 'pink', label: 'Pink', count: highlights.filter(h => h.color === 'pink').length },
    { name: 'red', label: 'Red', count: highlights.filter(h => h.color === 'red').length },
  ]

  const hasQuestionTypes = includeMultipleChoice || includeTrueFalse || includeShortAnswer || includeEssay

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Quiz with AI
          </DialogTitle>
          <DialogDescription>
            Create a personalized quiz from your study materials using GPT-4o-mini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quiz Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title (Optional)</Label>
            <Input
              id="title"
              placeholder="e.g., Chapter 3 Review Quiz"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
          </div>

          {/* Quiz Source */}
          <div className="space-y-2">
            <Label>Quiz Source</Label>
            <Tabs value={source} onValueChange={(v) => setSource(v as QuizSource)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="highlights" className="flex items-center gap-1">
                  <Highlighter className="h-3 w-3" />
                  Highlights
                </TabsTrigger>
                <TabsTrigger value="chapters" className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  Chapters
                </TabsTrigger>
                <TabsTrigger value="pages" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Page Range
                </TabsTrigger>
                <TabsTrigger value="fullDocument" className="flex items-center gap-1">
                  <FileQuestion className="h-3 w-3" />
                  Full Doc
                </TabsTrigger>
              </TabsList>

              <TabsContent value="highlights" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Generate quiz from your highlighted sections
                </p>
                <div className="space-y-2">
                  <Label>Select Highlight Color</Label>
                  <Select value={selectedHighlightColor} onValueChange={setSelectedHighlightColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {highlightColors.map(color => (
                        <SelectItem key={color.name} value={color.name} disabled={color.count === 0}>
                          <div className="flex items-center gap-2">
                            {color.name !== 'all' && (
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: color.name }}
                              />
                            )}
                            <span>{color.label}</span>
                            <Badge variant="outline" className="ml-auto">
                              {color.count}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="chapters" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Generate quiz from specific chapters or sections
                </p>
                {documentStructure?.chapters.length ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {documentStructure.chapters.map((chapter, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 border rounded">
                        <Checkbox
                          id={`chapter-${idx}`}
                          checked={selectedChapters.includes(chapter.title)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedChapters([...selectedChapters, chapter.title])
                            } else {
                              setSelectedChapters(selectedChapters.filter(c => c !== chapter.title))
                            }
                          }}
                        />
                        <label htmlFor={`chapter-${idx}`} className="flex-1 cursor-pointer">
                          <div className="font-medium text-sm">{chapter.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Pages {chapter.startPage}-{chapter.endPage}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No document structure available. Please analyze the document first.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="pages" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Generate quiz from a specific page range
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Page</Label>
                    <Input
                      type="number"
                      min={1}
                      max={documentStructure?.totalPages || 1}
                      value={pageRange.start}
                      onChange={(e) => setPageRange({ ...pageRange, start: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Page</Label>
                    <Input
                      type="number"
                      min={pageRange.start}
                      max={documentStructure?.totalPages || 1}
                      value={pageRange.end}
                      onChange={(e) => setPageRange({ ...pageRange, end: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fullDocument" className="space-y-3 mt-4">
                <p className="text-sm text-muted-foreground">
                  Generate quiz from the entire document
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    The AI will analyze the full document and create a comprehensive quiz covering all major topics.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Question Types */}
          <div className="space-y-3">
            <Label>Question Types</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mc"
                  checked={includeMultipleChoice}
                  onCheckedChange={(checked) => setIncludeMultipleChoice(checked as boolean)}
                />
                <label htmlFor="mc" className="text-sm cursor-pointer">
                  Multiple Choice
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tf"
                  checked={includeTrueFalse}
                  onCheckedChange={(checked) => setIncludeTrueFalse(checked as boolean)}
                />
                <label htmlFor="tf" className="text-sm cursor-pointer">
                  True/False
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sa"
                  checked={includeShortAnswer}
                  onCheckedChange={(checked) => setIncludeShortAnswer(checked as boolean)}
                />
                <label htmlFor="sa" className="text-sm cursor-pointer">
                  Short Answer
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="essay"
                  checked={includeEssay}
                  onCheckedChange={(checked) => setIncludeEssay(checked as boolean)}
                />
                <label htmlFor="essay" className="text-sm cursor-pointer">
                  Essay
                </label>
              </div>
            </div>
            {!hasQuestionTypes && (
              <p className="text-xs text-destructive">Please select at least one question type</p>
            )}
          </div>

          {/* Quiz Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number of Questions</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !hasQuestionTypes}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
