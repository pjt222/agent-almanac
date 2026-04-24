---
name: headless-web-scraping
locale: wenyan
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

# 無頭網爬

以 scrapling Python 庫取資於抗簡 HTTP 請求之網頁——JS 渲染內容、Cloudflare 保護站、動態 SPA——用其三級抓取架構與 CSS 取資。

## 用時

- 目標頁需 JavaScript 渲染（SPA、React、Vue）
- 站有反機器人保護（Cloudflare Turnstile、TLS 指紋）
- 需以 CSS 選擇器結構化取多元素
- 簡 `WebFetch` 或 `requests.get()` 返空或被阻
- 規模化取表資、鏈列、重 DOM 結構

## 入

- **必要**：目標 URL 或 URL 列
- **必要**：所取資（CSS 選擇器、欄名、或目標元素之述）
- **可選**：抓取級覆寫（默：依站為自擇）
- **可選**：輸出格式（默：JSON；替：CSV、Python 字典）
- **可選**：速限延秒（默：1）

## 法

### 第一步：擇抓取級

定 scrapling 之何抓取合目標站之防禦。

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

**得：** 三級之一已識。多現代站 `StealthyFetcher` 為正始點。

**敗則：** 若三級皆返阻響應，察站是否用 altcha CAPTCHA（工作量證明挑戰不可繞）。若然，記此限並供手取指示代之。

### 第二步：配抓取器

以合適選項設所擇抓取器。

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

**得：** 抓取實例已配可用。實例化無誤。`StealthyFetcher` 與 `DynamicFetcher` 者 Chromium 二進可得（scrapling 首次自動管）。

**敗則：**
- `playwright` 或瀏覽器二進不存——行 `python -m playwright install chromium`
- `configure()` 超時——增超時值或察網通
- 導入誤——裝 scrapling：`pip install scrapling`

### 第三步：抓取並取資

訪目標 URL 並以 CSS 選擇器取結構化資料。

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

**要 API 參考：**

| Method | Purpose |
|--------|---------|
| `response.find("selector")` | First matching element |
| `response.find_all("selector")` | All matching elements |
| `element.get("attr")` | Attribute value (href, src, data-*) |
| `element.get_all_text()` | All text content, recursively |
| `element.html_content` | Raw inner HTML |

**得：** 所取資合可見頁內容。元素非 None，已填頁者文字內容非空。

**敗則：**
- `find()` 返 `None`——察實 HTML（`response.html_content`）驗選擇器；頁或用異類名
- `get_all_text()` 得空文字——內容或於 shadow DOM 或 iframe；試 `DynamicFetcher` 配 `wait_selector`
- 勿用 `.css_first()`——此非 scrapling API（與他庫常混）

### 第四步：處失敗與邊緣

為 CAPTCHA 察、空響、會話需求施備援邏輯。

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

**得：** 函數於成返所取文，或於三級皆敗返 `None` 附診息。CAPTCHA 頁被察並報，非反復重試。

**敗則：**
- 三級皆返 403——站阻所有自動訪（WIPO、TMview、某政府庫常見）；記此 URL 為須手訪
- 超時誤——頁或在慢 CDN 後；增超時至 120s
- 會話/cookie 誤——站或需登入；加 cookie 處理或先認證

### 第五步：速限與倫理爬

行規模前施延並敬站策。

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

**倫理爬清單：**

1. 爬前察 `robots.txt`——敬 `Disallow` 指令
2. 請求間至少一秒延
3. 可則以描述性 User-Agent 識己
4. 無法據勿爬個資
5. 緩響本地避冗請
6. 若得 429（Too Many Requests）立止

**得：** 爬以受控速行。批量前察 `robots.txt`。無 429 響應被觸。

**敗則：**
- 429 Too Many Requests——延增至三至五秒，或止後再試
- `robots.txt` 禁該路——敬之；勿覆
- IP 封——立止爬；速限不足。若訪合法（公資、ToS 允、robots.txt 敬）而須繼，見 [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) 為網層升級

## 驗

- [ ] 正抓取級已擇（非過強過弱）
- [ ] 用 `configure()` 法（非已棄構造 kwargs）
- [ ] CSS 選擇器合實頁結構（對頁源已驗）
- [ ] 用 `.find()` / `.find_all()` API（非 `.css_first()` 或他庫法）
- [ ] CAPTCHA 察已置（altcha 頁報而非重試）
- [ ] 多 URL 爬已施速限
- [ ] 批量前察 `robots.txt`
- [ ] 取資非空且結構正

## 陷

- **用 `.css_first()` 代 `.find()`**：scrapling 用 `.find()` 與 `.find_all()` 選元——`.css_first()` 屬他庫，將拋 `AttributeError`
- **始於 DynamicFetcher**：始終先試 `Fetcher`，再升——`DynamicFetcher` 因全瀏啟而 10-50 倍慢
- **構造 kwargs 代 `configure()`**：scrapling v0.4.x 已棄傳選項於構造；始終用 `configure()` 法
- **忽 altcha CAPTCHA**：無抓取級可解 altcha 工作量證明——早察並退為手指示
- **無速限**：即使站不返 429，猛爬可致 IP 封或服務降
- **設選擇器穩**：網站 CSS 類頻變——每爬前對當前頁源驗選擇器

## 參

- [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) — 客端隱已竭而 IP 封阻合法 ToS 允訪時之網層升
- [use-graphql-api](../use-graphql-api/SKILL.md) — 站有 GraphQL 端點時之結構化 API 查（優於爬）
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — 將所取資轉 JSON、CSV 或他格式
- [deploy-searxng](../deploy-searxng/SKILL.md) — 聚多源結果之自托搜尋引擎
- [forage-solutions](../forage-solutions/SKILL.md) — 自多樣源收資之廣義模

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
