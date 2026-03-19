"""컬리 크롤러 (식품/리빙 특화)"""
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None  # type: ignore
    BeautifulSoup = None  # type: ignore

from .utils import get_headers, random_delay, retry, make_product, save_products


def crawl_kurly(keyword: str, budget_min: int, budget_max: int, slug: str) -> list[dict]:
    """컬리 검색 (식품/리빙)"""
    if not requests:
        print("requests 패키지가 필요합니다: pip install requests beautifulsoup4")
        return []

    products = []
    url = f"https://www.kurly.com/search?sword={keyword}"
    print(f"[컬리] 검색: {keyword} ({budget_min}~{budget_max}원)")

    def fetch():
        resp = requests.get(url, headers=get_headers(), timeout=10)
        if resp.status_code in (403, 429):
            print(f"[컬리] {resp.status_code} 응답, 스킵")
            return None
        resp.raise_for_status()
        return resp

    result = retry(fetch)
    if not result:
        print("[컬리] 크롤링 실패, 스킵")
        return []

    try:
        soup = BeautifulSoup(result.text, "html.parser")
        items = soup.select(".product-card, .goods_item, [data-product-id]")[:10]
        rank = 1
        for item in items:
            name_el = item.select_one(".product-name, .goods_name, h3")
            price_el = item.select_one(".product-price, .goods_price, .price")
            if not name_el or not price_el:
                continue
            name = name_el.get_text(strip=True)
            price_text = price_el.get_text(strip=True).replace(",", "").replace("원", "")
            try:
                price = int("".join(filter(str.isdigit, price_text)))
            except ValueError:
                continue
            if budget_min <= price <= budget_max:
                link = item.select_one("a[href]")
                product_url = f"https://www.kurly.com{link['href']}" if link and link.get("href") else url
                products.append(make_product(
                    rank=rank, name=name, brand="", price=price,
                    source="kurly", source_url=product_url, category=keyword,
                ))
                rank += 1
                if rank > 5:
                    break
            random_delay()
    except Exception as e:
        print(f"[컬리] 파싱 오류: {e}")

    if products:
        save_products(f"{slug}-kurly", products)
    return products


if __name__ == "__main__":
    crawl_kurly("선물세트 식품", 15000, 30000, "test-kurly")
