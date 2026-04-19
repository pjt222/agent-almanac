---
name: choose-loop-wakeup-interval
locale: wenyan-lite
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

# 擇迴圈喚醒之時

為 `ScheduleWakeup` 擇 `delaySeconds` 之值，須守提示快取五分鐘之壽、排程整分鐘之粒度、`[60, 3600]` 之運行夾限。此抉擇非直觀：常人直覺「約候五分鐘」，實落兩敗之域——既失快取，又未能攤還其失。

此推理本隨 `ScheduleWakeup` 之工具描述同行於呼叫之際，然彼時迴圈已排定。此技能將推理前移至規劃之時，歸其本位。

## 適用時機

- 設計自主 `/loop` 或 `ScheduleWakeup` 驅動之續行，擇每刻之延遲
- 規劃長駐代理輪詢、觀察或迭代之心跳節律
- 依成本或快取溫度調校輪詢節律
- 事後審迴圈之耗，察覺間隔失度
- 撰寫含擇 `delaySeconds` 之指南、手冊或示例

## 輸入

- **必要**：迴圈所待何事（特定事件、狀態轉移、閒刻、週期性檢查）
- **必要**：此刻之讀者需新鮮上下文（快取溫存）抑或可忍冷讀（可失快取）
- **選擇性**：待發事件最早可能之下界（如「建置至少需四分鐘」）
- **選擇性**：全迴圈之成本上限（刻數 × 每刻之耗）

## 步驟

### 步驟一：分類等待

定等待屬何層：

- **主動觀察（快取溫存）**：事在五分鐘內將變——建置近成、狀態正被輪詢、方啟動之進程
- **失快取等待**：五分鐘內無可察之事；上下文快取將冷，可接受
- **閒置**：無特定信號可觀；迴圈以「或能發現」而非「必有所見」檢入

**預期：** 明確分類：主動觀察、失快取、或閒置。

**失敗時：** 若等待無法分類——若對「所待何事」無誠實答——迴圈本不該存。跳至步驟六，慮全然不排喚醒。

### 步驟二：行三層抉擇

依分類擇 `delaySeconds`：

| 層級 | 範圍 | 快取行為 | 用時 |
|---|---|---|---|
| 快取溫存 | **60 – 270 s** | 快取溫存（五分鐘壽內） | 主動觀察——下刻需快速廉價重入 |
| 失快取 | **1200 – 3600 s** | 快取變冷；一失換得長候 | 真正閒置，或待發事件不能更早 |
| 閒置預設 | **1200 – 1800 s**（20–30 分） | 快取變冷 | 無特定信號；用戶可中斷之週期檢查 |

**莫取 300 s。** 此乃兩敗之區：快取已失，候時不足以攤還。若手伸向「約五分鐘」，降至 270 s（保溫存）或許 1200 s+（攤還其失）。

**預期：** 具體 `delaySeconds` 值，取自三層之一，非習慣性整分鐘。

**失敗時：** 若抉擇屢落於 300 s，底層之問常為「此迴圈以此節律該存否」——回顧步驟一。

### 步驟三：計及分鐘邊界

排程於整分鐘觸發。`delaySeconds` 為 `N` 則實際延遲 `N` 至 `N + 60` 秒，視呼叫時處分鐘之何秒。

示例：

> 於 `HH:MM:40` 呼 `ScheduleWakeup({delaySeconds: 90})` 產生目標 `HH:(MM+2):00`——實際候 140 s，非 90 s。

結果：次分鐘之意無義。視所傳值為**下界**，非精確排程。若一分鐘偏差關乎成敗，迴圈節律於此機制過緊。

**預期：** 已接受實際等待可較所請 `delaySeconds` 多至 60 s。對快取溫存之刻此事重要——270 s 可實成約 330 s，落入失快取之域。

**失敗時：** 若近天花板之值（如求快取溫存取 265 s）頻現，向下墊——取 240 s 而非 270 s，即便最壞之分鐘偏差亦保溫存之諾。

### 步驟四：守夾限

運行將 `delaySeconds` 夾至 `[60, 3600]`——範圍外之值靜然調整。遙測分別模型所求（`chosen_delay_seconds`）與實際排程（`clamped_delay_seconds`），凡不符置 `was_clamped: true`。

以夾後之值規劃，非所請之值：

- 請求低於 60 → 實際候 60 s 加分鐘邊界偏差（實中可至 120 s）
- 請求高於 3600 → 實際候 3600 s（一時）
- 運行不延上限；多時之候須多刻

**預期：** 所擇值落於 `[60, 3600]` 內，或已故意接受夾後行為。

