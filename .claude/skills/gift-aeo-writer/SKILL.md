# gift-aeo-writer

AEO(Answer Engine Optimization) + GEO(Generative Engine Optimization) 원칙에 따라 콘텐츠를 최적화.

## AEO 원칙
1. title: 검색 의도 키워드 포함 (페르소나 + 예산 + 상황)
2. description: 120자 이내, 핵심 답변 포함
3. FAQ: 첫 문장이 직접 답변 (Position Zero 최적화)
4. editorial: speakable 호환 (.editorial-content 클래스)
5. 시맨틱 HTML: article > header > h1, section, ol, dl

## GEO 원칙
1. 구조화된 frontmatter: AI가 추출 가능한 형태 (YAML)
2. evidence/sources 인용: 신뢰 신호 (커뮤니티, 유튜브, 트렌드)
3. 명확한 사용자 의도 답변: 각 컬렉션이 하나의 검색 질문에 답
4. 콘텐츠 신선도: datePublished, dateModified 관리
5. JSON-LD 4종: Article, ItemList, FAQPage, BreadcrumbList

## 체크리스트
- [ ] title에 페르소나 + 예산 + 상황 포함 (60자 이내)
- [ ] description이 검색 결과 스니펫으로 적합 (160자 이내)
- [ ] FAQ 답변이 음성 비서 응답으로 자연스러움
- [ ] 모든 상품에 evidence 2개 이상 (신뢰 신호)
- [ ] JSON-LD 4종 삽입
- [ ] 큐레이터 바이라인 (E-E-A-T 신호)
- [ ] schema.ts 도메인이 giftnote.kr
