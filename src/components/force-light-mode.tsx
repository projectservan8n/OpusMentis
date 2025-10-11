'use client'

import { useEffect } from 'react'

/**
 * Force light mode for marketing/public pages
 * This component removes the dark class from the HTML element
 * to ensure public pages are always in light mode
 */
export function ForceLightMode({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Force light mode by removing dark class
    document.documentElement.classList.remove('dark')

    // Watch for any changes and remove dark class immediately
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark')
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  return <>{children}</>
}
