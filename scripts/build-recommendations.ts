import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface CollectionMeta {
  slug: string
  title: string
  persona: string
  budgetTier: string
  budgetMin: number
  budgetMax: number
  occasion: string
  interest: string
  status: string
  tags: string[]
}

const collectionsDir = path.join(process.cwd(), 'content/collections')
const outputPath = path.join(process.cwd(), 'generated/recommendations.json')

function loadCollections(): CollectionMeta[] {
  if (!fs.existsSync(collectionsDir)) return []
  return fs.readdirSync(collectionsDir)
    .filter(f => f.endsWith('.md'))
    .map(f => {
      const content = fs.readFileSync(path.join(collectionsDir, f), 'utf8')
      const { data } = matter(content)
      return { slug: f.replace('.md', ''), ...data } as CollectionMeta
    })
    .filter(c => c.status === 'published')
}

function score(a: CollectionMeta, b: CollectionMeta): number {
  let s = 0
  // Same budget, different persona
  if (a.budgetTier === b.budgetTier && a.persona !== b.persona) s += 3
  // Same persona, adjacent budget
  if (a.persona === b.persona && Math.abs(a.budgetMin - b.budgetMin) <= 20000) s += 2
  // Same occasion, different budget
  if (a.occasion === b.occasion && a.budgetTier !== b.budgetTier) s += 1
  // Shared tags bonus
  const shared = a.tags?.filter(t => b.tags?.includes(t)).length || 0
  s += shared * 0.5
  return s
}

const collections = loadCollections()
const recommendations: Record<string, Array<{ slug: string; title: string; persona: string; budgetTier: string; occasion: string }>> = {}

for (const c of collections) {
  const others = collections
    .filter(o => o.slug !== c.slug)
    .map(o => ({ collection: o, score: score(c, o) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(o => ({
      slug: o.collection.slug,
      title: o.collection.title,
      persona: o.collection.persona,
      budgetTier: o.collection.budgetTier,
      occasion: o.collection.occasion,
    }))
  recommendations[c.slug] = others
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(recommendations, null, 2))
console.log(`Built recommendations for ${collections.length} collections`)
