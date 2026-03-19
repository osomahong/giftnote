"""쿠팡 크롤러 + affiliate URL 생성"""
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None  # type: ignore
    BeautifulSoup = None  # type: ignore

from .utils import get_headers, random_delay, retry, make_product, save_products


def crawl_coupang(keyword: str, budget_min: int, budget_max: int, slug: str) -> list[dict]:
    """쿠팡에서 키워드 검색 후 가격 필터링"""
    if not requests:
        print("requests 패키지가 필요합니다: pip install requests beautifulsoup4")
        return []

    products = []
    url = f"https://www.coupang.com/np/search?component=&q={keyword}&channel=user"
    print(f"[쿠팡] 검색: {keyword} ({budget_min}~{budget_max}원)")

    def fetch():
        headers = get_headers()
        headers["Referer"] = "https://www.coupang.com/"
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code in (403, 429):
            print(f"[쿠팡] {resp.status_code} 응답, 스킵")
            return None
        resp.raise_for_status()
        return resp

    result = retry(fetch)
    if not result:
        print("[쿠팡] 크롤링 실패, 스킵")
        return []

    try:
        soup = BeautifulSoup(result.text, "html.parser")
        items = soup.select("li.search-product, .baby-product, [data-product-id]")[:15]
        rank = 1
        for item in items:
            name_el = item.select_one(".name, .descriptions .name, a.search-product-link")
            price_el = item.select_one(".price-value, .base-price")
            if not name_el or not price_el:
                continue
            name = name_el.get_text(strip=True)
            price_text = price_el.get_text(strip=True).replace(",", "")
            try:
                price = int("".join(filter(str.isdigit, price_text)))
            except ValueError:
                continue
            if budget_min <= price <= budget_max:
                link = item.select_one("a[href]")
                product_url = f"https://www.coupang.com{link['href']}" if link and link.get("href") else url
                affiliate_url = f"https://link.coupang.com/re/AFFTDP?lptag=AF0001&pageKey={product_url}"
                product = make_product(
                    rank=rank, name=name, brand="", price=price,
                    source="coupang", source_url=product_url, category=keyword,
                )
                product["affiliateUrl"] = affiliate_url
                products.append(product)
                rank += 1
                if rank > 5:
                    break
            random_delay()
    except Exception as e:
        print(f"[쿠팡] 파싱 오류: {e}")

    if products:
        save_products(f"{slug}-coupang", products)
    return products


if __name__ == "__main__":
    crawl_coupang("스포츠 선물 남성", 40000, 60000, "test-coupang")
