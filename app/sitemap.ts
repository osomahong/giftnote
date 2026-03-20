import type { MetadataRoute } from 'next'
import { getPublishedCollections, getAllTags } from '@/lib/content'

export const dynamic = 'force-static'

const SITE_URL = 'https://giftnote.kr'

export default function sitemap(): MetadataRoute.Sitemap {
  const collections = getPublishedCollections()
  const tags = getAllTags()

  // 메인 + 태그 페이지
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  // 컬렉션 페이지
  for (const c of collections) {
    entries.push({
      url: `${SITE_URL}/collection/${c.slug}/`,
      lastModified: new Date(c.dateModified),
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  }

  // 태그 페이지
  for (const tag of tags) {
    entries.push({
      url: `${SITE_URL}/tag/${encodeURIComponent(tag)}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    })
  }

  return entries
}
