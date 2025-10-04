'use client'

import { useState, Fragment } from 'react'
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
import { Highlight } from '@/types/highlight'

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
    <>
    <Card className="h-fit max-h-[calc(100vh-24rem)] flex flex-col">
      {/* Header with Stats */}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Highlighter className="h-4 w-4" />
            Highlights ({filteredHighlights.length})
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-4">
        {/* Filters - Compact */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5 text-muted-foreground">
              <Filter className="h-3 w-3" />
              Color
            </label>
            <div className="flex gap-1.5 flex-wrap">
              <Button
                variant={selectedColor === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedColor(null)}
                className="h-7 text-xs px-2"
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
                    className="h-7 text-xs px-2"
                  >
                    <div className={`w-2.5 h-2.5 rounded mr-1.5 ${color.class}`} />
                    {count}
                  </Button>
                )
              })}
            </div>
          </div>

          {pages.length > 1 && (
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Page</label>
              <div className="flex gap-1.5 flex-wrap">
                <Button
                  variant={selectedPage === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPage(null)}
                  className="h-7 text-xs px-2"
                >
                  All
                </Button>
                {pages.slice(0, 10).map(page => (
                  <Button
                    key={page}
                    variant={selectedPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedPage(page)}
                    className="h-7 text-xs px-2"
                  >
                    {page}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {filteredHighlights.length > 0 && onGenerateQuiz && (
          <Button
            className="w-full h-8 text-xs"
            size="sm"
            onClick={handleGenerateQuizFromSelected}
          >
            <FileQuestion className="h-3 w-3 mr-1.5" />
            Quiz from {selectedColor || 'all'}
          </Button>
        )}

        {/* Highlights List */}
        <div className="space-y-2">
          {filteredHighlights.map(highlight => {
            const colorInfo = colors.find(c => c.name === highlight.color)
            const isExpanded = expandedHighlights.has(highlight.id)

            return (
              <div key={highlight.id} className="border rounded-lg p-3 hover:bg-muted/30 transition-colors">
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                      <div className={`w-3 h-3 rounded flex-shrink-0 ${colorInfo?.class}`} />
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                        P{highlight.pageNumber}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleHighlight(highlight.id)}
                      className="h-6 w-6 p-0"
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>

                  {/* Text Preview */}
                  <p
                    className="text-xs leading-relaxed cursor-pointer hover:text-primary transition-colors"
                    onClick={() => onHighlightClick?.(highlight)}
                  >
                    {highlight.text.length > 120 && !isExpanded
                      ? `${highlight.text.substring(0, 120)}...`
                      : highlight.text}
                  </p>

                  {/* Note Section */}
                  {(isExpanded || highlight.note) && (
                    <div className="pt-2 space-y-2">
                      {highlight.note && !editingNote && (
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          <div className="flex items-start gap-1.5">
                            <StickyNote className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <p className="flex-1 leading-relaxed">{highlight.note}</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      {isExpanded && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditNote(highlight)}
                            className="h-7 text-xs px-2"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            {highlight.note ? 'Edit' : 'Note'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onHighlightClick?.(highlight)}
                            className="h-7 text-xs px-2"
                          >
                            Jump
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onHighlightDelete?.(highlight.id)}
                            className="h-7 text-xs px-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>

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
    </>
  )
}
