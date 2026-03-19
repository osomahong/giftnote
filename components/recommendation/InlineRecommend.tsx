import Link from 'next/link'
import fs from 'fs'
import path from 'path'

interface RecommendationItem {
  slug: string
  title: string
  persona: string
  budgetTier: string
  occasion: string
}

function getRecommendations(currentSlug: string): RecommendationItem[] {
  try {
    const filePath = path.join(process.cwd(), 'generated/recommendations.json')
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return (data[currentSlug] || []).slice(0, 6)
  } catch {
    return []
  }
}

export function InlineRecommend({ currentSlug }: { currentSlug: string }) {
  const recommendations = getRecommendations(currentSlug)
  if (!recommendations.length) return null

  return (
    <section aria-label="다른 추천 큐레이션" className="mb-8">
      <h2 className="text-lg font-bold text-text mb-4">이런 큐레이션도 있어요</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recommendations.map((rec) => (
          <Link
            key={rec.slug}
            href={`/collection/${rec.slug}/`}
            className="block p-4 bg-white rounded-xl border border-border-light hover:border-accent/30 transition-colors"
          >
            <h3 className="text-sm font-medium text-text mb-2 line-clamp-2">{rec.title}</h3>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-tag-persona text-tag-persona-text">{rec.persona}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-tag-budget text-tag-budget-text">{rec.budgetTier}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-tag-occasion text-tag-occasion-text">{rec.occasion}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
