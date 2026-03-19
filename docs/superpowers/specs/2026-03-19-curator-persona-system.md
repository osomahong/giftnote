# 큐레이터 페르소나 시스템 스펙

## 개요

기프트노트 콘텐츠에 8명의 큐레이터 페르소나를 도입한다.
각 큐레이터는 "내 주변에 이런 사람이 있어서 선물을 고르게 됐다"는 선물 주는 사람의 시점으로 큐레이션을 작성한다.
모든 큐레이터는 간결하고 핵심만 짚는 리뷰어 톤을 공유하며, 차이는 관점과 강조점에서 드러난다.

## 1. 큐레이터 8명 정의

| ID | 이름 | 성별 | 나이대 | 성격 | 관점/강조점 | 추천 동기 예시 |
|---|---|---|---|---|---|---|
| `eric` | Eric | 남 | 30대 | 꼼꼼한 리서처 | 스펙, 비교, 데이터 | "여자친구 생일 선물을 한 달 전부터 비교해봤습니다" |
| `clair` | Clair | 여 | 20대 | 센스있는 선물러 | 감성, 패키징, 받는 사람 반응 | "친한 언니 집들이에 뻔하지 않은 걸 찾았어요" |
| `james` | James | 남 | 40대 | 넉넉한 형/선배 | 격, 품질, 브랜드 | "후배 결혼 축하 선물, 격에 맞는 걸 골랐습니다" |
| `hana` | Hana | 여 | 30대 | 현실적 살림러 | 가성비, 실용성, 경험 | "남편 생일에 예산 안에서 쓸모 있는 걸 찾았어요" |
| `leo` | Leo | 남 | 20대 | 활동적인 행동파 | 실사용 후기, 내구성 | "같이 운동하는 형 생일에 실제로 쓸 만한 걸 골랐습니다" |
| `mina` | Mina | 여 | 30대 | 안목있는 디자이너 | 디자인, 공간, 분위기 | "동료가 새 집으로 이사하는데 공간에 어울리는 걸로 골랐어요" |
| `owen` | Owen | 남 | 30대 | 사려깊은 이야기꾼 | 의미, 맥락, 관계 | "오래된 친구에게 마음이 전해지는 걸 고르고 싶었습니다" |
| `yuna` | Yuna | 여 | 20대 | 트렌드 리서처 | 최신 트렌드, 반응, 화제성 | "같이 일하는 동생 생일에 요즘 반응 좋은 걸 찾아봤어요" |

## 2. 톤 원칙

### 공통 원칙
- 간결한 리뷰어 톤. 핵심 정보 중심.
- 과장 표현 금지 ("대박", "미친", "꼭!", "강추" 등 사용하지 않음)
- 존댓말 통일 (~합니다/~해요 혼용 가능, 큐레이터별 고정)
- 선물 주는 사람의 시점 유지 ("내가 이 선물을 고른 이유")

### 큐레이터별 차이점
차이는 **어떤 포인트를 강조하느냐**에서 나타남:

| 큐레이터 | 강조 포인트 | 문장 스타일 |
|---|---|---|
| Eric | 스펙/수치/비교 | "A 대비 B가 ~한 차이가 있습니다" |
| Clair | 받는 사람 반응/감성 | "받았을 때 표정이 달라지는 선물이에요" |
| James | 브랜드/품질/격 | "이 가격대에서 품질이 가장 안정적입니다" |
| Hana | 가성비/실용/경험담 | "실제로 써보니 가격 대비 만족도가 높았어요" |
| Leo | 실사용/내구성/기능 | "실제로 써보면 체감 차이가 큽니다" |
| Mina | 디자인/공간/마감 | "인테리어에 자연스럽게 어울리는 느낌이에요" |
| Owen | 의미/스토리/관계 | "이 선물에는 시간을 들인 마음이 담겨 있더라고요" |
| Yuna | 트렌드/반응/화제성 | "최근 가장 반응이 좋은 제품이에요" |

## 3. 배정 로직

### 파일: `lib/curators.ts`

#### 매칭 우선순위
컬렉션의 `interest`, `gender`, `occasion`, `budgetTier` 조합으로 가장 어울리는 큐레이터를 선정한다.

매칭 테이블 (interest/occasion 키워드 → 큐레이터 가중치):

| 키워드 | 1순위 | 2순위 |
|---|---|---|
| 스포츠/운동/건강 | leo | eric |
| 인테리어/리빙/집들이 | mina | clair |
| 뷰티/패션/소품 | clair | yuna |
| 테크/가젯/전자 | eric | leo |
| 요리/주방/식품 | hana | james |
| 문화/책/감성 | owen | clair |
| 고가/프리미엄 | james | mina |
| 트렌드/MZ/유행 | yuna | clair |

#### 키워드 매칭 방식
interest/occasion 값은 한국어 자유 문자열. includes 기반 부분 매칭:
- "스포츠", "운동", "건강" 중 하나라도 포함 → leo 1순위
- 매칭 키워드는 `lib/curators.ts`에 배열로 정의

#### 분산 보장
- `getPublishedCollections()`에서 각 큐레이터의 기존 배정 횟수를 카운트
- 1순위 큐레이터가 이미 평균보다 2개 이상 많으면 2순위로 넘어감
- 모두 초과하면 전체 중 가장 적게 배정된 큐레이터로 폴백
- 단일 컬렉션 생성 기준. 배치 생성 시에는 순차 호출하므로 이전 결과가 반영됨

