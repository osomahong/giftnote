---
name: feedback_image_mismatch
description: 상품명과 이미지가 다른 경우가 빈번함. 다나와 pcode 검증 + HTTP HEAD 접근성 검증 필수.
type: feedback
---

다나와에서 이미지를 가져올 때 잘못된 pcode를 사용하면 전혀 다른 상품 사진이 표시된다. (예: 오설록 티백인데 코코도르 디퓨저 이미지)

**Why:** 에이전트가 다나와 검색 결과에서 상품명을 제대로 확인하지 않고 pcode를 복사하면, 다른 상품의 이미지가 들어간다. 사용자가 매번 확인하기 어려우므로 자동 검증이 필수.

**How to apply:**
1. 다나와 pcode 페이지 제목에 브랜드명 또는 핵심 키워드가 포함되는지 WebFetch로 확인
2. 모든 이미지 URL에 HTTP HEAD → 200 확인 (404면 재검색)
3. 가격비교 종료된 다나와 상품은 이미지도 404 → 다른 소스 사용
4. 이미지 클릭 시 구매 링크로 연결 (affiliateUrl)
