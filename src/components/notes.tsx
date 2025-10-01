'use client'

import React, { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ConfirmDialog from '@/components/confirm-dialog'
import { Plus, Edit2, Trash2, FileText, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Note {
  id: string
  content: string
  section?: string
  createdAt: string
  updatedAt: string
}

interface NotesProps {
  studyPackId: string
  initialNotes?: Note[]
}

const sections = [
  { id: 'general', label: 'General', color: 'bg-gray-100 text-gray-800' },
  { id: 'summary', label: 'Summary', color: 'bg-blue-100 text-blue-800' },
  { id: 'kanban', label: 'Kanban', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'flashcards', label: 'Flashcards', color: 'bg-green-100 text-green-800' },
]

export default function Notes({ studyPackId, initialNotes = [] }: NotesProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [isAdding, setIsAdding] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteSection, setNewNoteSection] = useState('general')
  const [loading, setLoading] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()
  }, [studyPackId])

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/study-packs/${studyPackId}/notes`)
      if (!response.ok) throw new Error('Failed to fetch notes')

      const fetchedNotes = await response.json()
      setNotes(fetchedNotes)
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    }
  }

  const addNote = async () => {
    if (!newNoteContent.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/study-packs/${studyPackId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newNoteContent.trim(),
          section: newNoteSection
        }),
      })

      if (!response.ok) throw new Error('Failed to create note')

      const newNote = await response.json()
      setNotes((prev: Note[]) => [newNote, ...prev])
      setNewNoteContent('')
      setNewNoteSection('general')
      setIsAdding(false)
      toast.success('Note added successfully')
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    } finally {
      setLoading(false)
    }
  }

  const updateNote = async (noteId: string, content: string, section: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim(), section }),
      })

      if (!response.ok) throw new Error('Failed to update note')

      const updatedNote = await response.json()
      setNotes((prev: Note[]) => prev.map((note: Note) =>
        note.id === noteId ? updatedNote : note
      ))
      setEditingNote(null)
      toast.success('Note updated successfully')
    } catch (error) {
      console.error('Error updating note:', error)
      toast.error('Failed to update note')
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!noteToDelete) return

    setLoading(true)
    try {
      const response = await fetch(`/api/notes/${noteToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete note')

      setNotes((prev: Note[]) => prev.filter((note: Note) => note.id !== noteToDelete))
      toast.success('Note deleted successfully')
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    } finally {
      setLoading(false)
      setNoteToDelete(null)
    }
  }

  const getSectionInfo = (sectionId?: string) => {
    return sections.find(s => s.id === sectionId) || sections[0]
  }

  const notesBySection = sections.map(section => ({
    ...section,
    notes: notes.filter(note => note.section === section.id)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Personal Notes</h3>
          <p className="text-sm text-muted-foreground">
            Add your own notes and insights to this study pack
          </p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      {/* Notes by section */}
      {notesBySection.map(section => (
        <div key={section.id}>
          {section.notes.length > 0 && (
            <>
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="secondary" className={section.color}>
                  {section.label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {section.notes.length} note{section.notes.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid gap-4 mb-6">
                {section.notes.map((note) => (
                  <Card key={note.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingNote(note)}
                            disabled={loading}
                            className="h-8 w-8 p-0"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNoteToDelete(note.id)}
                            disabled={loading}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                        {note.updatedAt !== note.createdAt && (
                          <span>
                            Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      ))}

      {/* Empty state */}
      {notes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notes yet</h3>
            <p className="text-muted-foreground mb-4">
              Start adding your personal notes and insights about this study material.
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Note
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Note Dialog */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Note</DialogTitle>
            <DialogDescription>
              Add a personal note to this study pack
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Section</label>
              <select
                value={newNoteSection}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewNoteSection(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Note</label>
              <Textarea
                value={newNoteContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNoteContent(e.target.value)}
                placeholder="Write your note here..."
                className="mt-1 min-h-[120px]"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setNewNoteContent('')
                  setNewNoteSection('general')
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={addNote}
                disabled={!newNoteContent.trim() || loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Add Note
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Note Dialog */}
      {editingNote && (
        <EditNoteDialog
          note={editingNote}
          onSave={updateNote}
          onClose={() => setEditingNote(null)}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!noteToDelete}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        loading={loading}
      />
    </div>
  )
}

// Edit Note Dialog Component
function EditNoteDialog({
  note,
  onSave,
  onClose,
  loading
}: {
  note: Note
  onSave: (noteId: string, content: string, section: string) => void
  onClose: () => void
  loading: boolean
}) {
  const [content, setContent] = useState(note.content)
  const [section, setSection] = useState(note.section || 'general')

  const handleSave = () => {
    if (!content.trim()) return
    onSave(note.id, content, section)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>
            Update your note content and section
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Section</label>
            <select
              value={section}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSection(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {sections.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Note</label>
            <Textarea
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!content.trim() || loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}