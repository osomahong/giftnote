import type { Product } from '@/lib/types'
import { StickerBadge } from '@/components/layout/StickerBadge'

const evidenceStyles: Record<string, { bg: string; text: string }> = {
  youtube: { bg: 'bg-evidence-youtube-bg', text: 'text-evidence-youtube-text' },
  community: { bg: 'bg-evidence-community-bg', text: 'text-evidence-community-text' },
  trend: { bg: 'bg-evidence-trend-bg', text: 'text-evidence-trend-text' },
  media: { bg: 'bg-evidence-media-bg', text: 'text-evidence-media-text' },
}

const platformLabels: Record<string, string> = {
  kakao: '카카오 선물하기',
  coupang: '쿠팡',
  naver: '네이버 쇼핑',
  '29cm': '29CM',
  kurly: '컬리',
  ssg: 'SSG',
}

function PlatformLogo({ source }: { source: string }) {
  const src = source === '29cm' ? '/svg/platforms/29cm.svg' : `/svg/platforms/${source}.svg`
  return (
    <img
      src={src}
      alt={platformLabels[source] || source}
      className="w-5 h-5 rounded"
      loading="lazy"
    />
  )
}

function EvidencePill({ evidence }: { evidence: { type: string; source: string; text: string; value: string } }) {
  const style = evidenceStyles[evidence.type] || evidenceStyles.trend
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${style.bg} ${style.text}`}>
      <span className="font-medium">{evidence.source}</span>
      <span className="opacity-70">·</span>
      <span>{evidence.value}</span>
    </span>
  )
}

function PriceDisplay({ product }: { product: Product }) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const isNaver = product.source === 'naver'
  const isUrgent = product.promotionEnd &&
    (new Date(product.promotionEnd).getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000

  return (
    <div className="flex items-baseline gap-2 flex-wrap">
      {hasDiscount && (
        <>
          <span className="text-sm text-text-muted line-through">
            {product.originalPrice!.toLocaleString()}원
          </span>
          <span className="text-xs font-bold text-discount px-1.5 py-0.5 bg-red-50 rounded">
            {product.discountRate}%
          </span>
        </>
      )}
      <span className="text-lg font-bold text-text">
        {product.price.toLocaleString()}원{isNaver && '~'}
      </span>
      {isNaver && (
        <span className="text-xs text-text-muted">최저가</span>
      )}
      {product.promotionEnd && (
        <span className={`text-xs ${isUrgent ? 'text-promotion-urgent font-bold' : 'text-text-muted'}`}>
          {product.promotionLabel || '프로모션'} ~{product.promotionEnd}
        </span>
      )}
    </div>
  )
}

function ProductImage({ product }: { product: Product }) {
  if (product.image) {
    return (
      <div className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-bg-warm">
        <img
          src={product.image}
          alt={product.imageAlt || `${product.brand} ${product.name}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className="w-full aspect-[4/3] rounded-xl mb-4 bg-bg-warm border border-border-light flex items-center justify-center">
      <div className="text-center text-text-muted">
        <svg className="w-8 h-8 mx-auto mb-1 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
        </svg>
        <span className="text-xs opacity-40">이미지 준비 중</span>
      </div>
    </div>
  )
}

export function ProductCard({ product, className = '', wide = false }: { product: Product; className?: string; wide?: boolean }) {
  if (wide) {
    return (
      <li itemScope className={`bg-surface rounded-2xl border border-border/50 p-4 md:p-6 relative shadow-sm md:col-span-2 ${className}`}>
        {product.isEditorPick && (
          <div className="absolute -top-3 left-4 z-10">
            <StickerBadge text="Editor's Pick" colorClass="bg-editor-pick" rotation={-3} />
          </div>
        )}

        <div className="md:flex md:gap-6">
          <div className="md:flex-1 md:min-w-0">
            <ProductImage product={product} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-text-muted font-medium">#{product.rank}</span>
              <PlatformLogo source={product.source} />
              <span className="text-xs text-text-muted">{product.brand}</span>
            </div>

            <h3 className="font-medium text-text mb-2">{product.name}</h3>
            <PriceDisplay product={product} />

            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              {product.reason}
            </p>

            <p className="mt-2 text-sm text-accent italic">
              &ldquo;{product.giftMessage}&rdquo;
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {product.evidence.map((ev, i) => (
                <EvidencePill key={i} evidence={ev} />
              ))}
            </div>

            <div className="mt-4">
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
                data-track="purchase-btn"
                data-track-name={product.name}
                data-track-brand={product.brand}
                data-track-price={product.price}
                data-track-platform={product.source}
              >
                <PlatformLogo source={product.source} />
                {platformLabels[product.source] || product.source}에서 구매하기
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </li>
    )
  }

  return (
    <li itemScope className={`bg-surface rounded-2xl border border-border/50 p-4 md:p-6 relative shadow-sm ${className}`}>
      {product.isEditorPick && (
        <div className="absolute -top-3 left-4 z-10">
          <StickerBadge text="Editor's Pick" colorClass="bg-editor-pick" rotation={-3} />
        </div>
      )}

      <ProductImage product={product} />

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-text-muted font-medium">#{product.rank}</span>
        <PlatformLogo source={product.source} />
        <span className="text-xs text-text-muted">{product.brand}</span>
      </div>

      <h3 className="font-medium text-text mb-2">{product.name}</h3>

      <PriceDisplay product={product} />

      <p className="mt-3 text-sm text-text-secondary leading-relaxed">
        {product.reason}
      </p>

      <p className="mt-2 text-sm text-accent italic">
        &ldquo;{product.giftMessage}&rdquo;
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {product.evidence.map((ev, i) => (
          <EvidencePill key={i} evidence={ev} />
        ))}
      </div>

      <div className="mt-4">
        <a
          href={product.affiliateUrl}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors"
        >
          <PlatformLogo source={product.source} />
          {platformLabels[product.source] || product.source}에서 구매하기
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
        {product.source === 'coupang' && (
          <p className="mt-2 text-[10px] text-text-muted leading-snug">
            이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다
          </p>
        )}
      </div>
    </li>
  )
}
