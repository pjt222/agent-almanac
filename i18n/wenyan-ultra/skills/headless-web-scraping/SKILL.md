---
name: headless-web-scraping
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Extract data from web pages using the scrapling Python library — select the
  appropriate fetcher tier (HTTP, stealth Chromium, or full browser automation)
  based on target site defenses, configure headless browsing, and extract
  structured data with CSS selectors. Use when WebFetch is insufficient for
  JS-rendered pages, anti-bot-protected sites, or structured multi-element
  extraction requiring DOM traversal.
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-scraping
  complexity: intermediate
  language: Python
  tags: web-scraping, headless, scrapling, automation, data-extraction
---

# 無頭網抓

由拒簡 HTTP 請求之網頁——JS 渲染、Cloudflare 護、動態 SPA——用 scrapling 三層取器架構與 CSS 析取。

## 用

- 目標頁需 JS 渲（SPA、React、Vue）
- 站有反爬護（Cloudflare Turnstile、TLS 指紋察）
- 需用 CSS 選多元素之結構析取
- 簡單 `WebFetch` 或 `requests.get()` 返空或封
- 大量取表數、鏈列、重複 DOM 構

## 入

- **必**：目標 URL 或列
- **必**：所取之數（CSS 選、欄名或目標元素之描）
- **可**：取器層覆（默：依站動自擇）
- **可**：出格式（默 JSON；替 CSV、Python dict）
- **可**：率限（秒，默 1）

## 行

### 一：擇取器層

定哪 scrapling 取器合目標站之護。

```python
# Decision matrix:
# 1. Fetcher        — static HTML, no JS, no anti-bot (fastest)
# 2. StealthyFetcher — Cloudflare/Turnstile, TLS fingerprint checks
# 3. DynamicFetcher  — JS-rendered SPAs, click/scroll interactions

# Quick probe: try Fetcher first, escalate on failure
from scrapling import Fetcher

fetcher = Fetcher()
response = fetcher.get("https://example.com/target-page")

if response.status == 200 and response.get_all_text():
    print("Fetcher tier sufficient")
else:
    print("Escalate to StealthyFetcher or DynamicFetcher")
```

| Signal | Recommended Tier |
|--------|-----------------|
| Static HTML, no protection | `Fetcher` |
| 403/503, Cloudflare challenge page | `StealthyFetcher` |
| Page loads but content area is empty | `DynamicFetcher` |
| Need to click buttons or scroll | `DynamicFetcher` |
| altcha CAPTCHA present | None (cannot be automated) |

得：三層之一已定。多現代站→`StealthyFetcher` 為正確起點。

敗：三層皆封→察站是否用 altcha CAPTCHA（工作量證明，不可繞）。若然，書限並予手取指示。

### 二：配取器

設所擇取器之合適選項。

```python
from scrapling import Fetcher, StealthyFetcher, DynamicFetcher

# Tier 1: Fast HTTP with TLS fingerprint impersonation
fetcher = Fetcher()
fetcher.configure(
    timeout=30,
    retries=3,
    follow_redirects=True
)

# Tier 2: Headless Chromium with anti-detection
fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True  # wait for all network requests to settle
)

# Tier 3: Full browser automation
fetcher = DynamicFetcher()
fetcher.configure(
    headless=True,
    timeout=90,
    network_idle=True,
    wait_selector="div.results"  # wait for specific element before extracting
)
```

得：取器實例已配備就。實例化無誤。`StealthyFetcher` 與 `DynamicFetcher` 皆有 Chromium 二進制（scrapling 於首行自管）。

敗：
- `playwright` 或瀏覽器二進制缺→行 `python -m playwright install chromium`
- `configure()` 超時→增超時或察網連
- 導入誤→裝 scrapling：`pip install scrapling`

### 三：取頁並析數

導至目標 URL，用 CSS 選析取結構數據。

```python
# Fetch the page
response = fetcher.get("https://example.com/target-page")

# Single element extraction
title = response.find("h1.page-title")
if title:
    print(title.get_all_text())

# Multiple elements
items = response.find_all("div.result-item")
for item in items:
    name = item.find("span.name")
    price = item.find("span.price")
    print(f"{name.get_all_text()}: {price.get_all_text()}")

# Get attribute values
links = response.find_all("a.product-link")
urls = [link.get("href") for link in links]

# Get raw HTML content of an element
detail_html = response.find("div.description").html_content
```

**關鍵 API 參考：**

| Method | Purpose |
|--------|---------|
| `response.find("selector")` | First matching element |
| `response.find_all("selector")` | All matching elements |
| `element.get("attr")` | Attribute value (href, src, data-*) |
| `element.get_all_text()` | All text content, recursively |
| `element.html_content` | Raw inner HTML |

得：所析數符頁之可見內容。元素非 None，文非空（於有內容頁）。

