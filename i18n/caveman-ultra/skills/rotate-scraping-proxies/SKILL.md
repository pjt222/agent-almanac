---
name: rotate-scraping-proxies
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Escalate blocked scrape → proxy rotation. Datacenter|residential|mobile pool, scrapling integ, sticky session, cost+health monitor, legal/ethical bounds. Use → after `headless-web-scraping` client stealth fails + traffic legit.
license: MIT
allowed-tools: Bash Read Write Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-scraping
  complexity: intermediate
  language: Python
  tags: web-scraping, proxies, rotation, residential, scrapling, networking
---

# Rotate Scraping Proxies

Network-layer escalation when client stealth exhausted. Last resort, not default — expensive, ethically charged, easily misused. Skill teaches when *not* to use as much as how.

## Use When

- `headless-web-scraping` (Fetcher → StealthyFetcher → DynamicFetcher) tried + still 403/429/geo-block
- Rate limit ≥3s + `robots.txt` permits
- UA + TLS fingerprint realistic (not default `python-requests`)
- Scrape legit: public data, no auth bypass, no paywall, no personal data w/o legal basis
- Budget for proxy traffic + accept ops complexity

**Don't use** → public API exists, ToS forbids automation, geo-license circumvention, fraud|cred-stuff|sneaker-bot|piracy.

## In

- **Required**: Target URLs + legal basis
- **Required**: Proxy creds (env var, never hard-code)
- **Required**: Pool type — datacenter|residential|mobile
- **Optional**: Geo target (country|region|city)
- **Optional**: Rotation granularity — per-req (default)|sticky session
- **Optional**: Daily traffic|spend cap
- **Optional**: Rate delay s (default 1, even w/ rotation)

## Do

### Step 1: Pre-flight Legality+Ethics

Gate workflow on documented review. Skip = biggest harm source.

```python
# Inputs to confirm before writing any code:
# 1. Is the data public (no login required)?
# 2. Does robots.txt permit the path?
# 3. Does the site's ToS prohibit automated access? (read it)
# 4. Would the scraping process personal data? If yes, what is the legal basis?
# 5. Could this access circumvent geo-licensing, paywalls, or auth?
# 6. Is there a public API or data dump that would make scraping unnecessary?
# 7. Have you contacted the site owner if scope is large?
```

→ Every Q has defensible written ans. First "no"|"unknown" stops proc.

If err:
- ToS forbids → don't proceed; contact owner|use API|licensed dataset
- Personal data no basis → don't proceed; engage privacy counsel
- Auth|geo-license bypass → don't proceed under any circumstances

### Step 2: Pool Type

Diff cost, detect, ethics. Cheapest tier solving block.

| Pool type | Detectability | Cost | Best for |
|-----------|---------------|------|----------|
| Datacenter | High (easily blocked by Cloudflare/Akamai) | $ | Sites with no real anti-bot, geo-shifting only |
| Residential | Low (real ISP IPs) | $$$ | Sites that block datacenter ASNs |
| Mobile | Very low (carrier-grade NAT, shared with thousands) | $$$$ | Sites that even block residential (rare) |

**Ethical caveat residential+mobile**: routes via real consumer connections. Provider consent varies — some pay, some bundle exit-node consent into "free VPN" EULAs unread. Prefer audited opt-in. If wouldn't be comfortable w/ stranger sending scrape via your home router → don't send via theirs.

→ Documented choice + cheapest viable + brief why higher rejected (or needed).

If err:
- Datacenter blocked, residential over budget → narrow scope (fewer URLs, slower) before upgrade
- No documented opt-in consent → reconsider whether scrape needed at all

### Step 3: Integrate Rotation w/ Scrapling

Wire proxy → scrapling fetcher. Read creds from env, never hard-code, never commit `.env`.

```python
import os
import random
from scrapling import Fetcher, StealthyFetcher

# Pattern A: provider-managed rotating endpoint (one URL, provider rotates per request)
PROXY_URL = os.environ["SCRAPING_PROXY_URL"]  # http://user:pass@gateway.example:7777

fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True,
    proxy=PROXY_URL,
)

# Pattern B: explicit pool, rotate yourself
POOL = os.environ["SCRAPING_PROXY_POOL"].split(",")  # comma-separated URLs

def fetch_with_rotation(url):
    proxy = random.choice(POOL)
    fetcher = StealthyFetcher()
    fetcher.configure(headless=True, timeout=60, proxy=proxy)
    return fetcher.get(url)
```

→ Reqs succeed + egress IP varies. Confirm via IP echo (`https://api.ipify.org`) before real scrape.

If err:
- 407 Proxy Auth Required → wrong creds|URL-encoding broke pwd (re-encode special chars)
- Same IP every call → endpoint sticky default; check docs for `-rotating` or per-req flag
- Massive latency → expected; rotation adds 200–2000ms/req

