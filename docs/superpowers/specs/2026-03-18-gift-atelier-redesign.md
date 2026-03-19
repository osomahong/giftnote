# Gift Atelier — 기프트노트 전면 리디자인 스펙

## 개요

기프트노트 웹사이트를 "Gift Atelier" 컨셉으로 전면 리디자인한다.
매거진 에디토리얼 + 컬러풀 펀 + 핸드메이드 아기자기 감성을 결합한 방향.
PC는 매거진 피처드 레이아웃, 모바일은 풀스크린 스냅 스크롤.

## 1. 색상 시스템

### 베이스
| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#F5F0E8` | 린넨/샌드 배경 |
| `--bg-warm` | `#EDE7DB` | 섹션 구분 배경 |
| `--surface` | `#FFFFFF` | 카드/콘텐츠 표면 |
| `--text` | `#2D2A24` | 본문 |
| `--text-secondary` | `#7A7368` | 부제, 설명 |
| `--text-muted` | `#A8A093` | 보조 정보 |
| `--border` | `#E0D9CE` | 카드 테두리 |

### Occasion별 포인트 컬러
| Occasion | 이름 | 값 |
|---|---|---|
| 생일 | 코랄 | `#FF6B6B` |
| 집들이 | 올리브 | `#84CC16` |
| 감사/명절 | 레몬 | `#FBBF24` |
| 기념일 | 라벤더 | `#A78BFA` |
| 기타 | 테라코타 | `#C8612A` |

### Occasion 매핑 규칙
occasion 문자열 → 컬러 매핑은 `lib/occasion-colors.ts`에서 처리한다.
- 포함(includes) 기반 매칭: "생일" 포함 → 코랄, "집들이" 포함 → 올리브, "감사"/"명절"/"추석"/"설" 포함 → 레몬, "기념일"/"결혼"/"돌잔치" 포함 → 라벤더
- 매칭 안 되면 → 기타(테라코타) 폴백
- Occasion 컬러는 배경/바/뱃지에만 사용. 흰 배경 위 텍스트로 직접 사용 금지 (레몬/올리브 WCAG 미달)
- 텍스트가 필요한 경우: 해당 occasion 컬러의 다크 변형(darken 30%) 사용

### 액센트
- CTA 버튼 (`--color-cta`): `#FF6B6B` → hover `#E85D5D` (accent와 별도 토큰)
- 링크/강조 (`--color-accent`): `#C8612A` (기존 유지)
- 기존 `text-accent`, `hover:text-accent` 클래스는 그대로 `#C8612A` 참조
- 태그 3종 컬러 (persona-blue, budget-green, occasion-yellow)도 기존 유지

## 2. 타이포그래피

| 요소 | 폰트 | 크기 | 무게 | 행간 |
|---|---|---|---|---|
| 히어로 제목 | Noto Serif KR | 48~64px | bold | 1.2 |
| 섹션 제목 | Noto Serif KR | 28~32px | bold | 1.3 |
| 카드 제목 | Noto Serif KR | 18~20px | bold | 1.4 |
| 본문 | Noto Sans KR | 15~16px | regular | 1.7 |
| 태그/뱃지 | Noto Sans KR | 12~13px | medium | — |
| 스티커 뱃지 | Caveat | 14~16px | bold | — |

- Caveat (Google Font)는 "에디터 픽", "HOT" 등 스티커 뱃지에만 사용
- 강조 키워드: occasion 컬러 20% opacity 배경 하이라이트 + bold

## 3. 장식 요소

### 스티커 뱃지
- occasion 컬러 배경 + 흰 텍스트
- `rotate(-3deg)`, `shadow-sm`, `rounded-full`
- Caveat 폰트

### 물결 디바이더
- SVG wave path, 높이 48px
- 위/아래 섹션 배경색 전환 (bg ↔ bg-warm)

### 도트 패턴
- CSS `radial-gradient`로 구현 (이미지 불필요)
- `radial-gradient(circle, var(--color-text-muted) 1px, transparent 1px)`, `background-size: 24px 24px`
- opacity 5~8%, 히어로/피처드 영역 배경 장식

### 아이콘
- 기존 stroke 24px 아이콘 → 컬러 filled 스타일, 32~48px
- occasion 컬러 적용

### FloatingDecorations
- 기존 전체 화면 장식 제거 → 히어로 영역에만 2~3개 집중 배치

## 4. 레이아웃

### PC (md 이상)

**max-width 변경**: `max-w-3xl` (48rem) → `max-w-6xl` (72rem)

**메인 페이지 구조**:
1. SiteHeader (로고 왼쪽, 태그 네비 오른쪽)
2. 히어로: 큰 세리프 제목 + 부제 + 도트 패턴 배경
3. 물결 디바이더
4. 피처드 섹션: 왼쪽 60% 피처드 카드 + 오른쪽 40% 서브 카드 2~3개 세로 쌓기
   - **피처드 선정 기준**: dateModified 가장 최신인 컬렉션. 동일 날짜 시 배열 첫 번째.
   - 컬렉션 1개뿐이면 피처드 1장만 풀와이드. 2개면 피처드+서브1. 0개면 섹션 숨김.
5. 물결 디바이더
6. occasion별 섹션: 제목 + 3열 그리드 카드
7. 물결 디바이더
8. 태그 클라우드
9. SiteFooter

**컬렉션 상세 페이지**:
- max-w-4xl로 확장
- 히어로 이미지: 풀와이드 rounded-3xl, h-72 md:h-96
- 나머지 섹션: 기존 구조 유지 + 새 스타일 적용

### 모바일 (sm 이하)

