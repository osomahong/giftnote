/**
 * OAuth 2.0 리프레시 토큰 발급 스크립트
 *
 * 사용법:
 *   npx tsx scripts/oauth-setup.ts
 *
 * 1. 브라우저에서 인증 URL 열기
 * 2. Google 로그인 후 권한 승인
 * 3. 리다이렉트된 URL에서 code 파라미터 복사
 * 4. 터미널에 붙여넣기 → 리프레시 토큰 발급
 */

import http from 'http'
import { URL } from 'url'

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET 환경변수를 설정하세요.')
  process.exit(1)
}

const REDIRECT_URI = 'http://localhost:9876/oauth/callback'
const SCOPES = [
  'https://www.googleapis.com/auth/tagmanager.edit.containers',
  'https://www.googleapis.com/auth/tagmanager.publish',
  'https://www.googleapis.com/auth/analytics.edit',
  'https://www.googleapis.com/auth/analytics.readonly',
].join(' ')

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`

console.log('\n=== OAuth 2.0 리프레시 토큰 발급 ===\n')
console.log('아래 URL을 브라우저에서 열어주세요:\n')
console.log(authUrl)
console.log('\n로컬 서버에서 콜백 대기 중...\n')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url!, `http://localhost:9876`)
  if (!url.pathname.startsWith('/oauth/callback')) {
    res.writeHead(404)
    res.end('Not found')
    return
  }

  const code = url.searchParams.get('code')
  if (!code) {
    res.writeHead(400)
    res.end('code 파라미터가 없습니다')
    return
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()

    if (tokenData.refresh_token) {
      console.log('\n✅ 리프레시 토큰 발급 성공!\n')
      console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokenData.refresh_token}`)
      console.log('\n위 값을 .env 파일에 추가하세요.\n')

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('<h1>✅ 인증 성공!</h1><p>터미널에서 리프레시 토큰을 확인하세요. 이 창을 닫아도 됩니다.</p>')
    } else {
      console.error('\n❌ 토큰 발급 실패:', tokenData)
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(`<h1>❌ 실패</h1><pre>${JSON.stringify(tokenData, null, 2)}</pre>`)
    }
  } catch (err) {
    console.error('❌ 에러:', err)
    res.writeHead(500)
    res.end('Error')
  }

  setTimeout(() => { server.close(); process.exit(0) }, 1000)
})

server.listen(9876, () => {
  console.log('콜백 서버 실행 중: http://localhost:9876')
})
