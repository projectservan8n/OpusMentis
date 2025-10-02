'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Loader2,
  FileText,
  Highlighter,
  X
} from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Highlight } from '@/types/highlight'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFViewerProps {
  filePath: string // Path to PDF file
  studyPackId: string
  highlights?: Highlight[]
  onHighlightCreate?: (highlight: Omit<Highlight, 'id'>) => void
  onHighlightClick?: (highlight: Highlight) => void
}

export default function PDFViewer({
  filePath,
  studyPackId,
  highlights = [],
  onHighlightCreate,
  onHighlightClick
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedColor, setSelectedColor] = useState<string>('yellow')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorPickerPosition, setColorPickerPosition] = useState<{ x: number; y: number } | null>(null)
  const [isCreatingHighlight, setIsCreatingHighlight] = useState(false)

  const pageRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  // Measure container width for responsive scaling
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Calculate responsive scale based on container width
  const getResponsiveScale = () => {
    if (typeof window === 'undefined') return scale

    // On mobile (< 640px), auto-fit to width
    if (window.innerWidth < 640) {
      return containerWidth > 0 ? (containerWidth - 32) / 612 : 0.5 // 612 is standard PDF width
    }
    return scale
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const colors = [
    { name: 'yellow', class: 'bg-yellow-300', hex: '#fde047' },
    { name: 'green', class: 'bg-green-300', hex: '#86efac' },
    { name: 'blue', class: 'bg-blue-300', hex: '#93c5fd' },
    { name: 'pink', class: 'bg-pink-300', hex: '#f9a8d4' },
    { name: 'red', class: 'bg-red-300', hex: '#fca5a5' }
  ]

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
    setLoading(false)
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error)
    setError('Failed to load PDF. Please try again.')
    setLoading(false)
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset
      if (newPage >= 1 && newPage <= numPages) {
        return newPage
      }
      return prevPageNumber
    })
  }

  const previousPage = () => changePage(-1)
  const nextPage = () => changePage(1)

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5))
  const resetZoom = () => setScale(1.0)

  // Handle text selection and show color picker (desktop)
  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return

    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === '') {
      setShowColorPicker(false)
      return
    }

    try {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Show color picker near the selection
      setColorPickerPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 50 // Above the selection
      })
      setShowColorPicker(true)
    } catch (error) {
      console.error('Error showing color picker:', error)
    }
  }, [isSelecting])

  // Handle long-press for mobile
  const [touchStartTime, setTouchStartTime] = useState<number>(0)
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isSelecting) return

    setTouchStartTime(Date.now())

    // Start long-press timer (500ms)
    const timer = setTimeout(() => {
      // Trigger selection after long press
      const touch = e.touches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)

      // Let browser handle text selection
      setTimeout(() => {
        const selection = window.getSelection()
        if (selection && selection.toString().trim()) {
          try {
            const range = selection.getRangeAt(0)
            const rect = range.getBoundingClientRect()

            setColorPickerPosition({
              x: rect.left + rect.width / 2,
              y: rect.top - 60 // Above selection, more space on mobile
            })
            setShowColorPicker(true)
          } catch (error) {
            console.error('Error on touch selection:', error)
          }
        }
      }, 100)
    }, 500)

    setTouchTimer(timer)
  }, [isSelecting])

  const handleTouchEnd = useCallback(() => {
    if (touchTimer) {
      clearTimeout(touchTimer)
      setTouchTimer(null)
    }
  }, [touchTimer])

  const handleTouchMove = useCallback(() => {
    // Cancel long-press if user moves finger
    if (touchTimer) {
      clearTimeout(touchTimer)
      setTouchTimer(null)
    }
  }, [touchTimer])

  // Create highlight with selected color
  const createHighlight = useCallback((color: string) => {
    const selection = window.getSelection()
    if (!selection || selection.toString().trim() === '') {
      return
    }

    try {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const pageElement = pageRef.current

      if (!pageElement) {
        console.warn('Page element not found')
        return
      }

      const pageRect = pageElement.getBoundingClientRect()

      // Ensure we have valid dimensions
      if (pageRect.width === 0 || pageRect.height === 0) {
        console.warn('Invalid page dimensions')
        return
      }

      // Calculate relative coordinates as percentages (scale-independent)
      const x = rect.left - pageRect.left
      const y = rect.top - pageRect.top

      const coordinates = {
        x: x,
        y: y,
        width: rect.width,
        height: rect.height,
        pageHeight: pageRect.height,
        pageWidth: pageRect.width,
        // Store as percentages for scale independence
        xPercent: (x / pageRect.width) * 100,
        yPercent: (y / pageRect.height) * 100,
        widthPercent: (rect.width / pageRect.width) * 100,
        heightPercent: (rect.height / pageRect.height) * 100
      }

      const highlight: Omit<Highlight, 'id'> = {
        pageNumber,
        coordinates,
        color: color,
        text: selection.toString()
      }

      console.log('Creating highlight:', highlight)

      // Show creating animation
      setIsCreatingHighlight(true)

      onHighlightCreate?.(highlight)

      // Clear selection and hide picker with smooth transition
      setTimeout(() => {
        setIsCreatingHighlight(false)
        selection.removeAllRanges()
        setShowColorPicker(false)
        setColorPickerPosition(null)
      }, 150)
    } catch (error) {
      console.error('Error creating highlight:', error)
    }
  }, [pageNumber, onHighlightCreate])

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isSelecting, handleMouseUp])

  // Handle keyboard shortcuts and click outside
  useEffect(() => {
    if (!showColorPicker) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowColorPicker(false)
        setColorPickerPosition(null)
        window.getSelection()?.removeAllRanges()
      }
      // Quick color selection with number keys 1-5
      if (e.key >= '1' && e.key <= '5') {
        const index = parseInt(e.key) - 1
        if (colors[index]) {
          createHighlight(colors[index].name)
        }
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false)
        setColorPickerPosition(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker, createHighlight, colors])

  // Render highlights on canvas
  const renderHighlights = () => {
    const pageHighlights = highlights.filter(h => h.pageNumber === pageNumber)

    if (pageHighlights.length === 0) return null

    return pageHighlights.map(highlight => {
      const color = colors.find(c => c.name === highlight.color)

      // Ensure coordinates exist and are valid
      if (!highlight.coordinates) {
        console.warn('Invalid highlight coordinates:', highlight)
        return null
      }

      const coords = highlight.coordinates as any

      // Use stored percentages if available (new format), otherwise calculate from pixels (legacy)
      let leftPercent, topPercent, widthPercent, heightPercent

      if (coords.xPercent !== undefined && coords.yPercent !== undefined) {
        // New format: use pre-calculated percentages (scale-independent)
        leftPercent = coords.xPercent
        topPercent = coords.yPercent
        widthPercent = coords.widthPercent
        heightPercent = coords.heightPercent
      } else {
        // Legacy format: calculate from pixel coordinates
        if (!coords.pageWidth || !coords.pageHeight) {
          console.warn('Missing page dimensions for legacy highlight:', highlight)
          return null
        }
        leftPercent = (coords.x / coords.pageWidth) * 100
        topPercent = (coords.y / coords.pageHeight) * 100
        widthPercent = (coords.width / coords.pageWidth) * 100
        heightPercent = (coords.height / coords.pageHeight) * 100
      }

      return (
        <div
          key={highlight.id}
          className="absolute cursor-pointer hover:opacity-90 transition-all duration-200 pointer-events-auto animate-in fade-in zoom-in-95"
          style={{
            left: `${leftPercent}%`,
            top: `${topPercent}%`,
            width: `${widthPercent}%`,
            height: `${heightPercent}%`,
            backgroundColor: color?.hex || '#fde047',
            opacity: 0.4,
            zIndex: 10
          }}
          onClick={(e) => {
            e.stopPropagation()
            onHighlightClick?.(highlight)
          }}
          title={highlight.note || highlight.text.substring(0, 50)}
        />
      )
    })
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-semibold mb-2">Error Loading PDF</p>
        <p className="text-muted-foreground">{error}</p>
      </Card>
    )
  }

  const pdfContent = (
    <>
      {/* Toolbar */}
      <Card className={`p-3 sm:p-4 ${isFullscreen ? 'rounded-none' : ''}`}>
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Top Row: Page Navigation (always visible) */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousPage}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={pageNumber >= numPages}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-sm font-medium whitespace-nowrap">
              Page {pageNumber} of {numPages || '...'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Bottom Row: Zoom and Highlighting */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Zoom Controls - hidden on mobile */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              <Button variant="outline" size="sm" onClick={zoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="text-xs">{Math.round(scale * 100)}%</Badge>
              <Button variant="outline" size="sm" onClick={zoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetZoom}>
                Reset
              </Button>
            </div>

            {/* Highlighting Toggle - visible on all devices */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={isSelecting ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setIsSelecting(!isSelecting)
                  if (isSelecting) {
                    setShowColorPicker(false)
                  }
                }}
                className="gap-2 flex-1 sm:flex-none"
              >
                <Highlighter className="h-4 w-4" />
                <span className="hidden sm:inline">{isSelecting ? 'Highlighting On' : 'Enable Highlighting'}</span>
                <span className="sm:hidden">{isSelecting ? 'Highlighting Mode: ON' : 'Enable Highlighting'}</span>
              </Button>
              {isSelecting && (
                <div className="flex items-center gap-2 flex-1 sm:flex-none">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    <span className="hidden md:inline">Select text to highlight</span>
                    <span className="md:hidden">Long-press text, then choose color</span>
                  </span>
                  {/* Show current color */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded border bg-muted">
                    <div className={`w-4 h-4 rounded ${colors.find(c => c.name === selectedColor)?.class}`} />
                    <span className="text-xs capitalize hidden sm:inline">{selectedColor}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* PDF Document */}
      <Card className={`relative ${isFullscreen ? 'rounded-none flex-1 overflow-auto' : 'overflow-hidden'}`}>
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div
          ref={containerRef}
          className={`${isFullscreen ? 'h-full flex items-center justify-center overflow-auto' : ''}`}
        >
          <div
            ref={pageRef}
            className={`relative inline-block ${isSelecting ? 'pdf-highlighting-active' : ''}`}
            style={{
              cursor: isSelecting ? 'text' : 'default'
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
          >
            <div className="relative">
              <Document
                file={filePath}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }
                options={{
                  // Optimize memory usage
                  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                  cMapPacked: true,
                  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                  // Enable streaming
                  disableAutoFetch: false,
                  disableStream: false
                }}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={getResponsiveScale()}
                  width={isFullscreen && containerWidth > 0 ? Math.min(containerWidth - 32, 800) : undefined}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="pdf-page"
                  loading={
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  }
                />
              </Document>

              {/* Render highlights overlay - allow clicks on highlights, block everything else */}
              <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto' }}>
                  {renderHighlights()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Page Info */}
      {!isFullscreen && (
        <div className="text-center text-sm text-muted-foreground">
          {highlights.filter(h => h.pageNumber === pageNumber).length > 0 && (
            <span>
              {highlights.filter(h => h.pageNumber === pageNumber).length} highlight(s) on this page
            </span>
          )}
        </div>
      )}

      {/* Floating Color Picker on Text Selection */}
      {showColorPicker && colorPickerPosition && (
        <div
          ref={colorPickerRef}
          className="fixed z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            left: `${colorPickerPosition.x}px`,
            top: `${colorPickerPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <Card className="p-2 shadow-lg border-2 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              {colors.map((color, index) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setSelectedColor(color.name)
                    createHighlight(color.name)
                  }}
                  disabled={isCreatingHighlight}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all duration-200
                    hover:scale-110 active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${color.class}
                    ${selectedColor === color.name ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-white shadow-sm'}
                    ${isCreatingHighlight ? 'animate-pulse' : ''}
                  `}
                  title={`Highlight with ${color.name} (${index + 1})`}
                  aria-label={`Highlight with ${color.name}, press ${index + 1}`}
                />
              ))}
              <div className="w-px h-6 bg-border mx-1" />
              <button
                onClick={() => {
                  setShowColorPicker(false)
                  setColorPickerPosition(null)
                  window.getSelection()?.removeAllRanges()
                }}
                disabled={isCreatingHighlight}
                className="p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50"
                title="Cancel (Esc)"
                aria-label="Cancel highlighting"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-xs text-muted-foreground text-center mt-2 px-1">
              Press 1-5 or click to select color
            </div>
          </Card>
        </div>
      )}
    </>
  )

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {pdfContent}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pdfContent}
    </div>
  )
}
