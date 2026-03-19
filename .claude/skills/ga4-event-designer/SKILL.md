# ga4-event-designer

사이트 구조를 분석하여 GA4 추적 이벤트를 설계하고 `analytics/event-schema.json`에 정의.

## 작업
1. 사이트 컴포넌트/페이지 구조 분석
2. 사용자 행동 흐름 파악 (탐색 → 열람 → 전환)
3. GA4 추천 이벤트 우선 매핑 (select_content, view_item 등)
4. 맞춤 이벤트는 `gift_` 접두사, snake_case, 40자 이내
5. 매개변수: GA4 표준 파라미터명 우선, 맞춤은 snake_case
6. `analytics/event-schema.json` 업데이트

## 이벤트 설계 원칙
- GA4 추천 이벤트를 최대한 활용 (select_content, view_item, share 등)
- 맞춤 이벤트는 분석 목적이 명확할 때만 추가
- 매개변수 카디널리티 500 이하 유지 (고유값이 너무 많으면 경고)
- 전환 이벤트는 비즈니스 핵심 액션만 (구매 클릭)

## 출력 형식
```json
{
  "name": "event_name",
  "category": "engagement|ecommerce|conversion|navigation",
  "trigger": "한국어 트리거 설명",
  "ga4Recommended": true/false,
  "parameters": { ... },
  "selector": "CSS selector for data-track",
  "dataAttributes": { "data-track": "...", ... }
}
```

## 맞춤 측정기준 정의
이벤트에서 사용하는 맞춤 매개변수는 `customDimensions` 배열에 등록:
- name: 매개변수명 (snake_case)
- scope: EVENT | USER
- description: 한국어 설명
