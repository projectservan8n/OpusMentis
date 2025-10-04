'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import DashboardLayout from '@/components/dashboard-layout'
import KanbanBoard from '@/components/kanban-board'
import Flashcards from '@/components/flashcards'
import Notes from '@/components/notes'
import PDFViewer from '@/components/pdf-viewer'
import AudioPlayer from '@/components/audio-player'
import VideoPlayer from '@/components/video-player'
import ImageViewer from '@/components/image-viewer'
import TranscriptViewer from '@/components/transcript-viewer'
import HighlightSidebar from '@/components/highlight-sidebar'
import QuizGeneratorModal from '@/components/quiz-generator-modal'
import StudyTimer from '@/components/study-timer'
import MiniPipPlayer from '@/components/mini-pip-player'
import { formatBytes } from '@/lib/utils'
import {
  FileText,
  Video,
  Music,
  Image,
  Download,
  Share2,
  Edit3,
  ArrowLeft,
  Clock,
  Brain,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Highlight } from '@/types/highlight'
import { DocumentStructure } from '@/lib/document-analyzer'

interface StudyPack {
  id: string
  title: string
  description?: string
  originalFileName: string
  fileType: string
  fileSize: number
  filePath?: string
  status: string
  processingError?: string
  summary?: string
  topics: string[]
  flashcards: any[]
  kanbanTasks: any[]
  transcript?: string
  createdAt: string
  updatedAt: string
  notes: any[]
  userId?: string
  organizationId?: string
  isOwner?: boolean
  isTeamMember?: boolean
  isShared?: boolean
}

const fileTypeIcons = {
  pdf: FileText,
  document: FileText,
  text: FileText,
  audio: Music,
  video: Video,
  image: Image,
}

