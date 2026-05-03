---
name: headless-web-scraping
description: >
  使用 scrapling Python 库从网页提取数据 —— 根据目标网站防御选择适当的
  fetcher 层（HTTP、stealth Chromium 或完整浏览器自动化）、配置无头浏览，
  并使用 CSS 选择器提取结构化数据。当 WebFetch 不足以应对 JS 渲染页面、
  反机器人保护的站点，或需要 DOM 遍历的结构化多元素提取时使用。
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-scraping
  complexity: intermediate
  language: Python
  tags: web-scraping, headless, scrapling, automation, data-extraction
  locale: zh-CN
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# 无头网页抓取

使用 scrapling 的三层 fetcher 架构和基于 CSS 的数据提取，从抗拒简单 HTTP 请求的网页 —— JS 渲染内容、Cloudflare 保护的站点和动态 SPA —— 提取数据。

## 适用场景

- 目标页面需要 JavaScript 渲染（SPA、React、Vue）
- 站点有反机器人保护（Cloudflare Turnstile、TLS 指纹）
- 您需要通过 CSS 选择器结构化提取多个元素
- 简单的 `WebFetch` 或 `requests.get()` 返回空或被阻止的响应
- 大规模提取表格数据、链接列表或重复 DOM 结构

## 输入

- **必需**：要抓取的目标 URL 或 URL 列表
- **必需**：要提取的数据（CSS 选择器、字段名或目标元素描述）
- **可选**：Fetcher 层覆盖（默认：根据站点行为自动选择）
- **可选**：输出格式（默认：JSON；备选：CSV、Python 字典）
- **可选**：请求间速率限制延迟（秒）（默认：1）

## 步骤

### 第 1 步：选择 Fetcher 层

确定哪个 scrapling fetcher 匹配目标站点的防御。

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

| 信号 | 推荐层 |
|--------|-----------------|
| 静态 HTML、无保护 | `Fetcher` |
| 403/503、Cloudflare 挑战页 | `StealthyFetcher` |
| 页面加载但内容区为空 | `DynamicFetcher` |
| 需要点击按钮或滚动 | `DynamicFetcher` |
| 存在 altcha CAPTCHA | 无（无法自动化） |

**预期结果：** 识别三层之一。对大多数现代站点，`StealthyFetcher` 是正确起点。

**失败处理：** 若所有三层都返回被阻止响应，检查站点是否使用 altcha CAPTCHA（无法绕过的工作量证明挑战）。若是，记录限制并改为提供手动提取说明。

### 第 2 步：配置 Fetcher

用适当选项设置选定的 fetcher。

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

**预期结果：** Fetcher 实例已配置并就绪。实例化时无错误。对 `StealthyFetcher` 和 `DynamicFetcher`，Chromium 二进制可用（scrapling 在首次运行时自动管理）。

**失败处理：**
- `playwright` 或浏览器二进制未找到 —— 运行 `python -m playwright install chromium`
- `configure()` 上超时 —— 增加超时值或检查网络连接
- 导入错误 —— 安装 scrapling：`pip install scrapling`

### 第 3 步：获取并提取数据

导航到目标 URL 并使用 CSS 选择器提取结构化数据。

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

**关键 API 参考：**

| 方法 | 用途 |
|--------|---------|
| `response.find("selector")` | 第一个匹配元素 |
| `response.find_all("selector")` | 所有匹配元素 |
| `element.get("attr")` | 属性值（href、src、data-*） |
| `element.get_all_text()` | 所有文本内容，递归 |
| `element.html_content` | 原始内部 HTML |

**预期结果：** 提取的数据匹配可见页面内容。元素非 None，文本内容对填充页面非空。

**失败处理：**
- `find()` 返回 `None` —— 检查实际 HTML（`response.html_content`）以验证选择器；页面可能使用与预期不同的类名
- `get_all_text()` 文本为空 —— 内容可能在 shadow DOM 或 iframe 中；尝试带 `wait_selector` 的 `DynamicFetcher`
- 不要使用 `.css_first()` —— 这不是 scrapling API 的一部分（与其他库的常见混淆）

