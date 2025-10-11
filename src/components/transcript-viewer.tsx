'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Search, Clock } from 'lucide-react'

interface TranscriptSegment {
  timestamp: number // in seconds
  timestampText: string // e.g., "01:23"
  text: string
}

interface TranscriptViewerProps {
  transcript: string
  currentTime?: number
  onSeek?: (time: number) => void
}

export default function TranscriptViewer({
  transcript,
  currentTime = 0,
  onSeek
}: TranscriptViewerProps) {
  const [segments, setSegments] = useState<TranscriptSegment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null)
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1)
  const activeSegmentRef = useRef<HTMLDivElement>(null)

  // Parse transcript into segments
  useEffect(() => {
    if (!transcript) return

    const lines = transcript.split('\n')
    const parsed: TranscriptSegment[] = []

    for (const line of lines) {
      // Match timestamp pattern: [MM:SS] or [HH:MM:SS]
      const match = line.match(/^\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*(.+)/)

      if (match) {
        const hours = match[3] ? parseInt(match[1]) : 0
        const minutes = match[3] ? parseInt(match[2]) : parseInt(match[1])
        const seconds = match[3] ? parseInt(match[3]) : parseInt(match[2])
        const text = match[3] ? match[4] : match[4]

        const totalSeconds = hours * 3600 + minutes * 60 + seconds

        parsed.push({
          timestamp: totalSeconds,
          timestampText: match[3]
            ? `${match[1]}:${match[2]}:${match[3]}`
            : `${match[1]}:${match[2]}`,
          text: text.trim()
        })
      } else if (line.trim()) {
        // If no timestamp, append to previous segment
        if (parsed.length > 0) {
          parsed[parsed.length - 1].text += ' ' + line.trim()
        }
      }
    }

    setSegments(parsed)
  }, [transcript])

  // Update active segment and word based on current playback time
  useEffect(() => {
    if (segments.length === 0) return

    // Find the segment that contains the current time
    let foundIndex: number | null = null

    for (let i = segments.length - 1; i >= 0; i--) {
      if (currentTime >= segments[i].timestamp) {
        foundIndex = i
        break
      }
    }

    setActiveSegmentIndex(foundIndex)

    // Calculate active word within the segment (karaoke effect)
    if (foundIndex !== null) {
      const segment = segments[foundIndex]
      const nextSegment = segments[foundIndex + 1]

      // Estimate segment duration (time until next segment, or assume 5 seconds if last)
      const segmentDuration = nextSegment
        ? nextSegment.timestamp - segment.timestamp
        : 5

      // Time elapsed within this segment
      const timeInSegment = currentTime - segment.timestamp

      // Split text into words
      const words = segment.text.split(/\s+/)

      // Estimate time per word
      const timePerWord = segmentDuration / words.length

      // Calculate which word should be highlighted
      const wordIndex = Math.floor(timeInSegment / timePerWord)
      setActiveWordIndex(Math.min(wordIndex, words.length - 1))
    } else {
      setActiveWordIndex(-1)
    }
  }, [currentTime, segments])

  // Auto-scroll active segment to center ONLY within transcript container, NOT the main page
  useEffect(() => {
    if (activeSegmentRef.current) {
      const scrollContainer = activeSegmentRef.current.closest('[data-radix-scroll-area-viewport]')

      if (scrollContainer) {
        const segmentRect = activeSegmentRef.current.getBoundingClientRect()
        const containerRect = scrollContainer.getBoundingClientRect()

        // Calculate the scroll position to center the segment within the container
        const segmentCenter = activeSegmentRef.current.offsetTop + (segmentRect.height / 2)
        const containerCenter = containerRect.height / 2
        const scrollTo = segmentCenter - containerCenter

        // Scroll ONLY the transcript container, not the page
        scrollContainer.scrollTo({
          top: scrollTo,
          behavior: 'smooth'
        })
      }
    }
  }, [activeSegmentIndex])

  // Filter segments by search query
  const filteredSegments = searchQuery
    ? segments.filter(seg =>
        seg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : segments

  // Handle segment click
  const handleSegmentClick = (segment: TranscriptSegment) => {
    onSeek?.(segment.timestamp)
  }

  if (!transcript || segments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Transcript Available</h3>
          <p className="text-muted-foreground text-sm">
            Transcript will appear here once the audio/video is processed.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Transcript
          <Badge variant="secondary" className="ml-auto">
            {segments.length} segments
          </Badge>
        </CardTitle>

        {/* Search Box */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-1">
            {filteredSegments.map((segment, index) => {
              const isActive = activeSegmentIndex === segments.indexOf(segment)
              const isSearchMatch = searchQuery &&
                segment.text.toLowerCase().includes(searchQuery.toLowerCase())

              return (
                <div
                  key={index}
                  ref={isActive ? activeSegmentRef : null}
                  onClick={() => handleSegmentClick(segment)}
                  className={`
                    group p-2 rounded-lg border cursor-pointer transition-all
                    ${isActive
                      ? 'bg-primary/10 border-primary shadow-sm'
                      : 'hover:bg-muted border-transparent'
                    }
                    ${isSearchMatch && !isActive ? 'bg-yellow-50 border-yellow-200' : ''}
                  `}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0">
                      <Badge
                        variant={isActive ? "default" : "outline"}
                        className="font-mono text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {segment.timestampText}
                      </Badge>
                    </div>
                    <p className={`text-sm leading-snug ${
                      isActive ? 'font-medium' : 'text-muted-foreground group-hover:text-foreground'
                    }`}>
                      {isActive ? (
                        // Karaoke-style word-by-word highlight for active segment
                        segment.text.split(/\s+/).map((word, wordIdx) => (
                          <span
                            key={wordIdx}
                            className={`inline-block transition-all duration-200 ${
                              wordIdx === activeWordIndex
                                ? 'text-primary font-bold scale-110 drop-shadow-lg'
                                : wordIdx < activeWordIndex
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            }`}
                            style={{
                              marginRight: '0.25rem'
                            }}
                          >
                            {word}
                          </span>
                        ))
                      ) : (
                        segment.text
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredSegments.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
