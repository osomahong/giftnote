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
- **사람 개입 없이 자동 해결**: 문제 발견 시 사용자에게 묻지 말고 아래 워크플로우대로 자동 처리
- **큐레이터-콘텐츠 성별 적합성 필수**: 아래 규칙 참조

## 큐레이터 배정 성별 규칙
선물 대상의 성별과 큐레이터의 성별 조합이 자연스러워야 한다:
- "여자친구 선물" → 남성 큐레이터만 배정 (Eric, James, Leo, Owen)
- "남자친구 선물" → 여성 큐레이터만 배정 (Clair, Hana, Mina, Yuna)
- "부모님/직장동료/친구 선물" → 성별 무관
- 콘텐츠의 대상 태그(여자친구, 남자친구)와 큐레이터 성별이 같으면 FAIL → 자동으로 적합한 큐레이터로 재배정
- editorial 톤: 큐레이터가 선물 주는 사람 입장이므로, "내 여자친구에게" 또는 "내 남자친구에게" 등 자연스러운 관계가 드러나야 함

## 실행 순서
1. gift-theme-planner → 테마 기획 + 큐레이터 배정
2. gift-crawl-products → 상품 크롤링 (건너뛰기 불가)
3. **coupang-deeplink.ts 실행** → 쿠팡 상품 자동 검증 + 딥링크
4. **naver-price-check.ts 실행** → 네이버 상품 최저가 조회 + 가격 업데이트
5. **이미지 교차 검증** → 컬렉션 내 이미지 URL 중복 체크, 중복 시 재검색
6. gift-story-writer → 에디토리얼 작성 (큐레이터 톤 반영)
5. gift-reason-explainer → 추천 이유 작성
6. gift-faq-generator → FAQ 생성
7. gift-aeo-writer → AEO 최적화
8. gift-scenario-writer → 시나리오 작성
9. gift-build-recommendations → 추천 빌드
10. gift-build-tags → 태그 빌드
11. gift-svg-design → SVG 에셋 생성

## 상품 링크 자동 해결 워크플로우

사람이 개입하지 않고 아래 순서대로 자동 처리:

```
검색 → 검증 → [실패 시] 대안 검색 → [실패 시] 플랫폼 전환 → 적용
```

### Phase 1: 정확한 검색
- 쿠팡파트너스 API로 상품명 검색
- 3중 검증: 브랜드 일치 + 상품명 유사도 30%↑ + 가격 ±50%
- 통과 → affiliateUrl/image/price 자동 업데이트

### Phase 2: 대안 검색 (Phase 1 실패 시)
- 브랜드 + 카테고리 조합으로 재검색
- 같은 3중 검증 적용
- 통과 → 업데이트

### Phase 3: 플랫폼 전환 (Phase 2도 실패 시)
- 쿠팡에서 취급하지 않는 상품으로 판단
- source를 "naver"로 자동 전환
- sourceUrl/affiliateUrl을 네이버 쇼핑 검색 URL로 설정
- 기존 이미지는 유지

### 리포트
모든 처리가 끝나면 자동으로 리포트 출력:
- ✅ 쿠팡 매칭 성공: N개
- ✅ 대안 매칭 성공: N개
- 🔄 네이버로 전환: N개
- ⏭️ 미처리: N개

## 콘텐츠 가독성 규칙 (모든 텍스트 생성 스킬에 적용)
- **인용구/대화체 분리**: 설명 문장과 인용구는 별도 문장으로 분리
- **한 문장 한 관점**: 특성 설명과 예시/인용은 섞지 않고 문장을 나눔
- **target.description**: 핵심 특성 1~2문장 + 인용/예시 1문장 (2~3문장 권장)
- **reason**: 50~80자. 기능적 장점 + 감성적 가치 조합. 2문장 권장.
- **giftMessage**: 30~50자. 선물할 때 전할 수 있는 메시지 한 줄.
- **editorial body**: 각 문단 50~80자. 3문단.
- **줄바꿈**: word-break: keep-all 전역 적용. 한국어 단어 중간에서 잘리지 않음. 제목은 자연스러운 띄어쓰기 단위로 줄바꿈되도록 작성.
- **폰트 크기 기준** (PC / 모바일):
  - 제목(h1): text-2xl / md:text-4xl
  - 설명: text-base / md:text-lg
  - 섹션 제목(h2): text-base / md:text-lg
  - 본문: text-sm / md:text-base
  - 상품명: text-base / md:text-lg
  - 보조 텍스트: text-xs / md:text-sm

## 출력
- `content/collections/{slug}.md` 완성 파일
- `generated/recommendations.json` 업데이트
- `generated/tag-index.json` 업데이트
- 검증 리포트 (터미널 출력)
