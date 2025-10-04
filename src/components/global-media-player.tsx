'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useMediaPlayer } from '@/contexts/media-player-context'
import AudioPlayer from './audio-player'
import VideoPlayer from './video-player'
import { Play, Pause, ArrowLeft } from 'lucide-react'

export default function GlobalMediaPlayer() {
  const pathname = usePathname()
  const router = useRouter()
  const mediaPlayer = useMediaPlayer()

  // Pause media when navigating to quiz page
  useEffect(() => {
    if (pathname?.startsWith('/quizzes/') && mediaPlayer.isPlaying && mediaPlayer.playPauseCallback) {
      mediaPlayer.playPauseCallback()
    }
  }, [pathname, mediaPlayer.isPlaying, mediaPlayer.playPauseCallback])

  // Don't show anything if no media is loaded
  if (!mediaPlayer.filePath || !mediaPlayer.fileType) {
    return null
  }

  // Check if we should show PiP (not on homepage or quiz pages)
  const isHomepage = pathname === '/'
  const isQuizPage = pathname?.startsWith('/quizzes/')
  const isStudyPackPage = pathname?.startsWith('/study-packs/')
  const shouldShowPiP = !isHomepage && !isQuizPage && mediaPlayer.filePath

  // Format time helper
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <>
      {/* Global PiP Player - shows when media is loaded but full player is not showing */}
      {shouldShowPiP && !mediaPlayer.isShowingFullPlayer && (
        <div className="fixed bottom-6 right-6 z-50 bg-black/90 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700 p-3 w-80">
          <div className="space-y-2">
            {/* Title and Controls Row */}
            <div className="flex items-center gap-3">
              <button
                onClick={mediaPlayer.playPauseCallback || undefined}
                className="w-10 h-10 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center transition flex-shrink-0"
              >
                {mediaPlayer.isPlaying ? (
                  <Pause className="h-5 w-5 text-black" fill="black" />
                ) : (
                  <Play className="h-5 w-5 text-black ml-0.5" fill="black" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate mb-1">
                  {mediaPlayer.title}
                </div>
                <div className="text-gray-400 text-xs">
                  {formatTime(mediaPlayer.currentTime)} / {formatTime(mediaPlayer.duration)}
                </div>
              </div>
            </div>

            {/* Return to Study Pack Button - only show if not already on study pack page */}
            {!isStudyPackPage && mediaPlayer.studyPackId && (
              <button
                onClick={() => router.push(`/study-packs/${mediaPlayer.studyPackId}`)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-white bg-white/10 hover:bg-white/20 rounded transition"
              >
                <ArrowLeft className="h-3 w-3" />
                Return to Study Pack
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
