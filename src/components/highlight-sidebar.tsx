'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Highlighter,
  StickyNote,
  Trash2,
  Edit3,
  FileQuestion,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Highlight {
  id: string
  pageNumber: number
  coordinates: {
    x: number
    y: number
    width: number
    height: number
    pageHeight: number
    pageWidth: number
  }
  color: string
  text: string
  note?: string
  createdAt?: string
}

interface HighlightSidebarProps {
  highlights: Highlight[]
  onHighlightClick?: (highlight: Highlight) => void
  onHighlightDelete?: (highlightId: string) => void
  onHighlightUpdate?: (highlightId: string, note: string) => void
  onGenerateQuiz?: (highlightIds: string[]) => void
}

export default function HighlightSidebar({
  highlights,
  onHighlightClick,
  onHighlightDelete,
  onHighlightUpdate,
  onGenerateQuiz
}: HighlightSidebarProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedPage, setSelectedPage] = useState<number | null>(null)
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [expandedHighlights, setExpandedHighlights] = useState<Set<string>>(new Set())

  const colors = [
    { name: 'yellow', class: 'bg-yellow-300' },
    { name: 'green', class: 'bg-green-300' },
    { name: 'blue', class: 'bg-blue-300' },
    { name: 'pink', class: 'bg-pink-300' },
    { name: 'red', class: 'bg-red-300' }
  ]

  // Filter highlights
  const filteredHighlights = highlights.filter(h => {
    if (selectedColor && h.color !== selectedColor) return false
    if (selectedPage && h.pageNumber !== selectedPage) return false
    return true
  })

  // Group by color
  const highlightsByColor = colors.reduce((acc, color) => {
    acc[color.name] = filteredHighlights.filter(h => h.color === color.name)
    return acc
  }, {} as Record<string, Highlight[]>)

  // Get unique pages
  const pages = Array.from(new Set(highlights.map(h => h.pageNumber))).sort((a, b) => a - b)

  const toggleHighlight = (highlightId: string) => {
    setExpandedHighlights(prev => {
      const next = new Set(prev)
      if (next.has(highlightId)) {
        next.delete(highlightId)
      } else {
        next.add(highlightId)
      }
      return next
    })
  }

  const handleEditNote = (highlight: Highlight) => {
    setEditingNote(highlight.id)
    setNoteText(highlight.note || '')
  }

  const handleSaveNote = () => {
    if (editingNote) {
      onHighlightUpdate?.(editingNote, noteText)
      setEditingNote(null)
      setNoteText('')
    }
  }

  const handleGenerateQuizFromSelected = () => {
    const highlightIds = filteredHighlights.map(h => h.id)
    onGenerateQuiz?.(highlightIds)
  }

  if (highlights.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Highlighter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Highlights Yet</h3>
          <p className="text-muted-foreground text-sm">
            Enable highlighting and select text in the PDF to create highlights
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Highlighter className="h-5 w-5" />
              Highlights ({filteredHighlights.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filter by Color
              </label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedColor === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedColor(null)}
                >
                  All
                </Button>
                {colors.map(color => {
                  const count = highlightsByColor[color.name]?.length || 0
                  return (
                    <Button
                      key={color.name}
                      variant={selectedColor === color.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedColor(color.name)}
                      disabled={count === 0}
                    >
                      <div className={`w-3 h-3 rounded mr-2 ${color.class}`} />
                      {count}
                    </Button>
                  )
                })}
              </div>
            </div>

            {pages.length > 1 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Filter by Page</label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedPage === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPage(null)}
                  >
                    All Pages
                  </Button>
                  {pages.slice(0, 10).map(page => (
                    <Button
                      key={page}
                      variant={selectedPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPage(page)}
                    >
                      Page {page}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {filteredHighlights.length > 0 && onGenerateQuiz && (
            <Button
              className="w-full"
              onClick={handleGenerateQuizFromSelected}
            >
              <FileQuestion className="h-4 w-4 mr-2" />
              Generate Quiz from {selectedColor ? `${selectedColor} highlights` : 'these highlights'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Highlights List */}
      <div className="space-y-2">
        {filteredHighlights.map(highlight => {
          const colorInfo = colors.find(c => c.name === highlight.color)
          const isExpanded = expandedHighlights.has(highlight.id)

          return (
            <Card key={highlight.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-4 h-4 rounded ${colorInfo?.class}`} />
                      <Badge variant="secondary" className="text-xs">
                        Page {highlight.pageNumber}
                      </Badge>
                      {highlight.createdAt && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(highlight.createdAt), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleHighlight(highlight.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Text Preview */}
                  <p
                    className="text-sm cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onHighlightClick?.(highlight)}
                  >
                    {highlight.text.length > 100 && !isExpanded
                      ? `${highlight.text.substring(0, 100)}...`
                      : highlight.text}
                  </p>

                  {/* Note Section */}
                  {(isExpanded || highlight.note) && (
                    <div className="pt-2 border-t">
                      {highlight.note && !editingNote && (
                        <div className="bg-muted/50 p-3 rounded text-sm">
                          <div className="flex items-start gap-2">
                            <StickyNote className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <p className="flex-1">{highlight.note}</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {isExpanded && (
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditNote(highlight)}
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            {highlight.note ? 'Edit Note' : 'Add Note'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onHighlightClick?.(highlight)}
                          >
                            Go to Page
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onHighlightDelete?.(highlight.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Note Dialog */}
      <Dialog open={editingNote !== null} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to Highlight</DialogTitle>
            <DialogDescription>
              Add your thoughts, questions, or explanations for this highlight
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note here..."
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
