---
name: rotate-scraping-proxies
locale: wenyan-lite
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

# 輪換抓取代理

抓取活動於用戶端隱身手段已盡時之網路層升級。代理輪換為最後手段，非預設——其昂貴、倫理敏感、易被濫用。此技能教人何時*不應*用，與如何善用，並重。

## 適用時機

- `headless-web-scraping`（Fetcher → StealthyFetcher → DynamicFetcher）已試而目標仍返 403/429/地理封鎖
- 速率限制已達 3 秒以上間隔，且 `robots.txt` 允許該路徑
- User-Agent 與 TLS 指紋已寫實（非預設之 `python-requests`）
- 抓取為合法：公開資料、無繞過驗證、無繞付費牆、無法律依據外採集個人資料
- 可為代理流量編列預算並接受運營複雜度

**勿用**之時機：存在公開 API（用之）、網站 ToS 禁止自動存取、繞過地理授權，或目的為詐欺／撞庫／搶鞋機器人／內容盜版。

## 輸入

- **必要**：目標 URL 及抓取之法律依據
- **必要**：代理池憑證（從環境讀取，絕不硬編碼）
- **必要**：池類型——資料中心、住宅或行動
- **選擇性**：地理定位（國家／區域／城市）
- **選擇性**：輪換粒度——每請求（預設）或黏性會話
- **選擇性**：每日流量／支出上限
- **選擇性**：速率限制延遲秒數（預設：1，輪換時亦同）

## 步驟

### 步驟一：起飛前合法性與倫理檢查

整個流程以書面合法與倫理審查為閘。跳此步乃單一最大傷害源。

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

**預期：** 每問皆有可辯護之書面答覆。首見「否」或「不知」即停止流程，待解決後再續。

**失敗時：**
- ToS 禁止自動存取——勿續；改聯繫網站擁有者，或用官方 API 或授權資料集
- 個人資料無法律依據——勿續；徵詢隱私法律顧問
- 繞過驗證或地理授權——任何情況下皆勿續

### 步驟二：選擇池類型

不同池類型有不同之成本、可偵測性與倫理輪廓。擇能實際解封之最便宜層級。

| 池類型 | 可偵測性 | 成本 | 最適 |
|-----------|---------------|------|----------|
| 資料中心 | 高（易為 Cloudflare/Akamai 封鎖） | $ | 無真反機器人之站、僅做地理切換 |
| 住宅 | 低（真實 ISP IP） | $$$ | 封鎖資料中心 ASN 之站 |
| 行動 | 極低（電信級 NAT，與千人共用） | $$$$ | 連住宅都封之站（罕見） |

**住宅與行動之倫理警告：** 此類池將你之流量路由經真實消費者連線。池運營商之同意模型不一——有付費予用戶者，亦有將出口節點同意捆綁進「免費 VPN」EULA 而用戶不讀者。應優先選有審計、選入式同意之供應商。若你不願有陌生人經你家路由器送出抓取流量，便勿經他人之路由器送你之流量。

**預期：** 經書面決定之最便宜可行層級，並簡短說明為何拒絕更高層（或為何需更高層）。

**失敗時：**
- 資料中心被封而住宅超預算——升級層級前先縮抓取範圍（更少 URL、更慢節奏）
- 找不到有書面選入式同意之供應商——重新考慮抓取本身是否必要

### 步驟三：以 scrapling 整合輪換

將代理接入 scrapling 抓取器。從環境變數讀取憑證——絕不硬編碼，絕不將 `.env` 提交至 git。

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

**預期：** 請求成功，且出口 IP 於各次呼叫間有變化。執行真實抓取前，先打 IP 回顯端點（如 `https://api.ipify.org`）確認。

**失敗時：**
- 407 Proxy Authentication Required——憑證錯，或密碼之 URL 編碼壞了（重新編碼特殊字元）
- 每次同 IP——供應商端點預設可能黏性；查文件取 `-rotating` 或每請求旗標
- 延遲大幅增加——預期；輪換每請求加 200-2000ms

