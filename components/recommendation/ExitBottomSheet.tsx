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

    const handlePopState = () => {
      if (Date.now() - startTime > 10000 && !shown) {
        setVisible(true)
        setShown(true)
        window.history.pushState(null, '', window.location.href)
      }
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [shown, recommendations.length, startTime])

  if (!visible || !recommendations.length) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative w-full max-w-lg bg-text rounded-t-3xl p-6 pb-8 animate-slide-in-bottom" style={{ maxHeight: '60vh' }}>
        {/* 핸들 바 */}
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">잠깐, 이런 선물은 어때요?</h3>
          <button
            onClick={dismiss}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 100px)' }}>
          {recommendations.slice(0, 3).map((rec) => (
            <Link
              key={rec.slug}
              href={`/collection/${rec.slug}/`}
              onClick={dismiss}
              className="block p-4 rounded-2xl bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-colors"
            >
              <p className="text-base font-bold text-white mb-2">{rec.title}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 text-white/80 font-medium">{rec.persona}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 text-white/80 font-medium">{rec.budgetTier}</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-occasion-coral/30 text-occasion-coral font-medium">{rec.occasion}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
