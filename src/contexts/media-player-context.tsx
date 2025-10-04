'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import FloatingMediaPlayer from '@/components/global/floating-media-player'

interface MediaPlayerState {
  studyPackId: string
  filePath: string
  fileType: 'audio' | 'video'
  title: string
  transcript?: string
}

interface MediaPlayerContextType {
  openPlayer: (state: MediaPlayerState) => void
  closePlayer: () => void
  setQuizActive: (active: boolean) => void
  isPlayerOpen: boolean
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined)

export function MediaPlayerProvider({ children }: { children: ReactNode }) {
  const [playerState, setPlayerState] = useState<MediaPlayerState | null>(null)
  const [isQuizActive, setIsQuizActive] = useState(false)

  const openPlayer = (state: MediaPlayerState) => {
    setPlayerState(state)
  }

  const closePlayer = () => {
    setPlayerState(null)
  }

  const setQuizActive = (active: boolean) => {
    setIsQuizActive(active)
  }

  return (
    <MediaPlayerContext.Provider
      value={{
        openPlayer,
        closePlayer,
        setQuizActive,
        isPlayerOpen: !!playerState
      }}
    >
      {children}
      {playerState && (
        <FloatingMediaPlayer
          studyPackId={playerState.studyPackId}
          filePath={playerState.filePath}
          fileType={playerState.fileType}
          title={playerState.title}
          transcript={playerState.transcript}
          onClose={closePlayer}
          isQuizActive={isQuizActive}
        />
      )}
    </MediaPlayerContext.Provider>
  )
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext)
  if (!context) {
    throw new Error('useMediaPlayer must be used within MediaPlayerProvider')
  }
  return context
}
