export interface Evidence {
  type: 'youtube' | 'community' | 'trend' | 'media'
  source: string
  text: string
  value: string
}

export interface Product {
  rank: number
  name: string
  brand: string
  price: number
  originalPrice?: number
  discountRate?: number
  promotionEnd?: string
  promotionLabel?: string
  source: 'kakao' | 'coupang' | 'naver' | '29cm' | 'kurly' | 'ssg'
  sourceUrl: string
  affiliateUrl: string
  image?: string
  imageAlt?: string
  category: string
  isEditorPick: boolean
  reason: string
  giftMessage: string
  evidence: Evidence[]
}

export interface TargetProfile {
  label: string
  description: string
  icon: 'heart' | 'star' | 'sparkle' | 'check' | 'gift'
}

export interface Editorial {
  eyebrow: string
  body: string[]
  pullQuote: {
    text: string
    cite: string
  }
}

export interface RelatedCollection {
  slug: string
  title: string
  description: string
}

export interface FAQ {
  question: string
  answer: string
  relatedSlug?: string
}

export interface Collection {
  slug: string
  title: string
  description: string
  persona: string
  ageGroup: string
  gender: string
  interest: string
  budgetTier: string
  budgetMin: number
  budgetMax: number
  occasion: string
  tpo: string
  tags: string[]
  status: 'draft' | 'published'
  datePublished: string
  dateModified: string
  heroSvg: string
  thumbnail?: string
  products: Product[]
  targets: TargetProfile[]
  editorial: Editorial
  faqs: FAQ[]
  curator?: string
}
