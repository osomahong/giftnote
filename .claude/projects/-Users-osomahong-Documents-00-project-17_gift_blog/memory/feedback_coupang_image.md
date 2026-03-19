---
name: feedback_coupang_image
description: 쿠팡파트너스 API productImage는 광고 배너이므로 상품 이미지로 사용 금지
type: feedback
---

쿠팡파트너스 검색 API가 반환하는 `productImage` URL (`ads-partners.coupang.com/image1/...`)은 실제 상품 사진이 아니라 광고 추적용 배너 이미지다. "특가는?" 같은 프로모션 배너가 나옴.

**Why:** 상품 이미지로 사용하면 "특가는?" 배너가 상품 썸네일로 표시되어 사용자 경험이 심각하게 나빠짐.

**How to apply:**
1. 쿠팡 API의 `productImage`는 상품 이미지로 절대 사용하지 않음
2. 쿠팡 API에서는 affiliateUrl/price/productName만 활용
3. 상품 이미지는 다나와(danawa.com)에서 pcode로 검색하여 `img.danawa.com/prod_img/...` URL을 가져옴
4. 다나와에서도 못 찾으면 네이버 쇼핑 검색 이미지 사용
5. 이미지 URL이 `ads-partners.coupang.com`을 포함하면 자동 FAIL 처리
