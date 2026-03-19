import type { Editorial as EditorialType } from '@/lib/types'

export function Editorial({ editorial }: { editorial: EditorialType }) {
  if (!editorial) return null

  return (
    <section aria-label="에디터 노트" className="mb-8">
      <div className="bg-surface rounded-3xl border border-border/50 p-6 shadow-md">
        <span className="text-xs font-bold uppercase tracking-widest text-accent mb-3 block">
          {editorial.eyebrow}
        </span>
        <div className="editorial-content space-y-3">
          {editorial.body.map((paragraph, i) => (
            <p key={i} className="text-sm text-text-secondary leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
        {editorial.pullQuote && (
          <blockquote className="mt-6 pl-4 border-l-2 border-accent">
            <p className="text-base text-text italic leading-relaxed">
              &ldquo;{editorial.pullQuote.text}&rdquo;
            </p>
            <cite className="mt-2 block text-xs text-text-muted not-italic">
              — {editorial.pullQuote.cite}
            </cite>
          </blockquote>
        )}
      </div>
    </section>
  )
}
