'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import DashboardLayout from '@/components/dashboard-layout'
import { formatBytes } from '@/lib/utils'
import {
  Upload,
  FileText,
  Music,
  Video,
  Image,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react'
import toast from 'react-hot-toast'

interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  studyPackId?: string
}

const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'audio/*': ['.mp3', '.wav', '.m4a'],
  'video/*': ['.mp4', '.mov', '.avi', '.webm'],
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return Image
  if (fileType.startsWith('audio/')) return Music
  if (fileType.startsWith('video/')) return Video
  return FileText
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<UploadFile[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending' as const
    }))

    setFiles(prev => [...prev, ...newFiles])

    // Start uploading files
    newFiles.forEach(uploadFile)
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: 200 * 1024 * 1024, // 200MB max
    multiple: true
  })

  const uploadFile = async (uploadFile: UploadFile) => {
    const formData = new FormData()
    formData.append('file', uploadFile.file)

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      // Update to processing status
      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id
          ? { ...f, status: 'processing', progress: 50, studyPackId: result.studyPackId }
          : f
      ))

      // Poll for completion
      pollProcessingStatus(uploadFile.id, result.studyPackId)

      toast.success('File uploaded successfully! AI is processing...')

    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id
          ? {
              ...f,
              status: 'error',
              error: error instanceof Error ? error.message : 'Upload failed'
            }
          : f
      ))

      toast.error(error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const pollProcessingStatus = async (fileId: string, studyPackId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/study-packs/${studyPackId}/status`)
        const result = await response.json()

        if (result.status === 'completed') {
          setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
          ))
          toast.success('Study pack ready! Click to view.')
          return true
        } else if (result.status === 'failed') {
          setFiles(prev => prev.map(f =>
            f.id === fileId
              ? { ...f, status: 'error', error: result.processingError || 'Processing failed' }
              : f
          ))
          toast.error('Processing failed')
          return true
        } else {
          // Still processing, update progress
          setFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, progress: Math.min(90, f.progress + 10) } : f
          ))
          return false
        }
      } catch (error) {
        console.error('Status check error:', error)
        return false
      }
    }

    // Poll every 3 seconds
    const interval = setInterval(async () => {
      const isDone = await checkStatus()
      if (isDone) {
        clearInterval(interval)
      }
    }, 3000)
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const viewStudyPack = (studyPackId: string) => {
    router.push(`/study-packs/${studyPackId}`)
  }

  return (
    <DashboardLayout
      title="Upload Study Material"
      subtitle="Upload PDFs, audio, video, or images to create AI-powered study materials"
    >
      {/* Upload Zone */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Files to Upload</CardTitle>
          <CardDescription>
            Drag and drop files here, or click to browse. Supports PDF, Word docs, text files, audio, video, and images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
              ${isDragReject ? 'border-red-500 bg-red-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />

            {isDragActive ? (
              <div>
                <p className="text-lg font-medium text-primary">Drop files here</p>
                <p className="text-sm text-muted-foreground">Release to upload</p>
              </div>
            ) : isDragReject ? (
              <div>
                <p className="text-lg font-medium text-red-600">File type not supported</p>
                <p className="text-sm text-muted-foreground">
                  Please upload PDF, Word, text, audio, video, or image files
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Maximum file size: 200MB per file
                </p>
                <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    PDF, DOC
                  </div>
                  <div className="flex items-center">
                    <Music className="h-4 w-4 mr-1" />
                    Audio
                  </div>
                  <div className="flex items-center">
                    <Video className="h-4 w-4 mr-1" />
                    Video
                  </div>
                  <div className="flex items-center">
                    <Image className="h-4 w-4 mr-1" />
                    Images
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
            <CardDescription>
              Track the progress of your file uploads and processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((uploadFile) => {
                const FileIcon = getFileIcon(uploadFile.file.type)
                const isCompleted = uploadFile.status === 'completed'
                const isError = uploadFile.status === 'error'
                const isProcessing = uploadFile.status === 'processing' || uploadFile.status === 'uploading'

                return (
                  <div
                    key={uploadFile.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg"
                  >
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileIcon className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(uploadFile.file.size)}
                      </p>

                      {isProcessing && (
                        <div className="mt-2">
                          <Progress value={uploadFile.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {uploadFile.status === 'uploading' ? 'Uploading...' : 'AI Processing...'}
                          </p>
                        </div>
                      )}

                      {isError && uploadFile.error && (
                        <p className="text-xs text-red-600 mt-1">{uploadFile.error}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {isCompleted && (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <Button
                            size="sm"
                            onClick={() => viewStudyPack(uploadFile.studyPackId!)}
                          >
                            View
                          </Button>
                        </>
                      )}

                      {isError && <AlertCircle className="h-5 w-5 text-red-600" />}

                      {isProcessing && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        className="p-1 h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Limits Info */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Free plan: 3 uploads per month • Pro plan: Unlimited uploads
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              File limits vary by plan. <Button variant="link" className="p-0 h-auto">Upgrade to increase limits</Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}