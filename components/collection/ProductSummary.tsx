import type { Product } from '@/lib/types'

export function ProductSummary({ products }: { products: Product[] }) {
  if (!products?.length) return null

  return (
    <section aria-label="추천 상품 요약" className="mb-8">
      <h2 className="text-base md:text-lg font-bold text-text mb-4">선물 큐레이션 요약</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible">
        {products.map((product) => (
          <a
            key={product.rank}
            href={`#product-${product.rank}`}
            className="flex-none w-[110px] md:w-auto group text-center"
          >
            <div className="w-[110px] h-[110px] md:w-full md:aspect-square rounded-xl overflow-hidden bg-bg-warm mb-2 border border-border/30 group-hover:border-accent/50 transition-colors">
              {product.image ? (
                <img
                  src={product.image}
                  alt={`${product.brand} ${product.name}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs text-text-muted opacity-40">이미지 준비 중</span>
                </div>
              )}
            </div>
            <p className="text-xs md:text-sm text-text-secondary leading-snug line-clamp-2 group-hover:text-accent transition-colors">
              {product.name}
            </p>
            <p className="text-xs md:text-sm font-bold text-text mt-0.5">
              {product.price.toLocaleString()}원
            </p>
          </a>
        ))}
      </div>
    </section>
  )
}
