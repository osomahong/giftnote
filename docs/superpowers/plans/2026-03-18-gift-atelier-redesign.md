# Gift Atelier 디자인 리뉴얼 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기프트노트 웹사이트를 "Gift Atelier" 컨셉(매거진 에디토리얼 + 컬러풀 + 핸드메이드)으로 전면 리디자인

**Architecture:** 색상/타이포 토큰 교체 → 유틸리티(occasion-colors) → 공통 장식 컴포넌트(WaveDivider, StickerBadge, HeroDecorations) → 메인 페이지(피처드 레이아웃 + 스냅 스크롤) → 컬렉션 상세 페이지 → 나머지 페이지 순으로 진행. 빌드 가능 상태를 매 태스크마다 유지.

**Tech Stack:** Next.js 16 (App Router, Static Export), Tailwind CSS v4 (@theme), TypeScript, Google Fonts (Caveat 추가)

**Spec:** `docs/superpowers/specs/2026-03-18-gift-atelier-redesign.md`

---

## File Map

### 신규 생성
| File | Responsibility |
|---|---|
| `lib/occasion-colors.ts` | occasion 문자열 → 컬러 매핑 유틸리티 |
| `components/layout/WaveDivider.tsx` | 섹션 간 물결 SVG 디바이더 |
| `components/layout/StickerBadge.tsx` | 손글씨풍 기울어진 뱃지 |
| `components/layout/HeroDecorations.tsx` | 히어로 영역 장식 일러스트 |

### 수정
| File | Changes |
|---|---|
| `app/globals.css` | 색상 토큰 전면 교체, 도트 패턴 유틸리티, CTA 토큰 |
| `app/layout.tsx` | Caveat 폰트 추가, FloatingDecorations → 삭제 |
| `app/page.tsx` | 전면 재작성: 피처드 레이아웃, 스냅 스크롤, max-w-6xl |
| `components/layout/SiteHeader.tsx` | 태그 네비 추가 |
| `components/collection/PageHeader.tsx` | h-96, 키워드 하이라이트, occasion 컬러 |
| `components/collection/ProductCard.tsx` | bg-white, rounded-3xl, shadow-md, 스티커 뱃지 |
| `components/collection/Editorial.tsx` | bg-white, rounded-3xl, shadow-md |
| `components/collection/SignalBar.tsx` | bg-white, rounded-3xl |
| `components/collection/RelatedSection.tsx` | bg-white, rounded-3xl, occasion 컬러 바 |
| `components/collection/FaqSection.tsx` | bg-white, rounded-3xl |
| `app/collection/[slug]/page.tsx` | max-w-4xl, occasion 컬러 전달 |
| `app/tag/[tag]/page.tsx` | 새 카드 스타일, occasion 컬러 바 |

### 삭제
| File | Reason |
|---|---|
| `components/layout/FloatingDecorations.tsx` | HeroDecorations로 대체 |

---

## Task 1: 색상 토큰 + CSS 유틸리티 전면 교체

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: 색상 토큰 교체**

`app/globals.css`의 `@theme` 블록을 전면 교체한다. 변경 내용:
- `--color-bg`: `#F7F7F5` → `#F5F0E8`
- `--color-bg-warm`: `#F2F0EB` → `#EDE7DB`
- `--color-text`: `#1A1916` → `#2D2A24`
- `--color-text-secondary`: `#6B6860` → `#7A7368`
- `--color-text-muted`: `#9C978E` → `#A8A093`
- `--color-border`: `#E5E2DB` → `#E0D9CE`
- `--color-border-light`: `#EFEDE8` → `#E0D9CE` (border와 통합)
- `--color-card-cream` 삭제 → `--color-surface: #FFFFFF` 추가
- `--color-highlight-accent` 삭제
- `--color-cta: #FF6B6B` 추가
- `--color-cta-hover: #E85D5D` 추가
- occasion 5색 토큰 추가: `--color-occasion-coral: #FF6B6B`, `--color-occasion-olive: #84CC16`, `--color-occasion-lemon: #FBBF24`, `--color-occasion-lavender: #A78BFA`, `--color-occasion-terra: #C8612A`

기존 accent, tag 3종, evidence 4종 토큰은 유지.

