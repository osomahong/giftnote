import Link from 'next/link'
import { getOccasionColor } from '@/lib/occasion-colors'
import type { Collection } from '@/lib/types'

export function CompactListItem({ collection }: { collection: Collection }) {
  const oc = getOccasionColor(collection.occasion)

  return (
    <Link
      href={`/collection/${collection.slug}/`}
      className="group flex items-center gap-3 px-3 py-2.5 hover:bg-bg-warm/50 transition-colors border-b border-border/10"
      data-track="compact-list-item"
      data-track-slug={collection.slug}
      data-track-occasion={collection.occasion}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${oc.bar}`} />
      <span className="text-sm text-text font-medium line-clamp-1 flex-1 group-hover:text-accent transition-colors">
        {collection.title}
      </span>
      <span className="text-[11px] px-2 py-0.5 rounded-full bg-tag-persona text-tag-persona-text font-medium shrink-0">
        {collection.persona}
      </span>
      <span className="text-[11px] text-text-muted shrink-0">
        {collection.budgetTier}
      </span>
    </Link>
  )
}
