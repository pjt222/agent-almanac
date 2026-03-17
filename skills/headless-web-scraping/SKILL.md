---
name: headless-web-scraping
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
  domain: general
  complexity: intermediate
  language: Python
  tags: web-scraping, headless, scrapling, automation, data-extraction
---

# Headless Web Scraping

Extract data from web pages that resist simple HTTP requests — JS-rendered content,
Cloudflare-protected sites, and dynamic SPAs — using scrapling's three-tier fetcher
architecture and CSS-based data extraction.

## When to Use

- Target page requires JavaScript rendering (SPA, React, Vue)
- Site has anti-bot protections (Cloudflare Turnstile, TLS fingerprinting)
- You need structured extraction of multiple elements via CSS selectors
- Simple `WebFetch` or `requests.get()` returns empty or blocked responses
- Extracting tabular data, link lists, or repeated DOM structures at scale

## Inputs

- **Required**: Target URL or list of URLs to scrape
- **Required**: Data to extract (CSS selectors, field names, or description of target elements)
- **Optional**: Fetcher tier override (default: auto-select based on site behavior)
- **Optional**: Output format (default: JSON; alternatives: CSV, Python dict)
- **Optional**: Rate limit delay in seconds (default: 1)

## Procedure

### Step 1: Select Fetcher Tier

Determine which scrapling fetcher matches the target site's defenses.

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

**Expected:** One of the three tiers is identified. For most modern sites, `StealthyFetcher` is the correct starting point.

**On failure:** If all three tiers return blocked responses, check whether the site uses altcha CAPTCHA (proof-of-work challenge that cannot be bypassed). If so, document the limitation and provide manual extraction instructions instead.

### Step 2: Configure the Fetcher

Set up the selected fetcher with appropriate options.

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

**Expected:** Fetcher instance is configured and ready. No errors on instantiation. For `StealthyFetcher` and `DynamicFetcher`, a Chromium binary is available (scrapling manages this automatically on first run).

**On failure:**
- `playwright` or browser binary not found -- run `python -m playwright install chromium`
- Timeout on `configure()` -- increase timeout value or check network connectivity
- Import error -- install scrapling: `pip install scrapling`

### Step 3: Fetch and Extract Data

Navigate to the target URL and extract structured data using CSS selectors.

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

**Expected:** Extracted data matches the visible page content. Elements are non-None and text content is non-empty for populated pages.

**On failure:**
- `find()` returns `None` -- inspect the actual HTML (`response.html_content`) to verify the selector; the page may use different class names than expected
- Empty text from `get_all_text()` -- content may be inside shadow DOM or an iframe; try `DynamicFetcher` with a `wait_selector`
- Do NOT use `.css_first()` -- this is not part of the scrapling API (common confusion with other libraries)

### Step 4: Handle Failures and Edge Cases

Implement fallback logic for CAPTCHA detection, empty responses, and session requirements.

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

**Expected:** Function returns extracted text on success, or `None` with a diagnostic message when all tiers fail. CAPTCHA pages are detected and reported rather than retried indefinitely.

**On failure:**
- All tiers return 403 -- the site blocks all automated access (common with WIPO, TMview, some government databases); document the URL as requiring manual access
- Timeout errors -- the page may be behind a slow CDN; increase timeout to 120s
- Session/cookie errors -- the site may require login; add cookie handling or authenticate first

### Step 5: Rate Limiting and Ethical Scraping

Implement delays and respect site policies before running at scale.

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
2. Use a minimum 1-second delay between requests
3. Identify your scraper with a descriptive User-Agent when possible
4. Do not scrape personal data without legal basis
5. Cache responses locally to avoid redundant requests
6. Stop immediately if you receive a 429 (Too Many Requests)

**Expected:** Scraping runs at a controlled rate. `robots.txt` is checked before bulk operations. No 429 responses are triggered.

**On failure:**
- 429 Too Many Requests -- increase delay to 3-5 seconds, or stop and retry later
- `robots.txt` disallows the path -- respect the directive; do not override it
- IP ban -- stop scraping immediately; the rate limiting was insufficient

## Validation

- [ ] Correct fetcher tier is selected (not over- or under-powered for the target)
- [ ] `configure()` method is used (not deprecated constructor kwargs)
- [ ] CSS selectors match actual page structure (verified against page source)
- [ ] `.find()` / `.find_all()` API is used (not `.css_first()` or other library methods)
- [ ] CAPTCHA detection is in place (altcha pages are reported, not retried)
- [ ] Rate limiting is implemented for multi-URL scraping
- [ ] `robots.txt` is checked before bulk operations
- [ ] Extracted data is non-empty and structurally correct

## Common Pitfalls

- **Using `.css_first()` instead of `.find()`**: scrapling uses `.find()` and `.find_all()` for element selection -- `.css_first()` belongs to a different library and will raise `AttributeError`
- **Starting with DynamicFetcher**: Always try `Fetcher` first, then escalate -- `DynamicFetcher` is 10-50x slower due to full browser startup
- **Constructor kwargs instead of `configure()`**: scrapling v0.4.x deprecated passing options to the constructor; always use the `configure()` method
- **Ignoring altcha CAPTCHA**: No fetcher tier can solve altcha proof-of-work challenges -- detect them early and fall back to manual instructions
- **No rate limiting**: Even if the site does not return 429, aggressive scraping can get your IP banned or cause service degradation
- **Assuming stable selectors**: Website CSS classes change frequently -- validate selectors against current page source before each scraping campaign

## Related Skills

- [use-graphql-api](../use-graphql-api/SKILL.md) -- structured API queries when the site offers a GraphQL endpoint (preferred over scraping)
- [serialize-data-formats](../serialize-data-formats/SKILL.md) -- converting extracted data to JSON, CSV, or other formats
- [deploy-searxng](../deploy-searxng/SKILL.md) -- self-hosted search engine that aggregates results from multiple sources
- [forage-solutions](../forage-solutions/SKILL.md) -- broader pattern for gathering information from diverse sources

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