```css
@theme {
  --color-bg: #F5F0E8;
  --color-bg-warm: #EDE7DB;
  --color-surface: #FFFFFF;
  --color-text: #2D2A24;
  --color-text-secondary: #7A7368;
  --color-text-muted: #A8A093;
  --color-border: #E0D9CE;
  --color-border-light: #E0D9CE;

  --color-accent: #C8612A;
  --color-accent-hover: #B55624;
  --color-accent-light: #FFF4EE;

  --color-cta: #FF6B6B;
  --color-cta-hover: #E85D5D;

  --color-occasion-coral: #FF6B6B;
  --color-occasion-olive: #84CC16;
  --color-occasion-lemon: #FBBF24;
  --color-occasion-lavender: #A78BFA;
  --color-occasion-terra: #C8612A;

  /* 기존 tag, evidence 토큰 그대로 유지 */
  --color-tag-persona: #EBF0FD;
  --color-tag-persona-text: #2D5BB0;
  --color-tag-budget: #EBF4EE;
  --color-tag-budget-text: #2A7A48;
  --color-tag-occasion: #FDF6E8;
  --color-tag-occasion-text: #B07820;

  --color-evidence-youtube-bg: #FDECEA;
  --color-evidence-youtube-text: #C0392B;
  --color-evidence-community-bg: #EBF4EE;
  --color-evidence-community-text: #2A7A48;
  --color-evidence-trend-bg: #FDF6E8;
  --color-evidence-trend-text: #B07820;
  --color-evidence-media-bg: #EBF0FD;
  --color-evidence-media-text: #2D5BB0;

  /* 하위 호환 별칭 — Task 8~9 이후 제거 */
  --color-card-cream: #FFFFFF;
  --color-card-cream-hover: #FAFAFA;
  --color-highlight-accent: oklch(from #FF6B6B l c h / 0.2);

  --color-editor-pick: #C8612A;
  --color-discount: #C0392B;
  --color-promotion-urgent: #C0392B;

  --font-serif: 'Noto Serif KR', serif;
  --font-sans: 'Noto Sans KR', sans-serif;
  --font-hand: 'Caveat', cursive;
}
```

- [ ] **Step 2: 도트 패턴 유틸리티 클래스 추가**

기존 애니메이션 클래스 아래에 도트 패턴 클래스 추가:

```css
.dot-pattern {
  background-image: radial-gradient(circle, var(--color-text-muted) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.06;
}
```

- [ ] **Step 3: `bg-card-cream` → `bg-surface` 일괄 사용 확인**

기존 `card-cream` 참조를 `surface`로 교체할 준비. 이 단계에서는 globals.css만 커밋.

- [ ] **Step 4: 빌드 확인**

```bash
./node_modules/.bin/next build 2>&1 | tail -5
```
Expected: 빌드 성공 (색상 토큰만 변경이라 깨지지 않음. `card-cream` 참조하는 파일이 아직 있으면 Tailwind가 빈 값을 넣을 수 있지만 빌드는 통과)

- [ ] **Step 5: 커밋**

```bash
git add app/globals.css
git commit -m "style: replace color tokens with Gift Atelier palette"
```

---

## Task 2: occasion-colors 유틸리티 생성

**Files:**
- Create: `lib/occasion-colors.ts`

- [ ] **Step 1: occasion-colors.ts 생성**

```typescript
export type OccasionColorKey = 'coral' | 'olive' | 'lemon' | 'lavender' | 'terra'

export interface OccasionColor {
  key: OccasionColorKey
  bg: string        // Tailwind bg class (배경용)
  bar: string       // 4px 컬러 바용
  badgeBg: string   // 스티커 뱃지 배경
  highlight: string // 키워드 하이라이트 배경 (20% opacity)
  text: string      // WCAG 안전한 다크 텍스트
}

const OCCASION_COLORS: Record<OccasionColorKey, OccasionColor> = {
  coral: {
    key: 'coral',
    bg: 'bg-occasion-coral',
    bar: 'bg-occasion-coral',
    badgeBg: 'bg-occasion-coral',
    highlight: 'bg-occasion-coral/20',
    text: 'text-[#B94A4A]',
  },
  olive: {
    key: 'olive',
    bg: 'bg-occasion-olive',
    bar: 'bg-occasion-olive',
    badgeBg: 'bg-occasion-olive',
    highlight: 'bg-occasion-olive/20',
    text: 'text-[#5C8F10]',
  },
  lemon: {
    key: 'lemon',
    bg: 'bg-occasion-lemon',
    bar: 'bg-occasion-lemon',
    badgeBg: 'bg-occasion-lemon',
    highlight: 'bg-occasion-lemon/20',
    text: 'text-[#92710F]',
  },
  lavender: {
    key: 'lavender',
    bg: 'bg-occasion-lavender',
    bar: 'bg-occasion-lavender',
    badgeBg: 'bg-occasion-lavender',
    highlight: 'bg-occasion-lavender/20',
    text: 'text-[#6D5BA3]',
  },
  terra: {
    key: 'terra',
    bg: 'bg-occasion-terra',
    bar: 'bg-occasion-terra',
    badgeBg: 'bg-occasion-terra',
    highlight: 'bg-occasion-terra/20',
    text: 'text-[#A04E20]',
  },
}

const OCCASION_MAP: [string[], OccasionColorKey][] = [
  [['생일'], 'coral'],
  [['집들이'], 'olive'],
  [['감사', '명절', '추석', '설'], 'lemon'],
  [['기념일', '결혼', '돌잔치'], 'lavender'],
]

export function getOccasionColor(occasion: string): OccasionColor {
  for (const [keywords, key] of OCCASION_MAP) {
    if (keywords.some(kw => occasion.includes(kw))) {
      return OCCASION_COLORS[key]
    }
  }
  return OCCASION_COLORS.terra
}

export function getOccasionColorByKey(key: OccasionColorKey): OccasionColor {
  return OCCASION_COLORS[key]
}
```

