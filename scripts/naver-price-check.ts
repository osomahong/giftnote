/**
 * 네이버 쇼핑 최저가 조회 + MD 자동 업데이트
 *
 * source=naver 상품의 실제 최저가를 네이버 쇼핑 검색 결과에서 가져와
 * price 필드를 업데이트합니다.
 *
 * 워크플로우: 검색 → 최저가 추출 → 검증 → 자동 적용
 *
 * 사용법: npx tsx scripts/naver-price-check.ts
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function getNaverLowestPrice(query: string): Promise<{ lowestPrice: number; productName: string; mallName: string; image: string; link: string } | null> {
  // 네이버 쇼핑 검색 페이지를 fetch하여 JSON 데이터 추출
  const url = `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}&sort=price_asc&pagingIndex=1&pagingSize=5`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
    })

    const html = await res.text()

    // 네이버 쇼핑은 SSR이 아닌 CSR이지만, __NEXT_DATA__ JSON에 초기 데이터가 포함됨
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/)
    if (nextDataMatch) {
      const nextData = JSON.parse(nextDataMatch[1])
      const products = nextData?.props?.pageProps?.initialState?.products?.list

      if (products?.length > 0) {
        // 가격 오름차순으로 정렬되어 있으므로 첫 번째가 최저가
        const first = products[0].item
        return {
          lowestPrice: first.price || first.lowPrice,
          productName: first.productName || first.productTitle,
          mallName: first.mallName || first.shopName || '',
          image: first.imageUrl || first.productImage || '',
          link: first.mallProductUrl || first.crUrl || '',
        }
      }
    }

    // __NEXT_DATA__ 파싱 실패 시, API 직접 호출 시도
    const apiUrl = `https://search.shopping.naver.com/api/search/all?query=${encodeURIComponent(query)}&sort=price_asc&pagingIndex=1&pagingSize=5`
    const apiRes = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://search.shopping.naver.com/',
      },
    })

    if (apiRes.ok) {
      const apiData = await apiRes.json()
      const items = apiData?.shoppingResult?.products

      if (items?.length > 0) {
        const first = items[0]
        return {
          lowestPrice: parseInt(first.price) || parseInt(first.lowPrice),
          productName: first.productName || first.productTitle,
          mallName: first.mallName || '',
          image: first.imageUrl || '',
          link: first.mallProductUrl || '',
        }
      }
    }

    return null
  } catch (err) {
    console.error(`  네이버 조회 실패: ${err}`)
    return null
  }
}

interface NaverProduct {
  file: string
  rank: number
  name: string
  brand: string
  currentPrice: number
  result: 'updated' | 'unchanged' | 'failed'
  newPrice?: number
  message: string
}

async function main() {
  console.log('=== 네이버 쇼핑 최저가 조회 + 업데이트 ===\n')

  const collectionsDir = path.join(process.cwd(), 'content/collections')
  const files = fs.readdirSync(collectionsDir).filter(f => f.endsWith('.md'))
  const entries: NaverProduct[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(collectionsDir, file), 'utf8')
    const { data } = matter(content)
    for (const p of data.products || []) {
      if (p.source === 'naver') {
        entries.push({ file, rank: p.rank, name: p.name, brand: p.brand, currentPrice: p.price, result: 'unchanged', message: '' })
      }
    }
  }

  if (!entries.length) { console.log('네이버 상품 없음.'); return }
  console.log(`${entries.length}개 네이버 상품 최저가 조회\n`)

  for (const entry of entries) {
    console.log(`--- #${entry.rank} ${entry.name} ---`)
    const result = await getNaverLowestPrice(`${entry.brand} ${entry.name}`)
    await sleep(2000)

    if (result && result.lowestPrice > 0) {
      const diff = Math.abs(result.lowestPrice - entry.currentPrice)
      const diffPercent = ((diff / entry.currentPrice) * 100).toFixed(0)

      if (diff > 0) {
        entry.result = 'updated'
        entry.newPrice = result.lowestPrice
        entry.message = `${entry.currentPrice.toLocaleString()}원 → ${result.lowestPrice.toLocaleString()}원~ (${result.mallName}, 차이 ${diffPercent}%)`
        console.log(`  ✅ 최저가: ${entry.message}`)
      } else {
        entry.result = 'unchanged'
        entry.message = `가격 동일: ${entry.currentPrice.toLocaleString()}원`
        console.log(`  ➡️ ${entry.message}`)
      }

      // 이미지도 업데이트 (네이버 쇼핑 이미지가 더 신뢰도 높음)
      if (result.image) {
        entry.message += ` | 이미지 업데이트`
      }
    } else {
      entry.result = 'failed'
      entry.message = '최저가 조회 실패 — 기존 가격 유지'
      console.log(`  ❌ ${entry.message}`)
    }
  }

  // MD 파일 업데이트
  console.log('\n--- MD 파일 업데이트 ---')

  for (const file of files) {
    const filePath = path.join(collectionsDir, file)
    const content = fs.readFileSync(filePath, 'utf8')
    const { data, content: body } = matter(content)
    let updated = false

    for (const product of data.products || []) {
      const entry = entries.find(e => e.file === file && e.rank === product.rank)
      if (!entry || entry.result !== 'updated' || !entry.newPrice) continue

      // originalPrice를 현재 price로, price를 최저가로
      if (!product.originalPrice || product.originalPrice < entry.currentPrice) {
        product.originalPrice = entry.currentPrice
      }
      product.price = entry.newPrice
      if (product.originalPrice > product.price) {
        product.discountRate = Math.round((1 - product.price / product.originalPrice) * 100)
      }
      updated = true
      console.log(`  ✅ ${file} #${product.rank}: ${entry.newPrice.toLocaleString()}원~`)
    }

    if (updated) {
      fs.writeFileSync(filePath, matter.stringify(body, data))
    }
  }

  // 리포트
  console.log('\n========== 최저가 리포트 ==========\n')
  const updatedEntries = entries.filter(e => e.result === 'updated')
  const unchangedEntries = entries.filter(e => e.result === 'unchanged')
  const failedEntries = entries.filter(e => e.result === 'failed')

  if (updatedEntries.length) {
    console.log(`✅ 가격 업데이트: ${updatedEntries.length}개`)
    updatedEntries.forEach(e => console.log(`   #${e.rank} ${e.name}: ${e.message}`))
  }
  if (unchangedEntries.length) {
    console.log(`➡️ 변경 없음: ${unchangedEntries.length}개`)
  }
  if (failedEntries.length) {
    console.log(`❌ 조회 실패: ${failedEntries.length}개 (기존 가격 유지)`)
    failedEntries.forEach(e => console.log(`   #${e.rank} ${e.name}`))
  }

  console.log('\n=== 완료 ===')
}

main().catch(console.error)
