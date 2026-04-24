---
name: du-dum
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Separate expensive observation from cheap decision-making in autonomous agent
  loops using a two-clock architecture. A fast clock accumulates data into a
  digest file; a slow clock reads the digest and acts only when something is
  pending. Idle cycles cost nothing because the action clock returns immediately
  after reading an empty digest. Use when building autonomous agents that must
  observe continuously but can only afford to act occasionally, when API or LLM
  costs dominate and most cycles have nothing to do, when designing cron-based
  agent architectures with observation and action phases, or when an existing
  heartbeat loop is too expensive because it calls the LLM on every tick.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: autonomous-agents, cost-optimization, two-clock, digest, heartbeat, batch-then-act, cron
---

# Du-Dum：集而後行

雙鐘異頻。速鐘（察）廉而集，書精要。慢鐘（行）讀要而判行否。要云無事→立退：閒週零費。

名源心跳：du-dum, du-dum。首拍（du）察，次拍（dum）行。多時，唯首拍動。

## 用

- 造有預之自主者，察頻於行
- 舊心跳每拍呼 LLM，縱無變
- 察廉（API 讀、文解、日掃）而行貴（LLM 呼、寫、告）
- 須解耦：察敗則末良要仍可供行鐘
- 造 cron 架，析行異職

## 入

- **必**：速鐘所察之源（API、文、日、饋）
- **必**：慢鐘所行（要示待辦時）
- **可**：速鐘週（默：每 4 時）
- **可**：慢鐘週（默：日一）
- **可**：日費頂（驗鐘設）
- **可**：要之式（markdown、JSON、YAML）

## 行

### 一：識兩鐘

分工為察（廉、頻）與行（貴、稀）。

1. 列舊循或新流中每作
2. 分類：察（讀、摘）抑行（呼 LLM、寫、告）
3. 驗分：察邊際費近零；行為貴作
4. 定頻：速鐘足以捕事；慢鐘足以合應時之求

| 鐘 | 費 | 頻 | 例 |
|-------|-------------|-----------|---------|
| 速（析） | 廉：API 讀、文解、無 LLM | 日 4-6 | 掃 GitHub 通知、解 RSS、讀日 |
| 慢（行） | 貴：LLM 推、寫 | 日 1 | 擬答、更儀表、發警 |

得：清二列分，每作屬一鐘。速鐘無 LLM 呼；慢鐘無採數。

敗：一作須讀且 LLM 推（如「摘新議」）→分之：速鐘入原議於要；慢鐘摘之。要乃界。

### 二：設要之式

要乃連兩鐘之低帶信。宜精、人可讀、機可解。

1. 定要文之徑與式（markdown 益人調）
2. 含首：時戳、源元
3. 設「待」節列須行之項
4. 設「態」節載現況（供儀表、記）
5. 含明之空態標（如 `pending: none` 或空節）

要例：

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

- PR #42 needs review response (opened 2h ago, author requested feedback)
- Issue #99 has new comment from maintainer (action: reply)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 14
- Items pending: 2
```

無待時：

```markdown
# Digest — 2026-03-22T06:30:00Z

## Pending

(none)

## Status

- Last analyzed: 2026-03-22T06:30:00Z
- Sources checked: github-notifications, rss-feed, error-log
- Items scanned: 8
- Items pending: 0
```

得：要之模，待/空態明。行鐘可察一欄一節定行否。

敗：要過長（>50 行）→速鐘含原數過多。移細於別檔，要只存摘與指。

### 三：建速鐘（析）

造循速表之察本。

1. 每源一本（使敗獨立）
2. 各本讀其源、取關事、附或重書要
3. 用文鎖或原子寫，防殘要
4. 記析運（時戳、項數、誤）於別日
5. 永勿呼 LLM 或為寫之外作，僅更要

```
# Pseudocode: analyze-notifications.sh
fetch_notifications()
filter_actionable(notifications)
format_as_digest_entries(filtered)
atomic_write(digest_path, entries)
log("analyzed {count} notifications, {pending} actionable")
```

表例（cron）：
```
# Fast clock: analyze every 4 hours
30 */4 * * *  /path/to/analyze-notifications.sh >> /var/log/analysis.log 2>&1
0  6   * * *  /path/to/analyze-pr-status.sh     >> /var/log/analysis.log 2>&1
```

得：一或多析本，各產或更要文。本獨運——一敗他仍更其節。

敗：源暫無→本記誤而留舊要項。勿源敗即清要——舊數於行鐘勝無數。

### 四：建慢鐘（行）

造行本：讀要、判行否。

1. 讀要（每行週第零步）
2. 察待節：若空或「none」→立退並記
3. 若有待→呼貴作（LLM 呼、擬信等）
4. 行後清或存已處之要項
5. 記行運（已處項、費、時）

```
# Pseudocode: heartbeat.sh (the slow clock)
digest = read_file(digest_path)

