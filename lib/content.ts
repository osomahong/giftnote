import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { Collection } from './types'

const collectionsDir = path.join(process.cwd(), 'content/collections')

export function getCollectionBySlug(slug: string): Collection {
  const filePath = path.join(collectionsDir, `${slug}.md`)
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(fileContents)
  return { slug, ...data } as Collection
}

export function getAllCollections(): Collection[] {
  if (!fs.existsSync(collectionsDir)) return []
  const files = fs.readdirSync(collectionsDir).filter(f => f.endsWith('.md'))
  return files.map(f => getCollectionBySlug(f.replace('.md', '')))
}

export function getPublishedCollections(): Collection[] {
  return getAllCollections().filter(c => c.status === 'published')
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  getAllCollections().forEach(c => c.tags?.forEach(t => tags.add(t)))
  return Array.from(tags).sort()
}

export function getCollectionsByTag(tag: string): Collection[] {
  return getPublishedCollections().filter(c => c.tags?.includes(tag))
}