### 第 4 步：处理失败和边界情况

为 CAPTCHA 检测、空响应和会话要求实现回退逻辑。

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

**预期结果：** 函数在成功时返回提取的文本，或在所有层失败时返回带诊断消息的 `None`。CAPTCHA 页被检测并报告，而非无限重试。

**失败处理：**
- 所有层返回 403 —— 站点阻止所有自动访问（WIPO、TMview、某些政府数据库常见）；将 URL 记录为需要手动访问
- 超时错误 —— 页面可能在缓慢的 CDN 后；将超时增加到 120s
- 会话/Cookie 错误 —— 站点可能需要登录；添加 cookie 处理或先认证

### 第 5 步：速率限制和道德抓取

在大规模运行前实现延迟并尊重站点政策。

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

**道德抓取检查清单：**

1. 在抓取前检查 `robots.txt` —— 尊重 `Disallow` 指令
2. 在请求间使用最少 1 秒延迟
3. 在可能时用描述性 User-Agent 标识您的抓取器
4. 不要在无法律基础下抓取个人数据
5. 在本地缓存响应以避免冗余请求
6. 收到 429（请求过多）时立即停止

**预期结果：** 抓取以受控速率运行。在批量操作前检查 `robots.txt`。未触发 429 响应。

**失败处理：**
- 429 请求过多 —— 将延迟增加到 3-5 秒，或停止稍后重试
- `robots.txt` 不允许路径 —— 尊重指令；不要覆盖
- IP 禁令 —— 立即停止抓取；速率限制不足。若访问合法（公开数据、ToS 允许、尊重 robots.txt）且您必须继续，参见 [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) 进行网络层升级

## 验证清单

- [ ] 选择正确的 fetcher 层（对目标既不过强也不过弱）
- [ ] 使用 `configure()` 方法（非已弃用的构造函数 kwargs）
- [ ] CSS 选择器匹配实际页面结构（对照页面源验证）
- [ ] 使用 `.find()` / `.find_all()` API（非 `.css_first()` 或其他库方法）
- [ ] CAPTCHA 检测就位（altcha 页被报告，非重试）
- [ ] 为多 URL 抓取实现速率限制
- [ ] 在批量操作前检查 `robots.txt`
- [ ] 提取的数据非空且结构正确

## 常见问题

- **使用 `.css_first()` 而非 `.find()`**：scrapling 使用 `.find()` 和 `.find_all()` 进行元素选择 —— `.css_first()` 属于不同库且会引发 `AttributeError`
- **从 DynamicFetcher 开始**：始终先尝试 `Fetcher`，再升级 —— `DynamicFetcher` 因完整浏览器启动慢 10-50 倍
- **构造函数 kwargs 而非 `configure()`**：scrapling v0.4.x 弃用了向构造函数传递选项；始终使用 `configure()` 方法
- **忽略 altcha CAPTCHA**：没有 fetcher 层能解决 altcha 工作量证明挑战 —— 早期检测它们并回退到手动指令
- **无速率限制**：即使站点不返回 429，激进抓取也可能让您的 IP 被禁或导致服务降级
- **假设稳定的选择器**：网站 CSS 类经常变化 —— 在每次抓取活动前对照当前页面源验证选择器

## 相关技能

- [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) —— 当客户端隐身耗尽且 IP 禁令阻止合法、ToS 允许的访问时进行网络层升级
- [use-graphql-api](../use-graphql-api/SKILL.md) —— 当站点提供 GraphQL 端点时进行结构化 API 查询（优于抓取）
- [serialize-data-formats](../serialize-data-formats/SKILL.md) —— 将提取的数据转换为 JSON、CSV 或其他格式
- [deploy-searxng](../deploy-searxng/SKILL.md) —— 自托管搜索引擎，聚合多源结果
- [forage-solutions](../forage-solutions/SKILL.md) —— 从多源收集信息的更广模式

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
