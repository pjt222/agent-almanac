---
name: du-dum
locale: wenyan
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

# 咚咚：先積後行之法

以二鐘分觀於行。疾鐘（析）廉收數而書簡牘，緩鐘（行）讀牘而定行否。牘告無待，則行鐘即出——閒時無費也。

名取心跳之韻：咚、咚。首跳（du）觀之，次跳（dum）行之。多時唯首跳而已。

## 用時

- 築自主之體，須常觀而罕可行者
- 現有心跳之環，每拍皆呼 LLM，雖無變化
- 觀廉（API 讀、解文件、掃日誌）而行昂（LLM 呼、寫操作、通知）
- 需解耦之敗：若觀敗，舊牘仍可供行鐘
- 設 cron 之體，析行分為各職

## 入

- **必要**：疾鐘所觀之源（API、文件、日誌、訂閱）
- **必要**：牘示有待時緩鐘所行之事
- **可選**：疾鐘之隔（默每四時）
- **可選**：緩鐘之隔（默日一）
- **可選**：日費之上限（以驗鐘之設）
- **可選**：牘之式（markdown、JSON、YAML）

## 法

### 第一步：識二鐘

分所有工於觀（廉、頻）與行（昂、罕）。

1. 列當前環或擬流中諸操作
2. 各類為觀（讀數、生摘）或行（呼 LLM、寫出、送訊）
3. 驗其分：觀宜零費或近零；行乃昂者
4. 定頻：疾鐘足以捕事；緩鐘足以應時

| 鐘 | 費之概 | 頻 | 例 |
|-------|-------------|-----------|---------|
| 疾（析） | 廉：API 讀、解文件、無 LLM | 日 4-6 次 | 掃 GitHub 通知、解 RSS、讀日誌 |
| 緩（行） | 昂：LLM 推斷、寫操作 | 日 1 次 | 擬應、更面、送警 |

**得：** 二列之分，各操作歸一鐘。疾鐘無 LLM 呼，緩鐘無採數。

**敗則：** 若一操作兼讀與 LLM（如「摘新事」），分之：疾鐘收原事入牘，緩鐘摘之。牘者，界也。

### 第二步：設牘之式

牘者，通二鐘之低帶訊也。宜簡、可讀於人、可解於機。

1. 定牘之路與式（markdown 便於人查）
2. 頭含時戳與源之元數
3. 定「待」節，列須行之事
4. 定「狀」節，記當前狀（供面板或日誌）
5. 明示空態（如 `pending: none` 或空節）

牘構之例：

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

無待之時：

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

**得：** 一牘模板，待空二態明。行鐘察一字或一節即可定行否。

**敗則：** 若牘過大（逾五十行），疾鐘含原數過多。移其詳至別文，牘為摘與指也。

### 第三步：造疾鐘（析）

建隨疾程而行之觀本。

1. 每源一本（令敗獨立）
2. 各本讀其源，取其事，增或改牘
3. 用文鎖或原子寫以防殘牘
4. 記析之運行（時戳、所得、誤）於別日誌
5. 勿呼 LLM，勿作更牘以外之寫

```
# Pseudocode: analyze-notifications.sh
fetch_notifications()
filter_actionable(notifications)
format_as_digest_entries(filtered)
atomic_write(digest_path, entries)
log("analyzed {count} notifications, {pending} actionable")
```

cron 程例：
```
# Fast clock: analyze every 4 hours
30 */4 * * *  /path/to/analyze-notifications.sh >> /var/log/analysis.log 2>&1
0  6   * * *  /path/to/analyze-pr-status.sh     >> /var/log/analysis.log 2>&1
```

**得：** 一或數析本，各生或更牘。本獨立而運——一敗，諸本之節猶更。

**敗則：** 若源暫不可達，本宜記誤而留舊牘。勿於源敗時清牘——陳數勝於無數，以供行鐘。

### 第四步：造緩鐘（行）

建讀牘定行之本。

1. 讀牘（每行循之第零步）
2. 察待節：若空或「none」，即出並記之
3. 若有待，呼昂操（LLM、擬訊等）
4. 行後，清或存已處之牘條
5. 記行之運行（所處之數、費、時）

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

