# gift-orchestrator

전체 큐레이션 파이프라인을 조율하는 오케스트레이터.

## 입력
- persona: 페르소나 (예: "30대 남성")
- interest: 관심사 (예: "스포츠")
- budget: 예산대 (예: "5만원대")
- occasion: 상황 (예: "생일")

## 핵심 규칙
- **크롤링 필수**: 상품 정보를 직접 작성하지 않음. 반드시 gift-crawl-products로 실제 상품 정보(이름, 가격, 이미지 URL, 브랜드)를 크롤링하여 반영
- **이미지 필수**: image가 빈 문자열인 상품은 최종 결과에 포함 불가
- **블라인드 = 커뮤니티**: evidence에서 블라인드 출처는 type: "community"로 분류 (SNS 아님)

## 실행 순서
1. gift-theme-planner → 테마 기획
2. gift-crawl-products → 상품 크롤링 (건너뛰기 불가)
3. gift-story-writer → 에디토리얼 작성
4. gift-reason-explainer → 추천 이유 작성
5. gift-faq-generator → FAQ 생성
6. gift-aeo-writer → AEO 최적화
7. gift-scenario-writer → 시나리오 작성
8. gift-build-recommendations → 추천 빌드
9. gift-build-tags → 태그 빌드
10. gift-svg-design → SVG 에셋 생성

## 콘텐츠 가독성 규칙 (모든 텍스트 생성 스킬에 적용)
- **인용구/대화체 분리**: 설명 문장과 인용구('이거 어디서 샀어?' 등)는 별도 문장으로 분리. 마침표 뒤 인용부호가 오면 새 문장으로 시작.
- **한 문장 한 관점**: 특성 설명과 예시/인용은 섞지 않고 문장을 나눈다.
  - Bad: "올리브영 베스트셀러보다는 숨은 브랜드를 좋아하는 분. '이거 어디서 샀어?'라는 말을 자주 들어요."
  - Good: "올리브영 베스트셀러보다 숨은 브랜드, 동네 편집숍을 좋아하는 분이에요. '이거 어디서 샀어?'라는 말을 자주 듣는 타입입니다."
- **target.description**: 핵심 특성 1~2문장 + 인용/예시 1문장으로 구성. 마침표 기준 2~3문장 권장.
- **reason/giftMessage**: 간결하게. 한 문장에 하나의 포인트.

## 출력
- `content/collections/{slug}.md` 완성 파일
- `generated/recommendations.json` 업데이트
- `generated/tag-index.json` 업데이트
