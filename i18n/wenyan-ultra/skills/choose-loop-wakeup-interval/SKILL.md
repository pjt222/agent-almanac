---
name: choose-loop-wakeup-interval
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Select a `delaySeconds` value when scheduling a loop wakeup via the
  `ScheduleWakeup` tool or the `/loop` slash command. Covers the three-tier
  cache-aware decision (cache-warm under 5 minutes, cache-miss 5 minutes to
  1 hour, idle default 20 to 30 minutes), the 300-second anti-pattern, the
  [60, 3600] runtime clamp, the minute-boundary rounding quirk, and writing
  a telemetry-worthy `reason` field. Use when designing an autonomous loop,
  when a heartbeat cadence is being planned, when polling cadence is being
  tuned, or when post-hoc review of loop costs reveals interval mis-sizing.
license: MIT
allowed-tools: ""
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: loop, wakeup, cache, scheduling, delay, general
---

# 擇循喚時

擇 `delaySeconds`：守 5 分緩存 TTL、整分粒度、`[60, 3600]` 夾。避「5 分」兩敗之位。

## 用

- 策 `/loop` 或 `ScheduleWakeup` 之每勾延→用
- 長駐代理之心拍→用
- 輪詢頻率之調→用
- 事後察費過高→用
- 書指南、劇本→用

## 入

- **必**：循之所待（事、遷、勾、察）
- **必**：讀時須熱緩存乎？或冷可受乎？
- **可**：事件可生之下界
- **可**：總費之上界

## 行

### 一：分類

- **熱察**：5 分內將變（構近畢、狀遷輪詢）
- **冷待**：5 分內無足察；緩存冷可受
- **閒**：無專號；因或遇而察

得：分類明（熱/冷/閒）。

敗：無「待何」之誠答→循或不當存→赴步五。

### 二：三層擇

| 層 | 範圍 | 緩存 | 用時 |
|---|---|---|---|
| 熱 | **60–270 s** | 溫留（<5 分 TTL） | 熱察 |
| 冷 | **1200–3600 s** | 冷；一失長待 | 真閒或事件不及 |
| 閒 | **1200–1800 s**（20–30 分）| 冷 | 無專號；可打斷 |

**勿擇 300 s**：兩敗之位——緩存失、待太短不攤。欲「5 分」者→降 270 s（熱）或赴 1200+（攤失）。

得：依層取一值，非習慣之整分。

敗：屢擇 300 s→問循當存否→返步一。

### 三：整分之偏

排程按整分發。`delaySeconds` N→實 `N` 至 `N+60` s，依呼時之秒。

例：

> 於 `HH:MM:40` 呼 `ScheduleWakeup({delaySeconds: 90})`→目標 `HH:(MM+2):00`——實待 140 s，非 90。

故：秒精無義。視所傳為**底**。若分偏為患→頻率過急，此器不宜。

得：受實待可長 60 s。熱勾 270 s 或成 330 s→出熱界。

敗：常近上限→下墊用 240 s 代 270 s。

### 四：守夾

運行夾 `delaySeconds` 於 `[60, 3600]`。遙測分 `chosen_delay_seconds` 與 `clamped_delay_seconds`，不合則 `was_clamped: true`。

依夾後值策，非所求：

- 求<60→實 60 s+分偏（可達 120 s）
- 求>3600→實 3600 s（1 時）
- 運行不延上限；多時之待須多勾

得：值在 `[60, 3600]` 內，或已明受夾。

敗：真須多時（如 4 時）→鏈勾（3600 勾內自再排）或用 `CronCreate`（`kind: "loop"`）。

### 五：書具體 `reason`

`reason` 為遙測、用者狀訊、緩存熱之由，三合一行。截 200 字。須具體。

- 佳：`checking long bun build`、`polling for EC2 instance running-state`、`idle heartbeat — watching the feed`
- 劣：`waiting`、`loop`、`next tick`、`continuing`

讀者為用，無預見頻率而欲知循何為。為彼而書。

得：一句具體之由，狀訊一目可懂。

敗：無具體由→問循當存否（步一、六）。

### 六：識「勿循」之況

非每「稍後回」皆須勾。**勿**勾當：

- 用者正察→彼輸入為發機，非計時
- 無收斂準→循無「畢」之義
- 任務互動（勾間問用者）
- 所需頻率<60 s 夾底→此為事發驅動，非循

得：明擇勾與不循。「因能」非由。

敗：屢勾屢被用打斷→模式誤，非區間。

## 驗

- [ ] 分類：熱/冷/閒（擇一）
- [ ] `delaySeconds` 在三層範圍內（60–270、1200–3600、或閒 1200–1800）
- [ ] 值非 300（兩敗）
- [ ] 值在 `[60, 3600]` 內或已明受夾
- [ ] 已計分偏（值視為底）
- [ ] `reason` 具體且<200 字
- [ ] 已察「勿循」——勾確當

## 忌

- **整分慣性（300 s）**：最常誤。「5 分」自然而剛誤。降 270 或攤至 1200+
- **忽分偏**：於分末求 60 s→實可達 120 s。熱勾或逸 TTL
- **秒精追求**：粒度為分。85 vs 90 vs 95 皆噪——擇而行
- **模糊 `reason`**：`"waiting"` 無助用者亦減遙測之用
- **以此技辯不必之循**：「察何」模糊→無區間可救→循勿存
- **手工夾於提示**：勿於推理中夾（「我封 3600 以安」）。運行夾之，任之
- **忘 7 日汰**：動態循默 7 日後收（用者可至 30）。長循宜於前畢，勿搶此限

## 示例

### 例一——熱察

`bun build` 已啟；代理欲速察使結果至時緩存仍熱。

- 分類：熱察（步一）
- 層：熱（步二），取 **240 s**
- 分偏（步三）：最壞實待~300 s——仍在 5 分 TTL 內（60 s 餘）
- 由（步五）：`checking long bun build`

### 例二——閒心拍

代理每時察低頻之流，覓可為之事。

- 分類：閒（步一）
- 層：閒默（步二），取 **1800 s**（30 分）
- 分偏（步三）：無關——60 s 偏於此頻可忽
- 由（步五）：`idle heartbeat — watching the feed`

### 例三——反模式

代理欲「待 5 分」使遠端 API 重試。求 300 s。

- 患：5 分緩存冷→300 s 付失——然 300 s 太短不攤
- 正：降 270 s（熱）或赴 1500 s（攤）。勿擇 300

## 參

- `manage-token-budget`
- `du-dum`
- `read-continue-here`
- `write-continue-here`
