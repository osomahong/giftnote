declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

export function pushEvent(eventName: string, params: Record<string, string | number | boolean>) {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({ event: eventName, ...params })
  }
}

// data-track 속성명 → event-schema.json 매개변수명 매핑
const PARAM_MAP: Record<string, string> = {
  slug: 'content_id',
  name: 'item_name',
  brand: 'item_brand',
  question: 'content_title',
  tag: 'menu_title',
}

export function trackClick(element: HTMLElement) {
  const tracked = element.closest('[data-track]') as HTMLElement | null
  if (!tracked) return
  const trackType = tracked.getAttribute('data-track')
  if (!trackType) return

  const params: Record<string, string> = {}

  for (const [key, value] of Object.entries(tracked.dataset)) {
    if (key.startsWith('track') && key !== 'track' && value) {
      // camelCase → snake_case: trackMenuType → menu_type
      let paramName = key.replace('track', '').replace(/^[A-Z]/, c => c.toLowerCase()).replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)
      // 매핑 테이블로 변환 (slug → content_id 등)
      paramName = PARAM_MAP[paramName] || paramName
      params[paramName] = value
    }
  }

  // event-schema.json과 일치하는 이벤트 매핑
  const eventMap: Record<string, string> = {
    'collection-card': 'collection_card_click',
    'purchase-btn': 'purchase_click',
    'faq-item': 'faq_open',
    'tag-link': 'tag_click',
    'related-card': 'related_click',
    'nav-tag': 'menu_click',
  }

  const eventName = eventMap[trackType]
  if (eventName) {
    // 자동 보강 파라미터
    if (trackType === 'collection-card') {
      params.content_type = 'collection'
    } else if (trackType === 'related-card') {
      params.content_type = 'related_collection'
    } else if (trackType === 'tag-link') {
      params.menu_type = '태그'
    }
    pushEvent(eventName, params)
  }
}
