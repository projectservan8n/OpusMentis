'use client'

import { useEffect } from 'react'

export default function ConsoleSuppressor() {
  useEffect(() => {
    // Suppress Radix UI accessibility warnings (non-critical)
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args: any[]) => {
      const msg = args[0]
      const msgStr = typeof msg === 'string' ? msg : String(msg)

      // Suppress Radix UI Dialog accessibility warnings
      if (
        msgStr.includes('DialogContent') ||
        msgStr.includes('DialogTitle') ||
        msgStr.includes('aria-describedby') ||
        msgStr.includes('VisuallyHidden')
      ) {
        return
      }

      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const msg = args[0]
      const msgStr = typeof msg === 'string' ? msg : String(msg)

      // Suppress Radix UI warnings
      if (
        msgStr.includes('Missing `Description`') ||
        msgStr.includes('aria-describedby')
      ) {
        return
      }

      originalWarn.apply(console, args)
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  return null
}
