import type { Collection } from '@/lib/types'
import type { OccasionColor } from '@/lib/occasion-colors'
import { getCuratorProfile } from '@/lib/curators'

function TagChip({ label, variant }: { label: string; variant: 'persona' | 'budget' | 'occasion' }) {
  const styles = {
    persona: 'bg-white/80 text-tag-persona-text',
    budget: 'bg-white/80 text-tag-budget-text',
    occasion: 'bg-white/80 text-tag-occasion-text',
  }
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm ${styles[variant]}`}>
      {label}
    </span>
  )
}

function highlightKeyword(title: string, keyword: string, highlightClass: string) {
  if (!keyword) return title
  const idx = title.indexOf(keyword)
  if (idx === -1) return title
  return (
    <>
      {title.slice(0, idx)}
      <em className={`not-italic ${highlightClass} px-1 rounded`}>{keyword}</em>
      {title.slice(idx + keyword.length)}
    </>
  )
}

export function PageHeader({ collection, occasionColor }: {
  collection: Collection
  occasionColor: OccasionColor
}) {

  return (
    <header className="mb-10">
      <div className="flex flex-wrap gap-2 justify-center mb-5">
        <TagChip label={collection.persona} variant="persona" />
        <TagChip label={collection.budgetTier} variant="budget" />
        <TagChip label={collection.occasion} variant="occasion" />
      </div>
      <h1 itemProp="headline" className="text-3xl md:text-4xl font-bold text-center text-text leading-snug mb-4">
        {collection.title}
      </h1>
      <p className="text-center text-text-secondary text-base max-w-xl mx-auto mb-5 leading-relaxed">
        {collection.description}
      </p>
      <div className="flex items-center justify-center gap-3 text-sm text-text-secondary">
        {collection.curator && (() => {
          const curator = getCuratorProfile(collection.curator)
          if (!curator) return null
          return (
            <span className="flex items-center gap-2">
              <img src={curator.image} alt={curator.name} className="w-7 h-7 rounded-full object-cover" />
              <span className="font-medium text-text">{curator.label}</span>
            </span>
          )
        })()}
        {collection.curator && <span className="text-text-muted">·</span>}
        <time itemProp="datePublished" dateTime={collection.datePublished} className="text-text-muted">{collection.datePublished}</time>
      </div>
    </header>
  )
}
