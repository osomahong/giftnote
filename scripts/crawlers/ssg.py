"""SSG 크롤러 (백화점 브랜드 특화)"""
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    requests = None  # type: ignore
    BeautifulSoup = None  # type: ignore

from .utils import get_headers, random_delay, retry, make_product, save_products


def crawl_ssg(keyword: str, budget_min: int, budget_max: int, slug: str) -> list[dict]:
    """SSG 검색 (백화점 브랜드)"""
    if not requests:
        print("requests 패키지가 필요합니다: pip install requests beautifulsoup4")
        return []

    products = []
    url = f"https://www.ssg.com/search.ssg?query={keyword}"
    print(f"[SSG] 검색: {keyword} ({budget_min}~{budget_max}원)")

    def fetch():
        resp = requests.get(url, headers=get_headers(), timeout=10)
        if resp.status_code in (403, 429):
            print(f"[SSG] {resp.status_code} 응답, 스킵")
            return None
        resp.raise_for_status()
        return resp

    result = retry(fetch)
    if not result:
        print("[SSG] 크롤링 실패, 스킵")
        return []

    try:
        soup = BeautifulSoup(result.text, "html.parser")
        items = soup.select(".cunit_prod, .product_item, [data-click-area]")[:10]
        rank = 1
        for item in items:
            name_el = item.select_one(".cunit_info .title, .product_name, em.tx_ko")
            price_el = item.select_one(".cunit_price .ssg_price, .product_price, em.ssg_price")
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
                product_url = link["href"] if link and link.get("href") and link["href"].startswith("http") else url
                products.append(make_product(
                    rank=rank, name=name, brand="", price=price,
                    source="ssg", source_url=product_url, category=keyword,
                ))
                rank += 1
                if rank > 5:
                    break
            random_delay()
    except Exception as e:
        print(f"[SSG] 파싱 오류: {e}")

    if products:
        save_products(f"{slug}-ssg", products)
    return products


if __name__ == "__main__":
    crawl_ssg("집들이 선물", 15000, 30000, "test-ssg")