export default function StudyPackPage() {
  const params = useParams()
  const router = useRouter()
  const studyPackId = params.id as string

  const [studyPack, setStudyPack] = useState<StudyPack | null>(null)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [documentStructure, setDocumentStructure] = useState<DocumentStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('pdf')
  const [showQuizGenerator, setShowQuizGenerator] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [currentMediaTime, setCurrentMediaTime] = useState(0)
  const [mediaDuration, setMediaDuration] = useState(0)
  const [isMediaPlaying, setIsMediaPlaying] = useState(false)
  const [mediaSeekCallback, setMediaSeekCallback] = useState<((time: number) => void) | null>(null)
  const [mediaPlayPauseCallback, setMediaPlayPauseCallback] = useState<(() => void) | null>(null)

  useEffect(() => {
    if (studyPackId) {
      fetchStudyPack()
      fetchHighlights()
      fetchDocumentStructure()
    }
  }, [studyPackId])

  const fetchStudyPack = async () => {
    try {
      const response = await fetch(`/api/study-packs/${studyPackId}`)
      if (!response.ok) {
        if (response.status === 404) {
          setError('Study pack not found')
        } else {
          throw new Error('Failed to fetch study pack')
        }
        return
      }

      const data = await response.json()
      setStudyPack(data)
    } catch (error) {
      console.error('Error fetching study pack:', error)
      setError('Failed to load study pack')
    } finally {
      setLoading(false)
    }
  }

  const updateKanbanTasks = async (tasks: any[]) => {
    try {
      const response = await fetch(`/api/study-packs/${studyPackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kanbanTasks: tasks }),
      })

      if (!response.ok) throw new Error('Failed to update tasks')

      setStudyPack(prev => prev ? { ...prev, kanbanTasks: tasks } : null)
    } catch (error) {
      console.error('Error updating kanban tasks:', error)
      toast.error('Failed to save changes')
    }
  }

  const exportToPDF = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'export' })

      const response = await fetch(`/api/study-packs/${studyPackId}/export`, {
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
      a.download = `${studyPack?.title.replace(/[^a-zA-Z0-9]/g, '_')}_study_pack.pdf` || 'study_pack.pdf'
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

  // Highlight management functions
  const fetchHighlights = async () => {
    try {
      const response = await fetch(`/api/highlights?studyPackId=${studyPackId}`)
      if (response.ok) {
        const data = await response.json()
        setHighlights(data)
      }
    } catch (error) {
      console.error('Error fetching highlights:', error)
    }
  }

  const handleHighlightCreate = async (highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyPackId,
          ...highlight
        })
      })

      if (response.ok) {
        const newHighlight = await response.json()
        setHighlights(prev => [...prev, newHighlight])
        toast.success('Highlight created')
      }
    } catch (error) {
      console.error('Error creating highlight:', error)
      toast.error('Failed to create highlight')
    }
  }

  const handleHighlightUpdate = async (highlightId: string, note: string) => {
    try {
      const response = await fetch(`/api/highlights?id=${highlightId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      })

      if (response.ok) {
        const updated = await response.json()
        setHighlights(prev => prev.map(h => h.id === highlightId ? updated : h))
        toast.success('Note updated')
      }
    } catch (error) {
      console.error('Error updating highlight:', error)
      toast.error('Failed to update note')
    }
  }

  const handleHighlightDelete = async (highlightId: string) => {
    try {
      const response = await fetch(`/api/highlights?id=${highlightId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setHighlights(prev => prev.filter(h => h.id !== highlightId))
        toast.success('Highlight deleted')
      }
    } catch (error) {
      console.error('Error deleting highlight:', error)
      toast.error('Failed to delete highlight')
    }
  }

  const handleHighlightClick = (highlight: Highlight) => {
    // Jump to the page in PDF viewer
    // This is handled by the PDF viewer component
    setActiveTab('pdf')
  }

  const fetchDocumentStructure = async () => {
    try {
      const response = await fetch(`/api/document-structure?studyPackId=${studyPackId}`)
      if (response.ok) {
        const data = await response.json()
        setDocumentStructure(data)
      } else if (response.status === 404) {
        // Document structure hasn't been analyzed yet - this is okay
        console.log('Document structure not yet analyzed')
      }
    } catch (error) {
      console.error('Error fetching document structure:', error)
    }
  }

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
  }

  const handleGenerateQuiz = () => {
    setShowQuizGenerator(true)
  }

  const handleQuizGenerated = (quizId: string) => {
    toast.success('Quiz generated successfully!')
    router.push(`/quizzes/${quizId}`)
  }

  const handleShareWithTeam = async () => {
    if (!studyPack?.isOwner) {
      toast.error('Only the owner can share this study pack')
      return
    }

    try {
      setIsSharing(true)
      toast.loading(studyPack.isShared ? 'Unsharing from team...' : 'Sharing with team...', { id: 'share' })

      const endpoint = `/api/study-packs/${studyPackId}/share`
      const response = await fetch(endpoint, {
        method: studyPack.isShared ? 'DELETE' : 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.upgradeRequired) {
          toast.error(data.error, { id: 'share', duration: 5000 })
          router.push('/billing')
          return
        }
        throw new Error(data.error || 'Failed to share')
      }

      // Refresh study pack to get updated sharing status
      await fetchStudyPack()

      toast.success(data.message, { id: 'share' })
    } catch (error: any) {
      console.error('Share error:', error)
      toast.error(error.message || 'Failed to share study pack', { id: 'share' })
    } finally {
      setIsSharing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !studyPack) {
    return (
      <DashboardLayout title="Error">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {error || 'Study pack not found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              The study pack you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  const FileIcon = fileTypeIcons[studyPack.fileType as keyof typeof fileTypeIcons] || FileText
  const isProcessing = studyPack.status === 'processing'
  const isFailed = studyPack.status === 'failed'
  const isCompleted = studyPack.status === 'completed'

  if (isProcessing) {
    return (
      <DashboardLayout title={studyPack.title}>
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">AI is Processing Your File</h3>
            <p className="text-muted-foreground mb-4">
              We're generating study materials from your content. This usually takes a few minutes.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <span>Extracting text</span>
              <span>→</span>
              <span>Analyzing content</span>
              <span>→</span>
              <span>Creating materials</span>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  if (isFailed) {
    return (
      <DashboardLayout title={studyPack.title}>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Processing Failed</h3>
            <p className="text-muted-foreground mb-4">
              {studyPack.processingError || 'Something went wrong while processing your file.'}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button onClick={() => router.push('/upload')}>
                Try Uploading Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{studyPack.title}</h1>
                {studyPack.isShared && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Team Pack
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{studyPack.originalFileName}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                <span>{formatBytes(studyPack.fileSize)}</span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(studyPack.createdAt), { addSuffix: true })}
                </span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {studyPack.status}
                </Badge>
                {studyPack.isTeamMember && !studyPack.isOwner && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Shared with you
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleGenerateQuiz} size="sm">
              <Sparkles className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Generate Quiz</span>
              <span className="sm:hidden ml-1">Quiz</span>
            </Button>
            <Button variant="outline" onClick={exportToPDF} size="sm">
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden ml-1">Export</span>
            </Button>
            {studyPack.isOwner && (
              <Button
                variant={studyPack.isShared ? "default" : "outline"}
                onClick={handleShareWithTeam}
                size="sm"
                disabled={isSharing}
              >
                {isSharing ? (
                  <Loader2 className="h-4 w-4 animate-spin sm:mr-2" />
                ) : (
                  <Share2 className="h-4 w-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">
                  {studyPack.isShared ? 'Unshare from Team' : 'Share with Team'}
                </span>
                <span className="sm:hidden ml-1">
                  {studyPack.isShared ? 'Unshare' : 'Share'}
                </span>
              </Button>
            )}
          </div>
        </div>

        {/* Description */}
        {studyPack.description && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{studyPack.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Study Materials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                  <TabsList className="w-full inline-flex h-10 items-center justify-start rounded-none border-b bg-transparent p-0 overflow-x-auto">
                    <TabsTrigger value="pdf" className="flex-shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
                      <span className="hidden sm:inline">
                        {studyPack.fileType === 'video' ? 'Video' :
                         studyPack.fileType === 'audio' ? 'Audio' :
                         studyPack.fileType === 'image' ? 'Image' : 'Document'}
                      </span>
                      <span className="sm:hidden">
                        {studyPack.fileType === 'video' ? 'Video' :
                         studyPack.fileType === 'audio' ? 'Audio' :
                         studyPack.fileType === 'image' ? 'Image' : 'Doc'}
                      </span>
                      {studyPack.fileType === 'pdf' && highlights.length > 0 && ` (${highlights.length})`}
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="flex-shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
                      Summary
                    </TabsTrigger>
                    <TabsTrigger value="kanban" className="flex-shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
                      Kanban
                    </TabsTrigger>
                    <TabsTrigger value="flashcards" className="flex-shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
                      <span className="hidden sm:inline">Flashcards ({studyPack.flashcards?.length || 0})</span>
                      <span className="sm:hidden">Cards ({studyPack.flashcards?.length || 0})</span>
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex-shrink-0 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
                      Notes ({studyPack.notes?.length || 0})
                    </TabsTrigger>
                  </TabsList>

              <div className="p-4 sm:p-6">
                <TabsContent value="pdf" className="mt-0">
                  {/* PDF Document Viewer */}
                  {studyPack.fileType === 'pdf' && studyPack.filePath ? (
                    <PDFViewer
                      filePath={`/api/files/${studyPack.filePath}`}
                      studyPackId={studyPackId}
                      highlights={highlights}
                      onHighlightCreate={handleHighlightCreate}
                      onHighlightClick={handleHighlightClick}
                    />
                  ) : studyPack.fileType === 'video' && studyPack.filePath ? (
                    /* Video Player - Full Width */
                    <VideoPlayer
                      filePath={`/api/files/${studyPack.filePath}`}
                      title={studyPack.title}
                      onTimeUpdate={setCurrentMediaTime}
                      onPlayerReady={(seekFn) => setMediaSeekCallback(() => seekFn)}
                      onDurationChange={setMediaDuration}
                      onPlayingStateChange={setIsMediaPlaying}
                      onPlayPauseReady={(toggleFn) => setMediaPlayPauseCallback(() => toggleFn)}
                    />
                  ) : studyPack.fileType === 'audio' && studyPack.filePath ? (
                    /* Audio Player - Full Width */
                    <AudioPlayer
                      filePath={`/api/files/${studyPack.filePath}`}
                      title={studyPack.title}
                      onTimeUpdate={setCurrentMediaTime}
                      onPlayerReady={(seekFn) => setMediaSeekCallback(() => seekFn)}
                      onDurationChange={setMediaDuration}
                      onPlayingStateChange={setIsMediaPlaying}
                      onPlayPauseReady={(toggleFn) => setMediaPlayPauseCallback(() => toggleFn)}
                    />
                  ) : studyPack.fileType === 'image' && studyPack.filePath ? (
                    /* Image Viewer */
                    <ImageViewer
                      filePath={`/api/files/${studyPack.filePath}`}
                      title={studyPack.title}
                    />
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">File Not Available</h3>
                        <p className="text-muted-foreground">
                          The file is not available or the file type is not supported.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="summary" className="mt-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">AI-Generated Summary</h3>
                      {studyPack.summary ? (
                        <Card>
                          <CardContent className="pt-6">
                            <div className="prose prose-sm max-w-none">
                              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {studyPack.summary}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No summary available
                        </div>
                      )}
                    </div>

                    {studyPack.topics && studyPack.topics.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Key Topics</h3>
                        <div className="flex flex-wrap gap-2">
                          {studyPack.topics.map((topic, index) => (
                            <Badge key={index} variant="outline">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="kanban" className="mt-0">
                  <KanbanBoard
                    tasks={studyPack.kanbanTasks || []}
                    onUpdateTasks={updateKanbanTasks}
                  />
                </TabsContent>

                <TabsContent value="flashcards" className="mt-0">
                  <Flashcards
                    flashcards={studyPack.flashcards || []}
                    studyPackId={studyPackId}
                    onFlashcardsUpdated={(newFlashcards) => {
                      setStudyPack(prev => prev ? { ...prev, flashcards: newFlashcards } : null)
                    }}
                  />
                </TabsContent>

                <TabsContent value="notes" className="mt-0">
                  <Notes
                    studyPackId={studyPack.id}
                    initialNotes={studyPack.notes || []}
                  />
                </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Study Timer, Transcript & Highlights */}
          <div className="lg:col-span-1 space-y-6">
            <StudyTimer studyPackId={studyPackId} />

            {/* Show transcript for audio/video files */}
            {(studyPack.fileType === 'audio' || studyPack.fileType === 'video') && studyPack.transcript && activeTab === 'pdf' && (
              <TranscriptViewer
                transcript={studyPack.transcript}
                currentTime={currentMediaTime}
                onSeek={mediaSeekCallback || undefined}
              />
            )}

            {/* Show highlights sidebar only for PDF files */}
            {studyPack.fileType === 'pdf' && activeTab === 'pdf' && (
              <HighlightSidebar
                highlights={highlights}
                onHighlightClick={handleHighlightClick}
                onHighlightDelete={handleHighlightDelete}
                onHighlightUpdate={handleHighlightUpdate}
                onGenerateQuiz={handleGenerateQuiz}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mini PiP Player - shows when on non-Content tabs with audio/video */}
      {activeTab !== 'pdf' && (studyPack.fileType === 'audio' || studyPack.fileType === 'video') && mediaPlayPauseCallback && (
        <MiniPipPlayer
          isPlaying={isMediaPlaying}
          currentTime={currentMediaTime}
          duration={mediaDuration}
          title={studyPack.title}
          onPlayPause={mediaPlayPauseCallback}
        />
      )}

      {/* Quiz Generator Modal */}
      <QuizGeneratorModal
        open={showQuizGenerator}
        onClose={() => setShowQuizGenerator(false)}
        studyPackId={studyPackId}
        highlights={highlights}
        documentStructure={documentStructure || undefined}
        onQuizGenerated={handleQuizGenerated}
      />
    </DashboardLayout>
  )
}