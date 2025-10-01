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

  const pageRef = useRef<HTMLDivElement>(null)

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

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    const pageElement = pageRef.current

    if (!pageElement) return

    const pageRect = pageElement.getBoundingClientRect()

    // Calculate relative coordinates
    const coordinates = {
      x: rect.left - pageRect.left,
      y: rect.top - pageRect.top,
      width: rect.width,
      height: rect.height,
      pageHeight: pageRect.height,
      pageWidth: pageRect.width
    }

    const highlight: Omit<Highlight, 'id'> = {
      pageNumber,
      coordinates,
      color: selectedColor,
      text: selection.toString()
    }

    onHighlightCreate?.(highlight)
    selection.removeAllRanges()
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

    return pageHighlights.map(highlight => {
      const color = colors.find(c => c.name === highlight.color)

      return (
        <div
          key={highlight.id}
          className="absolute cursor-pointer hover:opacity-75 transition-opacity"
          style={{
            left: `${(highlight.coordinates.x / highlight.coordinates.pageWidth) * 100}%`,
            top: `${(highlight.coordinates.y / highlight.coordinates.pageHeight) * 100}%`,
            width: `${(highlight.coordinates.width / highlight.coordinates.pageWidth) * 100}%`,
            height: `${(highlight.coordinates.height / highlight.coordinates.pageHeight) * 100}%`,
            backgroundColor: color?.hex || '#fde047',
            opacity: 0.4
          }}
          onClick={() => onHighlightClick?.(highlight)}
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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <Highlighter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {colors.map(color => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`
                    w-8 h-8 rounded border-2 transition-all
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
              className="ml-2"
            >
              {isSelecting ? 'Highlighting Enabled' : 'Enable Highlighting'}
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Badge variant="secondary">{Math.round(scale * 100)}%</Badge>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium whitespace-nowrap">
              Page {pageNumber} of {numPages || '...'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* PDF Document */}
      <Card className="relative overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        <div
          ref={pageRef}
          className="relative"
          style={{
            cursor: isSelecting ? 'text' : 'default',
            userSelect: isSelecting ? 'text' : 'none'
          }}
        >
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
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>

          {/* Render highlights overlay */}
          {renderHighlights()}
        </div>
      </Card>

      {/* Page Info */}
      <div className="text-center text-sm text-muted-foreground">
        {highlights.filter(h => h.pageNumber === pageNumber).length > 0 && (
          <span>
            {highlights.filter(h => h.pageNumber === pageNumber).length} highlight(s) on this page
          </span>
        )}
      </div>
    </div>
  )
}
