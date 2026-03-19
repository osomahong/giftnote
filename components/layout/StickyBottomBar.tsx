'use client'

import { useState, useEffect } from 'react'

interface StickyBottomBarProps {
  productName: string
  price: number
  affiliateUrl: string
}

export function StickyBottomBar({ productName, price, affiliateUrl }: StickyBottomBarProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-border shadow-lg transform transition-transform duration-300">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text truncate">{productName}</p>
          <p className="text-sm font-bold text-accent">{price.toLocaleString()}원</p>
        </div>
        <a
          href={affiliateUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="shrink-0 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          구매하기
        </a>
      </div>
    </div>
  )
}
