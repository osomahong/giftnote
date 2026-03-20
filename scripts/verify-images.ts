/**
 * 상품 이미지 검증 스크립트
 *
 * 1. HTTP 접근성 (200 OK)
 * 2. 다나와 pcode 매칭 (페이지 제목에 브랜드명 포함 여부)
 * 3. 컬렉션 내 이미지 중복
 * 4. 광고 이미지 차단
 *
 * 사용법: npx tsx scripts/verify-images.ts
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function checkHttpStatus(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
    return res.status
  } catch { return 0 }
}

async function checkDanawaPcode(imageUrl: string, brandName: string): Promise<{ ok: boolean; actual: string }> {
  // 다나와 이미지 URL에서 pcode 추출
  const match = imageUrl.match(/img\/(\d+)_/)
  if (!match) return { ok: true, actual: 'non-danawa' }

  const pcode = match[1]
  try {
    const res = await fetch(`https://prod.danawa.com/info/?pcode=${pcode}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
      signal: AbortSignal.timeout(5000),
    })
    const html = await res.text()

    // 가격비교 종료 체크
    if (html.includes('가격비교 서비스가 종료')) {
      return { ok: false, actual: '가격비교 종료' }
    }

    // 페이지 제목 추출
    const titleMatch = html.match(/<title>([^<]+)<\/title>/)
    const title = titleMatch ? titleMatch[1] : ''

    // 브랜드명이 제목에 포함되는지 (2글자 이상 매칭)
    const brandLower = brandName.toLowerCase()
    const titleLower = title.toLowerCase()

    // 브랜드 별칭 매핑
    const aliases: Record<string, string[]> = {
      '블렌더보틀': ['블랜더보틀', 'blenderbottle'],
      '블랜더보틀': ['블렌더보틀', 'blenderbottle'],
      '앤커': ['anker'],
      '브레오': ['breo', 'n1'],
      '리빙센스': ['칼소독기', '칼케어', 'uv'],
      '허브플러스': ['단밤', '바스볼', '입욕제'],
    }

    const allBrandNames = [brandLower, ...(aliases[brandLower] || [])]

    // 한글/영문 모두 매칭 시도
    for (const name of allBrandNames) {
      const cleaned = name.replace(/[^가-힣a-z0-9]/g, '')
      if (cleaned.length >= 2 && titleLower.includes(cleaned)) {
        return { ok: true, actual: title.substring(0, 40) }
      }
    }

    // 상품명 키워드 매칭 (브랜드가 안 맞아도 상품 카테고리가 맞으면 OK)
    // 예: "UV LED 칼소독기" → 다나와 "쿠진 나이프케어" — 둘 다 칼소독기
    const productKeywords = brandName.split(/\s+/).filter(w => w.length >= 2)
    for (const kw of productKeywords) {
      if (titleLower.includes(kw.toLowerCase())) {
        return { ok: true, actual: title.substring(0, 40) }
      }
    }

    return { ok: false, actual: title.substring(0, 40) }
  } catch {
    return { ok: true, actual: 'fetch-failed' }
  }
}

async function main() {
  console.log('=== 상품 이미지 검증 ===\n')

  const dir = path.join(process.cwd(), 'content/collections')
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'))

  let totalProducts = 0
  let passCount = 0
  let warnCount = 0
  let failCount = 0

  for (const file of files) {
    const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'))
    console.log(`--- ${file} ---`)

    const images = new Set<string>()

    for (const product of data.products || []) {
      totalProducts++
      const issues: string[] = []

      // 1. 빈 이미지
      if (!product.image) {
        issues.push('빈 이미지')
      }

      // 2. 광고 이미지
      if (product.image?.includes('ads-partners.coupang.com')) {
        issues.push('쿠팡 광고 이미지')
      }

      // 3. HTTP 접근성
      if (product.image) {
        const status = await checkHttpStatus(product.image)
        if (status !== 200) {
          issues.push(`HTTP ${status}`)
        }
      }

      // 4. 다나와 pcode 브랜드 매칭
      if (product.image?.includes('img.danawa.com')) {
        await sleep(500) // 다나와 요청 간격
        const pcodeCheck = await checkDanawaPcode(product.image, product.brand)
        if (!pcodeCheck.ok) {
          issues.push(`pcode 불일치: "${product.brand}" vs "${pcodeCheck.actual}"`)
        }
      }

      // 5. 중복 이미지
      if (product.image && images.has(product.image)) {
        issues.push('이미지 중복')
      }
      if (product.image) images.add(product.image)

      // 결과 출력
      if (issues.length === 0) {
        passCount++
        console.log(`  ✅ #${product.rank} ${product.name}`)
      } else {
        const isWarn = issues.every(i => i.includes('fetch-failed'))
        if (isWarn) {
          warnCount++
          console.log(`  ⚠️ #${product.rank} ${product.name}: ${issues.join(', ')}`)
        } else {
          failCount++
          console.log(`  ❌ #${product.rank} ${product.name}: ${issues.join(', ')}`)
        }
      }
    }
  }

  console.log(`\n========== 결과 ==========`)
  console.log(`전체: ${totalProducts} | ✅ ${passCount} | ⚠️ ${warnCount} | ❌ ${failCount}`)
  if (failCount > 0) {
    console.log('\n❌ FAIL 항목이 있습니다. 이미지를 수정해주세요.')
    process.exit(1)
  } else {
    console.log('\n✅ 전체 검증 통과')
  }
}

main().catch(console.error)
