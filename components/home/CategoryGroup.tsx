import Link from 'next/link'
import { CollectionCardSmall } from './CollectionCardSmall'
import { CompactListItem } from './CompactListItem'
import type { Collection } from '@/lib/types'

interface CategoryGroupProps {
  label: string
  emoji: string
  tagSlug: string
  items: Collection[]
}

export function CategoryGroup({ label, emoji, tagSlug, items }: CategoryGroupProps) {
  const showCard = items.length >= 3
  const cardItem = showCard ? items[0] : null
  const listItems = showCard ? items.slice(1) : items

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-text flex items-center gap-1.5">
          {emoji && <span>{emoji}</span>}
          {label}
        </h3>
        <Link
          href={`/tag/${tagSlug}/`}
          className="text-xs text-accent hover:underline"
          data-track="category-view-all"
          data-track-tag={tagSlug}
        >
          전체 보기 &rarr;
        </Link>
      </div>

      {cardItem && (
        <div className="mb-2">
          <CollectionCardSmall collection={cardItem} />
        </div>
      )}

      <div className="rounded-xl bg-surface/50 overflow-hidden">
        {listItems.map((c) => (
          <CompactListItem key={c.slug} collection={c} />
        ))}
      </div>
    </div>
  )
}
