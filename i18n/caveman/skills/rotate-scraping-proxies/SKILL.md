---
name: rotate-scraping-proxies
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Escalate blocked scraping campaigns with provider-neutral proxy rotation —
  decide between datacenter, residential, and mobile pools, integrate rotation
  with scrapling, configure session stickiness for stateful flows, monitor
  cost and health, and stay inside legal and ethical boundaries. Use as the
  next step after `headless-web-scraping` client-side stealth (StealthyFetcher,
  rate limiting, robots.txt) is insufficient and traffic is legitimate.
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

Network-layer escalation for scraping when client-side stealth exhausted. Proxy rotation = last resort, not default. Expensive, ethically charged, easily misused. Skill teaches when *not* to use as much as how.

## When Use

- `headless-web-scraping` (Fetcher → StealthyFetcher → DynamicFetcher) tried, target still returns 403/429/geo-blocks
- Rate limit ≥ 3s intervals, `robots.txt` permits path
- User-Agent and TLS fingerprint realistic (not default `python-requests`)
- Scraping legitimate: public data, no auth bypass, no paywall bypass, no personal data without legal basis
- Can budget proxy traffic, accept ops complexity

**Do not use** when: public API exists (use it), ToS forbids automation, would bypass geo-licensing, goal = fraud/credential stuffing/sneaker bots/piracy.

## Inputs

- **Required**: Target URLs, legal basis for scraping
- **Required**: Proxy pool credentials (env, never hard-code)
- **Required**: Pool type — datacenter, residential, mobile
- **Optional**: Geo targeting (country/region/city)
- **Optional**: Rotation granularity — per-request (default) or sticky
- **Optional**: Daily traffic/spend cap
- **Optional**: Rate limit delay (default 1s, even with rotation)

## Steps

### Step 1: Pre-flight Legality and Ethics Check

Gate workflow on documented legal+ethical review. Skip = biggest source of harm.

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

**Got:** Every question has defensible written answer. First "no" or "unknown" stops procedure.

**If fail:**
- ToS forbids automation — stop; contact owner or use API/licensed dataset
- Personal data, no legal basis — stop; engage privacy counsel
- Bypass auth or geo-licensing — never proceed

### Step 2: Choose Pool Type

Different pools = different cost, detectability, ethics. Pick cheapest tier that solves block.

| Pool type | Detectability | Cost | Best for |
|-----------|---------------|------|----------|
| Datacenter | High (easily blocked by Cloudflare/Akamai) | $ | Sites with no real anti-bot, geo-shifting only |
| Residential | Low (real ISP IPs) | $$$ | Sites that block datacenter ASNs |
| Mobile | Very low (carrier-grade NAT, shared with thousands) | $$$$ | Sites that even block residential (rare) |

**Ethical caveat for residential and mobile:** route traffic through real consumer connections. Operator consent model varies — some pay users, some bundle exit-node consent into "free VPN" EULAs users do not read. Prefer providers with audited, opt-in consent. Would not be comfortable with stranger sending scraping traffic through your home router? Do not send yours through theirs.

**Got:** Documented choice with cheapest viable tier, brief note on why higher tiers rejected (or needed).

**If fail:**
- Datacenter blocked, residential over budget — narrow scope (fewer URLs, slower) before upgrade tier
- No provider with documented opt-in consent — reconsider whether scraping necessary

### Step 3: Integrate Rotation with Scrapling

Wire proxy into scrapling fetchers. Read creds from env vars — never hard-code, never commit `.env`.

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

**Got:** Requests succeed, egress IP varies between calls. Hit IP-echo (`https://api.ipify.org`) to confirm before real scrape.

**If fail:**
- 407 Proxy Authentication Required — wrong creds or password URL-encoding broke (re-encode special chars)
- Same IP every call — provider endpoint sticky by default; check docs for `-rotating` or per-request flag
- Massive latency increase — expected; rotation adds 200–2000ms per request

### Step 4: Sticky Sessions and Pool Health

Decide rotation granularity per workload, then keep pool healthy.

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

**Got:** Stateful flows preserve cookies; bulk anonymous shows IP variance; dead proxies skipped not looped.

**If fail:**
- Login breaks mid-flow — rotation inside session; switch to sticky-session creds
- All proxies in sample fail health — pool exhausted or creds expired; rotate creds or contact provider

### Step 5: Monitoring, Cost Control, Kill Switch

Proxy traffic = per-GB + per-request cost. Runaway scrapers = runaway invoices. Always include limits + abort.

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

**Got:** Budget caps trigger before runaway cost. Logs show per-proxy success rate so bad egress IP can be identified, excluded.

**If fail:**
- Failure rate climbs above 20% — pause; site detected rotation pattern (e.g. all IPs share subnet); switch pool type or stop
- Cost-per-record exceeds expectations 5x — cache aggressive, dedupe URLs, batch where possible

## Checks

- [ ] Step 1 legality check documented in writing before code runs
- [ ] No proxy creds, pool URLs, session IDs in tracked files (grep `gateway.`, `proxy=`, provider hostname)
- [ ] `.env` (or equiv) in `.gitignore`
- [ ] Pool choice justified: cheapest viable tier, consent model verified for residential/mobile
- [ ] IP variance confirmed against echo endpoint before real run
- [ ] Stateful flows use sticky sessions; bulk anonymous use per-request
- [ ] Budget caps (requests, duration, failures) wired and tested
- [ ] Rate limit (≥1s) preserved — rotation not excuse to flood
- [ ] `robots.txt` still respected — rotation does not override

## Pitfalls

- **Rotate before stealth exhausted**: site often does not need new IP — needs realistic User-Agent, TLS fingerprint, slower cadence. Try `StealthyFetcher` and rate limit first; rotation expensive, unethical to deploy unnecessarily.
- **Hard-coded creds**: pasting proxy URL into source leaks to git, container images, stack traces. Read from env vars or secrets manager.
- **Rotate mid-session**: per-request rotation breaks any flow with cookies, CSRF, cart state. Use sticky for stateful work.
- **Treat rotation as "ethical anonymity"**: rotation hides *you*, does not make harmful scraping ethical. ToS, copyright, privacy law, rate-limit ethics still apply.
- **Use residential for high-risk activity**: credential stuffing, sneaker bots, geo-pirating streams, fraud — out of scope. Stop if your case looks like this.
- **Ignore `robots.txt` because "we have rotation now"**: rotation does not grant permission. Directive is directive.
- **No kill switch**: unsupervised loop on metered pool = four-figure invoice overnight. Cap requests, duration, failures.
- **Residential pool with opaque consent**: some providers source exit nodes from "free VPN" EULAs real users never read. Pay premium for audited, opt-in consent.

## See Also

- [headless-web-scraping](../headless-web-scraping/SKILL.md) — parent skill; always start there. Use this only as escalation.
- [use-graphql-api](../use-graphql-api/SKILL.md) — prefer official APIs to scraping.
- [deploy-searxng](../deploy-searxng/SKILL.md) — self-hosted search avoids scraping search engines entirely.
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md) — opposite network direction (serving vs fetching), useful neighbor.
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — run after integrating creds to confirm none leaked.

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
