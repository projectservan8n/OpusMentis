'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface MediaPlayerState {
  // Media file info
  filePath: string | null
  fileType: 'audio' | 'video' | null
  title: string
  studyPackId: string | null

  // Playback state
  isPlaying: boolean
  currentTime: number
  duration: number

  // Control callbacks
  seekCallback: ((time: number) => void) | null
  playPauseCallback: (() => void) | null

  // UI state - is the full player currently visible?
  isShowingFullPlayer: boolean

  // Transcript (optional)
  transcript?: string
}

interface MediaPlayerContextType extends MediaPlayerState {
  // Actions
  loadMedia: (params: {
    filePath: string
    fileType: 'audio' | 'video'
    title: string
    studyPackId: string
    transcript?: string
  }) => void
  clearMedia: () => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setSeekCallback: (callback: ((time: number) => void) | null) => void
  setPlayPauseCallback: (callback: (() => void) | null) => void
  setIsShowingFullPlayer: (showing: boolean) => void
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined)

export function MediaPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MediaPlayerState>({
    filePath: null,
    fileType: null,
    title: '',
    studyPackId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    seekCallback: null,
    playPauseCallback: null,
    isShowingFullPlayer: false,
    transcript: undefined,
  })

  const loadMedia = useCallback((params: {
    filePath: string
    fileType: 'audio' | 'video'
    title: string
    studyPackId: string
    transcript?: string
  }) => {
    setState(prev => ({
      ...prev,
      filePath: params.filePath,
      fileType: params.fileType,
      title: params.title,
      studyPackId: params.studyPackId,
      transcript: params.transcript,
      currentTime: 0,
      duration: 0,
      isPlaying: false,
    }))
  }, [])

  const clearMedia = useCallback(() => {
    setState({
      filePath: null,
      fileType: null,
      title: '',
      studyPackId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      seekCallback: null,
      playPauseCallback: null,
      isShowingFullPlayer: false,
      transcript: undefined,
    })
  }, [])

  const setIsPlaying = useCallback((playing: boolean) => {
    setState(prev => ({ ...prev, isPlaying: playing }))
  }, [])

  const setCurrentTime = useCallback((time: number) => {
    setState(prev => ({ ...prev, currentTime: time }))
  }, [])

  const setDuration = useCallback((duration: number) => {
    setState(prev => ({ ...prev, duration: duration }))
  }, [])

  const setSeekCallback = useCallback((callback: ((time: number) => void) | null) => {
    setState(prev => ({ ...prev, seekCallback: callback }))
  }, [])

  const setPlayPauseCallback = useCallback((callback: (() => void) | null) => {
    setState(prev => ({ ...prev, playPauseCallback: callback }))
  }, [])

  const setIsShowingFullPlayer = useCallback((showing: boolean) => {
    setState(prev => ({ ...prev, isShowingFullPlayer: showing }))
  }, [])

  return (
    <MediaPlayerContext.Provider
      value={{
        ...state,
        loadMedia,
        clearMedia,
        setIsPlaying,
        setCurrentTime,
        setDuration,
        setSeekCallback,
        setPlayPauseCallback,
        setIsShowingFullPlayer,
      }}
    >
      {children}
    </MediaPlayerContext.Provider>
  )
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext)
  if (context === undefined) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider')
  }
  return context
}