if digest.pending is empty:
    log("heartbeat: nothing pending, exiting")
    exit(0)

# Only reaches here if work exists
response = call_llm(digest.pending, system_prompt)
execute_actions(response)
archive_digest(digest_path)
log("heartbeat: processed {count} items, cost: {tokens} tokens")
```

表例（cron）：
```
# Slow clock: act once per day at 7am
0 7 * * *  /path/to/heartbeat.sh >> /var/log/heartbeat.log 2>&1
```

得：閒週時本於 1 秒內退（僅讀文察空）。活週時處待項並清要。

敗：LLM 呼敗→勿清要。待項留於下行週。或於要中設重試計，免永敗項之無盡重試。

### 五：設閒檢

省費源於閒檢——行鐘須以最少成本可靠別「無事」與「有事」。

1. 定閒檢為單、速作（讀文+串匹）
2. 驗閒路無外呼（無 API、無 LLM、無網）
3. 量閒路時——宜於 1 秒內
4. 閒週與活週異記以便監

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

得：閒路為一讀後一匹。無網、無生進程（本身除外）。

敗：閒檢不可靠（偽正致漏工，偽負致冗 LLM 呼）→簡要之式。檔首一布值欄（`has_pending: true/false`）最可靠。

### 六：驗費模

算預期費，驗雙鐘架確省。

1. 計日速鐘運數：`fast_runs = 24 / fast_interval_hours`
2. 計日慢鐘運數：通常 1
3. 算察費：`fast_runs * cost_per_analysis_run`（無 LLM 宜~$0）
4. 算行費：`active_days_fraction * cost_per_action_run`
5. 算閒費：`(1 - active_days_fraction) * cost_per_idle_check`（宜~$0）
6. 較原單循費

費較例：

| 架 | 日費（活） | 日費（閒） | 月費（80% 閒） |
|-------------|--------------------|--------------------|------------------------|
| Single loop (LLM every 30min) | $13.74/37h | $13.74/37h | ~$400 |
| Du-dum (6 analyses + 1 action) | $0.30 | $0.00 | ~$6 |

得：費模顯 du-dum 於閒日至少廉於原 10 倍。

敗：費模未顯顯省，其一大抵真：(a) 速鐘過頻，(b) 速鐘含隱 LLM 呼，(c) 系少閒。Du-dum 宜高閒率系。若系恒活，簡輪詢或更宜。

## 驗

- [ ] 速慢鐘清分，速路無 LLM 呼
- [ ] 要之式有明空態標
- [ ] 閒檢於 1 秒內退而無外呼
- [ ] 速鐘敗不損要（舊數存）
- [ ] 慢鐘敗不清待項（下週重試）
- [ ] 費模顯閒日較單循至少省 10 倍
- [ ] 兩鐘記運以便監與調
- [ ] 要不無限長（舊項於處後存或清）

## 忌

- **要無限增**：速鐘附而慢鐘不清→要成長日。行週畢後必清或存已處項
- **速鐘過速**：事日至而每 5 分析→費 API 限與碟 I/O。頻宜合源之實事率
- **慢鐘過慢**：行窗日一而事須同時應→慢鐘過慢。增頻或加急事捷徑以觸即行
- **速鐘含 LLM 呼**：速鐘一含 LLM 推→費模全破。審每速鐘本確無 LLM 呼。須摘→付慢鐘
- **速鐘本耦**：析本依他本出→一敗連崩。速鐘本宜獨——各讀己源、寫己節
- **閒默記**：閒週無記→不別「運而閒」與「崩而不運」。閒週必記，縱僅時戳
- **析敗即清要**：源斷→勿書空要。慢鐘將見「無待」而略真待之工。敗時存末良要

## 參

- `manage-token-budget` — 費控框，du-dum 使之可行；du-dum 乃架式，預為帳層
- `circuit-breaker-pattern` — 處敗態（工具壞）；du-dum 處常態（無事）。並用：du-dum 察閒，斷路復敗
- `observe` — 供速鐘之察法；du-dum 結構何時與何以經要成可行
- `forage-resources` — 謀探層；du-dum 乃其運行之執節奏
- `coordinate-reasoning` — 間接信法；要文乃一種間接協（經環境遺物）
