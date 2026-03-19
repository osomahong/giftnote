import Link from 'next/link'
import type { Collection } from '@/lib/types'
import { getPublishedCollections } from '@/lib/content'

function RelatedCard({ collection, section = 'content' }: { collection: Collection; section?: 'content' | 'curator' }) {
  return (
    <Link
      href={`/collection/${collection.slug}/`}
      className="flex gap-4 p-4 bg-surface rounded-3xl border border-border/50 hover:border-accent/30 shadow-md transition-colors group"
      data-track="related-card"
      data-track-slug={collection.slug}
      data-track-section={section}
    >
      <div className="shrink-0 w-16 h-16 rounded-lg bg-bg-warm flex items-center justify-center">
        <img
          src={collection.heroSvg}
          alt=""
          className="w-10 h-10 text-accent"
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-text group-hover:text-accent transition-colors line-clamp-1">
          {collection.title}
        </h3>
        <p className="text-xs text-text-muted mt-1 line-clamp-2">
          {collection.description}
        </p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {collection.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-bg-warm text-text-muted">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

function getRelatedByContent(current: Collection, limit = 3): Collection[] {
  return getPublishedCollections()
    .filter(c => c.slug !== current.slug)
    .map(c => {
      let score = 0
      if (c.occasion === current.occasion) score += 3
      if (c.ageGroup === current.ageGroup) score += 2
      if (c.gender === current.gender && c.gender !== '공통') score += 1
      if (c.interest === current.interest) score += 2
      const sharedTags = c.tags?.filter(t => current.tags?.includes(t)).length || 0
      score += sharedTags
      return { collection: c, score }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.collection)
}

function getRelatedByCurator(current: Collection, limit = 3): Collection[] {
  if (!current.curator) return []
  return getPublishedCollections()
    .filter(c => c.slug !== current.slug && c.curator === current.curator)
    .slice(0, limit)
}

export function RelatedSection({ current, curatorName }: { current: Collection; curatorName?: string }) {
  const contentRelated = getRelatedByContent(current)
  const curatorRelated = getRelatedByCurator(current)

  if (!contentRelated.length && !curatorRelated.length) return null

  return (
    <>
      {contentRelated.length > 0 && (
        <section aria-label="관련 큐레이션" className="mb-8">
          <h2 className="text-lg font-bold text-text mb-4">또 이런 선물 추천 리스트도 있어요</h2>
          <div className="space-y-3">
            {contentRelated.map((collection) => (
              <RelatedCard key={collection.slug} collection={collection} />
            ))}
          </div>
        </section>
      )}

      {curatorRelated.length > 0 && curatorName && (
        <section aria-label={`${curatorName}의 다른 큐레이션`} className="mb-8">
          <h2 className="text-lg font-bold text-text mb-4">
            {curatorName}가 추천하는 또 다른 선물 리스트
          </h2>
          <div className="space-y-3">
            {curatorRelated.map((collection) => (
              <RelatedCard key={collection.slug} collection={collection} section="curator" />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
