import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const collectionsDir = path.join(process.cwd(), 'content/collections')
const outputPath = path.join(process.cwd(), 'generated/tag-index.json')

const tagIndex: Record<string, string[]> = {}

if (fs.existsSync(collectionsDir)) {
  const files = fs.readdirSync(collectionsDir).filter(f => f.endsWith('.md'))
  for (const f of files) {
    const content = fs.readFileSync(path.join(collectionsDir, f), 'utf8')
    const { data } = matter(content)
    if (data.status !== 'published' || new Date(data.datePublished) > new Date()) continue
    const slug = f.replace('.md', '')
    for (const tag of (data.tags || [])) {
      if (!tagIndex[tag]) tagIndex[tag] = []
      tagIndex[tag].push(slug)
    }
  }
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(tagIndex, null, 2))
console.log(`Built tag index: ${Object.keys(tagIndex).length} tags`)
