# ga4-gtm-publisher

GTM API v2를 사용하여 컨테이너에 태그/트리거/변수를 생성하고 게시.

## 사전 조건
- `.env`에 `NEXT_PUBLIC_GTM_ID`, `GA4_MEASUREMENT_ID` 설정
- `.env`에 OAuth 인증 정보 설정 (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)
- `analytics/event-schema.json` 완성

## 작업
1. OAuth 2.0 액세스 토큰 발급 (리프레시 토큰 사용)
2. GTM 컨테이너에서 기존 워크스페이스 확인
3. event-schema.json 기반으로:
   - dataLayer 변수 생성 (각 매개변수에 대응)
   - Custom Event 트리거 생성 (이벤트명 매칭)
   - GA4 이벤트 태그 생성 (트리거 → GA4 이벤트 매핑)
4. 워크스페이스 버전 생성
5. 버전 게시

## 스크립트
`scripts/gtm-publish.ts` 실행:
```bash
npx tsx scripts/gtm-publish.ts
```

## GTM API 엔드포인트
- 계정/컨테이너 목록: `GET /tagmanager/v2/accounts/{accountId}/containers`
- 변수 생성: `POST /tagmanager/v2/{parent}/variables`
- 트리거 생성: `POST /tagmanager/v2/{parent}/triggers`
- 태그 생성: `POST /tagmanager/v2/{parent}/tags`
- 버전 생성: `POST /tagmanager/v2/{parent}/workspaces/{workspaceId}:create_version`
- 버전 게시: `POST /tagmanager/v2/{parent}/versions/{versionId}:publish`

## 주의사항
- 동일 이름의 변수/트리거/태그가 이미 있으면 스킵 (멱등성)
- 게시 전 변경사항 요약 출력
- 실패 시 워크스페이스 롤백하지 않음 (수동 확인 필요)
