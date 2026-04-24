---
name: headless-web-scraping
locale: caveman
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

# Headless Web Scraping

Extract data from web pages that resist simple HTTP requests — JS-rendered content, Cloudflare-protected sites, dynamic SPAs — using scrapling three-tier fetcher architecture + CSS-based data extraction.

## When Use

- Target page needs JavaScript rendering (SPA, React, Vue)
- Site has anti-bot protections (Cloudflare Turnstile, TLS fingerprinting)
- Need structured extraction of multiple elements via CSS selectors
- Simple `WebFetch` or `requests.get()` returns empty or blocked responses
- Extract tabular data, link lists, repeated DOM structures at scale

## Inputs

- **Required**: Target URL or list of URLs to scrape
- **Required**: Data to extract (CSS selectors, field names, description of target elements)
- **Optional**: Fetcher tier override (default: auto-select based on site behavior)
- **Optional**: Output format (default: JSON; alternatives: CSV, Python dict)
- **Optional**: Rate limit delay in seconds (default: 1)

## Steps

### Step 1: Pick Fetcher Tier

Find which scrapling fetcher matches target site defenses.

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
| Page loads but content area empty | `DynamicFetcher` |
| Need to click buttons or scroll | `DynamicFetcher` |
| altcha CAPTCHA present | None (cannot be automated) |

**Got:** One of three tiers identified. Most modern sites → `StealthyFetcher` correct starting point.

**If fail:** All three tiers return blocked responses? Check if site uses altcha CAPTCHA (proof-of-work challenge can't be bypassed). If so, document limitation + provide manual extraction instructions.

### Step 2: Configure Fetcher

Set up selected fetcher with appropriate options.

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

**Got:** Fetcher instance configured + ready. No errors on instantiation. `StealthyFetcher` + `DynamicFetcher` → Chromium binary available (scrapling manages this automatically on first run).

**If fail:**
- `playwright` or browser binary not found -- run `python -m playwright install chromium`
- Timeout on `configure()` -- increase timeout value or check network connectivity
- Import error -- install scrapling: `pip install scrapling`

### Step 3: Fetch + Extract Data

Navigate to target URL + extract structured data with CSS selectors.

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

**Key API reference:**

| Method | Purpose |
|--------|---------|
| `response.find("selector")` | First matching element |
| `response.find_all("selector")` | All matching elements |
| `element.get("attr")` | Attribute value (href, src, data-*) |
| `element.get_all_text()` | All text content, recursively |
| `element.html_content` | Raw inner HTML |

**Got:** Extracted data matches visible page content. Elements non-None + text content non-empty for populated pages.

**If fail:**
- `find()` returns `None` -- inspect actual HTML (`response.html_content`) to verify selector; page may use different class names than expected
- Empty text from `get_all_text()` -- content may be inside shadow DOM or iframe; try `DynamicFetcher` with `wait_selector`
- Do NOT use `.css_first()` -- not part of scrapling API (common confusion with other libraries)

### Step 4: Handle Failures + Edge Cases

Implement fallback logic for CAPTCHA detection, empty responses, session requirements.

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

**Got:** Function returns extracted text on success, or `None` with diagnostic message when all tiers fail. CAPTCHA pages detected + reported not retried indefinitely.

**If fail:**
- All tiers return 403 -- site blocks all automated access (common with WIPO, TMview, some government databases); document URL as needs manual access
- Timeout errors -- page may be behind slow CDN; increase timeout to 120s
- Session/cookie errors -- site may need login; add cookie handling or authenticate first

### Step 5: Rate Limiting + Ethical Scraping

Implement delays + respect site policies before running at scale.

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

**Ethical scraping checklist:**

1. Check `robots.txt` before scraping -- respect `Disallow` directives
2. Use min 1-second delay between requests
3. Identify scraper with descriptive User-Agent when possible
4. Do not scrape personal data without legal basis
5. Cache responses locally to avoid redundant requests
6. Stop immediately on 429 (Too Many Requests)

**Got:** Scraping runs at controlled rate. `robots.txt` checked before bulk operations. No 429 responses triggered.

**If fail:**
- 429 Too Many Requests -- increase delay to 3-5 seconds, or stop + retry later
- `robots.txt` disallows path -- respect directive; do not override
- IP ban -- stop scraping immediately; rate limiting insufficient. Access legitimate (public data, ToS-permitted, robots.txt-respected) + must continue → see [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) for network-layer escalation

## Checks

- [ ] Correct fetcher tier selected (not over- or under-powered for target)
- [ ] `configure()` method used (not deprecated constructor kwargs)
- [ ] CSS selectors match actual page structure (verified against page source)
- [ ] `.find()` / `.find_all()` API used (not `.css_first()` or other library methods)
- [ ] CAPTCHA detection in place (altcha pages reported, not retried)
- [ ] Rate limiting implemented for multi-URL scraping
- [ ] `robots.txt` checked before bulk operations
- [ ] Extracted data non-empty + structurally correct

## Pitfalls

- **Using `.css_first()` instead of `.find()`**: scrapling uses `.find()` + `.find_all()` for element selection -- `.css_first()` belongs to different library, raises `AttributeError`
- **Starting with DynamicFetcher**: Always try `Fetcher` first, then escalate -- `DynamicFetcher` 10-50x slower due to full browser startup
- **Constructor kwargs instead of `configure()`**: scrapling v0.4.x deprecated passing options to constructor; always use `configure()` method
- **Ignoring altcha CAPTCHA**: No fetcher tier can solve altcha proof-of-work challenges -- detect early + fall back to manual instructions
- **No rate limiting**: Even if site does not return 429, aggressive scraping can get IP banned or cause service degradation
- **Assuming stable selectors**: Website CSS classes change frequent -- validate selectors against current page source before each scraping campaign

## See Also

- [rotate-scraping-proxies](../rotate-scraping-proxies/SKILL.md) -- network-layer escalation when client-side stealth exhausted + IP bans block legitimate, ToS-permitted access
- [use-graphql-api](../use-graphql-api/SKILL.md) -- structured API queries when site offers GraphQL endpoint (preferred over scraping)
- [serialize-data-formats](../serialize-data-formats/SKILL.md) -- convert extracted data to JSON, CSV, or other formats
- [deploy-searxng](../deploy-searxng/SKILL.md) -- self-hosted search engine aggregates results from multiple sources
- [forage-solutions](../forage-solutions/SKILL.md) -- broader pattern for gathering information from diverse sources

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
