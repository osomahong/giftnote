/**
 * 쿠팡파트너스 API 키워드 검색 스크립트 — Batch 5
 *
 * 5개 테마 × 2 키워드 = 10회 검색 (limit=5, 7초 간격)
 * 결과를 content/products/crawl-batch-5.json에 저장
 *
 * 사용법: npx tsx scripts/coupang-search-batch5.ts
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const ACCESS_KEY = process.env.COUPANG_ACCESS_KEY!
const SECRET_KEY = process.env.COUPANG_SECRET_KEY!

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('COUPANG_ACCESS_KEY, COUPANG_SECRET_KEY 환경변수를 설정하세요.')
  process.exit(1)
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

function generateHmac(method: string, urlPath: string): string {
  const [pathPart, ...queryParts] = urlPath.split('?')
  const query = queryParts.join('?')
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const datetime = `${String(now.getUTCFullYear()).slice(2)}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
  const message = datetime + method + pathPart + (query || '')
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(message).digest('hex')
  return `CEA algorithm=HmacSHA256, access-key=${ACCESS_KEY}, signed-date=${datetime}, signature=${signature}`
}

interface CoupangProduct {
  productName: string
  productPrice: number
  productImage: string
  productUrl: string
}

async function searchCoupang(keyword: string, limit = 5): Promise<CoupangProduct[]> {
  const apiPath = `/v2/providers/affiliate_open_api/apis/openapi/products/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`
  const auth = generateHmac('GET', apiPath)
  const res = await fetch(`https://api-gateway.coupang.com${apiPath}`, {
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    console.error(`  HTTP ${res.status}: ${res.statusText}`)
    return []
  }
  const data = await res.json()
  return data.data?.productData || []
}

// --- 테마 정의 ---

interface Theme {
  id: string
  label: string
  keywords: string[]
}

const themes: Theme[] = [
  {
    id: 'housewarming-kitchen-30k',
    label: '집들이 선물 3만원대 주방용품',
    keywords: ['집들이 선물 주방', '주방 선물세트'],
  },
  {
    id: 'holiday-parents-50k',
    label: '명절 부모님 선물 5만원대',
    keywords: ['명절 부모님 선물', '추석 선물세트'],
  },
  {
    id: 'friend-30s-birthday-30k',
    label: '30대 친구 생일 선물 3만원대',
    keywords: ['30대 생일 선물', '친구 생일 선물 3만원'],
  },
  {
    id: 'luxury-girlfriend-50k-anniversary',
    label: '여자친구 기념일 선물 5만원대',
    keywords: ['여자친구 기념일 선물', '여자친구 선물 5만원'],
  },
  {
    id: 'thankyou-parents-30k',
    label: '부모님 감사 선물 3만원대',
    keywords: ['부모님 감사 선물', '어버이날 선물 3만원'],
  },
]

// --- 메인 ---

interface SearchResult {
  productName: string
  productPrice: number
  productUrl: string
  productImage: string
}

interface ThemeResult {
  themeId: string
  themeLabel: string
  keywords: {
    keyword: string
    results: SearchResult[]
  }[]
}

async function main() {
  console.log('=== 쿠팡파트너스 키워드 검색 — Batch 5 ===\n')

  const output: ThemeResult[] = []
  let apiCalls = 0

  for (const theme of themes) {
    console.log(`\n[${theme.id}] ${theme.label}`)
    const themeResult: ThemeResult = {
      themeId: theme.id,
      themeLabel: theme.label,
      keywords: [],
    }

    for (const keyword of theme.keywords) {
      if (apiCalls > 0) {
        console.log('  ... 7초 대기 ...')
        await sleep(7000)
      }

      console.log(`  검색: "${keyword}"`)
      const products = await searchCoupang(keyword, 5)
      apiCalls++

      const mapped: SearchResult[] = products.map(p => ({
        productName: p.productName,
        productPrice: p.productPrice,
        productUrl: p.productUrl,
        productImage: p.productImage,
      }))

      themeResult.keywords.push({ keyword, results: mapped })

      console.log(`  → ${mapped.length}개 결과`)
      for (const p of mapped) {
        console.log(`    - ${p.productName} (${p.productPrice.toLocaleString()}원)`)
      }
    }

    output.push(themeResult)
  }

  // 저장
  const outPath = path.join(process.cwd(), 'content/products/crawl-batch-5.json')
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8')

  console.log(`\n\n=== 완료 ===`)
  console.log(`API 호출: ${apiCalls}회`)
  console.log(`저장: ${outPath}`)
}

main().catch(console.error)
