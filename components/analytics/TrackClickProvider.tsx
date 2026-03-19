'use client'

import { useEffect } from 'react'
import { trackClick } from '@/lib/analytics'

export function TrackClickProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      const tracked = target.closest('[data-track]')
      if (tracked) {
        trackClick(target)
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return <>{children}</>
}
