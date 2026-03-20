import Link from 'next/link'
import type { FAQ } from '@/lib/types'
import { getCollectionBySlug } from '@/lib/content'

function FaqRelatedLink({ slug }: { slug: string }) {
  try {
    const collection = getCollectionBySlug(slug)
    return (
      <Link
        href={`/collection/${slug}/`}
        className="mt-3 flex items-center gap-3 p-3 bg-bg-warm rounded-lg border border-border-light hover:border-accent/30 transition-colors group"
      >
        <div className="shrink-0 w-10 h-10 rounded bg-white flex items-center justify-center">
          <img src={collection.heroSvg} alt="" className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-accent font-medium">관련 큐레이션</p>
          <p className="text-sm text-text group-hover:text-accent transition-colors line-clamp-1">
            {collection.title}
          </p>
        </div>
      </Link>
    )
  } catch {
    return null
  }
}

export function FaqSection({ faqs }: { faqs: FAQ[] }) {
  if (!faqs?.length) return null

  return (
    <section aria-label="자주 묻는 질문" className="mb-8">
      <h2 className="text-lg font-bold text-text mb-4">자주 묻는 질문</h2>
      <dl className="space-y-3">
        {faqs.map((faq, i) => (
          <details key={i} className="group bg-surface rounded-2xl border border-border/50 shadow-sm" data-track="faq-item" data-track-question={faq.question}>
            <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
              <dt className="font-medium text-base text-text pr-4">{faq.question}</dt>
              <svg
                className="w-4 h-4 text-text-muted shrink-0 transition-transform group-open:rotate-180"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="px-4 pb-4">
              <dd className="faq-answer text-base text-text-secondary leading-relaxed">
                {faq.answer}
              </dd>
              {faq.relatedSlug && <FaqRelatedLink slug={faq.relatedSlug} />}
            </div>
          </details>
        ))}
      </dl>
    </section>
  )
}
