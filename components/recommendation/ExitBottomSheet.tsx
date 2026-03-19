'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface SheetRecommendation {
  slug: string
  title: string
  persona: string
  budgetTier: string
  occasion: string
}

export function ExitBottomSheet({ recommendations }: { recommendations: SheetRecommendation[] }) {
  const [visible, setVisible] = useState(false)
  const [shown, setShown] = useState(false)
  const [startTime] = useState(Date.now())

  const dismiss = useCallback(() => {
    setVisible(false)
  }, [])

  useEffect(() => {
    if (shown || !recommendations.length) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && Date.now() - startTime > 10000) {
        // User switching tabs after 10+ seconds
      }
    }

    const handlePopState = () => {
      if (Date.now() - startTime > 10000 && !shown) {
        setVisible(true)
        setShown(true)
        // Push state back so user doesn't actually navigate away
        window.history.pushState(null, '', window.location.href)
      }
    }

    // Push initial state
    window.history.pushState(null, '', window.location.href)

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [shown, recommendations.length, startTime])

  if (!visible || !recommendations.length) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={dismiss} />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl p-6 pb-8 animate-slide-in-bottom" style={{ maxHeight: '55vh' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-text">잠깐, 이런 선물은 어때요?</h3>
          <button
            onClick={dismiss}
            className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text rounded-full"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(55vh - 80px)' }}>
          {recommendations.slice(0, 3).map((rec) => (
            <Link
              key={rec.slug}
              href={`/collection/${rec.slug}/`}
              onClick={dismiss}
              className="block p-3 rounded-xl border border-border-light hover:border-accent/30 transition-colors"
            >
              <p className="text-sm font-medium text-text mb-1.5">{rec.title}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-tag-persona text-tag-persona-text">{rec.persona}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-tag-budget text-tag-budget-text">{rec.budgetTier}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-tag-occasion text-tag-occasion-text">{rec.occasion}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
