---
name: rotate-scraping-proxies
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Network-layer escalation for scraping campaigns where client-side stealth has
already been exhausted. Proxy rotation is a last resort, not a default — it is
expensive, ethically charged, and easily misused. This skill teaches when *not*
to use it as much as how to use it well.

## When to Use

- `headless-web-scraping` (Fetcher → StealthyFetcher → DynamicFetcher) has
  been tried and the target still returns 403/429/geo-blocks
- Rate limiting is already at 3+ second intervals and `robots.txt` permits
  the path
- The User-Agent and TLS fingerprint are already realistic (not the default
  `python-requests`)
- Your scraping is legitimate: public data, no auth circumvention, no
  paywall bypass, no personal data harvested without legal basis
- You can budget for proxy traffic and accept the operational complexity

**Do not use** when: a public API exists (use it), the site's ToS forbids
automated access, you would be circumventing geo-licensing, or the goal is
fraud / credential stuffing / sneaker bots / content piracy.

## Inputs

- **Required**: Target URLs and the legal basis for scraping them
- **Required**: Proxy pool credentials (read from environment, never hard-coded)
- **Required**: Pool type — datacenter, residential, or mobile
- **Optional**: Geographic targeting (country / region / city)
- **Optional**: Rotation granularity — per-request (default) or sticky session
- **Optional**: Daily traffic / spend cap
- **Optional**: Rate limit delay in seconds (default: 1, even with rotation)

## Procedure

### Step 1: Pre-flight Legality and Ethics Check

Gate the entire workflow on a documented legal and ethical review. Skipping
this step is the single biggest source of harm.

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

**Expected:** Every question has a defensible written answer. The first "no"
or "unknown" stops the procedure until resolved.

**On failure:**
- ToS forbids automated access — do not proceed; contact the site owner or
  use an official API or licensed dataset instead
- Personal data with no legal basis — do not proceed; engage privacy counsel
- Circumvents auth or geo-licensing — do not proceed under any circumstances

### Step 2: Choose a Pool Type

Different pool types have different cost, detectability, and ethical profiles.
Pick the cheapest tier that actually solves your block.

| Pool type | Detectability | Cost | Best for |
|-----------|---------------|------|----------|
| Datacenter | High (easily blocked by Cloudflare/Akamai) | $ | Sites with no real anti-bot, geo-shifting only |
| Residential | Low (real ISP IPs) | $$$ | Sites that block datacenter ASNs |
| Mobile | Very low (carrier-grade NAT, shared with thousands) | $$$$ | Sites that even block residential (rare) |

**Ethical caveat for residential and mobile:** these pools route your traffic
through real consumer connections. The pool operator's consent model varies —
some pay users, some bundle exit-node consent into "free VPN" EULAs that
users do not read. Prefer providers with audited, opt-in consent. If you
would not be comfortable with a stranger sending your scraping traffic
through your home router, do not send yours through theirs.

**Expected:** A documented choice with the cheapest viable tier and a brief
note on why higher tiers were rejected (or why a higher tier is needed).

**On failure:**
- Datacenter is blocked but residential is over budget — narrow the scope of
  scraping (fewer URLs, slower cadence) before upgrading the tier
- Cannot find a provider with documented opt-in consent — reconsider whether
  the scraping is necessary at all

### Step 3: Integrate Rotation with Scrapling

Wire the proxy into scrapling fetchers. Read credentials from environment
variables — never hard-code, never commit a `.env` to git.

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

**Expected:** Requests succeed and the egress IP varies between calls.
Confirm by hitting an IP-echo endpoint (e.g. `https://api.ipify.org`) before
running the real scrape.

**On failure:**
- 407 Proxy Authentication Required — credentials are wrong or URL-encoding
  of the password broke (re-encode special characters)
- Same IP on every call — provider endpoint may be sticky by default; check
  documentation for a `-rotating` or per-request flag
