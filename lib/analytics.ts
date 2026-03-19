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

export function trackClick(element: HTMLElement) {
  const trackType = element.closest('[data-track]')?.getAttribute('data-track')
  if (!trackType) return

  const dataset = (element.closest('[data-track]') as HTMLElement)?.dataset || {}
  const params: Record<string, string> = {}

  for (const [key, value] of Object.entries(dataset)) {
    if (key.startsWith('track') && key !== 'track' && value) {
      const paramName = key.replace('track', '').replace(/^[A-Z]/, c => c.toLowerCase()).replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)
      params[paramName] = value
    }
  }

  const eventMap: Record<string, string> = {
    'collection-card': 'select_content',
    'purchase-btn': 'gift_purchase_click',
    'faq-item': 'gift_faq_open',
    'tag-link': 'gift_tag_click',
    'related-card': 'select_content',
  }

  const eventName = eventMap[trackType]
  if (eventName) {
    if (trackType === 'collection-card' || trackType === 'related-card') {
      params.content_type = trackType === 'related-card' ? 'related_collection' : 'collection'
    }
    pushEvent(eventName, params)
  }
}