#### 함수 시그니처
```typescript
export function assignCurator(collection: { interest: string; gender: string; occasion: string; budgetTier: string }): CuratorId
export function getCuratorProfile(id: CuratorId): CuratorProfile
```

## 4. 데이터 변경

### Collection 타입 추가
```typescript
// lib/types.ts
curator: CuratorId  // 큐레이터 ID

// lib/curators.ts에서 정의:
type CuratorId = 'eric' | 'clair' | 'james' | 'hana' | 'leo' | 'mina' | 'owen' | 'yuna'
```

### frontmatter 추가
```yaml
curator: eric
```

### CuratorProfile 타입
```typescript
export interface CuratorProfile {
  id: CuratorId
  name: string
  gender: '남' | '여'
  age: string
  personality: string    // 한줄 설명 ("꼼꼼한 리서처")
  emphasis: string       // 강조 포인트 ("스펙, 비교, 데이터")
  style: string          // 문장 스타일 가이드 (콘텐츠 생성 시 프롬프트용)
  motivation: string     // 추천 동기 예시
}
```

## 5. UI 표시

### PageHeader 바이라인
날짜 옆에 큐레이터 표시:
```
2026-03-15  ·  curated by Eric
```
- 큐레이터 이름은 bold, `text-accent` 컬러
- 클릭 시 동작 없음 (정적 사이트)

### 컬렉션 하단 큐레이터 카드
상품 목록과 RelatedSection 사이에 삽입:
```
┌──────────────────────────────────────────┐
│  curated by Eric                         │
│  꼼꼼한 리서처 · 스펙, 비교, 데이터 중심   │
│                                          │
│  Eric의 다른 큐레이션:                     │
│  · 컬렉션 제목 1 →                        │
│  · 컬렉션 제목 2 →                        │
└──────────────────────────────────────────┘
```
- `bg-surface rounded-3xl shadow-md` (기존 카드 스타일 통일)
- `<aside aria-label="큐레이터 소개">` 시맨틱 태그 사용
- 다른 큐레이션은 같은 curator의 published 컬렉션 최대 3개

#### CuratorCard props
```typescript
interface CuratorCardProps {
  curatorId: CuratorId
  currentSlug: string  // 현재 컬렉션 제외용
}
```
컴포넌트 내부에서 `getCuratorProfile(curatorId)` + `getPublishedCollections().filter(c => c.curator === curatorId && c.slug !== currentSlug).slice(0, 3)` 호출.

### Editorial eyebrow
콘텐츠 생성 시(gift-story-writer) eyebrow 값을 큐레이터 이름 포함하여 생성:
- `"Eric's Note"` 형식으로 frontmatter에 저장
- 렌더링 시 별도 오버라이드 없음 (기존 Editorial 컴포넌트 그대로 사용)

### 폴백
`curator` 필드가 없는 컬렉션은 큐레이터 UI를 숨김:
- PageHeader 바이라인: 날짜만 표시
- CuratorCard: 렌더링 안 함

## 6. 콘텐츠 생성 반영

### gift-orchestrator 파이프라인에 추가
기존 10단계 중 1단계(theme-planner) 직후에 큐레이터 배정 삽입:
1. gift-theme-planner
2. **큐레이터 배정** (assignCurator 호출 → curator ID 결정)
3. gift-crawl-products
4. gift-story-writer (← 큐레이터 프로필 전달)
5. gift-reason-explainer (← 큐레이터 프로필 전달)
6. ... 나머지 동일

### 프롬프트 주입
gift-story-writer, gift-reason-explainer, gift-scenario-writer에 큐레이터 컨텍스트를 전달:
```
이 큐레이션은 {name}이(가) 작성합니다.
관점: {personality} — {emphasis} 중심으로 언급
톤: 간결한 리뷰어. 핵심 정보 위주. 과장 없이.
동기: "내 주변에 이런 사람이 있어서 선물을 고르게 됐다" 시점
예시 동기: {motivation}
```

## 7. 변경 파일 목록

### 신규
- `lib/curators.ts` — 8명 프로필 정의, 배정 로직, getCuratorProfile
- `components/collection/CuratorCard.tsx` — 하단 큐레이터 프로필 카드

### 수정
- `lib/types.ts` — Collection에 `curator: string` 필드 추가
- `lib/content.ts` — frontmatter에서 curator 파싱
- `components/collection/PageHeader.tsx` — 바이라인에 큐레이터 표시
- `app/collection/[slug]/page.tsx` — CuratorCard 삽입
- `.claude/skills/gift-orchestrator/SKILL.md` — 큐레이터 배정 단계 추가
- `.claude/skills/gift-story-writer/SKILL.md` — 큐레이터 톤 지시
- `.claude/skills/gift-reason-explainer/SKILL.md` — 큐레이터 톤 지시
- `.claude/skills/gift-scenario-writer/SKILL.md` — 큐레이터 톤 지시
- `content/collections/*.md` (기존 3개) — curator 필드 추가

## 8. 기존 콘텐츠 마이그레이션

기존 3개 컬렉션에 curator 필드를 수동 배정:
- `sports-30s-male-50k-birthday` → `leo` (스포츠/운동 관련)
- `unique-30s-female-30k-birthday` → `clair` (센스있는 선물)
- `housewarming-20k` → `mina` (인테리어/집들이)
