import type { Collection } from './types'

const SITE_URL = 'https://gift.example.com'

export function generateArticleSchema(collection: Collection) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: collection.title,
    description: collection.description,
    datePublished: collection.datePublished,
    dateModified: collection.dateModified,
    author: {
      '@type': 'Organization',
      name: '기프트노트',
    },
    publisher: {
      '@type': 'Organization',
      name: '기프트노트',
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.editorial-content', '.faq-answer'],
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/collection/${collection.slug}/`,
    },
  }
}

export function generateItemListSchema(collection: Collection) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collection.title,
    numberOfItems: collection.products.length,
    itemListElement: collection.products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: product.affiliateUrl,
    })),
  }
}

export function generateFAQSchema(collection: Collection) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: collection.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

export function generateBreadcrumbSchema(collection: Collection) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '선물 추천',
        item: `${SITE_URL}/collection/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: collection.title,
        item: `${SITE_URL}/collection/${collection.slug}/`,
      },
    ],
  }
}