敗：
- `find()` 返 `None`→察實際 HTML（`response.html_content`）驗選。頁或用異類名
- `get_all_text()` 文空→內容或於 shadow DOM 或 iframe；試 `DynamicFetcher` 配 `wait_selector`
- 勿用 `.css_first()`——非 scrapling API（常與他庫混）

### 四：處失敗與邊例

為 CAPTCHA 察、空返、會話需實回退邏輯。

```python
import time

def scrape_with_fallback(url, selector):
    """Try each fetcher tier in order, with CAPTCHA detection."""
    tiers = [
        ("Fetcher", Fetcher),
        ("StealthyFetcher", StealthyFetcher),
        ("DynamicFetcher", DynamicFetcher),
    ]

    for tier_name, tier_class in tiers:
        fetcher = tier_class()
        fetcher.configure(headless=True, timeout=60)

        try:
            response = fetcher.get(url)
        except Exception as error:
            print(f"{tier_name} failed: {error}")
            continue

        # Detect CAPTCHA / challenge pages
        page_text = response.get_all_text().lower()
        if "altcha" in page_text or "proof of work" in page_text:
            print(f"altcha CAPTCHA detected -- cannot automate")
            return None

        if response.status == 403 or response.status == 503:
            print(f"{tier_name} blocked (HTTP {response.status}), escalating")
            continue

        result = response.find(selector)
        if result and result.get_all_text().strip():
            return result.get_all_text()

        print(f"{tier_name} returned empty content, escalating")

    print("All tiers exhausted. Manual extraction required.")
    return None
```

得：函於成返所析文，或於諸層皆敗時返 `None` 含診斷訊。CAPTCHA 頁察並報，非無限重試。

敗：
- 諸層皆 403→站封諸自動訪（WIPO、TMview、某政府庫常）；書 URL 需手訪
- 超時誤→頁或在慢 CDN 後；增超時至 120s
- 會話/cookie 誤→站或需登；加 cookie 處理或先認證

### 五：率限與倫理爬

大規模前實延並敬站策。

```python
import time
import urllib.robotparser

def check_robots_txt(base_url, target_path):
    """Check if scraping is allowed by robots.txt."""
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(f"{base_url}/robots.txt")
    rp.read()
    return rp.can_fetch("*", f"{base_url}{target_path}")

def scrape_urls(urls, selector, delay=1.0):
    """Scrape multiple URLs with rate limiting."""
    results = []
    fetcher = StealthyFetcher()
    fetcher.configure(headless=True, timeout=60)

    for url in urls:
        response = fetcher.get(url)
        data = response.find(selector)
        if data:
            results.append(data.get_all_text())

        time.sleep(delay)  # respect the server

    return results
```

**倫理爬查單：**

1. 爬前察 `robots.txt`——敬 `Disallow` 指令
2. 請求間至少 1 秒延
3. 可時以描述 User-Agent 識爬器
4. 無法據勿爬人資
5. 本地緩以避冗請
6. 受 429（請求過多）→立停

得：爬以控率行。大量前 `robots.txt` 已察。無 429 返現。

敗：
- 429 Too Many Requests→增延至 3-5 秒，或停後試
- `robots.txt` 禁徑→敬指令；勿覆
- IP 禁→即停爬；率限不足。若訪合法（公數、ToS 允、robots.txt 敬）且須續→參 [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) 之網層升級

## 驗

- [ ] 正確取器層已擇（非過強或弱）
- [ ] 用 `configure()` 方法（非棄構造器關鍵字）
- [ ] CSS 選符實頁構（對頁源驗）
- [ ] 用 `.find()`/`.find_all()` API（非 `.css_first()` 或他庫方法）
- [ ] CAPTCHA 察就位（altcha 頁報，非試）
- [ ] 多 URL 爬時率限已實
- [ ] 大量前 `robots.txt` 已察
- [ ] 析數非空且結構正確

## 忌

- **用 `.css_first()` 非 `.find()`**：scrapling 用 `.find()` 與 `.find_all()` 選元素——`.css_first()` 屬他庫，將發 `AttributeError`
- **始於 DynamicFetcher**：恆先試 `Fetcher`，後升級——`DynamicFetcher` 因全瀏啟而 10-50 倍慢
- **用構造器關鍵字非 `configure()`**：scrapling v0.4.x 已棄構造器選；恆用 `configure()`
- **忽 altcha CAPTCHA**：無取器層可解 altcha 工作量證明——早察之並回退手指
- **無率限**：即站不返 429，激爬亦可致 IP 禁或服務退
- **假選器穩**：網站 CSS 類變頻——各爬前對當前頁源驗選

## 參

- [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md)
- [use-graphql-api](../use-graphql-api/SKILL.md)
- [serialize-data-formats](../serialize-data-formats/SKILL.md)
- [deploy-searxng](../deploy-searxng/SKILL.md)
- [forage-solutions](../forage-solutions/SKILL.md)

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