- Massive latency increase — expected; rotation adds 200–2000ms per request

### Step 4: Sticky Sessions and Pool Health

Decide rotation granularity per workload, then keep the pool healthy.

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

**Expected:** Stateful flows preserve cookies across requests; bulk anonymous
scraping shows IP variance across requests; dead proxies are skipped instead
of looping.

**On failure:**
- Login breaks mid-flow — rotation is happening inside the session; switch
  to sticky-session credentials
- All proxies in sample fail health check — pool is exhausted or credentials
  expired; rotate credentials or contact provider

### Step 5: Monitoring, Cost Control, and Kill Switch

Proxy traffic has a per-GB cost and a per-request cost. Runaway scrapers
generate runaway invoices. Always include limits and an abort.

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

**Expected:** Budget caps trigger before runaway cost. Logs show per-proxy
success rate so a bad egress IP can be identified and excluded.

**On failure:**
- Failure rate climbs above 20% — pause; the site has detected the rotation
  pattern (e.g. all your IPs share a subnet); switch pool type or stop
- Cost-per-record exceeds expectations by 5x — cache aggressively, deduplicate
  URLs, batch where possible

## Validation

- [ ] Step 1 legality check is documented in writing before any code runs
- [ ] No proxy credentials, pool URLs, or session IDs appear in tracked files
      (grep for `gateway.`, `proxy=`, the provider hostname)
- [ ] `.env` (or equivalent) is in `.gitignore`
- [ ] Pool choice is justified: cheapest viable tier, with consent model
      verified for residential/mobile
- [ ] IP variance is confirmed against an echo endpoint before the real run
- [ ] Stateful flows use sticky sessions; bulk anonymous use per-request
- [ ] Budget caps (requests, duration, failures) are wired and tested
- [ ] Rate limiting (≥1s) is preserved — rotation is not an excuse to flood
- [ ] `robots.txt` is still respected — rotation does not override it

## Common Pitfalls

- **Rotating before stealth is exhausted**: the site often does not need a
  new IP — it needs a realistic User-Agent, TLS fingerprint, and slower
  cadence. Try `StealthyFetcher` and rate limiting first; rotation is
  expensive and unethical to deploy unnecessarily.
- **Hard-coded credentials**: pasting the proxy URL into the source file
  leaks it to git, container images, and stack traces. Always read from
  environment variables or a secrets manager.
- **Rotating mid-session**: per-request rotation breaks any flow that
  depends on cookies, CSRF tokens, or shopping-cart state. Use sticky
  sessions for stateful work.
- **Treating rotation as "ethical anonymity"**: rotation hides *you* from
  the target, but it does not make harmful scraping ethical. ToS, copyright,
  privacy law, and rate-limit ethics still apply unchanged.
- **Using residential proxies for high-risk activity**: credential stuffing,
  sneaker botting, geo-pirating streaming content, fraud — explicitly out
  of scope for this skill. If your use case looks like this, stop.
- **Ignoring `robots.txt` because "we have rotation now"**: rotation does
  not grant permission. The directive is the directive.
- **No kill switch**: an unsupervised loop on a metered proxy pool turns
  into a four-figure invoice overnight. Always cap requests, duration, and
  failures.
- **Choosing a residential pool with opaque consent**: some providers
  source exit nodes from "free VPN" EULAs that real users never read. Pay
  the premium for an audited, opt-in consent model.

## Related Skills

- [headless-web-scraping](../headless-web-scraping/SKILL.md) — parent skill;
  always start there. Use this skill only as escalation.
- [use-graphql-api](../use-graphql-api/SKILL.md) — prefer official APIs to
  scraping when one exists.
- [deploy-searxng](../deploy-searxng/SKILL.md) — self-hosted search avoids
  scraping search engines entirely.
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md) — opposite
  network direction (serving instead of fetching), useful neighbor reference.
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — run after
  integrating credentials to confirm none leaked into the repo.

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
