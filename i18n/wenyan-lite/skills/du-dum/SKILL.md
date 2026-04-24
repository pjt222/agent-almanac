---
name: du-dum
locale: wenyan-lite
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

# Du-Dum：先積後動之式

以二鐘之架構分昂貴之觀察與廉價之決策於自主代理之循環。快鐘積數據入摘要文件；慢鐘讀摘要，唯於有待處理者時作為。閒循環無費，以動鐘讀空摘要即刻返。

其名出於心跳之律：du-dum，du-dum。首拍（du）觀，次拍（dum）動。多時唯首拍發。

## 適用時機

- 建有預算之自主代理，須常觀而罕動者
- 既有心跳循環每拍呼 LLM，雖無所變
- 觀察廉（API 讀、文件解析、日誌掃）而動昂（LLM 呼、寫操作、通知）
- 需解耦之失敗：觀察若敗，舊善摘要仍可為動鐘所用
- 設計基於 cron 之代理架構，以分析與動作為分作業

## 輸入

- **必要**：快鐘當觀之數據源清單（API、文件、日誌、feed）
- **必要**：慢鐘於摘要示有待處理時當行之動作
- **選擇性**：快鐘間隔（預設：每四時）
- **選擇性**：慢鐘間隔（預設：每日一次）
- **選擇性**：每日費用上限（以驗鐘之配置）
- **選擇性**：摘要格式偏好（markdown、JSON、YAML）

## 步驟

### 步驟一：識二鐘

分所有工作為觀察（廉、頻）與動作（昂、罕）。

1. 列當前循環或規劃工作流中之每一操作
2. 歸類各為觀察（讀數據、出摘要）或動作（呼 LLM、寫出、發訊）
3. 驗其分：觀察宜邊際費近零；動作宜為昂貴之操作
4. 定頻率：快鐘頻至可捕事件；慢鐘頻至可達應答時限

| 鐘 | 費用型態 | 頻率 | 例 |
|-------|-------------|-----------|---------|
| 快（分析） | 廉：API 讀、文件解析、無 LLM | 每日 4-6 次 | 掃 GitHub 通知、解 RSS、讀日誌 |
| 慢（動作） | 昂：LLM 推理、寫操作 | 每日一次 | 草擬回覆、更新儀表板、發告警 |

**預期：** 清二欄之分，每操作僅屬一鐘。快鐘無 LLM 呼；慢鐘無數據搜集。

**失敗時：** 若一操作兼需讀與 LLM 推理（如「摘要新 issue」），分之：快鐘集原始 issue 入摘要；慢鐘摘之。摘要乃界。

### 步驟二：設計摘要格式

摘要乃架二鐘之低頻寬訊。宜緊湊、人可讀、機可解。

1. 定摘要文件之路徑與格式（推薦 markdown 便於人工除錯）
2. 含時戳與源頭之元數據頭
3. 定「pending」區列需動之項
4. 定「status」區示當前之態（供儀表板或日誌）
5. 含明確之空態指示（如 `pending: none` 或空區）

摘要結構例：

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

無待處理時：

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

**預期：** 有明 pending/empty 態之摘要模板。動鐘可由一欄或一區判是否行。

**失敗時：** 若摘要過巨（逾 50 行），快鐘含過多原始數據。移細節至另一數據文件，留摘要為帶指標之概要。

### 步驟三：實作快鐘（分析）

建於快排程而行之觀察腳本。

1. 每數據源一腳本（保失敗獨立）
2. 各腳本讀其源，取相關事件，附加或重寫摘要
3. 用文件鎖或原子寫以防部分摘要
4. 記分析運行（時戳、所見項、錯誤）至另一日誌文件
5. 切勿呼 LLM 或行超出更新摘要之寫操作

```
# Pseudocode: analyze-notifications.sh
fetch_notifications()
filter_actionable(notifications)
format_as_digest_entries(filtered)
atomic_write(digest_path, entries)
log("analyzed {count} notifications, {pending} actionable")
```

排程例（cron）：
```
# Fast clock: analyze every 4 hours
30 */4 * * *  /path/to/analyze-notifications.sh >> /var/log/analysis.log 2>&1
0  6   * * *  /path/to/analyze-pr-status.sh     >> /var/log/analysis.log 2>&1
```

**預期：** 一或多分析腳本，各生或更新摘要文件。各腳本獨立——一敗，他仍更新其區。

**失敗時：** 數據源若暫不可得，腳本宜記錯誤而留舊摘要項不動。切勿因源敗而清摘要——陳舊之數據於動鐘勝於無。

### 步驟四：實作慢鐘（動作）

建讀摘要並定是否動之動作腳本。

1. 讀摘要文件（每動循環之步驟零）
2. 檢 pending 區：若空或「none」，即出並記一條
3. 若有待處理項，呼昂貴之操作（LLM 呼、訊息組成等）
4. 動後，清或歸檔已處理之摘要項
5. 記動作運行（處理之項、費用、時長）

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

