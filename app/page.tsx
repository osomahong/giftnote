import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedCollections, getAllTags } from '@/lib/content'
import { getOccasionColor } from '@/lib/occasion-colors'
import { WaveDivider } from '@/components/layout/WaveDivider'
import { HeroDecorations } from '@/components/layout/HeroDecorations'
import { CompactListItem } from '@/components/home/CompactListItem'
import { CategoryTabs } from '@/components/home/CategoryTabs'

function hasOgImage(slug: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', 'og', `${slug}.png`))
}

function CollectionCard({ collection }: {
  collection: ReturnType<typeof getPublishedCollections>[number]
}) {
  const ogImage = hasOgImage(collection.slug)
  const oc = getOccasionColor(collection.occasion)

  return (
    <Link
      href={`/collection/${collection.slug}/`}
      className="group block rounded-2xl overflow-hidden bg-surface shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-border/30"
      data-track="collection-card"
      data-track-slug={collection.slug}
      data-track-occasion={collection.occasion}
      data-track-curator={collection.curator || ''}
    >
      <div className={`h-0.5 ${oc.bar}`} />

      {ogImage && (
        <div className="relative w-full overflow-hidden aspect-[2/1]">
          <Image
            src={`/og/${collection.slug}.png`}
            alt={collection.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-tag-persona text-tag-persona-text font-medium">
            {collection.persona}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-tag-budget text-tag-budget-text font-medium">
            {collection.budgetTier}
          </span>
        </div>
        <h3 className="font-bold text-text text-sm mb-1 line-clamp-2 group-hover:text-accent transition-colors">
          {collection.title}
        </h3>
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
          {collection.description}
        </p>
      </div>
    </Link>
  )
}

// 태그 카테고리 분류
const TAG_CATEGORIES: Record<string, { label: string; emoji: string }> = {
  '생일': { label: '생일 선물', emoji: '🎂' },
  '집들이': { label: '집들이 선물', emoji: '🏠' },
  '감사': { label: '감사 선물', emoji: '💐' },
  '기념일': { label: '기념일 선물', emoji: '💝' },
  '남자친구': { label: '남자친구 선물', emoji: '👨' },
  '여자친구': { label: '여자친구 선물', emoji: '👩' },
  '부모님': { label: '부모님 선물', emoji: '👨‍👩‍👧' },
  '직장동료': { label: '직장 선물', emoji: '💼' },
  '20대': { label: '20대 선물', emoji: '' },
  '30대': { label: '30대 선물', emoji: '' },
  '1만원대': { label: '1만원대', emoji: '' },
  '2만원대': { label: '2만원대', emoji: '' },
  '3만원대': { label: '3만원대', emoji: '' },
  '5만원대': { label: '5만원대', emoji: '' },
  '운동': { label: '운동/헬스', emoji: '🏋️' },
  '뷰티': { label: '뷰티/패션', emoji: '💄' },
  '인테리어': { label: '인테리어', emoji: '🛋️' },
  '건강': { label: '건강', emoji: '💊' },
}

export default function HomePage() {
  const collections = getPublishedCollections()
  const tags = getAllTags()

  const sorted = [...collections].sort(
    (a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
  )

  // 상황별 그룹
  const byOccasion = collections.reduce<Record<string, typeof collections>>((acc, c) => {
    const key = c.occasion || '기타'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  // 대상별 그룹
  const byTarget = collections.reduce<Record<string, typeof collections>>((acc, c) => {
    // 태그에서 대상 태그 추출
    const targetTags = c.tags.filter(t => ['남자친구', '여자친구', '부모님', '직장동료', '친구'].includes(t))
    for (const tag of targetTags) {
      if (!acc[tag]) acc[tag] = []
      acc[tag].push(c)
    }
    return acc
  }, {})

  // 예산별 그룹
  const byBudget = collections.reduce<Record<string, typeof collections>>((acc, c) => {
    if (!acc[c.budgetTier]) acc[c.budgetTier] = []
    acc[c.budgetTier].push(c)
    return acc
  }, {})

  // CategoryTabs용 GroupData 변환
  const occasionGroups = Object.entries(byOccasion).map(([key, items]) => {
    const cat = TAG_CATEGORIES[key]
    return {
      label: cat?.label || `${key} 선물`,
      emoji: cat?.emoji || '',
      tagSlug: key,
      items,
    }
  })

  const targetGroups = Object.entries(byTarget).map(([key, items]) => {
    const cat = TAG_CATEGORIES[key]
    return {
      label: cat?.label || `${key} 선물`,
      emoji: cat?.emoji || '',
      tagSlug: key,
      items,
    }
  })

  const budgetGroups = Object.entries(byBudget).map(([key, items]) => {
    const cat = TAG_CATEGORIES[key]
    return {
      label: cat?.label || key,
      emoji: cat?.emoji || '',
      tagSlug: key,
      items,
    }
  })

  const latestTop = sorted.slice(0, 6)
  const latestRest = sorted.slice(6)

  return (
    <div className="md:snap-none snap-y snap-proximity">
      {/* 히어로 */}
      <section className="relative min-h-[50vh] md:min-h-0 snap-start flex items-center justify-center md:block md:py-14 bg-bg">
        <div className="absolute inset-0 dot-pattern pointer-events-none" />
        <HeroDecorations />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text leading-tight mb-3 animate-fade-in-up">
            마음을 전하는{' '}
            <em className="not-italic bg-occasion-coral/20 px-1.5 py-0.5 rounded-md">선물</em>{' '}
            큐레이션
          </h1>
          <p className="text-base text-text-secondary animate-fade-in-up delay-1">
            받는 사람, 예산, 상황에 꼭 맞는 선물을 찾아보세요
          </p>
        </div>
      </section>

      <WaveDivider variant="to-warm" />

      {/* 최신 큐레이션 — 상위 6개 풀카드 + 나머지 컴팩트 리스트 */}
      <section className="bg-bg-warm py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold text-text mb-6">최신 큐레이션</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {latestTop.map((c) => (
              <CollectionCard key={c.slug} collection={c} />
            ))}
          </div>
          {latestRest.length > 0 && (
            <div className="mt-6 rounded-xl bg-surface/50 overflow-hidden grid grid-cols-1 md:grid-cols-2">
              {latestRest.map((c) => (
                <CompactListItem key={c.slug} collection={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      <WaveDivider variant="to-default" />

      {/* 카테고리별 탐색 — 탭 UI */}
      <section className="bg-bg py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold text-text mb-6">카테고리별 탐색</h2>
          <CategoryTabs
            byOccasion={occasionGroups}
            byTarget={targetGroups}
            byBudget={budgetGroups}
          />
        </div>
      </section>

      <WaveDivider variant="to-warm" />

      {/* 태그로 찾기 */}
      <section className="bg-bg-warm py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-xl font-bold text-text mb-6">태그로 찾기</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}/`}
                className="text-sm px-3 py-1.5 rounded-full bg-surface text-text-secondary border border-border/50 hover:border-accent/30 hover:text-accent transition-all"
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
