---
name: feedback_crawling_rule
description: 콘텐츠 생성 시 반드시 크롤링으로 실제 상품 정보/이미지를 가져와야 함. 블라인드는 SNS가 아님.
type: feedback
---

콘텐츠 작성 시 상품 정보를 직접 작성하지 말 것. 반드시 크롤링으로 실제 상품 정보(이름, 가격, 이미지 URL, 브랜드)를 가져와서 반영해야 한다.

**Why:** placeholder 데이터로 작성하면 이미지가 빠지고, 가격/상품명이 실제와 다를 수 있어서 콘텐츠 신뢰도가 떨어진다.

**How to apply:** gift-orchestrator 파이프라인에서 gift-crawl-products 단계를 절대 건너뛰지 말 것. 상품 sourceUrl, affiliateUrl, image 모두 실제 URL이어야 한다.

---

블라인드(Blind)는 SNS로 취급하지 않는다. 직장인 커뮤니티 앱이다. evidence에서 블라인드를 출처로 사용할 때 type은 "community"로 분류한다.

**Why:** 블라인드는 익명 직장인 커뮤니티이지 소셜 미디어가 아니다.

**How to apply:** evidence 작성 시 블라인드 출처는 type: "community", source: "블라인드"로 표기.
