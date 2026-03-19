# ga4-datalayer-setup

`analytics/event-schema.json`을 읽고 실제 코드에 dataLayer push + data-track 속성을 적용.

## 작업
1. `analytics/event-schema.json` 읽기
2. 각 이벤트의 `selector`와 `dataAttributes`에 따라 컴포넌트에 속성 추가
3. 클릭 이벤트에 dataLayer.push 호출 필요 시 `lib/analytics.ts`의 `pushEvent` 사용
4. 뷰포트 진입 추적은 IntersectionObserver 기반 클라이언트 컴포넌트로

## data-track 규칙
- `data-track="이벤트타입"` — 이벤트 분류 (collection-card, purchase-btn 등)
- `data-track-*` — 매개변수 전달 (data-track-slug, data-track-price 등)
- TrackClickProvider가 전역 클릭 이벤트를 감지하여 자동으로 dataLayer에 push

## 정적 사이트 제약 (output: 'export')
- GTM 스크립트는 `<Script strategy="afterInteractive">`로 삽입
- dataLayer push는 클라이언트 컴포넌트에서만 실행
- 서버 컴포넌트에는 data-* 속성만 추가 (이벤트 핸들러 불가)

## 파일 수정 대상
- `app/layout.tsx` — GTMScript, TrackClickProvider 추가
- `app/page.tsx` — 컬렉션 카드에 data-track 속성
- `components/collection/ProductCard.tsx` — 구매 버튼에 data-track
- `components/collection/FaqSection.tsx` — FAQ에 data-track
- `app/tag/[tag]/page.tsx` — 태그 링크에 data-track
- `components/collection/RelatedSection.tsx` — 관련 카드에 data-track
