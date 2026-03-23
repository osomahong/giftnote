import Link from 'next/link'
import { getOccasionColor } from '@/lib/occasion-colors'
import type { Collection } from '@/lib/types'

export function CollectionCardSmall({ collection }: { collection: Collection }) {
  const oc = getOccasionColor(collection.occasion)

  return (
    <Link
      href={`/collection/${collection.slug}/`}
      className="group block rounded-xl overflow-hidden bg-surface border border-border/30 hover:shadow-sm transition-all"
      data-track="collection-card-small"
      data-track-slug={collection.slug}
      data-track-occasion={collection.occasion}
    >
      <div className={`h-1 ${oc.bar}`} />
      <div className="p-3">
        <div className="flex flex-wrap gap-1 mb-1.5">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-tag-persona text-tag-persona-text font-medium">
            {collection.persona}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-tag-budget text-tag-budget-text font-medium">
            {collection.budgetTier}
          </span>
        </div>
        <h3 className="font-bold text-text text-sm mb-1 line-clamp-1 group-hover:text-accent transition-colors">
          {collection.title}
        </h3>
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
          {collection.description}
        </p>
      </div>
    </Link>
  )
}
