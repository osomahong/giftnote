# gift. — 선물 큐레이션 플랫폼

## 프로젝트 개요
- Next.js 16 + App Router + Static Export
- 서버/DB 없음. `content/collections/*.md` 파일이 데이터베이스
- 수익 모델: 쿠팡파트너스 affiliate 딥링크

## 핵심 규칙
- `output: 'export'` — 완전 정적 빌드. Route Handlers, Middleware 사용 불가
- `params`는 Promise — `await params` 필수 (Next.js 15+ 규칙)
- 모든 동적 라우트에 `generateStaticParams` 필수
- affiliate 링크: `rel="nofollow sponsored"` 필수
- 모든 가격은 number (KRW 원 단위)

## 디렉토리 구조
```
content/collections/  → MD 큐레이션 파일 (frontmatter = 데이터)
content/products/     → 크롤링 결과 JSON
content/signals/      → 트렌드 신호 JSON
generated/            → 빌드 시 생성 (recommendations.json, tag-index.json)
app/                  → Next.js App Router 페이지
lib/                  → types.ts, content.ts, schema.ts
components/collection/   → 서버 컴포넌트 6개
components/recommendation/ → 추천 컴포넌트 3개
components/layout/    → 레이아웃 컴포넌트
scripts/              → 빌드 스크립트
public/svg/           → SVG 에셋
```

## 빌드 순서
1. `tsx scripts/build-recommendations.ts` → generated/recommendations.json
2. `tsx scripts/build-tag-index.ts` → generated/tag-index.json
3. `next build` → out/

## 컬렉션 MD 파일 구조
frontmatter 필수 필드: title, description, persona, ageGroup, gender, interest, budgetTier, budgetMin, budgetMax, occasion, tpo, tags, status, datePublished, dateModified, signalScore, heroSvg, products, signals, editorial, scenarios, faqs

## 디자인 시스템
- 배경: #F7F7F5, 텍스트: #1A1916
- 폰트: Noto Serif KR (제목), Noto Sans KR (본문)
- 태그 3종 컬러: persona(파랑), budget(초록), occasion(노랑)
- Evidence pill 4종: youtube(빨강), community(초록), trend(노랑), media(파랑)
- 최대 너비: max-w-3xl (48rem)

## 커스텀 스킬
`.claude/skills/` 하위에 11개 스킬 정의됨
