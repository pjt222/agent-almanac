---
name: headless-web-scraping
locale: caveman-ultra
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

Extract from resistant pages (JS-rendered, Cloudflare, dynamic SPAs) via scrapling 3-tier fetcher + CSS extraction.

## Use When

- JS rendering (SPA, React, Vue)
- Anti-bot (Cloudflare Turnstile, TLS fingerprint)
- Structured multi-element via CSS
- `WebFetch` / `requests.get()` empty or blocked
- Tabular/list/repeated DOM at scale

## In

- **Required**: URL(s)
- **Required**: data to extract (CSS selectors, field names, target desc)
- **Optional**: fetcher tier override (default: auto)
- **Optional**: out format (default JSON; CSV, dict)
- **Optional**: rate limit sec (default 1)

## Do

### Step 1: Select tier

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

→ 1 of 3 tiers. Modern sites → `StealthyFetcher` usual start.

**If err:** all 3 blocked → check altcha CAPTCHA (PoW, cannot bypass). Document limitation + manual extraction.

### Step 2: Configure

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

→ Fetcher configured + ready. No err on init. Stealth/Dynamic → Chromium auto-managed first run.

**If err:**
- `playwright` / browser binary missing → `python -m playwright install chromium`
- `configure()` timeout → increase timeout or check network
- Import err → `pip install scrapling`

### Step 3: Fetch + extract

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

**API ref:**

| Method | Purpose |
|--------|---------|
| `response.find("selector")` | First matching element |
| `response.find_all("selector")` | All matching elements |
| `element.get("attr")` | Attribute value (href, src, data-*) |
| `element.get_all_text()` | All text content, recursively |
| `element.html_content` | Raw inner HTML |

→ Extracted data matches visible content. Non-None elements, non-empty text on populated pages.

**If err:**
- `find()` → `None` → inspect `response.html_content` for actual HTML; selectors may differ
- Empty `get_all_text()` → shadow DOM / iframe → `DynamicFetcher` w/ `wait_selector`
- NO `.css_first()` → not scrapling API (other lib confusion)

### Step 4: Handle failures + edge cases

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

→ Returns text on success, None + diagnostic on fail. CAPTCHA detected + reported not retried.

**If err:**
- All 403 → site blocks all automation (WIPO, TMview, gov DBs). Document as manual access.
- Timeout → slow CDN → increase to 120s.
- Session/cookie errs → login required → add cookie handling / auth.

### Step 5: Rate limit + ethical

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

**Ethical checklist:**

1. `robots.txt` first → respect `Disallow`
2. Min 1-sec delay
3. Descriptive User-Agent
4. No personal data w/o legal basis
5. Cache locally → avoid redundant reqs
6. 429 → stop immediately

→ Controlled rate. `robots.txt` checked pre-bulk. No 429.

**If err:**
- 429 → increase delay 3-5 sec, or stop + retry later
- `robots.txt` disallow → respect, do not override
- IP ban → stop immediately. If legit access (public, ToS-permit, robots-respect) must continue → see `rotate-scraping-proxies` for network-layer escalation

## Check

- [ ] Correct tier (not over/under)
- [ ] `configure()` used (not deprecated constructor kwargs)
- [ ] Selectors match actual structure (verified vs source)
- [ ] `.find()` / `.find_all()` used (not `.css_first()`)
- [ ] CAPTCHA detection (altcha reported, not retried)
- [ ] Rate limit for multi-URL
- [ ] `robots.txt` checked pre-bulk
- [ ] Extracted data non-empty + correct

## Traps

- **`.css_first()` instead `.find()`**: scrapling uses `.find()`/`.find_all()`. `.css_first()` = diff lib → `AttributeError`.
- **Start w/ DynamicFetcher**: try Fetcher first. Dynamic 10-50× slower (full browser startup).
- **Constructor kwargs**: scrapling v0.4.x deprecated → always `configure()`.
- **Ignore altcha**: no tier solves altcha PoW → detect early + fallback manual.
- **No rate limit**: even w/o 429 → IP ban / service degradation.
- **Stable selectors**: CSS changes frequently → validate before each campaign.

## →

- `rotate-scraping-proxies` — network-layer escalation when client-side stealth exhausted
- `use-graphql-api` — GraphQL endpoint > scraping
- `serialize-data-formats` — JSON/CSV conversion
- `deploy-searxng` — self-hosted aggregator
- `forage-solutions` — broader info gathering

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
