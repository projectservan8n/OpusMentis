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
  Highlighter
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

  const pageRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  // Handle text selection and highlighting
  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return

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
        color: selectedColor,
        text: selection.toString()
      }

      console.log('Creating highlight:', highlight)
      onHighlightCreate?.(highlight)

      // Clear selection after a small delay to show visual feedback
      setTimeout(() => {
        selection.removeAllRanges()
      }, 100)
    } catch (error) {
      console.error('Error creating highlight:', error)
    }
  }, [isSelecting, pageNumber, selectedColor, onHighlightCreate])

  useEffect(() => {
    if (isSelecting) {
      document.addEventListener('mouseup', handleMouseUp)
      return () => document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isSelecting, handleMouseUp])

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
          className="absolute cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto"
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

          {/* Bottom Row: Zoom and Highlighting (hidden on mobile for space) */}
          <div className="hidden sm:flex items-center justify-between gap-2 flex-wrap">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
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

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {colors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`
                      w-6 h-6 sm:w-8 sm:h-8 rounded border-2 transition-all
                      ${color.class}
                      ${selectedColor === color.name ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}
                    `}
                    title={`Highlight with ${color.name}`}
                  />
                ))}
              </div>
              <Button
                variant={isSelecting ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsSelecting(!isSelecting)}
              >
                <Highlighter className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{isSelecting ? 'Enabled' : 'Highlight'}</span>
              </Button>
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
            className="relative inline-block"
            style={{
              cursor: isSelecting ? 'text' : 'default',
              userSelect: isSelecting ? 'text' : 'none',
              touchAction: isSelecting ? 'none' : 'pan-x pan-y pinch-zoom'
            }}
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
              >
                <Page
                  pageNumber={pageNumber}
                  scale={getResponsiveScale()}
                  width={isFullscreen && containerWidth > 0 ? Math.min(containerWidth - 32, 800) : undefined}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="pdf-page"
                />
              </Document>

              {/* Render highlights overlay - positioned absolutely over the PDF */}
              <div className="absolute inset-0 pointer-events-none">
                {renderHighlights()}
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