- [ ] **Step 2: 빌드 확인**

```bash
./node_modules/.bin/next build 2>&1 | tail -5
```
Expected: 성공 (새 파일, 아직 import 안 됨)

- [ ] **Step 3: 커밋**

```bash
git add lib/occasion-colors.ts
git commit -m "feat: add occasion-colors utility for occasion-based theming"
```

---

## Task 3: 공통 장식 컴포넌트 3개 생성

**Files:**
- Create: `components/layout/WaveDivider.tsx`
- Create: `components/layout/StickerBadge.tsx`
- Create: `components/layout/HeroDecorations.tsx`

- [ ] **Step 1: WaveDivider.tsx 생성**

```tsx
export function WaveDivider({ fromColor = 'bg', toColor = 'bg-warm' }: { fromColor?: string; toColor?: string }) {
  return (
    <div aria-hidden="true" role="presentation" className="w-full h-12 relative -my-px">
      <svg
        viewBox="0 0 1440 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 0h1440v24c-240 16-480 24-720 24S240 40 0 24V0z"
          className={`fill-${fromColor}`}
        />
        <path
          d="M0 48h1440V24c-240-16-480-24-720-24S240 8 0 24v24z"
          className={`fill-${toColor}`}
        />
      </svg>
    </div>
  )
}
```

주의: Tailwind 동적 클래스는 작동하지 않으므로, 실제 구현에서는 style prop으로 CSS 변수를 넘기거나, 고정된 fromColor/toColor 조합만 사용한다. 실제 사용처에서는 `bg` → `bg-warm` 또는 `bg-warm` → `bg` 두 가지뿐이므로 variant prop으로 처리:

```tsx
export function WaveDivider({ variant = 'to-warm' }: { variant?: 'to-warm' | 'to-default' }) {
  const from = variant === 'to-warm' ? 'var(--color-bg)' : 'var(--color-bg-warm)'
  const to = variant === 'to-warm' ? 'var(--color-bg-warm)' : 'var(--color-bg)'

  return (
    <div aria-hidden="true" role="presentation" className="w-full h-12 relative -my-px">
      <svg
        viewBox="0 0 1440 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <path
          d="M0 0h1440v24c-240 16-480 24-720 24S240 40 0 24V0z"
          fill={from}
        />
        <path
          d="M0 48h1440V24c-240-16-480-24-720-24S240 8 0 24v24z"
          fill={to}
        />
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: StickerBadge.tsx 생성**

```tsx
interface StickerBadgeProps {
  text: string
  colorClass: string  // occasion 컬러 Tailwind bg class (e.g., 'bg-occasion-coral')
  rotation?: number   // 기본 -3
}

