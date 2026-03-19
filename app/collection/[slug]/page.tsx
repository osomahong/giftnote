import type { Metadata } from 'next'
import { getCollectionBySlug, getPublishedCollections } from '@/lib/content'
import { generateArticleSchema, generateItemListSchema, generateFAQSchema, generateBreadcrumbSchema } from '@/lib/schema'
import { PageHeader } from '@/components/collection/PageHeader'
import { TargetProfileSection } from '@/components/collection/SignalBar'
import { Editorial } from '@/components/collection/Editorial'
import { ProductCard } from '@/components/collection/ProductCard'
import { RelatedSection } from '@/components/collection/RelatedSection'
import { FaqSection } from '@/components/collection/FaqSection'
import { InlineRecommend } from '@/components/recommendation/InlineRecommend'
import { FloatingBubble } from '@/components/recommendation/FloatingBubble'
import { ExitBottomSheet } from '@/components/recommendation/ExitBottomSheet'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { getTagStyle } from '@/lib/tags'
import { getOccasionColor } from '@/lib/occasion-colors'
import { getCuratorProfile } from '@/lib/curators'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const collections = getPublishedCollections()
  return collections.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)
  return {
    title: collection.title,
    description: collection.description,
    openGraph: {
      title: collection.title,
      description: collection.description,
      type: 'article',
      publishedTime: collection.datePublished,
      modifiedTime: collection.dateModified,
      images: [{
        url: `/og/${slug}.png`,
        width: 1200,
        height: 630,
        alt: collection.title,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.title,
      description: collection.description,
      images: [`/og/${slug}.png`],
    },
    alternates: {
      canonical: `/collection/${slug}/`,
    },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const collection = getCollectionBySlug(slug)

  const articleSchema = generateArticleSchema(collection)
  const itemListSchema = generateItemListSchema(collection)
  const faqSchema = generateFAQSchema(collection)
  const breadcrumbSchema = generateBreadcrumbSchema(collection)

  const bubbleRecs = getPublishedCollections()
    .filter(c => c.slug !== slug)
    .slice(0, 2)
    .map(c => ({ slug: c.slug, title: c.title, persona: c.persona, budgetTier: c.budgetTier }))

  const sheetRecs = getPublishedCollections()
    .filter(c => c.slug !== slug)
    .slice(0, 3)
    .map(c => ({ slug: c.slug, title: c.title, persona: c.persona, budgetTier: c.budgetTier, occasion: c.occasion }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-12">
        <Breadcrumb items={[
          { label: '선물 추천', href: '/' },
          { label: collection.title },
        ]} />

        <PageHeader collection={collection} occasionColor={getOccasionColor(collection.occasion)} />
        <TargetProfileSection targets={collection.targets} />
        <Editorial editorial={collection.editorial} curator={collection.curator ? getCuratorProfile(collection.curator) : null} />

        <section aria-label="추천 상품 목록">
          <h2 className="text-lg font-bold text-text mb-4">추천 상품 TOP {collection.products.length}</h2>
          <ol className={`grid gap-6 ${collection.products.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`} itemScope>
            {collection.products.map((product, i) => {
              const isLastOdd = collection.products.length > 1 && collection.products.length % 2 === 1 && i === collection.products.length - 1
              return (
                <ProductCard key={product.rank} product={product} wide={isLastOdd} />
              )
            })}
          </ol>
        </section>

        <div className="my-8" />

        <RelatedSection current={collection} curatorName={collection.curator ? collection.curator.charAt(0).toUpperCase() + collection.curator.slice(1) : undefined} />
        <FaqSection faqs={collection.faqs} />

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {collection.tags.map((tag) => {
              const style = getTagStyle(tag)
              return (
                <a
                  key={tag}
                  href={`/tag/${tag}/`}
                  className={`text-xs px-3 py-1.5 rounded-full ${style.bg} ${style.text} hover:opacity-80 transition-opacity`}
                >
                  #{tag}
                </a>
              )
            })}
          </div>
        </div>

        <InlineRecommend currentSlug={slug} />
      </article>

      <FloatingBubble recommendations={bubbleRecs} />
      <ExitBottomSheet recommendations={sheetRecs} />
    </>
  )
}