### 步驟四：黏性會話與池健康

依工作負載決定輪換粒度，並維持池之健康。

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

**預期：** 有狀態流跨請求保持 cookies；批量匿名抓取顯示請求間 IP 變化；死代理被跳過而非循環。

**失敗時：**
- 登入流中途斷——輪換在會話內發生；改用黏性會話憑證
- 抽樣中所有代理皆健康檢查失敗——池耗盡或憑證過期；輪換憑證或聯繫供應商

### 步驟五：監控、成本控制與緊急開關

代理流量有每 GB 與每請求之成本。失控之抓取器產生失控之發票。應始終納入限額與中止機制。

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

**預期：** 預算上限於失控成本前觸發。日誌顯示每代理之成功率，俾以識別並排除壞之出口 IP。

**失敗時：**
- 失敗率攀升超 20%——暫停；網站已偵測輪換模式（如所有 IP 同子網）；切換池類型或停止
- 每記錄成本超預期 5 倍——積極快取、URL 去重、可批處理時批處理

## 驗證

- [ ] 步驟一之合法性檢查於任何代碼執行前已書面記錄
- [ ] 受追蹤檔案中無代理憑證、池 URL 或會話 ID（grep `gateway.`、`proxy=`、供應商主機名）
- [ ] `.env`（或等效）已在 `.gitignore` 中
- [ ] 池選擇有理：最便宜可行層級，住宅／行動已驗證同意模型
- [ ] 真實執行前已對回顯端點確認 IP 變化
- [ ] 有狀態流用黏性會話；批量匿名用每請求
- [ ] 預算上限（請求、時長、失敗）已接線並測試
- [ ] 速率限制（≥1 秒）已保留——輪換非氾濫之藉口
- [ ] `robots.txt` 仍受尊重——輪換不可凌駕之

## 常見陷阱

- **隱身未盡即輪換**：網站常非需新 IP——其需寫實 User-Agent、TLS 指紋與更慢節奏。應先試 `StealthyFetcher` 與速率限制；輪換昂貴且不必要時部署不道德。
- **硬編碼憑證**：將代理 URL 貼入源檔將其洩漏至 git、容器映像與堆疊追蹤。應從環境變數或秘密管理器讀取。
- **會話中途輪換**：每請求輪換打斷任何依 cookies、CSRF token 或購物車狀態之流。對有狀態工作用黏性會話。
- **將輪換視為「倫理匿名」**：輪換對目標隱藏*你*，但不令有害抓取變道德。ToS、版權、隱私法、速率限制倫理仍不變適用。
- **以住宅代理作高風險活動**：撞庫、搶鞋機器人、地理盜版串流內容、詐欺——明確不在此技能範圍。若你之用例如此，止之。
- **以「我們有輪換了」為由忽視 `robots.txt`**：輪換不予許可。指令即指令。
- **無緊急開關**：無監控之迴圈於計量代理池上一夜變成四位數發票。應始終限制請求、時長與失敗。
- **選擇同意不透明之住宅池**：有些供應商從真實用戶從未讀之「免費 VPN」EULA 取得出口節點。應付溢價以取得審計、選入式之同意模型。

## 相關技能

- [headless-web-scraping](../headless-web-scraping/SKILL.md) — 父技能；應始終從之起步。此技能僅作升級用。
- [use-graphql-api](../use-graphql-api/SKILL.md) — 存在官方 API 時，優先用之而非抓取。
- [deploy-searxng](../deploy-searxng/SKILL.md) — 自託管搜尋完全免於抓取搜尋引擎。
- [configure-reverse-proxy](../configure-reverse-proxy/SKILL.md) — 反向之網路方向（提供而非擷取），有用之鄰參考。
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — 整合憑證後執行以確認無洩漏入倉庫。

<!-- Keep under 500 lines. Extract large examples to references/EXAMPLES.md if needed. -->
