import type { Editorial as EditorialType } from '@/lib/types'
import type { CuratorProfile } from '@/lib/curators'

export function Editorial({ editorial, curator }: { editorial: EditorialType; curator?: CuratorProfile | null }) {
  if (!editorial) return null

  return (
    <section aria-label="에디터 노트" className="mb-8">
      <div className="bg-surface rounded-3xl border border-border/50 p-6 shadow-md">
        <div className={curator ? 'flex gap-5' : ''}>
          {curator && (
            <div className="shrink-0 hidden sm:flex flex-col items-center gap-2 pt-1">
              <img
                src={curator.image}
                alt={curator.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <span className="text-xs font-medium text-text-muted">{curator.name}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              {curator && (
                <img
                  src={curator.image}
                  alt={curator.name}
                  className="w-8 h-8 rounded-full object-cover sm:hidden"
                />
              )}
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {editorial.eyebrow}
              </span>
            </div>
            <div className="editorial-content space-y-3">
              {editorial.body.map((paragraph, i) => (
                <p key={i} className="text-sm text-text-secondary leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            {editorial.pullQuote && (
              <blockquote className="mt-5 pl-4 border-l-2 border-accent">
                <p className="text-base text-text italic leading-relaxed">
                  &ldquo;{editorial.pullQuote.text}&rdquo;
                </p>
                <cite className="mt-2 block text-xs text-text-muted not-italic">
                  — {editorial.pullQuote.cite}
                </cite>
              </blockquote>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
