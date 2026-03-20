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

  const dismiss = useCallback(() => {
    setVisible(false)
    setDismissed(true)
  }, [])

  useEffect(() => {
    if (dismissed || !recommendations.length) return

    // 상품 카드 3개가 뷰포트에 진입하면 팝업 표시
    let seenCount = 0
    const observed = new Set<Element>()

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && !observed.has(entry.target)) {
          observed.add(entry.target)
          seenCount++
          if (seenCount >= 3 && !visible) {
            setTimeout(() => setVisible(true), 1500)
            observer.disconnect()
          }
        }
      }
    }, { threshold: 0.3 })

    // product-1, product-2, ... 엘리먼트 관찰
    setTimeout(() => {
      document.querySelectorAll('[id^="product-"]').forEach(el => observer.observe(el))
    }, 1000)

    return () => observer.disconnect()
  }, [dismissed, recommendations.length, visible])

  if (!visible || !recommendations.length) return null

  const rec = recommendations[0]

  return (
    <div className="fixed bottom-20 right-3 left-3 md:left-auto md:right-4 md:max-w-sm z-40 animate-slide-in-bottom">
      <div className="bg-text rounded-2xl shadow-2xl p-4 relative border border-white/10">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          aria-label="닫기"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <p className="text-xs text-white/60 mb-2 font-medium">이것도 추천해요</p>
        <Link href={`/collection/${rec.slug}/`} className="block group" onClick={dismiss}>
          <p className="text-base font-bold text-white group-hover:text-occasion-coral transition-colors line-clamp-2 pr-6">
            {rec.title}
          </p>
          <div className="mt-2.5 flex gap-1.5">
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 text-white/80 font-medium">{rec.persona}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-white/15 text-white/80 font-medium">{rec.budgetTier}</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm text-occasion-coral font-medium">
            보러 가기
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  )
}
