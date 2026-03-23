/**
 * 큐레이터별 사이트맵 XML 생성
 *
 * 출력:
 *   public/sitemap-index.xml    — 사이트맵 인덱스
 *   public/sitemap-main.xml     — 메인 + 태그 페이지
 *   public/sitemap-{curator}.xml — 큐레이터별 컬렉션
 *
 * 사용법: npx tsx scripts/build-sitemaps.ts
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const SITE_URL = 'https://giftnote.kr'
const collectionsDir = path.join(process.cwd(), 'content/collections')
const outputDir = path.join(process.cwd(), 'public')

interface Collection {
  slug: string
  curator?: string
  datePublished: string
  dateModified: string
  tags: string[]
}

function loadCollections(): Collection[] {
  if (!fs.existsSync(collectionsDir)) return []
  return fs.readdirSync(collectionsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const { data } = matter(fs.readFileSync(path.join(collectionsDir, f), 'utf8'))
      return {
        slug: f.replace('.md', ''),
        status: data.status as string,
        curator: data.curator,
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        tags: data.tags || [],
      }
    })
    .filter(c => c.status === 'published' && new Date(c.datePublished) <= new Date())
}

function xmlUrl(loc: string, lastmod: string, changefreq: string, priority: number): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

function wrapUrlset(urls: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
}

function wrapSitemapIndex(sitemaps: { loc: string; lastmod: string }[]): string {
  const entries = sitemaps.map(s => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`
}

function main() {
  console.log('=== 사이트맵 생성 ===\n')

  const collections = loadCollections()
  const now = new Date().toISOString()

  // 모든 태그 수집
  const allTags = [...new Set(collections.flatMap(c => c.tags))].sort()

  // 큐레이터별 그룹
  const byCurator = new Map<string, Collection[]>()
  for (const c of collections) {
    const key = c.curator || 'uncategorized'
    if (!byCurator.has(key)) byCurator.set(key, [])
    byCurator.get(key)!.push(c)
  }

  const sitemapFiles: { loc: string; lastmod: string }[] = []

  // 1. 메인 사이트맵 (홈 + 태그 페이지)
  const mainUrls: string[] = [
    xmlUrl(SITE_URL, now, 'daily', 1.0),
  ]
  for (const tag of allTags) {
    mainUrls.push(xmlUrl(`${SITE_URL}/tag/${encodeURIComponent(tag)}/`, now, 'weekly', 0.5))
  }
  const mainPath = path.join(outputDir, 'sitemap-main.xml')
  fs.writeFileSync(mainPath, wrapUrlset(mainUrls))
  sitemapFiles.push({ loc: `${SITE_URL}/sitemap-main.xml`, lastmod: now })
  console.log(`  sitemap-main.xml: ${mainUrls.length}개 URL (홈 + 태그 ${allTags.length}개)`)

  // 2. 큐레이터별 사이트맵
  for (const [curator, items] of byCurator) {
    const urls = items.map(c =>
      xmlUrl(`${SITE_URL}/collection/${c.slug}/`, c.dateModified, 'weekly', 0.8)
    )
    const filename = `sitemap-${curator}.xml`
    const filePath = path.join(outputDir, filename)
    fs.writeFileSync(filePath, wrapUrlset(urls))

    const latestMod = items.reduce((max, c) => c.dateModified > max ? c.dateModified : max, items[0].dateModified)
    sitemapFiles.push({ loc: `${SITE_URL}/${filename}`, lastmod: new Date(latestMod).toISOString() })
    console.log(`  ${filename}: ${urls.length}개 URL (${curator})`)
  }

  // 3. 사이트맵 인덱스
  const indexContent = wrapSitemapIndex(sitemapFiles)
  const indexPath = path.join(outputDir, 'sitemap-index.xml')
  fs.writeFileSync(indexPath, indexContent)
  // sitemap.xml도 동일 내용으로 생성 (표준 경로)
  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), indexContent)
  console.log(`\n  sitemap-index.xml + sitemap.xml: ${sitemapFiles.length}개 사이트맵`)

  console.log('\n=== 완료 ===')
}

main()
