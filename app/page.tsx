import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedCollections, getAllTags } from '@/lib/content'
import { getOccasionColor } from '@/lib/occasion-colors'
import { WaveDivider } from '@/components/layout/WaveDivider'
import { HeroDecorations } from '@/components/layout/HeroDecorations'

function hasThumb(slug: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', 'og', `_thumb-${slug}.png`))
}

function CollectionCard({
  collection,
  featured = false,
}: {
  collection: ReturnType<typeof getPublishedCollections>[number]
  featured?: boolean
}) {
  const thumb = hasThumb(collection.slug)
  const oc = getOccasionColor(collection.occasion)

  return (
    <Link
      href={`/collection/${collection.slug}/`}
      className={`group block rounded-3xl overflow-hidden bg-surface shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${featured ? 'h-full' : ''}`}
      data-track="collection-card"
      data-track-slug={collection.slug}
      data-track-occasion={collection.occasion}
      data-track-curator={collection.curator || ''}
    >
      <div className={`h-1 ${oc.bar}`} />

      <div className={`relative w-full overflow-hidden ${featured ? 'aspect-[3/2] min-h-[320px]' : 'aspect-[4/3]'}`}>
        {thumb ? (
          <Image
            src={`/og/_thumb-${collection.slug}.png`}
            alt={collection.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full ${oc.highlight} flex items-center justify-center`}>
            <img
              src={collection.heroSvg}
              alt=""
              className="w-12 h-12 opacity-40"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <div className={featured ? 'p-6' : 'p-5'}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-tag-persona text-tag-persona-text font-medium">
            {collection.persona}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-tag-budget text-tag-budget-text font-medium">
            {collection.budgetTier}
          </span>
        </div>
        <h3 className={`font-bold text-text ${featured ? 'text-2xl md:text-[28px]' : 'text-base'} mb-2 ${featured ? 'line-clamp-3' : 'line-clamp-2'} group-hover:text-accent transition-colors`}>
          {collection.title}
        </h3>
        <p className={`text-sm text-text-secondary ${featured ? 'line-clamp-3' : 'line-clamp-2'} leading-relaxed`}>
          {collection.description}
        </p>
        <span className="inline-flex items-center gap-1 mt-3 text-sm text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          자세히 보기
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const collections = getPublishedCollections()
  const tags = getAllTags()

  const sorted = [...collections].sort(
    (a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
  )
  const featured = sorted[0]
  const subFeatured = sorted.slice(1, 4)

  const grouped = collections.reduce<Record<string, typeof collections>>((acc, c) => {
    const key = c.occasion || '기타'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  const occasionEntries = Object.entries(grouped)
  const snapSections = occasionEntries.slice(0, 3)
  const restSections = occasionEntries.slice(3)

  return (
    <div className="md:snap-none snap-y snap-proximity">
      {/* 히어로 */}
      <section className="relative min-h-screen md:min-h-0 snap-start flex items-center justify-center md:block md:py-16 bg-bg">
        <div className="absolute inset-0 dot-pattern pointer-events-none" />
        <HeroDecorations />
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text leading-tight mb-4 animate-fade-in-up">
            마음을 전하는{' '}
            <em className="not-italic bg-occasion-coral/20 px-2 py-0.5 rounded-md">선물</em>{' '}
            큐레이션
          </h1>
          <p className="text-lg text-text-secondary animate-fade-in-up delay-1">
            받는 사람, 예산, 상황에 꼭 맞는 선물을 찾아보세요
          </p>
        </div>
      </section>

      <WaveDivider variant="to-warm" />

      {/* 피처드 */}
      {featured && (
        <section className="min-h-screen md:min-h-0 snap-start bg-bg-warm py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-text mb-8">최신 큐레이션</h2>
            {subFeatured.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
                  <CollectionCard collection={featured} featured />
                </div>
                <div className="md:col-span-2 flex flex-col gap-6">
                  {subFeatured.map((c) => (
                    <CollectionCard key={c.slug} collection={c} />
                  ))}
                </div>
              </div>
            ) : (
              <CollectionCard collection={featured} featured />
            )}
          </div>
        </section>
      )}

      <WaveDivider variant="to-default" />

      {/* Occasion별 — 스냅 (처음 3개) */}
      {snapSections.map(([occasion, items]) => {
        const oc = getOccasionColor(occasion)
        return (
          <section key={occasion} className="min-h-screen md:min-h-0 snap-start bg-bg py-8 md:py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-8 flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${oc.bar}`} />
                {occasion}
              </h2>
              <div className="flex md:hidden gap-4 overflow-x-auto snap-x snap-proximity pb-4 -mx-4 px-4">
                {items.map((c) => (
                  <div key={c.slug} className="snap-start shrink-0 w-[280px]">
                    <CollectionCard collection={c} />
                  </div>
                ))}
              </div>
              <div className="hidden md:grid md:grid-cols-3 gap-6">
                {items.map((c) => (
                  <CollectionCard key={c.slug} collection={c} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* 나머지 Occasion (스냅 아님) */}
      {restSections.map(([occasion, items]) => {
        const oc = getOccasionColor(occasion)
        return (
          <section key={occasion} className="bg-bg py-8 md:py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-text mb-8 flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${oc.bar}`} />
                {occasion}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {items.map((c) => (
                  <CollectionCard key={c.slug} collection={c} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      <WaveDivider variant="to-warm" />

      {/* 태그 */}
      <section className="bg-bg-warm py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-text mb-8">태그</h2>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}/`}
                className="text-sm px-4 py-2 rounded-full bg-surface text-text-secondary border border-border/50 hover:border-accent/30 hover:text-accent transition-all"
                data-track="tag-link"
                data-track-tag={tag}
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
