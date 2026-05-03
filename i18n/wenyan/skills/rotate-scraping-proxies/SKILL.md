---
name: rotate-scraping-proxies
locale: wenyan
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

# 輪轉爬蟲代理

爬蟲被阻而客戶端隱身已盡，乃以網層之代理輪轉升而圖之。輪轉者，末路之計，非默用也——其費高、其德有疵、易為惡用。此技教其*不*用之時，與其善用之法。

## 用時

- `headless-web-scraping`（Fetcher → StealthyFetcher → DynamicFetcher）已試，目標仍返 403/429/地阻乃用
- 速限已至三秒以上，且 `robots.txt` 許其徑乃用
- User-Agent 與 TLS 指紋已合實（非默之 `python-requests`）乃用
- 爬之合法：公開之數、無越權、無越牆、無無據而採人之數乃用
- 可預其代理之費，能受其運之繁乃用

**勿用**之時：有公 API（用之）、站之 ToS 禁自動之訪、欲越地之授、欲行詐/憑據塞/球鞋搶/盜版者。

## 入

- **必要**：目標網址與爬之之法依
- **必要**：代理池之憑據（自環境讀，勿硬編）
- **必要**：池之類——數據中心、住宅、或行動
- **可選**：地之鎖（國/區/市）
- **可選**：輪轉之粒度——每請（默）或粘性會話
- **可選**：日流量/支出之限
- **可選**：速限之延（默：1，雖輪轉亦然）

## 法

### 第一步：飛前合法與德之察

全程繫於書面之法德審。略此者，害之最大源也。

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

得：每問皆有可辯之書答。一遇「否」或「未知」則止，俟其解。

敗則：
- ToS 禁自動訪——勿進；聯站主，或用官 API 或許可之數
- 採個資而無法依——勿進；請隱私律師
- 越權或越地之授——無論如何不進

### 第二步：擇池類

各池類之費、可察、德之屬皆異。擇能解阻之最廉者。

| 池類 | 可察 | 費 | 宜於 |
|-----------|---------------|------|----------|
| 數據中心 | 高（Cloudflare/Akamai 易阻） | $ | 無真正反爬之站，唯地遷 |
| 住宅 | 低（真 ISP 之 IP） | $$$ | 阻數據中心 ASN 之站 |
| 行動 | 極低（運營商級 NAT，與千者共） | $$$$ | 連住宅亦阻（罕） |

**住宅與行動之德戒**：此池借真消費者之網以行汝之流量。池運營者之同意之模有異——或付用者，或將出口節點之同意捆於「免費 VPN」之 EULA 中，用者未嘗讀也。宜擇有審計、明選之同意之供者。若汝不願陌人由汝家路由送其爬流，則勿令汝之流經他人之路由。

得：書面之擇——可行之最廉等，附簡注述高等何以拒（或何以需高等）。

敗則：
- 數據中心被阻而住宅超預算——先縮爬之範（少網址、慢頻），再升等
- 不能得有書面選入同意之供者——再思爬之是否必要

### 第三步：以 Scrapling 集輪轉

代理裝入 scrapling 之取者。憑據自環境變量讀——勿硬編，勿提交 `.env` 入 git。

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

得：諸請皆成，出口之 IP 每呼有變。實爬之前，擊一 IP 回響之點（如 `https://api.ipify.org`）以驗。

敗則：
- 407 Proxy Authentication Required——憑據誤，或密碼之 URL 編碼破（特字再編）
- 每呼皆同 IP——供者之點或默為粘性；查其文檔以求 `-rotating` 或每請之旗
- 延巨增——預期也；輪轉每請增 200–2000ms

### 第四步：粘性會話與池之健

依所為擇輪轉之粒度，後守池之健。

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

得：有狀之流跨請保 cookie；匿名之大爬諸請示 IP 之變；死代理略而不循環。

敗則：
- 登錄中途斷——輪轉發於會話內；改用粘性會話之憑據
- 樣本中諸代理皆健察敗——池竭或憑據過期；輪換憑據或聯供者

### 第五步：監察、控費、與斷閘

代理之流量有每 GB 之費與每請之費。失控之爬，致失控之賬。必含限與斷。

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

得：預算之限觸於失控之費前。日誌示每代理之成率，惡之出口 IP 可識而排。

敗則：
- 敗率過 20%——暫停；站已察輪轉之模（如諸 IP 共子網）；換池類或止之
- 每錄之費五倍於預期——力快取、去重、可批則批

## 驗

- [ ] 第一步合法察於行碼前以書記之
- [ ] 無代理憑據、池網址、會話 ID 入追蹤之文件（grep `gateway.`、`proxy=`、供者主機名）
- [ ] `.env`（或等者）入 `.gitignore`
- [ ] 池之擇有理：可行之最廉等，住宅/行動之同意之模已驗
- [ ] IP 之變於回響之點驗於實爬前
- [ ] 有狀之流用粘性會話；匿名大爬用每請輪轉
- [ ] 預算之限（請數、時、敗）已裝且試
- [ ] 速限（≥1s）仍存——輪轉非洪爬之藉
- [ ] `robots.txt` 仍守——輪轉不能凌之

## 陷

- **隱身未盡而輪轉**：站常不需新 IP——需實之 User-Agent、TLS 指紋、慢頻。先試 `StealthyFetcher` 與速限；輪轉費高而德疵，無故勿施
- **硬編憑據**：粘代理 URL 入源，洩於 git、容器之像、棧之蹤。必自環境變量或秘密管理者讀
- **會話中輪轉**：每請輪轉破依 cookie、CSRF 令、購物車狀者之流。有狀之務用粘性會話
- **視輪轉為「德之匿」**：輪轉藏*汝*於目標，然不能化害爬為德爬。ToS、版權、隱私律、速限德皆不變
- **以住宅代理為高險之為**：憑據塞、球鞋搶、地盜流、詐——明出此技之外。汝之用例若似之，則止
- **以「今有輪轉」忽 `robots.txt`**：輪轉不授許可。其令即令也
- **無斷閘**：無監之循環於計費之代理池，一夜成四位之賬。必限請數、時、敗
- **擇住宅池而同意不明**：某供自「免費 VPN」之 EULA 取出口節點，真用者未嘗讀。寧付溢價以求審計、明選之同意之模

## 參

- [headless-web-scraping](../headless-web-scraping/SKILL.md) — 父技；必先始於此。此技唯為升級之計
- [use-graphql-api](../use-graphql-api/SKILL.md) — 有官 API 則勝爬
- [deploy-searxng](../deploy-searxng/SKILL.md) — 自宿之搜免爬搜引擎
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md) — 反向之網（供而非取），鄰參之用
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — 集憑據後行之，驗無洩入庫

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
