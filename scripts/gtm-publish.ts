/**
 * GTM API v2를 사용하여 event-schema.json 기반으로
 * 변수/트리거/태그를 생성하고 컨테이너를 게시합니다.
 *
 * 사용법: npx tsx scripts/gtm-publish.ts
 */

import fs from 'fs'
import path from 'path'

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET!
const REFRESH_TOKEN = process.env.GOOGLE_OAUTH_REFRESH_TOKEN!
const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_ID!
const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID!

if (!REFRESH_TOKEN) {
  console.error('GOOGLE_OAUTH_REFRESH_TOKEN이 설정되지 않았습니다.')
  console.error('먼저 실행: npx tsx scripts/oauth-setup.ts')
  process.exit(1)
}

const API_BASE = 'https://tagmanager.googleapis.com/tagmanager/v2'

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

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function api(token: string, method: string, endpoint: string, body?: unknown, retries = 3): Promise<{ ok: boolean; data: any }> {
  for (let i = 0; i < retries; i++) {
    await sleep(2500) // 분당 30회 제한 → 2.5초 간격
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    if (res.status === 429 && i < retries - 1) {
      console.log(`  ⏳ 쿼터 제한, ${10 * (i + 1)}초 대기...`)
      await sleep(10000 * (i + 1))
      continue
    }
    if (!res.ok) {
      console.error(`API 에러 (${res.status}):`, data.error?.message || JSON.stringify(data))
    }
    return { ok: res.ok, data }
  }
  return { ok: false, data: {} }
}

async function findContainerPath(token: string): Promise<string> {
  const { data } = await api(token, 'GET', '/accounts')
  for (const account of data.account || []) {
    const { data: containers } = await api(token, 'GET', `/${account.path}/containers`)
    for (const container of containers.container || []) {
      if (container.publicId === GTM_CONTAINER_ID) {
        console.log(`컨테이너 발견: ${container.path}`)
        return container.path
      }
    }
  }
  throw new Error(`컨테이너 ${GTM_CONTAINER_ID}를 찾을 수 없습니다`)
}

async function getDefaultWorkspace(token: string, containerPath: string): Promise<string> {
  const { data } = await api(token, 'GET', `/${containerPath}/workspaces`)
  const ws = data.workspace?.[0]
  if (!ws) throw new Error('워크스페이스를 찾을 수 없습니다')
  console.log(`워크스페이스: ${ws.name} (${ws.path})`)
  return ws.path
}

async function listExisting(token: string, wsPath: string, type: string) {
  const { data } = await api(token, 'GET', `/${wsPath}/${type}`)
  return data[type.replace(/s$/, '')] || data[type] || []
}

interface EventDef {
  name: string
  trigger: string
  ga4Recommended: boolean
  parameters: Record<string, { type: string; value: string; custom: boolean }>
  selector: string
}