### Step 4: Sticky Sessions + Pool Health

Granularity per workload + keep pool healthy.

```python
# Sticky session for stateful flows (login, multi-page checkout-like crawls)
# Most providers expose a session ID via the username:
#   user-session-abc123:pass@gateway.example:7777
# All requests with the same session ID exit through the same IP for ~10 min.

# Per-request rotation for anonymous bulk scraping (default)

# Pool health check — call before bulk run
def check_pool(pool, sample_size=5):
    sample = random.sample(pool, min(sample_size, len(pool)))
    alive = []
    for proxy in sample:
        try:
            r = StealthyFetcher().configure(proxy=proxy, timeout=10).get(
                "https://api.ipify.org"
            )
            if r.status == 200:
                alive.append(proxy)
        except Exception:
            pass
    return alive

# Backoff on transient proxy failures
def fetch_with_backoff(url, max_attempts=3):
    for attempt in range(max_attempts):
        try:
            r = fetch_with_rotation(url)
            if r.status not in (407, 502, 503):
                return r
        except Exception:
            pass
        time.sleep(2 ** attempt)
    return None
```

→ Stateful preserves cookies; bulk shows IP variance; dead proxies skipped not looped.

If err:
- Login breaks mid-flow → rotating in session; switch to sticky-session creds
- All sample fail health → pool exhausted|creds expired; rotate|contact provider

### Step 5: Monitor + Cost + Kill Switch

Per-GB + per-req cost. Runaway scrape → runaway invoice. Always cap+abort.

```python
import time

class ScrapeBudget:
    def __init__(self, max_requests, max_duration_seconds, max_failures):
        self.max_requests = max_requests
        self.max_duration = max_duration_seconds
        self.max_failures = max_failures
        self.requests = 0
        self.failures = 0
        self.start = time.monotonic()

    def allow(self):
        if self.requests >= self.max_requests:
            return False, "request cap reached"
        if time.monotonic() - self.start >= self.max_duration:
            return False, "time cap reached"
        if self.failures >= self.max_failures:
            return False, "failure cap reached (circuit breaker)"
        return True, None

    def record(self, success):
        self.requests += 1
        if not success:
            self.failures += 1

budget = ScrapeBudget(max_requests=1000, max_duration_seconds=3600, max_failures=20)

for url in target_urls:
    ok, reason = budget.allow()
    if not ok:
        print(f"Aborting: {reason}")
        break
    response = fetch_with_backoff(url)
    budget.record(success=response is not None)
    time.sleep(1)  # rate limiting still applies even with rotation
```

→ Caps trigger before runaway. Logs show per-proxy success → identify+exclude bad IP.

If err:
- Fail rate >20% → pause; site detected pattern (shared subnet); switch type|stop
- Cost-per-record 5x → cache, dedup URLs, batch

## Check

- [ ] Step 1 legality documented written before code
- [ ] No proxy creds|pool URLs|session IDs in tracked files (grep `gateway.`, `proxy=`, hostname)
- [ ] `.env` in `.gitignore`
- [ ] Pool justified: cheapest viable + consent verified for residential|mobile
- [ ] IP variance confirmed vs echo before real run
- [ ] Stateful → sticky; bulk → per-req
- [ ] Budget caps (req|dur|fail) wired+tested
- [ ] Rate limit (≥1s) preserved — rotation ≠ flood excuse
- [ ] `robots.txt` respected — rotation doesn't override

## Traps

- **Rotate before stealth exhausted**: Site needs realistic UA, TLS, slower cadence — not new IP. Try `StealthyFetcher`+rate first.
- **Hard-coded creds**: Source file leaks → git, images, traces. Always env|secrets manager.
- **Rotate mid-session**: Per-req breaks cookies|CSRF|cart. Sticky for stateful.
- **"Ethical anonymity" myth**: Rotation hides *you* from target → doesn't make harmful scrape ethical. ToS, copyright, privacy law, rate-ethics still apply.
- **Residential for high-risk**: Cred stuff, sneaker, geo-pirate, fraud → out of scope. Stop.
- **Ignore `robots.txt` because rotation**: Doesn't grant permission. Directive=directive.
- **No kill switch**: Unsupervised loop on metered pool → 4-figure invoice overnight. Always cap.
- **Opaque consent residential**: Some src exit nodes from "free VPN" EULAs unread. Pay premium for audited opt-in.

## →

- [headless-web-scraping](../headless-web-scraping/SKILL.md) — parent; always start there
- [use-graphql-api](../use-graphql-api/SKILL.md) — prefer official APIs
- [deploy-searxng](../deploy-searxng/SKILL.md) — self-host search → no scrape
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md) — opposite direction reference
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — run after creds → confirm no leak

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
