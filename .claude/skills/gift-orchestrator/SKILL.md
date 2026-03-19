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
- **reason/giftMessage**: 간결하게. 한 문장에 하나의 포인트

## 출력
- `content/collections/{slug}.md` 완성 파일
- `generated/recommendations.json` 업데이트
- `generated/tag-index.json` 업데이트
- 검증 리포트 (터미널 출력)
