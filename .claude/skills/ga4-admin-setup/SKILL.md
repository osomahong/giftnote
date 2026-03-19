# ga4-admin-setup

GA4 Admin API로 맞춤 측정기준/측정항목을 생성하고 전환 이벤트를 등록.

## 사전 조건
- `.env`에 `GA4_PROPERTY_ID` 설정 (숫자 ID)
- `.env`에 OAuth 인증 정보 설정
- `analytics/event-schema.json` 완성

## 작업
1. OAuth 2.0 액세스 토큰 발급
2. event-schema.json의 `customDimensions` 배열 읽기
3. GA4 Admin API로:
   - 기존 맞춤 측정기준 목록 조회
   - 없는 것만 생성 (멱등성)
4. `conversionEvents` 배열의 이벤트를 전환으로 등록 (Key Event)

## 스크립트
`scripts/ga4-admin-setup.ts` 실행:
```bash
npx tsx scripts/ga4-admin-setup.ts
```

## GA4 Admin API 엔드포인트
- 맞춤 측정기준 목록: `GET /v1beta/properties/{propertyId}/customDimensions`
- 맞춤 측정기준 생성: `POST /v1beta/properties/{propertyId}/customDimensions`
- 전환 이벤트 생성: `POST /v1beta/properties/{propertyId}/keyEvents`

## 맞춤 측정기준 제한
- GA4 무료: 이벤트 범위 50개, 사용자 범위 25개
- 생성 전 현재 사용량 확인하여 초과 시 경고

## 주의사항
- GA4_PROPERTY_ID는 측정 ID(G-XXXX)가 아닌 숫자 속성 ID
- 속성 ID를 모르면 Admin API로 계정 > 속성 목록에서 조회 가능
