import Link from 'next/link'
import { getAllTags } from '@/lib/content'

export function SiteHeader() {
  const tags = getAllTags().slice(0, 5)

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/svg/logo-symbol.svg" alt="" className="h-8 w-8" aria-hidden="true" />
          <img src="/svg/logo.svg" alt="기프트노트" className="h-6" />
        </Link>
        <nav className="flex items-center gap-1">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}/`}
              className="text-xs px-2.5 py-1 rounded-full text-text-muted hover:text-accent hover:bg-accent-light transition-colors hidden md:inline-block"
            >
              #{tag}
            </Link>
          ))}
          <Link
            href="/"
            className="text-sm font-medium text-text-secondary hover:text-accent transition-colors ml-2"
          >
            추천
          </Link>
        </nav>
      </div>
    </header>
  )
}
