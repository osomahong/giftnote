/**
 * 쿠팡파트너스 API로 상품 검색 + 딥링크 생성
 *
 * 1. 컬렉션 MD에서 source=coupang 상품의 name으로 검색
 * 2. 검색 결과에서 실제 상품 URL, 이미지, 가격 가져오기
 * 3. 딥링크 API로 어필리에이트 URL 생성
 * 4. MD 파일 업데이트
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

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(message)
    .digest('hex')

  return `CEA algorithm=HmacSHA256, access-key=${ACCESS_KEY}, signed-date=${datetime}, signature=${signature}`
}

async function searchProduct(keyword: string): Promise<{ productUrl: string; productImage: string; productPrice: number; productName: string } | null> {
  const apiPath = `/v2/providers/affiliate_open_api/apis/openapi/products/search?keyword=${encodeURIComponent(keyword)}&limit=1`
  const authorization = generateHmac('GET', apiPath)

  const res = await fetch(`https://api-gateway.coupang.com${apiPath}`, {
    method: 'GET',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()

  if (!res.ok || !data.data?.productData?.length) {
    console.error(`  검색 실패: "${keyword}" — ${data.message || res.status}`)
    return null
  }

  const product = data.data.productData[0]
  return {
    productUrl: product.productUrl,
    productImage: product.productImage,
    productPrice: product.productPrice,
    productName: product.productName,
  }
}

async function createDeeplinks(urls: string[]): Promise<Record<string, string>> {
  const apiPath = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink'
  const authorization = generateHmac('POST', apiPath)

  const res = await fetch(`https://api-gateway.coupang.com${apiPath}`, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coupangUrls: urls }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('딥링크 API 에러:', data.message || data)
    return {}
  }

  const result: Record<string, string> = {}
  if (data.data) {
    for (const item of data.data) {
      if (item.originalUrl && item.shortenUrl) {
        result[item.originalUrl] = item.shortenUrl
      }
    }
  }
  return result
}

interface CoupangProduct {
  file: string
  rank: number
  name: string
  searchResult?: {
    productUrl: string
    productImage: string
    productPrice: number
    productName: string
  }
  deeplink?: string
}

async function main() {
  console.log('=== 쿠팡파트너스 상품 검색 + 딥링크 생성 ===\n')

  const collectionsDir = path.join(process.cwd(), 'content/collections')
  const files = fs.readdirSync(collectionsDir).filter(f => f.endsWith('.md'))

  const coupangProducts: CoupangProduct[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(collectionsDir, file), 'utf8')
    const { data } = matter(content)

    for (const product of data.products || []) {
      if (product.source === 'coupang') {
        coupangProducts.push({ file, rank: product.rank, name: product.name })
      }
    }
  }

  if (coupangProducts.length === 0) {
    console.log('쿠팡 상품이 없습니다.')
    return
  }

  console.log(`${coupangProducts.length}개 쿠팡 상품 발견\n`)

  // 1. 상품 검색 (시간당 10회 제한 → 간격 두고 호출)
  console.log('--- 상품 검색 ---')
  for (const product of coupangProducts) {
    console.log(`  검색: "${product.name}"`)
    product.searchResult = (await searchProduct(product.name)) || undefined
    if (product.searchResult) {
      console.log(`    ✅ ${product.searchResult.productName} — ${product.searchResult.productPrice}원`)
    }
    await sleep(7000) // 안전하게 7초 간격
  }

  // 검색 성공한 것만 딥링크 생성
  const found = coupangProducts.filter(p => p.searchResult)
  if (found.length === 0) {
    console.log('\n검색 결과가 없습니다.')
    return
  }

  // 2. 딥링크 생성 (1회 호출로 모두 변환)
  console.log('\n--- 딥링크 생성 ---')
  await sleep(7000)
  const urls = found.map(p => p.searchResult!.productUrl)
  const deeplinks = await createDeeplinks(urls)

  for (const product of found) {
    product.deeplink = deeplinks[product.searchResult!.productUrl]
    if (product.deeplink) {
      console.log(`  ✅ ${product.name} → ${product.deeplink}`)
    } else {
      console.log(`  ❌ ${product.name} — 딥링크 생성 실패`)
    }
  }

  // 3. MD 파일 업데이트
  console.log('\n--- MD 파일 업데이트 ---')
  for (const file of files) {
    const filePath = path.join(collectionsDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const { data, content: body } = matter(content)
    let updated = false

    for (const product of data.products || []) {
      const match = found.find(p => p.file === file && p.rank === product.rank && p.deeplink)
      if (match && match.searchResult) {
        product.sourceUrl = match.searchResult.productUrl
        product.affiliateUrl = match.deeplink
        // 이미지도 업데이트 (쿠팡 이미지가 더 정확할 수 있음)
        if (match.searchResult.productImage) {
          product.image = match.searchResult.productImage
        }
        updated = true
        console.log(`  ${file} #${product.rank}: 업데이트 완료`)
      }
    }

    if (updated) {
      const newContent = matter.stringify(body, data)
      fs.writeFileSync(filePath, newContent)
    }
  }

  console.log('\n=== 완료 ===')
}

main().catch(console.error)
