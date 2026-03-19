# gift-seo-audit

콘텐츠 발행 전 SEO 품질을 검수하는 스킬.

## 검수 항목

### 메타데이터
- [ ] title: 60자 이하, 핵심 키워드(페르소나+상황+예산) 포함
- [ ] description: 120자 이하, 검색 스니펫으로 자연스러운 문장
- [ ] canonical URL 설정
- [ ] og:title, og:description, og:type=article 설정
- [ ] datePublished, dateModified ISO 8601 형식

### 구조화 데이터 (JSON-LD)
- [ ] Article 스키마: headline, author, publisher, speakable
- [ ] ItemList 스키마: 상품 순위 매핑
- [ ] FAQPage 스키마: question-answer 페어
- [ ] BreadcrumbList 스키마: 3단계 (홈 > 카테고리 > 상세)

### 시맨틱 HTML
- [ ] `<article>` 최상위 래핑
- [ ] `<h1>` 1개만 존재, `itemprop="headline"` 포함
- [ ] `<time itemprop="datePublished">` datetime 속성
- [ ] `<section aria-label>` 영역 구분
- [ ] `<ol>` 상품 순위 리스트
- [ ] `<dl><dt><dd>` FAQ 구조
- [ ] affiliate 링크에 `rel="nofollow sponsored"` 필수

### AEO (Answer Engine Optimization)
- [ ] FAQ 첫 문장이 질문의 직접 답변 (Position Zero 최적화)
- [ ] FAQ 답변에 구체적 상품명+가격 포함
- [ ] editorial에 `.editorial-content` 클래스 (speakable 대응)
- [ ] faq 답변에 `.faq-answer` 클래스 (speakable 대응)

### 콘텐츠 품질
- [ ] targets(타겟 프로필) 3~5개, 각각 구체적 인물상 묘사
- [ ] 상품 5~8개, 각각 reason(50~80자) + giftMessage(30~50자)
- [ ] evidence 상품당 2~3개, 정량 수치 포함
- [ ] scenario 3개, 서로 다른 관계/상황 커버
- [ ] 태그가 lib/tags.ts의 사전 정의 목록에서 선택되었는지

### 크로스링크
- [ ] FAQ 답변에 관련 컬렉션 링크 포함
- [ ] "또 이런 선물도 있어요" 섹션에 같은 TPO 컬렉션 연결
- [ ] InlineRecommend에 추천 컬렉션 노출

### 이미지
- [ ] 상품 이미지 URL 설정 (비어있지 않은지)
- [ ] heroSvg 카테고리 SVG 경로 유효
- [ ] alt 텍스트가 상품명을 포함

## 실행 방법
콘텐츠 MD 파일 경로를 입력으로 받아 위 항목을 검수하고 결과를 리포트.

## 출력
각 항목에 대해 ✅ (통과) / ❌ (실패) / ⚠️ (경고) 표시.
실패 항목에 대한 구체적 수정 제안 포함.