排程例（cron）：
```
# Slow clock: act once per day at 7am
0 7 * * *  /path/to/heartbeat.sh >> /var/log/heartbeat.log 2>&1
```

**預期：** 動作腳本於閒循環一秒內出（僅一文件讀與空檢）。於活循環，其處理待處理項並清摘要。

**失敗時：** 若 LLM 呼敗，勿清摘要。待處理項留於下一動作循環。可於摘要實作重試計數以免永久失敗項之無限重試。

### 步驟五：配置閒檢測

費用之省出於閒檢——動鐘須以最小開銷可靠分「無事」與「有事」。

1. 定閒檢為單一快操作（文件讀 + 字串檢）
2. 驗閒路徑無外呼（無 API、無 LLM、無網）
3. 量閒路徑時長——宜一秒內
4. 記閒循環與活循環有別以便監測

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

**預期：** 閒路徑乃一文件讀後一字串匹。無網呼，除腳本自身外無進程產生。

**失敗時：** 若閒檢不穩（偽陽致漏工，偽陰致不必要之 LLM 呼），簡化摘要格式。頂置單一布爾欄（`has_pending: true/false`）最為可靠。

### 步驟六：驗成本模型

算預期之費以確二鐘架構之省。

1. 算每日快鐘次：`fast_runs = 24 / fast_interval_hours`
2. 算每日慢鐘次：典型為 1
3. 算觀察費：`fast_runs * cost_per_analysis_run`（若無 LLM 宜近 $0）
4. 算動作費：`active_days_fraction * cost_per_action_run`
5. 算閒費：`(1 - active_days_fraction) * cost_per_idle_check`（宜近 $0）
6. 與原單循環費比

費用比較例：

| 架構 | 每日費（活） | 每日費（閒） | 每月費（80% 閒） |
|-------------|--------------------|--------------------|------------------------|
| 單循環（每 30 分 LLM 一呼） | $13.74/37h | $13.74/37h | ~$400 |
| Du-dum（6 分析 + 1 動作） | $0.30 | $0.00 | ~$6 |

**預期：** 成本模型示 du-dum 架構於閒日至少較原省 10 倍。

**失敗時：** 若模型未示明顯之省，其一或真：(a) 快鐘過頻，(b) 快鐘含隱 LLM 呼，或 (c) 系統罕閒。Du-dum 惠於高閒比之系統。若系統恆活，更簡之輪詢法或更宜。

## 驗證

- [ ] 快慢二鐘淨分，快路徑無 LLM 呼
- [ ] 摘要格式有明空態指示
- [ ] 閒檢於一秒內出，無外呼
- [ ] 快鐘敗不毀摘要（保陳舊之數據）
- [ ] 慢鐘敗不清待處理項（下循環重試）
- [ ] 成本模型示閒日較單循環省至少 10 倍
- [ ] 二鐘皆記其運行以便監測與除錯
- [ ] 摘要不無限增長（舊項於處理後歸檔或清）

## 常見陷阱

- **摘要無限增長**：若快鐘附加而慢鐘永不清，摘要成漸長之日誌。動作循環畢後必清或歸檔已處理項。
- **快鐘過快**：事件日至而每五分析，乃浪 API 配額與盤 I/O。令快鐘頻配合數據源之實事件率。
- **慢鐘過慢**：若動窗一日一次而事件需同時應，則慢鐘太慢。增其頻或加觸發立即動之急件捷徑。
- **快鐘含 LLM 呼**：若快鐘含 LLM 推理，整個成本模型破。審每快鐘腳本確無 LLM 呼。若需摘要，推至慢鐘。
- **快鐘腳本耦合**：若一分析腳本依另一之輸出，前者敗則連鎖。保快鐘腳本獨立——各讀其源，各寫其摘要區。
- **閒時無聲**：若閒循環無日誌輸出，爾不能分「運行且閒」與「崩且未行」。即時戳而已，閒循環必記。
- **分析失敗時清摘要**：數據源若下，勿寫空摘要。慢鐘將見「無待處理」而跳過實待處理之工。敗時留舊善之摘要。

## 相關技能

- `manage-token-budget` — du-dum 使其實用之成本控制框架；du-dum 為架構式，token 預算為會計層
- `circuit-breaker-pattern` — 處理失敗之情（工具壞）；du-dum 處理常情（無事）。合用：du-dum 為閒檢，circuit-breaker 為敗歸
- `observe` — 快鐘之觀察方法論；du-dum 架構何時何以觀察透過摘要成可行
- `forage-resources` — 策略探索層；du-dum 為 forage-resources 運行之執行律
- `coordinate-reasoning` — 踩跡信號之模式；摘要文件乃踩跡之一形（經環境產物之間接協調）
