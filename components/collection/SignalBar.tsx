import type { ReactNode } from 'react'
import type { TargetProfile } from '@/lib/types'

const iconMap: Record<TargetProfile['icon'], ReactNode> = {
  heart: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.3l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.1 8.3 22 9.2 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.2 8.9 8.3 12 2" />
    </svg>
  ),
  sparkle: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  gift: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <rect x="5" y="12" width="14" height="9" rx="1" />
      <line x1="12" y1="8" x2="12" y2="21" />
      <path d="M12 8a4 4 0 0 0-4-4c-1.5 0-3 1-2 3" />
      <path d="M12 8a4 4 0 0 1 4-4c1.5 0 3 1 2 3" />
    </svg>
  ),
}

export function TargetProfileSection({ targets }: { targets: TargetProfile[] }) {
  if (!targets?.length) return null

  return (
    <section aria-label="추천 대상" className="mb-8">
      <h2 className="text-lg font-bold text-text mb-4">이런 분께 어울려요</h2>
      <div className="space-y-3">
        {targets.map((target, i) => (
          <div key={i} className="flex items-start gap-3 p-4 md:p-5 bg-surface rounded-2xl border border-border/50 shadow-sm">
            <span className="shrink-0 w-9 h-9 rounded-full bg-accent/8 text-accent flex items-center justify-center mt-0.5">
              {iconMap[target.icon]}
            </span>
            <div className="min-w-0">
              <p className="text-base md:text-lg font-bold text-text">{target.label}</p>
              <p className="text-sm md:text-base text-text-secondary mt-1 leading-relaxed">
                {target.description.split(/(?<=\.) (?=[''"「])/).map((part, j, arr) => (
                  <span key={j}>
                    {part}{j < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
