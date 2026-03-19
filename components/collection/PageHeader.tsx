import Image from 'next/image'
import fs from 'fs'
import path from 'path'
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

function getHeroImageSrc(slug: string): string {
  const thumbPath = path.join(process.cwd(), 'public', 'og', `_thumb-${slug}.png`)
  if (fs.existsSync(thumbPath)) {
    return `/og/_thumb-${slug}.png`
  }
  return `/og/_bg.png`
}

export function PageHeader({ collection, slug, occasionColor }: {
  collection: Collection
  slug: string
  occasionColor: OccasionColor
}) {
  const heroSrc = getHeroImageSrc(slug)

  return (
    <header className="mb-10">
      <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden mb-8">
        <Image src={heroSrc} alt="" fill className="object-cover" aria-hidden="true" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        <img src="/svg/decorative/sparkle.svg" alt="" aria-hidden="true"
          className="absolute top-4 left-4 w-6 h-6 opacity-20 text-accent animate-float hidden md:block" />
        <img src="/svg/decorative/heart.svg" alt="" aria-hidden="true"
          className="absolute bottom-8 right-4 w-5 h-5 opacity-20 text-accent animate-wobble delay-2 hidden md:block" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/90 backdrop-blur-sm rounded-2xl p-2.5 shadow-lg">
            <img src={collection.heroSvg} alt="" className="w-full h-full" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <TagChip label={collection.persona} variant="persona" />
            <TagChip label={collection.budgetTier} variant="budget" />
            <TagChip label={collection.occasion} variant="occasion" />
          </div>
        </div>
      </div>
      <h1 itemProp="headline" className="text-3xl md:text-4xl font-bold text-center text-text leading-snug mb-4">
        {highlightKeyword(collection.title, collection.interest, occasionColor.highlight)}
      </h1>
      <p className="text-center text-text-secondary text-base max-w-xl mx-auto mb-5 leading-relaxed">
        {collection.description}
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-text-secondary">
        {collection.curator && (() => {
          const curator = getCuratorProfile(collection.curator)
          if (!curator) return null
          return (
            <span className="font-medium text-text">{curator.label}</span>
          )
        })()}
        {collection.curator && <span className="text-text-muted">·</span>}
        <time itemProp="datePublished" dateTime={collection.datePublished} className="text-text-muted">{collection.datePublished}</time>
      </div>
    </header>
  )
}
