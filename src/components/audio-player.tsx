'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import TranscriptViewer from '@/components/transcript-viewer'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Music,
  Download
} from 'lucide-react'

interface AudioPlayerProps {
  filePath: string
  title: string
  transcript?: string
  onTimeUpdate?: (time: number) => void
  onPlayerReady?: (seekFn: (time: number) => void) => void
  onPauseReady?: (pauseFn: () => void) => void
  onDurationChange?: (duration: number) => void
  onPlayingStateChange?: (isPlaying: boolean) => void
  onPlayPauseReady?: (toggleFn: () => void) => void
}

export default function AudioPlayer({ filePath, title, transcript, onTimeUpdate, onPlayerReady, onPauseReady, onDurationChange, onPlayingStateChange, onPlayPauseReady }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isDraggingSeek, setIsDraggingSeek] = useState(false)
  const [seekPreview, setSeekPreview] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)

  // Expose functions to parent
  useEffect(() => {
    if (onPlayerReady) {
      onPlayerReady(seekToTime)
    }
    if (onPauseReady) {
      onPauseReady(() => {
        if (audioRef.current && !audioRef.current.paused) {
          audioRef.current.pause()
          setIsPlaying(false)
        }
      })
    }
    if (onPlayPauseReady) {
      onPlayPauseReady(togglePlayPause)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Notify parent of playing state changes
  useEffect(() => {
    onPlayingStateChange?.(isPlaying)
  }, [isPlaying, onPlayingStateChange])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (audioRef.current.paused) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
    // State will be updated by play/pause event listeners
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    if (!isDraggingSeek) {
      const time = audioRef.current.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)
    }
  }

  // Handle duration loaded
  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    const dur = audioRef.current.duration
    if (isFinite(dur) && dur > 0) {
      console.log('Audio duration loaded:', dur)
      setDuration(dur)
      onDurationChange?.(dur)
    }
  }

  // Also check duration on canplay event as backup
  const handleCanPlay = () => {
    if (!audioRef.current || duration > 0) return
    const dur = audioRef.current.duration
    if (isFinite(dur) && dur > 0) {
      console.log('Audio duration from canplay:', dur)
      setDuration(dur)
      onDurationChange?.(dur)
    }
  }

  // Handle seek drag (visual only)
  const handleSeekChange = (value: number[]) => {
    setIsDraggingSeek(true)
    setSeekPreview(value[0])
  }

  // Handle seek commit (actual seek on mouse release)
  const handleSeekCommit = (value: number[]) => {
    seekToTime(value[0])
    // Keep dragging state true briefly to prevent timeupdate override
    setTimeout(() => {
      setIsDraggingSeek(false)
    }, 200)
  }

  // Seek to specific time (used by slider and transcript)
  const seekToTime = (time: number) => {
    if (!audioRef.current) return

    // Prevent timeupdate from interfering
    setIsDraggingSeek(true)

    // Pause first to ensure clean seek
    const wasPlaying = !audioRef.current.paused
    if (wasPlaying) {
      audioRef.current.pause()
    }

    // Set the time
    audioRef.current.currentTime = time
    setCurrentTime(time)

    // Resume playing if it was playing before
    if (wasPlaying) {
      audioRef.current.play()
    }

    // Clear dragging state after a delay
    setTimeout(() => {
      setIsDraggingSeek(false)
    }, 200)
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return
    const newVolume = value[0]
    audioRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return

    if (isMuted) {
      audioRef.current.volume = volume || 0.5
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds))
  }

  // Change playback speed
  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    const newRate = rates[nextIndex]

    if (audioRef.current) {
      audioRef.current.playbackRate = newRate
      setPlaybackRate(newRate)
    }
  }

  // Download audio
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = filePath
    a.download = title || 'audio.mp3'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Audio Player
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={filePath}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          preload="metadata"
        />

        {/* Waveform / Progress Bar - Radix Slider */}
        <div className="space-y-2">
          <Slider
            min={0}
            max={duration || 1}
            step={0.1}
            value={[isDraggingSeek ? seekPreview : currentTime]}
            onValueChange={handleSeekChange}
            onValueCommit={handleSeekCommit}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => skip(-10)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            title="Rewind 10s"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-14 h-14 rounded-full bg-black hover:bg-gray-900 flex items-center justify-center transition shadow-lg"
          >
            {isPlaying ? (
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            title="Forward 10s"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Volume Control and Playback Speed */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange([parseFloat(e.target.value)])}
              className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={changePlaybackRate}
            title="Playback speed"
          >
            <span className="text-sm font-semibold">{playbackRate}x</span>
          </Button>
        </div>

        {/* Download Button */}
        <Button
          variant="outline"
          onClick={handleDownload}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Audio
        </Button>

        {/* Transcript Section */}
        {transcript && (
          <>
            <Separator className="my-4" />
            <TranscriptViewer
              transcript={transcript}
              currentTime={currentTime}
              onSeek={seekToTime}
            />
          </>
        )}

        {/* Info */}
        {!transcript && (
          <p className="text-sm text-muted-foreground text-center">
            Use the study timer while listening to track your focus time
          </p>
        )}
      </CardContent>
    </Card>
  )
}
