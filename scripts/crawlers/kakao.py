"""카카오 선물하기 크롤러"""
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None  # type: ignore
    BeautifulSoup = None  # type: ignore

from .utils import get_headers, random_delay, retry, make_product, save_products


def crawl_kakao(keyword: str, budget_min: int, budget_max: int, slug: str) -> list[dict]:
    """gift.kakao.com에서 키워드 검색 후 가격 필터링"""
    if not requests:
        print("requests 패키지가 필요합니다: pip install requests beautifulsoup4")
        return []

    products = []
    url = f"https://gift.kakao.com/search/product?query={keyword}"
    print(f"[카카오] 검색: {keyword} ({budget_min}~{budget_max}원)")

    def fetch():
        resp = requests.get(url, headers=get_headers(), timeout=10)
        resp.raise_for_status()
        return resp

    result = retry(fetch)
    if not result:
        print("[카카오] 크롤링 실패, 스킵")
        return []

    try:
        soup = BeautifulSoup(result.text, "html.parser")
        items = soup.select(".product_item, .gift_item, [data-product]")[:10]
        rank = 1
        for item in items:
            name_el = item.select_one(".name, .product_name, h3")
            price_el = item.select_one(".price, .product_price, .amount")
            if not name_el or not price_el:
                continue
            name = name_el.get_text(strip=True)
            price_text = price_el.get_text(strip=True).replace(",", "").replace("원", "")
            try:
                price = int("".join(filter(str.isdigit, price_text)))
            except ValueError:
                continue
            if budget_min <= price <= budget_max:
                products.append(make_product(
                    rank=rank, name=name, brand="", price=price,
                    source="kakao", source_url=url, category=keyword,
                ))
                rank += 1
                if rank > 5:
                    break
            random_delay(1.0, 2.0)
    except Exception as e:
        print(f"[카카오] 파싱 오류: {e}")

    if products:
        save_products(f"{slug}-kakao", products)
    return products


if __name__ == "__main__":
    crawl_kakao("스포츠 선물", 40000, 60000, "test-kakao")
