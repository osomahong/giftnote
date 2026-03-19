# ga4-gtm-publisher

GTM API v2를 사용하여 컨테이너에 태그/트리거/변수를 생성하고 게시.

## 사전 조건
- `.env`에 `NEXT_PUBLIC_GTM_ID`, `GA4_MEASUREMENT_ID` 설정
- `.env`에 OAuth 인증 정보 설정 (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)
- `analytics/event-schema.json` 완성

## GTM 네이밍 컨벤션 (필수 준수)

### 태그 네이밍
- **구성 태그**: `GA4 - Config` (Google 태그 유형, 측정 ID 설정)
- **이벤트 태그**: `GA4 - Event - {한국어 설명}`
  - 예: `GA4 - Event - 컬렉션 카드 클릭`
  - 예: `GA4 - Event - 구매 버튼 클릭`
  - 예: `GA4 - Event - FAQ 열기`
  - 예: `GA4 - Event - 태그 클릭`
  - 예: `GA4 - Event - 검색 실행`

### 트리거 네이밍
- `Event - {이벤트명}` (맞춤 이벤트 유형)
  - 예: `Event - collection_card_click`
  - 예: `Event - purchase_click`

### 변수 네이밍
- **측정 ID 변수**: `GA4 - 측정 ID` (상수 변수, 값: G-RBMBJ6VD54)
- **dataLayer 변수**: `DLV - {매개변수명}`
  - 예: `DLV - section`, `DLV - content_title`, `DLV - content_id`
  - 예: `DLV - menu_type`, `DLV - menu_title`
  - 예: `DLV - item_name`, `DLV - price`, `DLV - platform`

### 태그 구성 규칙
- 모든 이벤트 태그의 측정 ID: `{{GA4 - 측정 ID}}` (하드코딩 금지)
- 이벤트 매개변수 값: `{{DLV - {매개변수명}}}` 형식으로 참조
- "이 컨테이너에서 Google 태그가 발견됨" 상태 유지

## 작업
1. OAuth 2.0 액세스 토큰 발급 (리프레시 토큰 사용)
2. GTM 컨테이너에서 기존 워크스페이스 확인
3. **GA4 - Config 태그 확인/생성** (Google 태그 유형)
4. **GA4 - 측정 ID 변수 확인/생성** (상수 변수)
5. event-schema.json 기반으로:
   - `DLV - {매개변수명}` 변수 생성
   - `Event - {이벤트명}` 트리거 생성
   - `GA4 - Event - {한국어 설명}` 태그 생성
6. 워크스페이스 버전 생성
7. 버전 게시

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
