---
name: headless-web-scraping
locale: wenyan-lite
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

# 無頭網頁抓取

以 scrapling 之三層抓取器架構與 CSS 基資料提取自阻簡單 HTTP 請求之網頁——JS 渲染內容、
Cloudflare 保護站與動態 SPA——提取資料。

## 適用時機

- 目標頁需 JavaScript 渲染（SPA、React、Vue）
- 站有反爬保護（Cloudflare Turnstile、TLS 指紋）
- 需經 CSS 選擇器結構化提取多元素
- 簡單 `WebFetch` 或 `requests.get()` 返空或被阻之響應
- 大規模提取表資料、連結列或重複 DOM 結構

## 輸入

- **必要**：目標 URL 或欲抓取之 URL 列表
- **必要**：欲提取之資料（CSS 選擇器、欄位名或目標元素之描述）
- **選擇性**：抓取器層覆寫（預設：依站行為自動選）
- **選擇性**：輸出格式（預設：JSON；替代：CSV、Python dict）
- **選擇性**：秒之速率限延遲（預設：1）

## 步驟

### 步驟一：擇抓取器層

定何 scrapling 抓取器配目標站之防禦。

```python
# 決策矩陣：
# 1. Fetcher        — 靜態 HTML、無 JS、無反爬（最速）
# 2. StealthyFetcher — Cloudflare/Turnstile、TLS 指紋核
# 3. DynamicFetcher  — JS 渲染之 SPA、點擊/滾動互動

# 快速試探：先 Fetcher，失則升級
from scrapling import Fetcher

fetcher = Fetcher()
response = fetcher.get("https://example.com/target-page")

if response.status == 200 and response.get_all_text():
    print("Fetcher tier sufficient")
else:
    print("Escalate to StealthyFetcher or DynamicFetcher")
```

| 訊號 | 建議層 |
|--------|-----------------|
| 靜態 HTML、無保護 | `Fetcher` |
| 403/503、Cloudflare 挑戰頁 | `StealthyFetcher` |
| 頁載但內容區空 | `DynamicFetcher` |
| 需點按鈕或滾動 | `DynamicFetcher` |
| altcha CAPTCHA 存 | 無（不可自動化） |

**預期：** 三層之一已識。對多數現代站，`StealthyFetcher` 為正確起點。

**失敗時：** 若三層皆返阻響應，核站是否用 altcha CAPTCHA（不可繞之工作量證明挑戰）。若然，記限並供手動提取指引。

### 步驟二：配抓取器

以合宜選項設所擇抓取器。

```python
from scrapling import Fetcher, StealthyFetcher, DynamicFetcher

# 層一：以 TLS 指紋假冒之快速 HTTP
fetcher = Fetcher()
fetcher.configure(
    timeout=30,
    retries=3,
    follow_redirects=True
)

# 層二：附反偵測之無頭 Chromium
fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True  # 待所有網路請求定
)

# 層三：完全瀏覽器自動化
fetcher = DynamicFetcher()
fetcher.configure(
    headless=True,
    timeout=90,
    network_idle=True,
    wait_selector="div.results"  # 提取前待特定元素
)
```

**預期：** 抓取器實例已配可用。實例化無錯。`StealthyFetcher` 與 `DynamicFetcher` 須 Chromium 二進制（scrapling 首次執行自動管之）。

**失敗時：**
- `playwright` 或瀏覽器二進制未覓 —— 執行 `python -m playwright install chromium`
- `configure()` 之逾時 —— 增逾時值或核網路連線
- 導入錯 —— 裝 scrapling：`pip install scrapling`

### 步驟三：抓取並提取資料

導至目標 URL 並以 CSS 選擇器提取結構化資料。

```python
# 抓取頁
response = fetcher.get("https://example.com/target-page")

# 單元素提取
title = response.find("h1.page-title")
if title:
    print(title.get_all_text())

# 多元素
items = response.find_all("div.result-item")
for item in items:
    name = item.find("span.name")
    price = item.find("span.price")
    print(f"{name.get_all_text()}: {price.get_all_text()}")

# 取屬性值
links = response.find_all("a.product-link")
urls = [link.get("href") for link in links]

# 取元素之原始 HTML 內容
detail_html = response.find("div.description").html_content
```

**關鍵 API 參考：**

