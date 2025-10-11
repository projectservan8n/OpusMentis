'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Keyboard } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  open: boolean
  onClose: () => void
}

export default function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { keys: ['Space'], description: 'Play/Pause media' },
    { keys: ['1'], description: 'Switch to Document/Media tab' },
    { keys: ['2'], description: 'Switch to Summary tab' },
    { keys: ['3'], description: 'Switch to Kanban tab' },
    { keys: ['4'], description: 'Switch to Flashcards tab' },
    { keys: ['5'], description: 'Switch to Notes tab' },
    { keys: ['F'], description: 'Toggle fullscreen' },
    { keys: ['⌘', 'S'], description: 'Quick save (auto-saved)' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
    { keys: ['Esc'], description: 'Close modals' },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <div key={keyIndex} className="flex items-center gap-1">
                    {keyIndex > 0 && <span className="text-muted-foreground">+</span>}
                    <Badge variant="outline" className="font-mono">
                      {key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