export function StickerBadge({ text, colorClass, rotation = -3 }: StickerBadgeProps) {
  return (
    <span
      className={`inline-block font-hand text-sm font-bold text-white px-3 py-1 rounded-full shadow-sm ${colorClass}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      {text}
    </span>
  )
}
```

- [ ] **Step 3: HeroDecorations.tsx 생성**

```tsx
export function HeroDecorations() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <img
        src="/svg/decorative/gift-box.svg"
        alt=""
        className="absolute top-[10%] left-[5%] w-10 h-10 md:w-12 md:h-12 opacity-15 animate-float delay-1 hidden md:block"
      />
      <img
        src="/svg/decorative/heart.svg"
        alt=""
        className="absolute top-[15%] right-[8%] w-8 h-8 md:w-10 md:h-10 opacity-15 animate-wobble delay-2"
      />
      <img
        src="/svg/decorative/star.svg"
        alt=""
        className="absolute bottom-[20%] left-[8%] w-8 h-8 opacity-10 animate-wobble delay-3 hidden md:block"
      />
    </div>
  )
}
```

- [ ] **Step 4: 빌드 확인**

```bash
./node_modules/.bin/next build 2>&1 | tail -5
```
Expected: 성공

- [ ] **Step 5: 커밋**

```bash
git add components/layout/WaveDivider.tsx components/layout/StickerBadge.tsx components/layout/HeroDecorations.tsx
git commit -m "feat: add WaveDivider, StickerBadge, HeroDecorations components"
```

---

## Task 4: layout.tsx 업데이트 — Caveat 폰트 + FloatingDecorations 제거

**Files:**
- Modify: `app/layout.tsx`
- Delete: `components/layout/FloatingDecorations.tsx`

- [ ] **Step 1: layout.tsx 수정**

변경사항:
1. `import { FloatingDecorations }` 줄 삭제
2. Caveat 폰트 import 추가
3. `<FloatingDecorations />` JSX 제거
4. `<main>` 에서 `relative z-10` 제거 (FloatingDecorations가 없으므로 불필요)

```tsx
import type { Metadata } from 'next'
import { Noto_Serif_KR, Noto_Sans_KR, Caveat } from 'next/font/google'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import './globals.css'

const notoSerifKR = Noto_Serif_KR({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-hand',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://giftnote.kr'),
  title: {
    default: '기프트노트 — 마음을 전하는 선물 큐레이션',
    template: '%s — 기프트노트',
  },
  description: '받는 사람, 예산, 상황에 꼭 맞는 선물 추천. 기프트노트가 엄선한 큐레이션으로 센스 있는 선물을 찾아보세요.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${notoSerifKR.variable} ${notoSansKR.variable} ${caveat.variable}`}>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: FloatingDecorations.tsx 삭제**

```bash
rm components/layout/FloatingDecorations.tsx
```

- [ ] **Step 3: 빌드 확인**

```bash
./node_modules/.bin/next build 2>&1 | tail -5
```
Expected: 성공

- [ ] **Step 4: 커밋**

```bash
git add app/layout.tsx
git rm components/layout/FloatingDecorations.tsx
git commit -m "refactor: add Caveat font, remove FloatingDecorations from layout"
```

---

## Task 5: SiteHeader 태그 네비 추가

**Files:**
- Modify: `components/layout/SiteHeader.tsx`

- [ ] **Step 1: SiteHeader에 인기 태그 네비게이션 추가**

현재 SiteHeader는 로고 + "추천" 링크만 있음. 오른쪽에 인기 태그 네비를 추가한다.

```tsx
import Link from 'next/link'
import { getAllTags } from '@/lib/content'

export function SiteHeader() {
  const tags = getAllTags().slice(0, 5)

  return (
    <header className="sticky top-0 z-50 bg-bg/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/svg/logo-symbol.svg" alt="" className="h-7 w-7" aria-hidden="true" />
          <img src="/svg/logo.svg" alt="기프트노트" className="h-5 hidden sm:block" />
        </Link>
        <nav className="flex items-center gap-1">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tag/${tag}/`}
              className="text-xs px-2.5 py-1 rounded-full text-text-muted hover:text-accent hover:bg-accent-light transition-colors hidden md:inline-block"
            >
              #{tag}
            </Link>
          ))}
          <Link
            href="/"
            className="text-sm font-medium text-text-secondary hover:text-accent transition-colors ml-2"
          >
            추천
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

주의: `max-w-3xl` → `max-w-6xl`로 변경하여 새 레이아웃과 일치시킨다. 기존 SiteHeader 구조를 읽고, 위 코드에 맞게 조정할 것.

- [ ] **Step 2: 빌드 확인**

```bash
./node_modules/.bin/next build 2>&1 | tail -5
```
Expected: 성공

- [ ] **Step 3: 커밋**

```bash
git add components/layout/SiteHeader.tsx
git commit -m "feat: add tag navigation to SiteHeader, widen to max-w-6xl"
```

---

## Task 6: 메인 페이지 전면 재작성

**Files:**
- Modify: `app/page.tsx`

이 태스크가 가장 크다. 피처드 레이아웃 + 모바일 스냅 스크롤 + 물결 디바이더 + 히어로 장식 통합.

- [ ] **Step 1: page.tsx 전면 재작성**

핵심 로직:
1. `getPublishedCollections()` 가져오기
2. `dateModified` 기준으로 정렬 → 첫 번째가 featured
3. occasion별 그룹화
4. PC: 피처드(60%) + 서브(40%) + 3열 그리드
5. 모바일: `snap-y snap-proximity` + 가로 스크롤 카드

