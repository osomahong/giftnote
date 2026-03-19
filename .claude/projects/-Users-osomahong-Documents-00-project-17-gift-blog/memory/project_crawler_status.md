---
name: project_crawler_status
description: 크롤러 플랫폼별 상태와 향후 확장 계획
type: project
---

현재 네이버 쇼핑 API + 쿠팡파트너스 API만 사용. 나머지 4개 플랫폼은 향후 확장 예정.

**Why:** 카카오/29CM/컬리는 React SPA라 requests+BS4 방식 불가. SSG만 SSR이라 가능하나 우선순위 낮음.

**How to apply:**
- 네이버: openapi.naver.com/v1/search/shop.json (API키 필요)
- 쿠팡: 파트너스 API (검색 + 딥링크)
- 카카오 선물하기: Playwright 필요, URL은 /search/result?query={}&searchType=search_typing_keyword
- 29CM: Playwright 필요, search.29cm.co.kr/search?keyword={}
- 컬리: Playwright 필요, www.kurly.com/search?sword={}
- SSG: SSR 가능, www.ssg.com/search.ssg?target=all&query={}, 셀렉터 li.cunit_t232
- utils.py의 UA 문자열 Chrome 120 → 133+ 업데이트 필요
