# gift-theme-planner

큐레이션 테마를 기획하고 slug, 태그, 메타데이터를 결정.

## 입력
- persona, interest, budget, occasion 조합

## 작업
1. slug 생성: `{interest}-{ageGroup}-{gender}-{budget}-{occasion}` 형식
2. 태그 5~8개 선정 (페르소나, 예산, 상황, 관심사 포함)
3. title: SEO 최적화 제목 (검색 의도 반영)
4. description: 120자 이내 AEO 친화 설명
5. heroSvg 카테고리 매핑

## targets 작성 규칙
- description: 핵심 특성 1~2문장 + 인용/예시 1문장 (마침표 기준 2~3문장)
- 설명 문장과 인용구는 별도 문장으로 분리
- 인용구는 작은따옴표로 감싸고 새 문장으로 시작
  - Good: "숨은 브랜드, 동네 편집숍을 좋아하는 분이에요. '이거 어디서 샀어?'라는 말을 자주 듣는 타입입니다."

## 출력
- frontmatter 초안 (YAML)