```tsx
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import { getPublishedCollections, getAllTags } from '@/lib/content'
import { getOccasionColor } from '@/lib/occasion-colors'
import { WaveDivider } from '@/components/layout/WaveDivider'
import { HeroDecorations } from '@/components/layout/HeroDecorations'
import { StickerBadge } from '@/components/layout/StickerBadge'

function hasThumb(slug: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', 'og', `_thumb-${slug}.png`))
}

function CollectionCard({
  collection,
  featured = false,
}: {
  collection: ReturnType<typeof getPublishedCollections>[number]
  featured?: boolean
}) {
  const thumb = hasThumb(collection.slug)
  const oc = getOccasionColor(collection.occasion)

  return (
    <Link
      href={`/collection/${collection.slug}/`}
      className={`group block rounded-3xl overflow-hidden bg-surface shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${featured ? 'h-full' : ''}`}
    >
      {/* Occasion 컬러 바 */}
      <div className={`h-1 ${oc.bar}`} />

      {/* 썸네일 */}
      <div className={`relative w-full overflow-hidden ${featured ? 'aspect-[3/2] min-h-[320px]' : 'aspect-[4/3]'}`}>
        {thumb ? (
          <Image
            src={`/og/_thumb-${collection.slug}.png`}
            alt={collection.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={`w-full h-full ${oc.highlight} flex items-center justify-center`}>
            <img
              src={collection.heroSvg}
              alt=""
              className="w-12 h-12 opacity-40"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className={`${featured ? 'p-6' : 'p-5'}`}>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-tag-persona text-tag-persona-text font-medium">
            {collection.persona}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-tag-budget text-tag-budget-text font-medium">
            {collection.budgetTier}
          </span>
        </div>
        <h3 className={`font-serif font-bold text-text ${featured ? 'text-2xl md:text-[28px]' : 'text-base'} mb-2 ${featured ? 'line-clamp-3' : 'line-clamp-2'} group-hover:text-accent transition-colors`}>
          {collection.title}
        </h3>
        <p className={`text-sm text-text-secondary ${featured ? 'line-clamp-3' : 'line-clamp-2'} leading-relaxed`}>
          {collection.description}
        </p>
        <span className="inline-flex items-center gap-1 mt-3 text-sm text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          자세히 보기
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const collections = getPublishedCollections()
  const tags = getAllTags()

  // 피처드 선정: dateModified 최신
  const sorted = [...collections].sort(
    (a, b) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
  )
  const featured = sorted[0]
  const subFeatured = sorted.slice(1, 4)

  // occasion별 그룹
  const grouped = collections.reduce<Record<string, typeof collections>>((acc, c) => {
    const key = c.occasion || '기타'
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  const occasionEntries = Object.entries(grouped)
  // 모바일: 처음 3개만 스냅 섹션, 나머지는 일반
  const snapSections = occasionEntries.slice(0, 3)
  const restSections = occasionEntries.slice(3)

  return (
    <div className="md:snap-none snap-y snap-proximity">
      {/* 히어로 */}
      <section className="relative min-h-screen md:min-h-0 snap-start flex items-center justify-center md:block md:py-16 bg-bg">
        <div className="absolute inset-0 dot-pattern pointer-events-none" />
        <HeroDecorations />
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-text leading-tight mb-4 animate-fade-in-up">
            마음을 전하는{' '}
            <em className="not-italic bg-occasion-coral/20 px-2 py-0.5 rounded-md">선물</em>{' '}
            큐레이션
          </h1>
          <p className="text-lg text-text-secondary animate-fade-in-up delay-1">
            받는 사람, 예산, 상황에 꼭 맞는 선물을 찾아보세요
          </p>
        </div>
      </section>

      <WaveDivider variant="to-warm" />

      {/* 피처드 섹션 */}
      {featured && (
        <section className="min-h-screen md:min-h-0 snap-start bg-bg-warm py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-text mb-8">최신 큐레이션</h2>
            {subFeatured.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="md:col-span-3">
                  <CollectionCard collection={featured} featured />
                </div>
                <div className="md:col-span-2 flex flex-col gap-6">
                  {subFeatured.map((c) => (
                    <CollectionCard key={c.slug} collection={c} />
                  ))}
                </div>
              </div>
            ) : (
              <CollectionCard collection={featured} featured />
            )}
          </div>
        </section>
      )}

      <WaveDivider variant="to-default" />

      {/* Occasion별 섹션 — 스냅 (모바일 처음 3개) */}
      {snapSections.map(([occasion, items]) => {
        const oc = getOccasionColor(occasion)
        return (
          <section key={occasion} className="min-h-screen md:min-h-0 snap-start bg-bg py-8 md:py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-text mb-8 flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${oc.bar}`} />
                {occasion}
              </h2>
              {/* 모바일 가로 스크롤 */}
              <div className="flex md:hidden gap-4 overflow-x-auto snap-x snap-proximity pb-4 -mx-4 px-4">
                {items.map((c) => (
                  <div key={c.slug} className="snap-start shrink-0 w-[280px]">
                    <CollectionCard collection={c} />
                  </div>
                ))}
              </div>
              {/* PC 3열 그리드 */}
              <div className="hidden md:grid md:grid-cols-3 gap-6">
                {items.map((c) => (
                  <CollectionCard key={c.slug} collection={c} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* 나머지 Occasion 섹션 (스냅 아님) */}
      {restSections.map(([occasion, items]) => {
        const oc = getOccasionColor(occasion)
        return (
          <section key={occasion} className="bg-bg py-8 md:py-12">
            <div className="max-w-6xl mx-auto px-4">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-text mb-8 flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${oc.bar}`} />
                {occasion}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {items.map((c) => (
                  <CollectionCard key={c.slug} collection={c} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

      <WaveDivider variant="to-warm" />

      {/* 태그 클라우드 */}
      <section className="bg-bg-warm py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-text mb-8">태그</h2>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag}/`}
                className="text-sm px-4 py-2 rounded-full bg-surface text-text-secondary border border-border/50 hover:border-accent/30 hover:text-accent transition-all"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: 빌드 확인**

```bash
./node_modules/.bin/next build 2>&1 | tail -10
```
Expected: 성공. 동적 Tailwind 클래스(`bg-occasion-coral` 등)가 빌드에서 감지되는지 확인. 감지 안 되면 globals.css에 safelist 추가 필요.

빌드에서 occasion 컬러 클래스가 누락되면 `globals.css`에 다음 추가:

```css
/* Tailwind safelist — occasion dynamic classes */
.bg-occasion-coral { background-color: var(--color-occasion-coral); }
.bg-occasion-olive { background-color: var(--color-occasion-olive); }
.bg-occasion-lemon { background-color: var(--color-occasion-lemon); }
.bg-occasion-lavender { background-color: var(--color-occasion-lavender); }
.bg-occasion-terra { background-color: var(--color-occasion-terra); }
```

주의: Tailwind CSS v4에서 `@theme`에 정의된 커스텀 색상은 자동으로 유틸리티가 생성되므로 safelist가 불필요할 수 있다. 빌드 결과를 보고 판단.

- [ ] **Step 3: 커밋**

```bash
git add app/page.tsx
git commit -m "feat: rewrite homepage with featured layout, snap scroll, wave dividers"
```

---

## Task 7: 컬렉션 상세 페이지 업데이트

**Files:**
- Modify: `app/collection/[slug]/page.tsx`
- Modify: `components/collection/PageHeader.tsx`

- [ ] **Step 1: collection/[slug]/page.tsx 수정**

변경사항:
- `max-w-3xl` → `max-w-4xl`
- `occasion` 정보를 PageHeader에 전달 (occasion 컬러 하이라이트용)

```tsx
// 기존 import에 추가:
import { getOccasionColor } from '@/lib/occasion-colors'

// CollectionPage 함수 내부 변경:
// 1. const oc = getOccasionColor(collection.occasion)
// 2. <article className="max-w-3xl ..."> → <article className="max-w-4xl ...">
// 3. <PageHeader collection={collection} slug={slug} /> → <PageHeader collection={collection} slug={slug} occasionColor={oc} />
```

- [ ] **Step 2: PageHeader.tsx 수정**

변경사항:
- `h-56 md:h-72` → `h-72 md:h-96`
- `occasionColor` prop 추가
- `highlightKeyword`에서 `bg-highlight-accent` → `occasionColor.highlight` 사용
- 장식 SVG 유지

```tsx
import Image from 'next/image'
import fs from 'fs'
import path from 'path'
import type { Collection } from '@/lib/types'
import type { OccasionColor } from '@/lib/occasion-colors'

function highlightKeyword(title: string, keyword: string, highlightClass: string) {
  if (!keyword) return title
  const idx = title.indexOf(keyword)
  if (idx === -1) return title
  return (
    <>
      {title.slice(0, idx)}
      <em className={`not-italic ${highlightClass} px-1 rounded`}>{keyword}</em>
      {title.slice(idx + keyword.length)}
    </>
  )
}

function getHeroImageSrc(slug: string): string {
  const thumbPath = path.join(process.cwd(), 'public', 'og', `_thumb-${slug}.png`)
  if (fs.existsSync(thumbPath)) {
    return `/og/_thumb-${slug}.png`
  }
  return `/og/_bg.png`
}

export function PageHeader({ collection, slug, occasionColor }: {
  collection: Collection
  slug: string
  occasionColor: OccasionColor
}) {
  const heroSrc = getHeroImageSrc(slug)

  return (
    <header className="mb-10">
      <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden mb-8">
        <Image src={heroSrc} alt="" fill className="object-cover" aria-hidden="true" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {/* 장식 SVG */}
        <img src="/svg/decorative/sparkle.svg" alt="" aria-hidden="true"
          className="absolute top-4 left-4 w-6 h-6 opacity-20 text-accent animate-float hidden md:block" />
        <img src="/svg/decorative/heart.svg" alt="" aria-hidden="true"
          className="absolute bottom-8 right-4 w-5 h-5 opacity-20 text-accent animate-wobble delay-2 hidden md:block" />
        {/* 중앙 아이콘 + 태그 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/90 backdrop-blur-sm rounded-2xl p-2.5 shadow-lg">
            <img src={collection.heroSvg} alt="" className="w-full h-full" aria-hidden="true" />
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm bg-white/80 text-tag-persona-text">{collection.persona}</span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm bg-white/80 text-tag-budget-text">{collection.budgetTier}</span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-sm bg-white/80 text-tag-occasion-text">{collection.occasion}</span>
          </div>
        </div>
      </div>
      <h1 itemProp="headline" className="font-serif text-3xl md:text-4xl font-bold text-center text-text leading-snug mb-4">
        {highlightKeyword(collection.title, collection.interest, occasionColor.highlight)}
      </h1>
      <p className="text-center text-text-secondary text-base max-w-xl mx-auto mb-5 leading-relaxed">
        {collection.description}
      </p>
      <div className="flex items-center justify-center text-xs text-text-muted">
        <time itemProp="datePublished" dateTime={collection.datePublished}>{collection.datePublished}</time>
      </div>
    </header>
  )
}
```

주의: `OccasionColor` 인터페이스를 `lib/occasion-colors.ts`에서 export 해야 함 — Task 2에서 이미 `export interface` 되어 있는지 확인.

- [ ] **Step 3: 빌드 확인**

```bash
./node_modules/.bin/next build 2>&1 | tail -10
```
Expected: 성공

- [ ] **Step 4: 커밋**

```bash
git add app/collection/[slug]/page.tsx components/collection/PageHeader.tsx
git commit -m "feat: update collection detail page — max-w-4xl, taller hero, occasion highlight"
```

---

## Task 8: 컬렉션 상세 카드 컴포넌트 5개 스타일 업데이트

**Files:**
- Modify: `components/collection/ProductCard.tsx`
- Modify: `components/collection/Editorial.tsx`
- Modify: `components/collection/SignalBar.tsx`
- Modify: `components/collection/RelatedSection.tsx`
- Modify: `components/collection/FaqSection.tsx`

공통 변경 패턴: `bg-white` 또는 `bg-card-cream` → `bg-surface`, `rounded-xl` 또는 `rounded-2xl` → `rounded-3xl`, `border-border-light` → `border-border/50`, `shadow-sm` → `shadow-md`

- [ ] **Step 1: ProductCard.tsx**

변경:
```
bg-card-cream rounded-2xl border border-border-light/50 p-6 relative shadow-sm
→
bg-surface rounded-3xl border border-border/50 p-6 relative shadow-md
```

에디터 픽 뱃지를 StickerBadge로 교체:
```tsx
import { StickerBadge } from '@/components/layout/StickerBadge'

// 기존 에디터 픽 div:
{product.isEditorPick && (
  <div className="absolute -top-2.5 left-4 bg-editor-pick text-white text-xs font-bold px-2.5 py-0.5 rounded-full z-10">
    에디터 픽
  </div>
)}

// 새로운 에디터 픽:
{product.isEditorPick && (
  <div className="absolute -top-3 left-4 z-10">
    <StickerBadge text="Editor's Pick" colorClass="bg-editor-pick" rotation={-3} />
  </div>
)}
```

- [ ] **Step 2: Editorial.tsx**

```
bg-card-cream rounded-2xl border border-border-light/50 p-6
→
bg-surface rounded-3xl border border-border/50 p-6 shadow-md
```

- [ ] **Step 3: SignalBar.tsx (TargetProfileSection)**

```
bg-card-cream rounded-2xl border border-border-light/50
→
bg-surface rounded-3xl border border-border/50 shadow-md
```

- [ ] **Step 4: RelatedSection.tsx**

```
bg-card-cream rounded-2xl border border-border-light/50 hover:border-accent/30
→
bg-surface rounded-3xl border border-border/50 hover:border-accent/30 shadow-md
```

- [ ] **Step 5: FaqSection.tsx**

```
bg-card-cream rounded-2xl border border-border-light/50
→
bg-surface rounded-3xl border border-border/50 shadow-md
```

- [ ] **Step 6: 빌드 확인**

```bash
./node_modules/.bin/next build 2>&1 | tail -5
```
Expected: 성공

- [ ] **Step 7: 커밋**

```bash
git add components/collection/ProductCard.tsx components/collection/Editorial.tsx components/collection/SignalBar.tsx components/collection/RelatedSection.tsx components/collection/FaqSection.tsx
git commit -m "style: apply Gift Atelier card style to all collection components"
```

---

## Task 9: 태그 페이지 스타일 업데이트

**Files:**
- Modify: `app/tag/[tag]/page.tsx`

- [ ] **Step 1: 태그 페이지 카드 스타일 변경**

변경:
- `max-w-3xl` → `max-w-6xl`
- `grid-cols-1 sm:grid-cols-2 gap-4` → `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6`
- 카드: `bg-card-cream rounded-2xl border border-border-light/50` → `bg-surface rounded-3xl border border-border/50 shadow-md`
- occasion 컬러 바 추가:

```tsx
import { getOccasionColor } from '@/lib/occasion-colors'

// 카드 내부 최상단에 추가:
{(() => {
  const oc = getOccasionColor(collection.occasion)
  return <div className={`h-1 rounded-t-3xl ${oc.bar}`} />
})()}
```

또는 더 깔끔하게 카드 구조 변경:
```tsx
{collections.map((collection) => {
  const oc = getOccasionColor(collection.occasion)
  return (
    <Link
      key={collection.slug}
      href={`/collection/${collection.slug}/`}
      className="block bg-surface rounded-3xl border border-border/50 shadow-md hover:shadow-lg hover:border-accent/30 transition-all overflow-hidden"
    >
      <div className={`h-1 ${oc.bar}`} />
      <div className="p-5">
        {/* 기존 카드 내용 */}
      </div>
    </Link>
  )
})}
```

- [ ] **Step 2: 빌드 확인**

```bash
./node_modules/.bin/next build 2>&1 | tail -5
```
Expected: 성공

- [ ] **Step 3: 커밋**

```bash
git add app/tag/[tag]/page.tsx
git commit -m "style: apply Gift Atelier style to tag page"
```

---

## Task 10: 최종 빌드 + 검증

- [ ] **Step 1: 전체 빌드**

```bash
./node_modules/.bin/next build 2>&1 | tail -20
```
Expected: 0 errors, 모든 페이지 정적 생성 성공

- [ ] **Step 2: 개발 서버 확인**

기존 3000 포트 프로세스를 종료하고 재시작:
```bash
kill $(lsof -ti:3000) 2>/dev/null; ./node_modules/.bin/next dev &
```

검증 체크리스트:
- [ ] 메인 히어로: 큰 세리프 제목 + "선물" 코랄 하이라이트
- [ ] 도트 패턴 배경 보임
- [ ] 히어로 장식 일러스트 (데스크탑)
- [ ] 물결 디바이더로 섹션 전환
- [ ] 피처드 카드: 왼쪽 60% + 오른쪽 서브 카드
- [ ] 컬렉션 카드: 흰 배경 + 상단 occasion 컬러 바
- [ ] 모바일: 스냅 스크롤 + 가로 카드 스크롤
- [ ] 컬렉션 상세: max-w-4xl, 큰 히어로, 키워드 하이라이트
- [ ] 모든 카드: rounded-3xl + shadow-md
- [ ] SiteHeader: 태그 네비 표시 (데스크탑)
- [ ] 린넨/샌드 배경색 (#F5F0E8)
- [ ] prefers-reduced-motion 시 애니메이션 정지

- [ ] **Step 3: 최종 커밋 (필요시)**

누락된 변경이 있다면:
```bash
git add -A
git commit -m "style: Gift Atelier redesign polish and fixes"
```

---

## Deferred / Out-of-scope

- **아이콘 filled 스타일 변환**: 스펙의 "stroke → filled 32-48px" 아이콘 변경은 이번 리디자인에서 제외. 기존 stroke 아이콘을 유지하되, 크기만 장식 컴포넌트에서 조정. 별도 태스크로 진행.
- **컬렉션 카드 에디터 픽 스티커**: `Collection` 타입에 `isEditorPick` 필드 없음. `Product`에만 존재. 컬렉션 레벨 에디터 픽은 타입 확장 후 별도 구현.
- **CLAUDE.md 디자인 시스템 업데이트**: 구현 완료 후 색상/레이아웃 값을 CLAUDE.md에 반영.
- **`--color-card-cream`, `--color-highlight-accent` 별칭 제거**: Task 8~9 완료 후 이 별칭을 globals.css에서 삭제하는 정리 태스크 필요.

## Implementation Notes

- `lib/occasion-colors.ts`의 Tailwind 클래스 문자열(`'bg-occasion-coral'` 등)은 **절대 동적 조합으로 리팩토링 금지**. Tailwind JIT 스캐너가 이 리터럴 문자열을 소스에서 감지해야 유틸리티가 생성됨.
