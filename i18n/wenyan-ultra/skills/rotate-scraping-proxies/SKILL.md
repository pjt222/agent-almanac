---
name: rotate-scraping-proxies
locale: wenyan-ultra
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

# 輪代

擷阻時代之輪。末計也，貴、難、易誤用。教知不用之時亦如善用。

## 用

- `headless-web-scraping`（Fetcher → StealthyFetcher → DynamicFetcher）已試而仍 403/429/地阻→用
- 限速已 ≥ 3 秒、`robots.txt` 許→用
- UA、TLS 印已逼真→用
- 擷合法：公訊、無破權、無越牆、無私訊→用
- 可承代費與運繁→用

**勿用**：公 API 存（用之）、ToS 禁自動、越地授、欺詐、堆證、鞋機、盜版。

## 入

- **必**：標 URL 與擷之法基
- **必**：代池憑（讀環境，勿硬碼）
- **必**：池類—中心、宅、行
- **可**：地標（國/區/市）
- **可**：輪粒—請求（默）或粘
- **可**：日量/費限
- **可**：限速秒（默：1，雖輪猶用）

## 行

### 一：法倫察

文錄之法倫察為閘。略此為害源。

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

得：諸問皆有可辯之答。首「否」/「未知」即停。

敗：
- ToS 禁→勿行；聯主或用官 API/授集
- 私訊無基→勿行；徵隱私顧問
- 越權/越地→無論何況勿行

### 二：擇池類

各類費、可察、倫殊。擇可解阻之最廉。

| 池類 | 可察 | 費 | 宜 |
|------|-----|---|----|
| 中心 | 高 | $ | 無真反機之站、僅地遷 |
| 宅 | 低 | $$$ | 阻中心 ASN 之站 |
| 行 | 極低 | $$$$ | 阻宅之站（罕） |

**宅、行倫慮**：經真消費連線。供商徵同模殊—有付用者，有「免 VPN」EULA 暗包者。宜選審計、入式同意。汝若不願外人擷流經汝家，勿經他人。

得：文錄擇—最廉可行、附拒高之故。

敗：
- 中心阻、宅超預→縮擷範前升
- 無入式同意供→重思擷之必

### 三：合 scrapling

接代於 scrapling 擷。讀環境憑—勿硬碼，勿提交 `.env`。

```python
import os
import random
from scrapling import Fetcher, StealthyFetcher

PROXY_URL = os.environ["SCRAPING_PROXY_URL"]

fetcher = StealthyFetcher()
fetcher.configure(
    headless=True,
    timeout=60,
    network_idle=True,
    proxy=PROXY_URL,
)

POOL = os.environ["SCRAPING_PROXY_POOL"].split(",")

def fetch_with_rotation(url):
    proxy = random.choice(POOL)
    fetcher = StealthyFetcher()
    fetcher.configure(headless=True, timeout=60, proxy=proxy)
    return fetcher.get(url)
```

得：請求成、出口 IP 變。實擷前以 IP 回顯端（如 `https://api.ipify.org`）驗。

敗：
- 407 Proxy Authentication Required→憑誤或密碼編碼壞
- 諸請同 IP→默粘；查 `-rotating` 或請求標
- 大延→可期；輪加 200–2000ms

### 四：粘會與池健

按工選輪粒，繼保池健。

```python
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

得：態流保 cookie；匿擷示 IP 變；死代跳過。

敗：
- 登中斷→會內輪→改粘憑
- 樣皆敗→池盡或憑期；轉憑/聯供

### 五：察、費控、急停

代流按 GB 與請求計費。失控擷生失控賬。必設限與停。

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
    time.sleep(1)
```

得：限觸先於失控費。日誌示代功率以辨除。

敗：
- 敗率 > 20%→停；站察輪式（IP 同網段）；轉池或停
- 單錄費超期 5 倍→積極緩存、去重、批處

## 驗

- [ ] 步一法察文錄於碼前
- [ ] 無代憑、池 URL、會 ID 入追檔（grep `gateway.`、`proxy=`、供主機）
- [ ] `.env` 入 `.gitignore`
- [ ] 池選有理：最廉可行、宅/行同意已驗
- [ ] IP 變於回顯端驗於實擷前
- [ ] 態流用粘；匿擷用每請求
- [ ] 限（請求、時、敗）已接已測
- [ ] 限速（≥1s）保—輪非洪泛之由
- [ ] `robots.txt` 仍守—輪不蓋之

## 忌

- **隱前輪**：站常需新印（UA、TLS、緩）非新 IP。先試 `StealthyFetcher` 與限速；輪貴而倫
- **硬碼憑**：源檔含代 URL→泄於 git、容像、棧蹤。必讀環境或秘管
- **會中輪**：每請求輪破依 cookie、CSRF、車態之流。態工用粘
- **以輪為「倫匿」**：輪藏汝於標，不令害擷為倫。ToS、版、私法、限倫仍適
- **以宅代為高險動**：堆證、鞋機、地盜、欺—明出此技範。若汝用例似之，停
- **「有輪故忽 `robots.txt`」**：輪不予許。指即指
- **無急停**：計量代池上無監循生四位賬於夜。必限請、時、敗
- **擇暗同意宅池**：有供以「免 VPN」EULA 採出口節（真用戶未讀）。付溢價得審計入式同意

## 參

- [headless-web-scraping](../headless-web-scraping/SKILL.md)
- [use-graphql-api](../use-graphql-api/SKILL.md)
- [deploy-searxng](../deploy-searxng/SKILL.md)
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md)
- [security-audit-codebase](../security-audit-codebase/SKILL.md)