**失敗時：** 若需確為多時（如「四時後喚我」），串接喚醒——排 3600 s 之刻，其自重排——或改用 cron 迴圈（`CronCreate` 帶 `kind: "loop"`）。

### 步驟五：書具體之 `reason`

`reason` 欄乃遙測、用戶可見狀態、提示快取溫度推理之合一。截於 200 字元。須具體。

- 佳：`checking long bun build`、`polling for EC2 instance running-state`、`idle heartbeat — watching the feed`
- 劣：`waiting`、`loop`、`next tick`、`continuing`

此欄之讀者乃欲解迴圈所作而無須預測節律之用戶。為彼而書。

**預期：** 具體一語之因，用戶瞥狀態欄即能解。

**失敗時：** 若無具體因可言，重審迴圈該存否（步驟一與步驟六）。

### 步驟六：識「莫迴圈」之情形

非凡「稍後再來」之念皆值排喚醒。勿排一刻當：

- 用戶主動觀察——其輸入乃正確觸發，非計時器
- 無收斂判準——迴圈無「完成」之定義
- 任務為互動式（於各刻間向用戶發問）
- 所需節律短於夾下限（60 s）——如此緊之輪詢歸事件驅動機制，非迴圈

**預期：** 於排喚醒與不迴圈之間有自覺之擇。「因我能」非迴圈之由。

**失敗時：** 若排之喚醒屢於觸發前被用戶打斷，模式有誤——非間隔。

## 驗證

- [ ] 等待已分類為主動觀察、失快取、或閒置（三者之一）
- [ ] 所擇 `delaySeconds` 落於三層範圍之一（60–270、1200–3600 或閒置之 1200–1800）
- [ ] 值非 300（兩敗）
- [ ] 值於 `[60, 3600]` 內，或夾後行為已明確接受
- [ ] 分鐘邊界偏差已計（視值為下界）
- [ ] `reason` 具體且少於 200 字元
- [ ] 已行「莫迴圈」檢查——喚醒確有必要

## 常見陷阱

- **整分鐘預設（300 s）**：最常見之誤。「約五分鐘」自然卻恰誤。降至 270 s 或許 1200 s+。
- **忽略分鐘邊界偏差**：於分鐘末請求 60 s 可產生約 120 s 實延。於快取溫存之刻，此可令其越五分鐘壽。
- **追次分鐘精度**：排程有分鐘粒度。問 85 s vs. 90 s vs. 95 s 為噪——擇一而行。
- **模糊 `reason` 欄**：`"waiting"` 告用戶無物，亦令遙測失用。書因如用戶將讀於狀態欄。
- **以此技能正當化無謂之迴圈**：若「我觀何事」之誠答含糊，無間隔之擇可救——迴圈不該存。
- **於提示中手夾**：勿於模型推理中夾（「我上限 3600 以策安全」）。運行會夾。由之。
- **忘七日期滿**：動態迴圈預設七日後收回（用戶可配至三十日）。長駐迴圈宜設計遠於此上限而終，非競之。

## 範例

### 範例一 — 快取溫存主動觀察

`bun build` 已啟；代理欲速檢入令結果至時快取尚溫。

- 分類：主動觀察（步驟一）
- 層：快取溫存（步驟二），取 **240 s**
- 分鐘邊界（步驟三）：最壞實候約 300 s——以 60 s 緩衝仍於五分鐘壽內
- 因（步驟五）：`checking long bun build`

### 範例二 — 閒置心跳

自主代理每時觀低流量饋送一次，覓可為之事。

- 分類：閒置（步驟一）
- 層：閒置預設（步驟二），取 **1800 s**（30 分）
- 分鐘邊界（步驟三）：無關——60 s 偏差於此節律可忽
- 因（步驟五）：`idle heartbeat — watching the feed`

### 範例三 — 反模式

代理欲於遠端 API 重試時「候五分鐘」。請求為 300 s。

- 問題：快取於五分鐘冷，故 300 s 付其失——然 300 s 過短不能攤還
- 修：或降至 270 s（保溫存）或許 1500 s（攤還其失）。莫取 300。

## 相關技能

- `manage-token-budget` — 長駐代理迴圈之成本上限；快取感知之定量乃一槓桿
- `du-dum` — 觀察/行動分離之模式；無 cron 時此技能定觀察之鐘間隔
- `read-continue-here` — 跨會話交接；此技能涵會話內喚醒
- `write-continue-here` — `read-continue-here` 之反

<!-- Keep under 500 lines. Current: ~200 lines. -->
