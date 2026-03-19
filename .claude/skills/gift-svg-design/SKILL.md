# gift-svg-design

카테고리 일러스트, 패턴, 아이콘 SVG를 생성.

## SVG 규칙
- viewBox 필수
- currentColor 사용 (테마 대응)
- path 15개 이하
- 5KB 이하
- stroke-linecap="round" stroke-linejoin="round"

## SVG 유형
- `public/svg/categories/` — 카테고리 일러스트 (120x120)
- `public/svg/patterns/` — 배경 패턴 (20x20 타일)
- `public/svg/icons/` — UI 아이콘 (24x24)
- `public/svg/decorative/` — 장식 요소 (다양한 크기)
- `public/svg/og/` — OG 이미지 템플릿

## 네이밍
- 카테고리: `{interest}.svg`
- 아이콘: `{name}.svg` (케밥 케이스)
