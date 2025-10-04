'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Download,
  Video as VideoIcon
} from 'lucide-react'

interface VideoPlayerProps {
  filePath: string
  title: string
  transcript?: string
  onTimeUpdate?: (time: number) => void
  onPlayerReady?: (seekFn: (time: number) => void) => void
  onPauseReady?: (pauseFn: () => void) => void
}

export default function VideoPlayer({ filePath, title, transcript, onTimeUpdate, onPlayerReady, onPauseReady }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isDraggingSeek, setIsDraggingSeek] = useState(false)
  const [seekPreview, setSeekPreview] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Expose seek and pause functions to parent
  useEffect(() => {
    if (onPlayerReady) {
      onPlayerReady(seekToTime)
    }
    if (onPauseReady) {
      onPauseReady(() => {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause()
          setIsPlaying(false)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Format time as HH:MM:SS or MM:SS
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Handle play/pause
  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Handle time update
  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    if (!isDraggingSeek) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)
    }
  }

  // Handle duration loaded
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
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
    if (!videoRef.current) return

    // Pause first to ensure clean seek
    const wasPlaying = !videoRef.current.paused
    if (wasPlaying) {
      videoRef.current.pause()
    }

    // Set the time
    videoRef.current.currentTime = time
    setCurrentTime(time)

    // Resume playing if it was playing before
    if (wasPlaying) {
      videoRef.current.play()
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return
    const newVolume = value[0]
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // Toggle mute
  const toggleMute = () => {
    if (!videoRef.current) return

    if (isMuted) {
      videoRef.current.volume = volume || 0.5
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds))
  }

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Change playback speed
  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    const newRate = rates[nextIndex]

    if (videoRef.current) {
      videoRef.current.playbackRate = newRate
      setPlaybackRate(newRate)
    }
  }

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  // Download video
  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = filePath
    a.download = title || 'video.mp4'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <VideoIcon className="h-5 w-5" />
          Video Player
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div
          ref={containerRef}
          className="relative bg-black group"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Video Element */}
          <video
            ref={videoRef}
            src={filePath}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlayPause}
            className="w-full aspect-video cursor-pointer"
          />

          {/* Video Controls Overlay */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 space-y-3 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress Bar - Native HTML5 for better seek support */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={isDraggingSeek ? seekPreview : currentTime}
              onChange={(e) => handleSeekChange([parseFloat(e.target.value)])}
              onMouseUp={(e) => handleSeekCommit([parseFloat((e.target as HTMLInputElement).value)])}
              onTouchEnd={(e) => handleSeekCommit([parseFloat((e.target as HTMLInputElement).value)])}
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
            />

            <div className="flex items-center justify-between gap-3 text-white">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlayPause}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skip(-10)}
                  className="text-white hover:bg-white/20"
                  title="Rewind 10s"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => skip(10)}
                  className="text-white hover:bg-white/20"
                  title="Forward 10s"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                {/* Volume */}
                <div className="flex items-center gap-2 min-w-[120px]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20 shrink-0"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="w-20 hidden sm:block">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Time Display */}
                <span className="text-sm hidden md:inline">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={changePlaybackRate}
                  className="text-white hover:bg-white/20 text-xs"
                  title="Playback speed"
                >
                  <span className="text-xs font-semibold">{playbackRate}x</span>
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Controls (Outside Video) */}
        <div className="px-6 pb-6 space-y-3">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Video
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Use the study timer while watching to track your focus time
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
