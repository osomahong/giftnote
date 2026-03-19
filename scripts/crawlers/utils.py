"""공통 크롤링 유틸리티"""
import time
import random
import json
import os
from typing import Any

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
]

def get_random_ua() -> str:
    return random.choice(USER_AGENTS)

def get_headers() -> dict[str, str]:
    return {
        "User-Agent": get_random_ua(),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    }

def random_delay(min_sec: float = 2.0, max_sec: float = 5.0) -> None:
    time.sleep(random.uniform(min_sec, max_sec))

def retry(func, max_retries: int = 3, delay: float = 3.0):
    """3회 재시도 데코레이터 역할"""
    for attempt in range(max_retries):
        try:
            return func()
        except Exception as e:
            print(f"  시도 {attempt + 1}/{max_retries} 실패: {e}")
            if attempt < max_retries - 1:
                time.sleep(delay * (attempt + 1))
    return None

def save_products(slug: str, products: list[dict[str, Any]]) -> None:
    output_dir = os.path.join(os.path.dirname(__file__), "../../content/products")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"{slug}.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print(f"저장 완료: {output_path} ({len(products)}개 상품)")

def make_product(
    rank: int,
    name: str,
    brand: str,
    price: int,
    source: str,
    source_url: str,
    category: str,
    original_price: int | None = None,
    discount_rate: int | None = None,
    promotion_end: str | None = None,
    promotion_label: str | None = None,
    image: str = "",
) -> dict[str, Any]:
    """Product 타입에 맞는 기본 딕셔너리 생성"""
    product: dict[str, Any] = {
        "rank": rank,
        "name": name,
        "brand": brand,
        "price": price,
        "source": source,
        "sourceUrl": source_url,
        "affiliateUrl": source_url,
        "image": image,
        "category": category,
        "isEditorPick": rank == 1,
        "reason": "",
        "giftMessage": "",
        "evidence": [],
    }
    if original_price:
        product["originalPrice"] = original_price
    if discount_rate:
        product["discountRate"] = discount_rate
    if promotion_end:
        product["promotionEnd"] = promotion_end
    if promotion_label:
        product["promotionLabel"] = promotion_label
    return product
