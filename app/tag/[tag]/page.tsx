import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllTags, getCollectionsByTag } from '@/lib/content'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { getOccasionColor } from '@/lib/occasion-colors'

type Props = { params: Promise<{ tag: string }> }

export async function generateStaticParams() {
  const tags = getAllTags()
  return tags.map((tag) => ({ tag: encodeURIComponent(tag) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  return {
    title: `#${decodedTag} 선물 추천`,
    description: `${decodedTag} 관련 선물 큐레이션 모음. 데이터 기반으로 엄선한 추천 리스트를 확인하세요.`,
    alternates: {
      canonical: `/tag/${tag}/`,
    },
  }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const collections = getCollectionsByTag(decodedTag)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb items={[
        { label: `#${decodedTag}` },
      ]} />

      <h1 className="text-2xl font-bold text-text mb-2">#{decodedTag}</h1>
      <p className="text-text-secondary text-sm mb-8">{collections.length}개의 큐레이션</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {collections.map((collection) => {
          const oc = getOccasionColor(collection.occasion)
          return (
            <Link
              key={collection.slug}
              href={`/collection/${collection.slug}/`}
              className="block bg-surface rounded-3xl border border-border/50 shadow-md hover:shadow-lg hover:border-accent/30 transition-all overflow-hidden"
            >
              <div className={`h-1 ${oc.bar}`} />
              <div className="p-5">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tag-persona text-tag-persona-text">
                    {collection.persona}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tag-budget text-tag-budget-text">
                    {collection.budgetTier}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tag-occasion text-tag-occasion-text">
                    {collection.occasion}
                  </span>
                </div>
                <h2 className="font-medium text-text text-sm mb-1">{collection.title}</h2>
                <p className="text-xs text-text-muted line-clamp-2">{collection.description}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {collections.length === 0 && (
        <p className="text-center text-text-muted py-12">해당 태그의 큐레이션이 아직 없습니다.</p>
      )}
    </div>
  )
}