**스냅 스크롤 기반**:
- `snap-y snap-proximity` 컨테이너 (mandatory 대신 proximity → 키보드/접근성 안전)
- 각 섹션: `snap-start min-h-screen`
- occasion 섹션이 4개 이상이면 "생일"/"집들이" 등 주요 2~3개만 풀스크린, 나머지는 일반 스크롤 섹션으로 표시
- 히어로: 풀스크린, 풀블리드
- 피처드 카드: 풀스크린 1장
- occasion 섹션: 풀스크린, 카드는 가로 스크롤 (snap-x)
- 태그 클라우드 + 푸터

## 5. 컴포넌트

### 컬렉션 카드
- `bg-white`, `rounded-3xl`, `shadow-md`
- 상단 4px occasion 컬러 바
- AI 일러스트 썸네일 (`/og/_thumb-{slug}.png`, aspect-[4/3]), 없으면 occasion 컬러 20% opacity 배경 + heroSvg 아이콘(48px)
- pill 태그 (페르소나, 예산)
- 세리프 제목 + 설명 2줄 clamp
- 에디터 픽 스티커 (Caveat, 기울어짐, 있을 때만)
- 우하단 → 화살표
- hover: shadow-lg + -translate-y-1

### 피처드 카드
- 컬렉션 카드와 동일 구조, 세로로 확장된 버전
- 제목 28px, 설명 3줄
- 썸네일 aspect-[3/2], min-h-[320px]
- PC에서 왼쪽 60% 차지, 서브 카드 높이 합과 동일 (h-full)

### 물결 디바이더 컴포넌트
- props: `fromColor`, `toColor`
- SVG wave path, 높이 48px
- 섹션 간 배경색 전환

### 스티커 뱃지 컴포넌트
- props: `text`, `color`, `rotation`
- Caveat 폰트, occasion 컬러 배경

### 히어로 (메인 페이지)
- 큰 세리프 제목, 키워드 하이라이트 (occasion 컬러)
- 부제 한 줄
- 도트 패턴 배경
- 장식 일러스트 2~3개 (absolute)
- 모바일: 풀스크린 (min-h-screen)

### 상세 페이지 PageHeader
- 풀와이드 AI 일러스트 배경, rounded-3xl
- h-72 md:h-96
- 그라데이션 오버레이 + 제목 키워드 하이라이트
- 장식 SVG 2개

### 상세 페이지 ProductCard
- 기존 구조 유지
- `bg-white`, `rounded-3xl`, `shadow-md`
- 컬러 바 없음
- 에디터 픽 스티커만 occasion 컬러 적용

### 상세 페이지 기타 카드 (Editorial, SignalBar, Related, FAQ)
- `bg-white`, `rounded-3xl`, `shadow-md`
- `border-border/50`

## 6. 라운딩 + 그림자

| 요소 | rounded | shadow |
|---|---|---|
| 카드 | 3xl (24px) | md |
| 버튼 | 2xl (16px) | sm |
| 태그/pill | full | none |
| hover 카드 | — | lg |

## 7. 애니메이션

기존 float/wobble/spin-slow 유지하되 히어로 영역에만 적용.
fade-in-up은 히어로 제목 + 카드 진입에 사용.
모바일 snap scroll은 CSS 네이티브 (JS 없음).
`prefers-reduced-motion: reduce` 시 모든 애니메이션 비활성화.

## 8. 변경 파일 목록

### 수정
- `app/globals.css` — 색상 토큰 전면 교체, 새 유틸리티
- `app/layout.tsx` — Caveat 폰트 추가, FloatingDecorations 제거
- `app/page.tsx` — 전면 재작성 (피처드 레이아웃, 스냅 스크롤)
- `app/tag/[tag]/page.tsx` — 새 카드 스타일
- `app/collection/[slug]/page.tsx` — max-w 확장, 새 스타일
- `components/collection/PageHeader.tsx` — 확대, 새 스타일
- `components/collection/ProductCard.tsx` — 새 카드 스타일
- `components/collection/Editorial.tsx` — 새 카드 스타일
- `components/collection/SignalBar.tsx` — 새 카드 스타일
- `components/collection/RelatedSection.tsx` — 새 카드 스타일
- `components/collection/FaqSection.tsx` — 새 카드 스타일
- `components/layout/SiteHeader.tsx` — 태그 네비 추가

### 신규
- `components/layout/WaveDivider.tsx` — 물결 디바이더
- `components/layout/StickerBadge.tsx` — 스티커 뱃지
- `components/layout/HeroDecorations.tsx` — 히어로 장식 (FloatingDecorations 대체)
- `lib/occasion-colors.ts` — occasion별 컬러 매핑 유틸리티

### 삭제
- `components/layout/FloatingDecorations.tsx` — HeroDecorations로 대체

## 9. 접근성 규칙

- 물결 디바이더: `aria-hidden="true"`, `role="presentation"`
- 스티커 뱃지: 주변 텍스트와 중복이면 `aria-hidden="true"`, 아니면 `aria-label` 부여
- Occasion 컬러 바: 색상만으로 구분하지 않음 — 섹션 제목 텍스트 + 카드 내 occasion 태그 텍스트로 보조
- 레몬(#FBBF24), 올리브(#84CC16)는 흰 배경 위 텍스트 금지. 배경/바/뱃지 배경으로만 사용
- 모바일 snap scroll: `snap-proximity` 사용 (mandatory 아님, 키보드 트랩 방지)

## 10. 미변경 영역

- `components/recommendation/` (InlineRecommend, FloatingBubble, ExitBottomSheet) — 기존 스타일 유지
- `SiteFooter` — 새 배경색(`--bg-warm`)만 자동 적용, 구조 변경 없음
- `lib/types.ts` — 변경 없음 (피처드 선정은 dateModified 기반)
- CLAUDE.md — 구현 완료 후 디자인 시스템 섹션 업데이트 필요
