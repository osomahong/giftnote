"""네이버 쇼핑 크롤러"""
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None  # type: ignore
    BeautifulSoup = None  # type: ignore

from .utils import get_headers, random_delay, retry, make_product, save_products


def crawl_naver(keyword: str, budget_min: int, budget_max: int, slug: str) -> list[dict]:
    """네이버 쇼핑 검색"""
    if not requests:
        print("requests 패키지가 필요합니다: pip install requests beautifulsoup4")
        return []

    products = []
    url = f"https://search.shopping.naver.com/search/all?query={keyword}&frm=NVSHATC&prevQuery="
    print(f"[네이버] 검색: {keyword} ({budget_min}~{budget_max}원)")

    def fetch():
        resp = requests.get(url, headers=get_headers(), timeout=10)
        resp.raise_for_status()
        return resp

    result = retry(fetch)
    if not result:
        print("[네이버] 크롤링 실패, 스킵")
        return []

    try:
        soup = BeautifulSoup(result.text, "html.parser")
        items = soup.select(".product_item, .basicList_item, [data-nclick]")[:15]
        rank = 1
        for item in items:
            name_el = item.select_one(".product_title, .basicList_title, a[title]")
            price_el = item.select_one(".price_num, .basicList_price, .price")
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
                product_url = link["href"] if link and link.get("href") else url
                products.append(make_product(
                    rank=rank, name=name, brand="", price=price,
                    source="naver", source_url=product_url, category=keyword,
                ))
                rank += 1
                if rank > 5:
                    break
            random_delay()
    except Exception as e:
        print(f"[네이버] 파싱 오류: {e}")

    if products:
        save_products(f"{slug}-naver", products)
    return products


if __name__ == "__main__":
    crawl_naver("독특한 선물 여성", 25000, 40000, "test-naver")
