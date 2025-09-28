'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatBytes } from '@/lib/utils'
import {
  FileText,
  Video,
  Music,
  Image,
  Eye,
  Download,
  Trash2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react'

interface StudyPackCardProps {
  studyPack: {
    id: string
    title: string
    description?: string
    originalFileName: string
    fileType: string
    fileSize: number
    status: string
    processingError?: string
    createdAt: string
    _count?: {
      notes: number
    }
  }
  onDelete?: (id: string) => void
  onExport?: (id: string) => void
}

const fileTypeIcons = {
  pdf: FileText,
  document: FileText,
  text: FileText,
  audio: Music,
  video: Video,
  image: Image,
}

const statusStyles = {
  processing: {
    icon: Loader2,
    color: 'bg-blue-100 text-blue-800',
    iconClass: 'animate-spin'
  },
  completed: {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800',
    iconClass: ''
  },
  failed: {
    icon: AlertCircle,
    color: 'bg-red-100 text-red-800',
    iconClass: ''
  }
}

export default function StudyPackCard({ studyPack, onDelete, onExport }: StudyPackCardProps) {
  const FileIcon = fileTypeIcons[studyPack.fileType as keyof typeof fileTypeIcons] || FileText
  const statusConfig = statusStyles[studyPack.status as keyof typeof statusStyles] || statusStyles.completed
  const StatusIcon = statusConfig.icon

  const isProcessing = studyPack.status === 'processing'
  const isFailed = studyPack.status === 'failed'
  const isCompleted = studyPack.status === 'completed'

  return (
    <Card className="study-pack-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {studyPack.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {studyPack.originalFileName}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className={statusConfig.color}>
            <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.iconClass}`} />
            {studyPack.status}
          </Badge>
        </div>

        {studyPack.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {studyPack.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>{formatBytes(studyPack.fileSize)}</span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDistanceToNow(new Date(studyPack.createdAt), { addSuffix: true })}
            </span>
            {studyPack._count?.notes && studyPack._count.notes > 0 && (
              <span>{studyPack._count.notes} notes</span>
            )}
          </div>
        </div>

        {isFailed && studyPack.processingError && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600">{studyPack.processingError}</p>
          </div>
        )}

        {isProcessing && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-600">
              AI is processing your file. This may take a few minutes...
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex space-x-2 w-full">
          {isCompleted && (
            <Link href={`/study-packs/${studyPack.id}`} className="flex-1">
              <Button variant="default" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
          )}

          {isCompleted && onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport(studyPack.id)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}

          {isFailed && (
            <Link href="/upload" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                Try Again
              </Button>
            </Link>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(studyPack.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}