| 方法 | 用途 |
|--------|---------|
| `response.find("selector")` | 首配之元素 |
| `response.find_all("selector")` | 所有配之元素 |
| `element.get("attr")` | 屬性值（href、src、data-*） |
| `element.get_all_text()` | 所有文字內容，遞迴 |
| `element.html_content` | 原始內部 HTML |

**預期：** 所提取資料配可見頁內容。元素非 None，文字內容於有內容頁非空。

**失敗時：**
- `find()` 返 `None` —— 察實際 HTML（`response.html_content`）以驗選擇器；頁或用與預期不同之類名
- `get_all_text()` 空 —— 內容或於 shadow DOM 或 iframe 中；試 `DynamicFetcher` 附 `wait_selector`
- 勿用 `.css_first()` —— 非 scrapling API 之部分（常與他庫混淆）

### 步驟四：處理失敗與邊緣情形

為 CAPTCHA 偵測、空響應與會話需求實退路邏輯。

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

        # 偵測 CAPTCHA / 挑戰頁
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

**預期：** 函數成功時返所提取文字，或於所有層失敗時返 `None` 附診斷訊息。CAPTCHA 頁被偵測並報，非無限重試。

**失敗時：**
- 所有層返 403 —— 站阻所有自動化存取（WIPO、TMview、部分政府資料庫常見）；記此 URL 為需手動存取
- 逾時錯 —— 頁或於慢 CDN 後；增逾時至 120 秒
- 會話/cookie 錯 —— 站或需登入；加 cookie 處理或先認證

### 步驟五：速率限與倫理抓取

大規模執行前實延遲並尊重站之政策。

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

        time.sleep(delay)  # 尊重伺服器

    return results
```

**倫理抓取清單：**

1. 抓取前核 `robots.txt` —— 尊重 `Disallow` 指令
2. 請求間用最少一秒延遲
3. 可能時以描述性 User-Agent 識別抓取器
4. 勿無法律基抓取個資
5. 本地快取響應以避冗請求
6. 收 429（過多請求）即停

**預期：** 抓取於受控速率執行。大量操作前核 `robots.txt`。無 429 響應觸發。

**失敗時：**
- 429 過多請求 —— 增延遲至三至五秒或停後再試
- `robots.txt` 不允路徑 —— 尊重指令；勿覆寫
- IP 封鎖 —— 立即停；速率限不足。若存取合法（公共資料、ToS 允、robots.txt 尊重）且必續，見 [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) 之網路層升級

## 驗證

- [ ] 擇正確抓取器層（不過強亦不過弱）
- [ ] 用 `configure()` 方法（非棄之建構子關鍵字參數）
- [ ] CSS 選擇器配實頁結構（對頁源驗之）
- [ ] 用 `.find()` / `.find_all()` API（非 `.css_first()` 或他庫方法）
- [ ] CAPTCHA 偵測已設（altcha 頁報而非重試）
- [ ] 多 URL 抓取實速率限
- [ ] 大量操作前核 `robots.txt`
- [ ] 所提取資料非空且結構正確

## 常見陷阱

- **用 `.css_first()` 而非 `.find()`**：scrapling 用 `.find()` 與 `.find_all()` 以選元素 —— `.css_first()` 屬他庫，將引 `AttributeError`
- **起於 DynamicFetcher**：永先試 `Fetcher` 再升級 —— `DynamicFetcher` 因完整瀏覽器啟動慢十至五十倍
- **建構子 kwargs 而非 `configure()`**：scrapling v0.4.x 棄傳選項予建構子；永用 `configure()` 方法
- **忽 altcha CAPTCHA**：無抓取器層可解 altcha 工作量證明挑戰 —— 早偵之並退至手動指引
- **無速率限**：即站不返 429，激進抓取可致 IP 封或服務降級
- **假設穩定選擇器**：網站 CSS 類常變 —— 每抓取前驗選擇器於當前頁源

## 相關技能

- [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) —— 客戶端隱身竭且 IP 封阻合法 ToS 允存取時之網路層升級
- [use-graphql-api](../use-graphql-api/SKILL.md) —— 站提供 GraphQL 端點時之結構化 API 查詢（優於抓取）
- [serialize-data-formats](../serialize-data-formats/SKILL.md) —— 將所提取資料轉為 JSON、CSV 或他格式
- [deploy-searxng](../deploy-searxng/SKILL.md) —— 自託搜尋引擎聚合多源結果
- [forage-solutions](../forage-solutions/SKILL.md) —— 自多源收資訊之廣義模式

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
