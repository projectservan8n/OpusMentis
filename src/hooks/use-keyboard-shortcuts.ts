import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  callback: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey
        const metaMatch = shortcut.metaKey === undefined || event.metaKey === shortcut.metaKey
        const shiftMatch = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey
        const altMatch = shortcut.altKey === undefined || event.altKey === shortcut.altKey

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          event.preventDefault()
          shortcut.callback()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = []
  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.metaKey) parts.push('⌘')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.shiftKey) parts.push('Shift')
  parts.push(shortcut.key.toUpperCase())
  return parts.join('+')
}
