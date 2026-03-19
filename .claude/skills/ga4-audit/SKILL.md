# ga4-audit

전체 GA4 분석 파이프라인의 결과물을 검토하여 데이터 수집 품질을 검증.

## 실행 시점
모든 GA4 관련 에이전트 작업 완료 후, 또는 이벤트/코드 변경 시 수시로 실행.

## 검증 항목

### 1. 이벤트 네이밍 검증
- GA4 예약 이벤트명과 충돌 여부 (first_visit, session_start 등은 사용 불가)
- GA4 추천 이벤트 사용 시 표준 매개변수 포함 여부
- snake_case 준수, 40자 이내
- 이벤트명 패턴: `{영역}_{행동}` (collection_card_click, purchase_click 등)

### 2. 매개변수 네이밍 검증
- GA4 예약 매개변수와 충돌 여부
- snake_case 준수, 40자 이내
- 이벤트당 매개변수 25개 이내
- 표준 매개변수 체계 준수:
  - 콘텐츠: section, index, content_type, content_title, content_id, content_url
  - 메뉴: menu_type, menu_title
  - 검색: search_term
  - 상품: item_name, item_brand, price, platform

### 3. GTM 네이밍 컨벤션 검증
- 태그: `GA4 - Config` / `GA4 - Event - {한국어 설명}` 형식인지
- 트리거: `Event - {이벤트명}` 형식인지
- 변수: `GA4 - 측정 ID` / `DLV - {매개변수명}` 형식인지
- 측정 ID가 하드코딩 아닌 `{{GA4 - 측정 ID}}` 변수 참조인지

### 4. 코드-스키마 매칭
- `analytics/event-schema.json`의 모든 이벤트가 코드에 `data-track`으로 구현되었는지
- `data-track` 속성이 있는데 스키마에 정의 안 된 이벤트는 없는지

### 5. GTM-스키마 매칭
- 모든 이벤트에 대응하는 GTM 태그/트리거가 존재하는지 (GTM API로 조회)
- GA4 태그의 측정 ID가 올바른지

### 6. GA4 맞춤정의 매칭
- 맞춤 매개변수가 모두 GA4 맞춤 측정기준으로 등록되었는지
- 미등록 매개변수는 GA4 보고서에서 보이지 않으므로 critical 경고

### 7. 데이터 품질
- 동일 액션에 중복 이벤트 발화 가능성
- 카디널리티 경고: 맞춤 측정기준 값의 예상 고유값이 500+ 이면 경고
- 필수 전환 포인트 누락 (구매 클릭이 추적되지 않으면 critical)

### 8. 이전 버전 호환성
- 기존 이벤트명이 변경되었으면 경고
- 기존 매개변수명이 변경되었으면 경고
- 제거된 이벤트가 있으면 경고

## 출력
`analytics/audit-report.md`에 결과 저장:

```markdown
# GA4 Audit Report — {날짜}

## Summary
- ✅ PASS: N items
- ⚠️ WARNING: N items
- ❌ FAIL: N items

## Details
### ✅ PASS
### ⚠️ WARNING
### ❌ FAIL
```

## 심각도
- **FAIL**: 데이터 수집 불가 또는 잘못된 수집 (즉시 수정 필요)
- **WARNING**: 수집은 되지만 분석 품질에 영향 (개선 권장)
- **PASS**: 정상
