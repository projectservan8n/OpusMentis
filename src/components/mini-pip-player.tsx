'use client'

import { Play, Pause } from 'lucide-react'

interface MiniPipPlayerProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  title: string
  onPlayPause?: () => void
  onSeek?: (time: number) => void
}

export default function MiniPipPlayer({
  isPlaying,
  currentTime,
  duration,
  title,
  onPlayPause,
  onSeek
}: MiniPipPlayerProps) {
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed top-6 right-6 z-50 bg-black/90 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-3 w-64">
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          disabled={!onPlayPause}
          className="w-10 h-10 rounded-full bg-background hover:bg-accent flex items-center justify-center transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed border"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-foreground" fill="currentColor" />
          ) : (
            <Play className="h-5 w-5 text-foreground ml-0.5" fill="currentColor" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-white text-xs font-medium truncate mb-1">{title}</div>
          <div className="text-gray-400 text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>
    </div>
  )
}
