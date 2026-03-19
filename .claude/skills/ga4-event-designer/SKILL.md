# ga4-event-designer

사이트 구조를 분석하여 GA4 추적 이벤트를 설계하고 `analytics/event-schema.json`에 정의.

## 이벤트 정의서 규칙 (필수 준수)

이벤트 정의서는 아래 컬럼 구조를 따른다:
| 구분 | 이벤트 | 설명 | 이벤트명 | 이벤트 매개변수 | 이벤트 매개변수 값 | 이벤트 매개변수 값 예시 |

### 이벤트명 규칙
- snake_case, 40자 이내
- 페이지/영역 + 행동 조합: `{영역}_{행동}` (예: `collection_card_click`, `purchase_click`, `faq_open`)
- GA4 추천 이벤트(select_content, view_item 등)는 그대로 사용 가능
- 맞춤 이벤트는 사이트 맥락에 맞게 명명 (불필요한 접두사 지양)

### 매개변수 규칙
- snake_case, 40자 이내
- 콘텐츠 관련 표준 매개변수 체계:
  - `section`: 콘텐츠가 클릭된 섹션이름 (예: "최신 큐레이션", "생일 선물 추천")
  - `index`: 클릭된 콘텐츠가 배치된 순서 (1부터 시작, 순서 없으면 제외)
  - `content_type`: 콘텐츠 유형 (예: "collection", "product", "faq")
  - `content_title`: 콘텐츠 제목
  - `content_id`: 콘텐츠 고유 ID (slug 등)
  - `content_url`: 콘텐츠 URL
- 메뉴/네비게이션 관련:
  - `menu_type`: 메뉴 구분 (예: "상단 고정메뉴", "태그 네비")
  - `menu_title`: 클릭한 메뉴명
- 검색 관련:
  - `search_term`: 검색어
- 배너 관련:
  - `banner_index`: 배너 순서
  - `banner_title`: 배너 제목
  - `banner_id`: 배너 ID
  - `banner_url`: 배너 URL
- 상품/이커머스 관련:
  - `item_name`, `item_brand`, `price`, `platform`

### 매개변수 값 예시 규칙
- 고정값은 "(고정)" 표기: `상단 고정메뉴 (고정)`
- 순서값은 "(순서값 없을 시 제외)" 표기: `1 (순서값 없을 시 제외)`
- 동적값은 실제 예시 기재: `운동하는 남자친구 생일 선물 추천 3만원대`

## GTM 네이밍 컨벤션 (필수)

### 태그
- 구성 태그: `GA4 - Config`
- 이벤트 태그: `GA4 - Event - {한국어 설명}` (예: `GA4 - Event - 컬렉션 카드 클릭`)

### 트리거
- `Event - {이벤트명}` (예: `Event - collection_card_click`)
- 유형: 맞춤 이벤트

### 변수
- 측정 ID: `GA4 - 측정 ID` (상수 변수, 하드코딩 금지)
- dataLayer 변수: `DLV - {매개변수명}` (예: `DLV - content_title`, `DLV - section`)

### 구성 태그 참조
- 모든 이벤트 태그의 측정 ID는 `{{GA4 - 측정 ID}}` 변수로 참조
- "이 컨테이너에서 Google 태그가 발견됨" 상태 유지

## 이벤트 설계 원칙
- GA4 추천 이벤트를 최대한 활용 (select_content, view_item 등)
- 맞춤 이벤트는 분석 목적이 명확할 때만 추가
- 매개변수 카디널리티 500 이하 유지
- 전환 이벤트는 비즈니스 핵심 액션만 (구매 클릭)
- 이벤트당 매개변수 25개 이내

## 출력 형식
`analytics/event-schema.json`에 저장:
```json
{
  "name": "collection_card_click",
  "category": "engagement",
  "trigger": "메인/태그 페이지에서 컬렉션 카드 클릭 시",
  "parameters": {
    "section": { "type": "string", "value": "클릭된 섹션명", "example": "생일 선물 추천 (고정)" },
    "index": { "type": "number", "value": "배치 순서", "example": "1 (순서값 없을 시 제외)" },
    "content_type": { "type": "string", "value": "collection (고정)" },
    "content_title": { "type": "string", "value": "컬렉션 제목" },
    "content_id": { "type": "string", "value": "slug" },
    "content_url": { "type": "string", "value": "컬렉션 URL" }
  }
}
```
