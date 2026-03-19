'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface BubbleRecommendation {
  slug: string
  title: string
  persona: string
  budgetTier: string
}

export function FloatingBubble({ recommendations }: { recommendations: BubbleRecommendation[] }) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showCount, setShowCount] = useState(0)

  const dismiss = useCallback(() => {
    setVisible(false)
    setDismissed(true)
  }, [])

  useEffect(() => {
    if (dismissed || showCount >= 2 || !recommendations.length) return

    let scrollTimer: ReturnType<typeof setTimeout> | null = null
    let delayTimer: ReturnType<typeof setTimeout> | null = null

    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      if (scrollPercent > 0.7 && !visible) {
        if (scrollTimer) clearTimeout(scrollTimer)
        scrollTimer = setTimeout(() => {
          delayTimer = setTimeout(() => {
            setVisible(true)
            setShowCount(prev => prev + 1)
            // Auto-hide after 60 seconds
            setTimeout(() => setVisible(false), 60000)
          }, 3000)
        }, 100)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimer) clearTimeout(scrollTimer)
      if (delayTimer) clearTimeout(delayTimer)
    }
  }, [dismissed, showCount, visible, recommendations.length])

  if (!visible || !recommendations.length) return null

  const rec = recommendations[0]

  return (
    <div className="fixed bottom-20 right-4 z-30 max-w-xs animate-slide-in-right">
      <div className="bg-white rounded-xl shadow-lg border border-border-light p-4 relative">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-text-muted hover:text-text rounded-full"
          aria-label="닫기"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <p className="text-xs text-text-muted mb-2">이것도 추천해요</p>
        <Link href={`/collection/${rec.slug}/`} className="block group" onClick={dismiss}>
          <p className="text-sm font-medium text-text group-hover:text-accent transition-colors line-clamp-2">
            {rec.title}
          </p>
          <div className="mt-2 flex gap-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-tag-persona text-tag-persona-text">{rec.persona}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-tag-budget text-tag-budget-text">{rec.budgetTier}</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