cron 程例：
```
# Slow clock: act once per day at 7am
0 7 * * *  /path/to/heartbeat.sh >> /var/log/heartbeat.log 2>&1
```

**得：** 閒循時，行本一秒內出（唯讀一文察空）。活循時，處諸待事並清牘。

**敗則：** 若 LLM 呼敗，勿清牘。待事留於下循。可於牘設重試計以防永敗之無限試。

### 第五步：設閒察

費省在閒察——行鐘須以最小耗明辨「無事」與「有事」。

1. 定閒察為一速操作（讀文+對字）
2. 驗閒徑無外呼（無 API、無 LLM、無網）
3. 量閒徑之時——宜不足一秒
4. 閒循與活循異記，以利監察

```bash
# Minimal idle check
if grep -q "^(none)$" "$DIGEST_PATH" || grep -q "pending: 0" "$DIGEST_PATH"; then
    echo "$(date -u +%FT%TZ) heartbeat: idle" >> "$LOG_PATH"
    exit 0
fi
```

**得：** 閒徑唯一讀一對。無網呼，無本身以外之進程開。

**敗則：** 若閒察不穩（誤肯致漏工、誤否致無益 LLM 呼），簡化牘式。頭置一布爾（`has_pending: true/false`）最可靠。

### 第六步：驗費之模

算預期之費以確二鐘之節省。

1. 算疾鐘日運：`fast_runs = 24 / fast_interval_hours`
2. 算緩鐘日運：通常一
3. 算觀費：`fast_runs * cost_per_analysis_run`（無 LLM 則近零）
4. 算行費：`active_days_fraction * cost_per_action_run`
5. 算閒費：`(1 - active_days_fraction) * cost_per_idle_check`（近零）
6. 與單環原費相較

費較之例：

| 架構 | 日費（活） | 日費（閒） | 月費（八成閒） |
|-------------|--------------------|--------------------|------------------------|
| 單環（每半時一 LLM） | $13.74/37h | $13.74/37h | ~$400 |
| 咚咚（六析一行） | $0.30 | $0.00 | ~$6 |

**得：** 費模示咚咚架構於閒日至少十倍廉於原。

**敗則：** 若費模未示顯著節省，或為：（甲）疾鐘過頻；（乙）疾鐘含隱 LLM 呼；（丙）系鮮閒。咚咚益於高閒比之系。若常活，簡輪詢或更宜。

## 驗

- [ ] 疾緩二鐘清分，疾徑無 LLM 呼
- [ ] 牘式有明空態之標
- [ ] 閒察於一秒內出，無外呼
- [ ] 疾鐘敗不壞牘（陳數得存）
- [ ] 緩鐘敗不清待事（下循再試）
- [ ] 費模示閒日至少十倍廉於單環
- [ ] 二鐘皆記運行，供監察查錯
- [ ] 牘不無界增長（處後舊條存或清）

## 陷

- **牘無界長**：若疾鐘增而緩鐘永不清，牘漸成長日誌。行循畢，必清或存所處之條
- **疾鐘過疾**：事日一現而五分一析，浪 API 額與磁 I/O。疾鐘頻宜合源之實事率
- **緩鐘過緩**：若行窗日一而事需同時應，緩鐘過緩。增頻或加急事捷徑以即行
- **LLM 呼於疾鐘**：若疾鐘含 LLM 推斷，費模盡破。審疾鐘每本以確無 LLM。若需摘，遞於緩鐘
- **疾鐘本相依**：若一析本賴另一之出，首敗則連敗。疾鐘本宜獨立——各讀其源，各寫其節
- **閒無記**：若閒循無日誌，不可辨「運而閒」與「崩而不運」。必記閒循，哪怕一時戳
- **析敗即清牘**：若源斷，勿書空牘。緩鐘見「無待」而略實有之工。敗時存舊牘

## 參

- `manage-token-budget` — 費控之框，咚咚使之可行；咚咚為架構，token budget 為計之層
- `circuit-breaker-pattern` — 處敗（工具破）；咚咚處常（無事）。並用：咚咚司閒察，斷路司敗復
- `observe` — 疾鐘之觀法；咚咚結其於牘何時可行
- `forage-resources` — 策略探層；咚咚乃其所運行之節奏
- `coordinate-reasoning` — 臭跡信之式；牘乃臭跡（藉環境物之間接協調）
