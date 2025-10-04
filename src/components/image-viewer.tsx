'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Download,
  RotateCw,
  Image as ImageIcon
} from 'lucide-react'

interface ImageViewerProps {
  filePath: string
  title: string
}

export default function ImageViewer({ filePath, title }: ImageViewerProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const resetZoom = () => {
    setScale(1)
    setRotation(0)
  }

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

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

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = filePath
    a.download = title || 'image'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Image Viewer
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-normal text-muted-foreground min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={rotate}
              title="Rotate 90°"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div
          ref={containerRef}
          className={`
            relative bg-muted rounded-lg overflow-auto
            ${isFullscreen ? 'h-screen' : 'min-h-[500px] max-h-[70vh]'}
          `}
        >
          <div className="flex items-center justify-center min-h-full p-4">
            <img
              src={filePath}
              alt={title}
              className="max-w-full h-auto transition-transform duration-200"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
                transformOrigin: 'center'
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Image
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-4">
          Use scroll wheel or pinch to zoom • Click and drag to pan
        </p>
      </CardContent>
    </Card>
  )
}
