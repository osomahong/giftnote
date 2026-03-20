# gift-seo-audit

콘텐츠 발행 전 SEO/AEO/GEO 품질 + 이미지/링크 + GA4 검수.

## 검수 항목

### 메타데이터
- [ ] title: 60자 이하, 핵심 키워드(페르소나+상황+예산) 포함
- [ ] description: 160자 이하, 검색 스니펫으로 자연스러운 문장
- [ ] canonical URL 설정 (trailing slash 일관성)
- [ ] og:title, og:description, og:image 설정
- [ ] datePublished, dateModified ISO 8601 형식

### 구조화 데이터 (JSON-LD)
- [ ] Article 스키마: headline, author, publisher
- [ ] ItemList 스키마: 상품 순위 매핑
- [ ] FAQPage 스키마: question-answer 페어
- [ ] BreadcrumbList 스키마: 3단계
- [ ] schema.ts SITE_URL = "https://giftnote.kr"

### 콘텐츠 품질
- [ ] 태그 3~5개 (표준 풀에서만, 중복/범용 없이)
- [ ] FAQ 4개
- [ ] reason 50~80자 (49자 이하 FAIL)
- [ ] giftMessage 30~50자 (29자 이하 FAIL)
- [ ] evidence 상품당 2~3개
- [ ] editorial 3문단, 각 50~80자
- [ ] 상품 5개 (4개 이하 WARN)

### 큐레이터 검증
- [ ] 큐레이터 배정됨
- [ ] 성별 적합성 (여자친구→남성큐, 남자친구→여성큐)
- [ ] editorial eyebrow: "{CuratorName}'s Note"
- [ ] pullQuote.cite: 큐레이터 이름

### 이미지 검증 (verify-images.ts)
- [ ] 모든 이미지 HTTP 200 접근 가능
- [ ] ads-partners.coupang.com 이미지 없음
- [ ] 다나와 pcode 브랜드 매칭 통과
- [ ] 컬렉션 내 이미지 중복 없음
- [ ] 빈 이미지 없음

### 상품 중복 검증
- [ ] 기존 콘텐츠와 상품 중복률 50% 이하
- [ ] 같은 브랜드 상품 2개 이하

### 가격 검증
- [ ] 모든 상품 가격이 budgetMin~budgetMax 범위 내

### GA4/GTM 검증
- [ ] data-track 속성이 모든 인터랙션 포인트에 적용
- [ ] event-schema.json과 analytics.ts eventMap 일치

### AEO/GEO
- [ ] FAQ 첫 문장이 직접 답변 (Position Zero)
- [ ] FAQ 답변에 구체적 상품명+가격
- [ ] 큐레이터 바이라인 (E-E-A-T 신호)
- [ ] evidence로 신뢰 신호 제공

### 사이트맵
- [ ] robots.ts → sitemap-index.xml
- [ ] 큐레이터별 사이트맵 생성됨
- [ ] 도메인 giftnote.kr

## 실행 방법
콘텐츠 MD 파일 또는 전체 컬렉션을 검수.
verify-images.ts 스크립트 실행 포함.

## 출력
각 항목: ✅ PASS / ❌ FAIL / ⚠️ WARN.
FAIL 항목에 대한 구체적 수정 제안 포함.