async function main() {
  console.log('=== GTM 컨테이너 세팅 시작 ===\n')

  const schema = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'analytics/event-schema.json'), 'utf8')
  )
  const events: EventDef[] = schema.events

  const token = await getAccessToken()
  console.log('✅ OAuth 토큰 발급 완료\n')

  const containerPath = await findContainerPath(token)
  const wsPath = await getDefaultWorkspace(token, containerPath)

  const existingVars = await listExisting(token, wsPath, 'variables')
  const existingTriggers = await listExisting(token, wsPath, 'triggers')
  const existingTags = await listExisting(token, wsPath, 'tags')

  const existingVarNames = new Set(existingVars.map((v: any) => v.name))
  const existingTriggerNames = new Set(existingTriggers.map((t: any) => t.name))
  const existingTagNames = new Set(existingTags.map((t: any) => t.name))

  // 1. GA4 설정 변수 (측정 ID)
  const configVarName = 'GA4 - 측정 ID'
  if (!existingVarNames.has(configVarName)) {
    console.log(`변수 생성: ${configVarName}`)
    await api(token, 'POST', `/${wsPath}/variables`, {
      name: configVarName,
      type: 'c',
      parameter: [{ type: 'template', key: 'value', value: GA4_MEASUREMENT_ID }],
    })
  }

  // 2. dataLayer 변수 생성
  const allCustomParams = new Set<string>()
  for (const event of events) {
    for (const [paramName, paramDef] of Object.entries(event.parameters)) {
      if (paramDef.custom) allCustomParams.add(paramName)
    }
  }

  for (const param of allCustomParams) {
    const varName = `DLV - ${param}`
    if (existingVarNames.has(varName)) {
      console.log(`  스킵 (이미 존재): ${varName}`)
      continue
    }
    console.log(`변수 생성: ${varName}`)
    await api(token, 'POST', `/${wsPath}/variables`, {
      name: varName,
      type: 'v',
      parameter: [
        { type: 'integer', key: 'dataLayerVersion', value: '2' },
        { type: 'boolean', key: 'setDefaultValue', value: 'false' },
        { type: 'template', key: 'name', value: param },
      ],
    })
  }

  // 3. 트리거 생성
  const uniqueEvents = [...new Map(events.map(e => [e.name + e.selector, e])).values()]
  const triggerIds: Record<string, string> = {}

  for (const event of uniqueEvents) {
    const triggerName = `Event - ${event.name}`
    if (existingTriggerNames.has(triggerName)) {
      const existing = existingTriggers.find((t: any) => t.name === triggerName)
      if (existing) triggerIds[triggerName] = existing.triggerId
      console.log(`  스킵 (이미 존재): ${triggerName}`)
      continue
    }
    console.log(`트리거 생성: ${triggerName}`)
    const { ok, data } = await api(token, 'POST', `/${wsPath}/triggers`, {
      name: triggerName,
      type: 'customEvent',
      customEventFilter: [{
        type: 'equals',
        parameter: [
          { type: 'template', key: 'arg0', value: '{{_event}}' },
          { type: 'template', key: 'arg1', value: event.name },
        ],
      }],
    })
    if (ok) triggerIds[triggerName] = data.triggerId
  }

  // 4. GA4 이벤트 태그 생성
  for (const event of uniqueEvents) {
    const tagName = `GA4 - Event - ${event.trigger}`
    const triggerName = `Event - ${event.name}`
    if (existingTagNames.has(tagName)) {
      console.log(`  스킵 (이미 존재): ${tagName}`)
      continue
    }

    const triggerId = triggerIds[triggerName]
    if (!triggerId) {
      console.log(`  스킵 (트리거 없음): ${tagName}`)
      continue
    }

    const eventParams = Object.entries(event.parameters).map(([key, def]) => ({
      type: 'map',
      map: [
        { type: 'template', key: 'name', value: key },
        { type: 'template', key: 'value', value: `{{DLV - ${key}}}` },
      ],
    }))

    console.log(`태그 생성: ${tagName}`)
    await api(token, 'POST', `/${wsPath}/tags`, {
      name: tagName,
      type: 'gaawe',
      parameter: [
        { type: 'template', key: 'eventName', value: event.name },
        { type: 'template', key: 'measurementIdOverride', value: `{{${configVarName}}}` },
        { type: 'list', key: 'eventParameters', list: eventParams },
      ],
      firingTriggerId: [triggerId],
    })
  }

  // 5. 버전 생성 + 게시
  console.log('\n버전 생성 중...')
  const { ok: vOk, data: vData } = await api(token, 'POST', `/${wsPath}:create_version`, {
    name: `Auto-publish ${new Date().toISOString().split('T')[0]}`,
    notes: 'event-schema.json 기반 자동 생성',
  })

  if (vOk && vData.containerVersion) {
    const versionPath = vData.containerVersion.path
    console.log(`버전 생성 완료: ${versionPath}`)

    console.log('게시 중...')
    const { ok: pOk } = await api(token, 'POST', `/${versionPath}:publish`)
    if (pOk) {
      console.log('\n✅ GTM 컨테이너 게시 완료!')
    } else {
      console.error('\n❌ 게시 실패')
    }
  } else {
    console.error('\n❌ 버전 생성 실패:', vData)
  }

  console.log('\n=== GTM 세팅 완료 ===')
}

main().catch(console.error)
