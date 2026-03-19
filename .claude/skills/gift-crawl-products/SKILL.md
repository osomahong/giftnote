# gift-crawl-products

6개 플랫폼에서 상품을 크롤링하여 products 배열 생성.

## 플랫폼
- kakao (gift.kakao.com)
- coupang (쿠팡)
- naver (네이버 쇼핑)
- 29cm
- kurly (컬리)
- ssg (SSG)

## 규칙
- User-Agent 로테이션
- 요청 간격: 2~5초
- 재시도: 3회
- 403/429 시 스킵
- 상품 5~8개 선별

## 필수 수집 필드 (누락 불가)
- **name**: 실제 상품명
- **brand**: 실제 브랜드명
- **price**: 실제 판매가 (number, KRW 원 단위)
- **originalPrice**: 정가 (할인 상품인 경우)
- **image**: 상품 대표 이미지 URL (빈 문자열 절대 불가)
- **sourceUrl**: 실제 상품 페이지 URL
- **affiliateUrl**: 쿠팡파트너스/네이버 어필리에이트 딥링크

## 이미지 수집 규칙
- 상품 대표 이미지(썸네일)를 반드시 수집
- HTTPS URL만 허용
- CDN 이미지 URL이 리다이렉트되는 경우 최종 URL 사용
- 이미지 수집 실패 시 해당 상품 제외하고 다른 상품으로 대체
- **image가 빈 문자열인 상품은 최종 결과에 포함하지 않음**

## evidence 출처 분류 규칙
- youtube: 유튜브 채널/영상
- community: 커뮤니티 (블라인드, 디시인사이드, 클리앙, 오늘의집, 네이버 카페 등)
- trend: 검색 트렌드, 판매 데이터 (네이버 트렌드, 구글 트렌드, 판매량)
- media: 언론/매거진 (GQ, 얼루어, 리빙센스 등)
- **블라인드는 SNS가 아님. type: "community"로 분류**

## 출력
- products 배열 (Product 타입 준수, image 필드 필수)
- `content/products/{slug}.json` 원본 데이터 저장
