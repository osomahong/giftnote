/**
 * GA4 Admin API로 맞춤 측정기준 생성 + 전환 이벤트 등록.
 *
 * 사용법: npx tsx scripts/ga4-admin-setup.ts
 *
 * GA4_PROPERTY_ID를 모르면 --list-properties 옵션으로 조회:
 *   npx tsx scripts/ga4-admin-setup.ts --list-properties
 */

import fs from 'fs'
import path from 'path'

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET!
const REFRESH_TOKEN = process.env.GOOGLE_OAUTH_REFRESH_TOKEN!
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID

if (!REFRESH_TOKEN) {
  console.error('GOOGLE_OAUTH_REFRESH_TOKEN이 설정되지 않았습니다.')
  console.error('먼저 실행: npx tsx scripts/oauth-setup.ts')
  process.exit(1)
}

const API_BASE = 'https://analyticsadmin.googleapis.com/v1beta'

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`토큰 발급 실패: ${JSON.stringify(data)}`)
  return data.access_token
}

async function api(token: string, method: string, endpoint: string, body?: unknown) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) {
    console.error(`API 에러 (${res.status}):`, JSON.stringify(data, null, 2))
  }
  return { ok: res.ok, data }
}

async function listProperties(token: string) {
  console.log('=== GA4 속성 목록 조회 ===\n')
  const { data: accounts } = await api(token, 'GET', '/accountSummaries')
  for (const account of accounts.accountSummaries || []) {
    console.log(`계정: ${account.displayName} (${account.account})`)
    for (const prop of account.propertySummaries || []) {
      const propId = prop.property.replace('properties/', '')
      console.log(`  속성: ${prop.displayName} — ID: ${propId}`)
    }
  }
  console.log('\nGA4_PROPERTY_ID에 숫자 ID를 .env에 설정하세요.')
}

async function main() {
  const token = await getAccessToken()
  console.log('✅ OAuth 토큰 발급 완료\n')

  if (process.argv.includes('--list-properties')) {
    await listProperties(token)
    return
  }

  if (!GA4_PROPERTY_ID) {
    console.error('GA4_PROPERTY_ID가 설정되지 않았습니다.')
    console.error('먼저 실행: npx tsx scripts/ga4-admin-setup.ts --list-properties')
    process.exit(1)
  }

  const propertyPath = `properties/${GA4_PROPERTY_ID}`

  console.log('=== GA4 맞춤 측정기준 설정 시작 ===\n')

  const schema = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'analytics/event-schema.json'), 'utf8')
  )

  // 기존 맞춤 측정기준 조회
  const { data: existingDims } = await api(token, 'GET', `/${propertyPath}/customDimensions`)
  const existingNames = new Set(
    (existingDims.customDimensions || []).map((d: any) => d.parameterName)
  )

  const total = (existingDims.customDimensions || []).length
  console.log(`기존 맞춤 측정기준: ${total}개 (이벤트 범위 최대 50개)\n`)

  // 맞춤 측정기준 생성
  for (const dim of schema.customDimensions) {
    if (existingNames.has(dim.name)) {
      console.log(`  스킵 (이미 존재): ${dim.name}`)
      continue
    }

    console.log(`측정기준 생성: ${dim.name} — ${dim.description}`)
    const { ok } = await api(token, 'POST', `/${propertyPath}/customDimensions`, {
      parameterName: dim.name,
      displayName: dim.description,
      scope: dim.scope,
      description: dim.description,
    })
    if (!ok) console.error(`  ❌ 생성 실패: ${dim.name}`)
  }

  // 전환 이벤트(Key Event) 등록
  console.log('\n전환 이벤트 등록...')
  const { data: existingKeyEvents } = await api(token, 'GET', `/${propertyPath}/keyEvents`)
  const existingKeyEventNames = new Set(
    (existingKeyEvents.keyEvents || []).map((e: any) => e.eventName)
  )

  for (const eventName of schema.conversionEvents) {
    if (existingKeyEventNames.has(eventName)) {
      console.log(`  스킵 (이미 등록): ${eventName}`)
      continue
    }

    console.log(`전환 등록: ${eventName}`)
    const { ok } = await api(token, 'POST', `/${propertyPath}/keyEvents`, {
      eventName,
      countingMethod: 'ONCE_PER_EVENT',
    })
    if (!ok) console.error(`  ❌ 등록 실패: ${eventName}`)
  }

  console.log('\n✅ GA4 맞춤 측정기준 설정 완료!')
  console.log(`\n현재 맞춤 측정기준: ${total + schema.customDimensions.filter((d: any) => !existingNames.has(d.name)).length}개 / 50개`)
}

main().catch(console.error)
