/**
 * 쿠팡파트너스 상품 자동 검증 + 딥링크 적용 스크립트
 *
 * 워크플로우: 검증 → 문제 발견 → 대안 탐색 → 해결 → 적용
 *
 * 1. MD에서 source=coupang 상품 추출
 * 2. 쿠팡 API 검색 → 3중 검증 (브랜드/유사도/가격)
 * 3. 검증 실패 시: 자동으로 대안 탐색
 *    a) 브랜드명만으로 재검색
 *    b) 카테고리 키워드로 재검색
 *    c) 대안도 실패 → source를 naver로 전환 + 네이버 검색 URL 적용
 * 4. 최종 리포트 출력 + MD 자동 업데이트
 *
 * 사용법: npx tsx scripts/coupang-deeplink.ts
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import matter from 'gray-matter'

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
  const data = await res.json()
  return data.data?.productData || []
}

// --- 검증 ---

function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '').replace(/[^가-힣a-z0-9]/g, '')
}

function extractBrand(name: string): string {
  const match = name.match(/^[\w가-힣]+/)
  return match ? match[0].toLowerCase() : ''
}

const BRAND_ALIASES: Record<string, string[]> = {
  '블렌더보틀': ['블랜더보틀', 'blenderbottle'],
  '블랜더보틀': ['블렌더보틀', 'blenderbottle'],
  '셀렉스': ['selex', '매일유업'],
  '나이키': ['nike'],
  '언더아머': ['underarmour', 'under armour'],
  '아레나': ['arena'],
  'qcy': ['큐씨와이'],
  '아디다스': ['adidas'],
  '뉴발란스': ['new balance', 'newbalance'],
  '리복': ['reebok'],
  '푸마': ['puma'],
  '아식스': ['asics'],
}

function brandMatch(original: string, candidate: string): boolean {
  const origBrand = extractBrand(original).toLowerCase()
  const candNorm = normalize(candidate)
  if (candNorm.includes(normalize(origBrand))) return true
  for (const alias of BRAND_ALIASES[origBrand] || []) {
    if (candNorm.includes(normalize(alias))) return true
  }
  if (origBrand.length >= 3) {
    const chars = normalize(origBrand)
    for (let i = 0; i <= chars.length - 3; i++) {
      if (candNorm.includes(chars.substring(i, i + 3))) return true
    }
  }
  return false
}

function keywordOverlap(original: string, candidate: string): number {
  const words = original.toLowerCase().split(/\s+/).filter(w => w.length > 1)
  const candLow = candidate.toLowerCase()
  let hits = 0
  for (const w of words) if (candLow.includes(w)) hits++
  return words.length > 0 ? hits / words.length : 0
}

function charSimilarity(a: string, b: string): number {
  const na = normalize(a).split('')
  const nb = normalize(b)
  let m = 0
  for (const c of na) if (nb.includes(c)) m++
  return na.length > 0 ? m / na.length : 0
}

function priceOk(orig: number, cand: number): boolean {
  return cand >= orig * 0.5 && cand <= orig * 1.5
}

function verify(origName: string, origPrice: number, cand: CoupangProduct) {
  const brand = brandMatch(origName, cand.productName)
  const sim = charSimilarity(origName, cand.productName)
  const kw = keywordOverlap(origName, cand.productName)
  const price = priceOk(origPrice, cand.productPrice)
  const passed = brand && (sim >= 0.3 || kw >= 0.5)
  return { passed, brand, sim, kw, price }
}

// --- 대안 탐색 ---

function generateAltQueries(name: string, brand: string, category: string): string[] {
  const queries: string[] = []
  // 브랜드 + 카테고리
  if (brand && category) queries.push(`${brand} ${category}`)
  // 브랜드만
  if (brand) queries.push(brand)
  // 카테고리만 (가격대 포함)
  if (category) queries.push(`${category} 선물`)
  return queries
}

function naverSearchUrl(name: string): string {
  return `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(name)}`
}

// --- 메인 ---

interface ProductEntry {
  file: string
  rank: number
  name: string
  brand: string
  price: number
  category: string
  result: 'matched' | 'alt-matched' | 'switched-to-naver' | 'unchanged'
  matchedProduct?: CoupangProduct
  message: string
}

async function main() {
  console.log('=== 쿠팡파트너스 자동 검증 + 딥링크 ===\n')

  const collectionsDir = path.join(process.cwd(), 'content/collections')
  const files = fs.readdirSync(collectionsDir).filter(f => f.endsWith('.md'))
  const entries: ProductEntry[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(collectionsDir, file), 'utf8')
    const { data } = matter(content)
    for (const p of data.products || []) {
      if (p.source === 'coupang') {
        entries.push({ file, rank: p.rank, name: p.name, brand: p.brand, price: p.price, category: p.category, result: 'unchanged', message: '' })
      }
    }
  }

  if (!entries.length) { console.log('쿠팡 상품 없음.'); return }
  console.log(`${entries.length}개 쿠팡 상품 처리\n`)

  let apiCalls = 0

  for (const entry of entries) {
    console.log(`\n--- #${entry.rank} ${entry.name} ---`)

    // Phase 1: 정확한 검색
    const phase1Queries = [entry.name, `${entry.brand} ${entry.name.replace(new RegExp(entry.brand, 'i'), '').trim()}`]

    let best: CoupangProduct | null = null
    let bestSim = 0

    for (const q of phase1Queries) {
      if (apiCalls >= 9) { console.log('  ⚠️ API 쿼터 한도 근접, 남은 상품 스킵'); break }
      console.log(`  검색: "${q}"`)
      const results = await searchCoupang(q, 5)
      apiCalls++
      await sleep(7000)

      for (const cand of results) {
        const v = verify(entry.name, entry.price, cand)
        if (v.passed && v.sim > bestSim) {
          best = cand
          bestSim = v.sim
        }
      }
      if (best) break
    }

    if (best) {
      entry.result = 'matched'
      entry.matchedProduct = best
      entry.message = `✅ 매칭: "${best.productName}" (${best.productPrice}원)`
      console.log(`  ${entry.message}`)
      continue
    }

    // Phase 2: 대안 검색 (브랜드+카테고리 조합)
    console.log('  1차 실패 → 대안 검색...')
    const altQueries = generateAltQueries(entry.name, entry.brand, entry.category)

    for (const q of altQueries) {
      if (apiCalls >= 9) break
      console.log(`  대안 검색: "${q}"`)
      const results = await searchCoupang(q, 5)
      apiCalls++
      await sleep(7000)

      for (const cand of results) {
        const v = verify(entry.name, entry.price, cand)
        if (v.passed && v.sim > bestSim) {
          best = cand
          bestSim = v.sim
        }
      }
      if (best) break
    }

    if (best) {
      entry.result = 'alt-matched'
      entry.matchedProduct = best
      entry.message = `✅ 대안 매칭: "${best.productName}" (${best.productPrice}원)`
      console.log(`  ${entry.message}`)
      continue
    }

    // Phase 3: 쿠팡에 없음 → source를 naver로 자동 전환
    console.log('  대안도 실패 → 네이버로 자동 전환')
    entry.result = 'switched-to-naver'
    entry.message = `🔄 네이버로 전환: 쿠팡에서 "${entry.brand}" 상품을 찾을 수 없음`
    console.log(`  ${entry.message}`)
  }

  // --- MD 파일 업데이트 ---
  console.log('\n\n--- MD 파일 업데이트 ---')

  for (const file of files) {
    const filePath = path.join(collectionsDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const { data, content: body } = matter(content)
    let updated = false

    for (const product of data.products || []) {
      const entry = entries.find(e => e.file === file && e.rank === product.rank)
      if (!entry) continue

      if ((entry.result === 'matched' || entry.result === 'alt-matched') && entry.matchedProduct) {
        product.sourceUrl = entry.matchedProduct.productUrl
        product.affiliateUrl = entry.matchedProduct.productUrl
        product.image = entry.matchedProduct.productImage
        product.price = entry.matchedProduct.productPrice
        updated = true
        console.log(`  ✅ ${file} #${product.rank}: 쿠팡 업데이트`)
      } else if (entry.result === 'switched-to-naver') {
        product.source = 'naver'
        product.sourceUrl = naverSearchUrl(product.name)
        product.affiliateUrl = naverSearchUrl(product.name)
        // 이미지는 기존 것 유지 (이미 있으면)
        updated = true
        console.log(`  🔄 ${file} #${product.rank}: 네이버로 전환`)
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, matter.stringify(body, data))
    }
  }

  // --- 최종 리포트 ---
  console.log('\n\n========== 최종 리포트 ==========\n')

  const matched = entries.filter(e => e.result === 'matched')
  const altMatched = entries.filter(e => e.result === 'alt-matched')
  const switched = entries.filter(e => e.result === 'switched-to-naver')
  const unchanged = entries.filter(e => e.result === 'unchanged')

  if (matched.length) {
    console.log(`✅ 쿠팡 매칭 성공: ${matched.length}개`)
    matched.forEach(e => console.log(`   ${e.file} #${e.rank}: "${e.name}" → "${e.matchedProduct!.productName}"`))
  }
  if (altMatched.length) {
    console.log(`✅ 대안 매칭 성공: ${altMatched.length}개`)
    altMatched.forEach(e => console.log(`   ${e.file} #${e.rank}: "${e.name}" → "${e.matchedProduct!.productName}"`))
  }
  if (switched.length) {
    console.log(`🔄 네이버로 전환: ${switched.length}개`)
    switched.forEach(e => console.log(`   ${e.file} #${e.rank}: "${e.name}" — 쿠팡 미취급`))
  }
  if (unchanged.length) {
    console.log(`⏭️ 미처리 (API 쿼터): ${unchanged.length}개`)
    unchanged.forEach(e => console.log(`   ${e.file} #${e.rank}: "${e.name}"`))
  }

  console.log(`\nAPI 호출: ${apiCalls}/10회`)
  console.log('\n=== 완료 ===')
}

main().catch(console.error)
