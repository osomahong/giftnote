import type { MetadataRoute } from 'next'
import { getPublishedCollections, getAllTags } from '@/lib/content'

export const dynamic = 'force-static'

const SITE_URL = 'https://gift.example.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const collections = getPublishedCollections()
  const tags = getAllTags()

  const collectionEntries: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${SITE_URL}/collection/${c.slug}/`,
    lastModified: new Date(c.dateModified),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const tagEntries: MetadataRoute.Sitemap = tags.map((tag) => ({
    url: `${SITE_URL}/tag/${tag}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...collectionEntries,
    ...tagEntries,
  ]
}
