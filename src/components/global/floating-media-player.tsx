'use client'

import { useState, useEffect } from 'react'
import { X, Minimize2, Maximize2 } from 'lucide-react'
import AudioPlayer from '@/components/audio-player'
import VideoPlayer from '@/components/video-player'

interface FloatingMediaPlayerProps {
  studyPackId: string
  filePath: string
  fileType: 'audio' | 'video'
  title: string
  transcript?: string
  onClose: () => void
  isQuizActive?: boolean
}

export default function FloatingMediaPlayer({
  studyPackId,
  filePath,
  fileType,
  title,
  transcript,
  onClose,
  isQuizActive = false
}: FloatingMediaPlayerProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [pauseCallback, setPauseCallback] = useState<(() => void) | null>(null)

  // Auto-pause when quiz is active
  useEffect(() => {
    if (isQuizActive && pauseCallback) {
      pauseCallback()
    }
  }, [isQuizActive, pauseCallback])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.player-controls')) return // Don't drag when interacting with controls

    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - dragOffset.x
    const newY = e.clientY - dragOffset.y

    // Keep within viewport bounds
    const maxX = window.innerWidth - 400
    const maxY = window.innerHeight - (isMinimized ? 60 : 300)

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset, position])

  const handlePauseReady = (pauseFn: () => void) => {
    setPauseCallback(() => pauseFn)
  }

  return (
    <div
      className={`fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all ${
        isMinimized ? 'w-96' : 'w-[500px]'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium truncate">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 rounded transition"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Player Content */}
      {!isMinimized && (
        <div className="player-controls p-4">
          {isQuizActive && (
            <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Media paused during quiz
            </div>
          )}

          {fileType === 'audio' ? (
            <AudioPlayer
              filePath={filePath}
              title={title}
              transcript={transcript}
              onPauseReady={handlePauseReady}
            />
          ) : (
            <VideoPlayer
              filePath={filePath}
              title={title}
              transcript={transcript}
              onPauseReady={handlePauseReady}
            />
          )}
        </div>
      )}

      {isMinimized && (
        <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
          Click <Maximize2 className="h-3 w-3 inline" /> to expand player
        </div>
      )}
    </div>
  )
}
