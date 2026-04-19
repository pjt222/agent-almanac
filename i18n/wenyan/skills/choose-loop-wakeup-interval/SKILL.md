---
name: choose-loop-wakeup-interval
locale: wenyan
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

# 擇循環醒寐之時

擇 `delaySeconds` 之值於 `ScheduleWakeup`，合乎緩存五分之壽、調度整分之粒、`[60, 3600]` 之限。其擇非淺：常人之念「約五分」，正陷兩失之地——既失緩存，又不攤長待。

其理本隨 `ScheduleWakeup` 之具述而至呼時，然其時循環已定。此技將其理提於謀時，正其所宜也。

## 用時

- 設自主 `/loop` 或 `ScheduleWakeup` 驅續，擇每刻之遲
- 為長行之使者謀心跳之律，將察、將觀、將迭
- 調輪詢之律以應本或緩存之壓
- 事後察循環之本，而覺時距失宜
- 書引、書行冊、書有 `delaySeconds` 之例

## 入

- **必**：循環所待者何（某事、某態之變、閒刻、週察）
- **必**：此刻讀者需新脈絡乎（緩存溫）抑或可忍冷讀（緩存失可受）
- **可選**：所待事之最早可發之下界（如「建至少四分」）
- **可選**：循環總本之上限（刻數 × 每刻之本）

## 法

### 第一步：分待之類

定此待屬何階：

- **主察（緩存溫）**：五分內有變可期——建將成、態將遷、程方啟
- **緩存失之待**：五分內無值察之事；脈絡緩存將冷而可受
- **閒**：無特定之兆可察；循環來察，蓋或有所得，非必有所得

**得：** 分明之類：主察、緩存失、或閒。

**敗則：** 若待不可分——若無誠答於「吾何所待」——此循環或本不宜存。跳至第五步，慎思不設醒寐。

### 第二步：施三階之擇

依所分擇 `delaySeconds`：

| 階 | 範 | 緩存之行 | 用於 |
|---|---|---|---|
| 緩存溫 | **60 – 270 秒** | 緩存溫存（未及五分之壽） | 主察——下刻需速且廉之再入 |
| 緩存失 | **1200 – 3600 秒** | 緩存冷；一失換久待 | 真閒、或所待事不可早發 |
| 閒之常 | **1200 – 1800 秒**（二十至三十分） | 緩存冷 | 無特兆；週察而用者可中斷 |

**勿擇 300 秒。** 此兩失之距：緩存已失，而待太短不足攤其失。若念「約五分」，降至 270 秒（保溫）或定 1200 秒以上（攤其失）。

**得：** 自三階中擇定一 `delaySeconds`，非習擇之整分之數。

**敗則：** 若擇屢落 300 秒，根本之問常為「此循環當以此律存乎」——重察第一步。

### 第三步：量於分界

調度者發於整分之界。`delaySeconds` 為 `N` 者，實遲為 `N` 至 `N + 60` 秒，視呼時於分中何秒而定。

例：

> 於 `HH:MM:40` 呼 `ScheduleWakeup({delaySeconds: 90})`，則目標為 `HH:(MM+2):00`——即實待 140 秒，非 90 秒。

故：秒下之意無義。所傳之值視為**下限**，非精確之期。若一分之差緊要，則循環之律過密，不宜用此機。

**得：** 已受實待可長於 `delaySeconds` 達 60 秒。於緩存溫之刻此要緊——270 秒實可成約 330 秒，入緩存失之境。

**敗則：** 若近上限之值（如求溫之 265 秒）常見，則降之——用 240 秒替 270 秒，以保溫之諾於最壞之分界偏移下。

### 第四步：敬其限

行時以 `delaySeconds` 限於 `[60, 3600]`——逾者默調。遙測分所求（`chosen_delay_seconds`）與實定（`clamped_delay_seconds`），不合則設 `was_clamped: true`。

謀以限後之值，非所求之值：

- 求低於 60 → 實待 60 秒加分界偏移（實可達 120 秒）
- 求高於 3600 → 實待 3600 秒（一時）
- 無運行延其上；數時之待需多刻

**得：** 所擇之值落於 `[60, 3600]` 內，或有意受限後之行。

**敗則：** 若真需數時（如「四時後喚吾」），鏈醒寐——設 3600 秒之刻而自再定——或以 cron 為循環（`CronCreate` 附 `kind: "loop"`）代之。

### 第五步：書具體之 `reason`

`reason` 者，遙測、用者可見之狀、緩存溫之理合一也。截於 200 字。宜具體。

- 善：`checking long bun build`、`polling for EC2 instance running-state`、`idle heartbeat — watching the feed`
- 惡：`waiting`、`loop`、`next tick`、`continuing`

此欄之讀者乃用者，欲解循環所為而不必預知其律。為其書也。

**得：** 一具體之語，使用者一瞥狀態而解之。

**敗則：** 若無具體之由可述，重思循環是否當存（第一步與第六步）。

### 第六步：識勿循環之境

非每「後來」之念皆宜設醒寐。不可設刻於：

- 用者主察——其入為正觸，非計時
- 無收斂之準——循環無「畢」之義
- 任務互動（於刻間問用者）
- 所需之律短於限之底（60 秒）——此密之輪詢屬事驅之機，非循環

**得：** 明擇設醒寐或不循環。「因可」非循環之由。

**敗則：** 若所設醒寐屢為用者於發前中斷，則式誤，非時誤也。

## 驗

- [ ] 待已分為主察、緩存失、或閒（三擇其一）
- [ ] 所擇 `delaySeconds` 落於三階之一（60–270、1200–3600、或閒之 1200–1800）
- [ ] 非 300（兩失之距）
- [ ] 於 `[60, 3600]` 內，或明受限後之行
- [ ] 分界偏移已計（所值視為下限）
- [ ] `reason` 具體且不及 200 字
- [ ] 勿循環之察已行——醒寐確當

## 陷

- **整分之常（300 秒）**：最常之誤。「約五分」似然而正誤。降至 270 秒或定 1200 秒以上。
- **忽分界之偏**：於分末求 60 秒可生約 120 秒之實遲。於緩存溫之刻，此可推越五分之壽。
- **追秒下之精**：調度者粒為分。求 85 秒、90 秒、95 秒皆噪——擇一而行。
- **`reason` 欄晦**：`"waiting"` 於用者無益而減遙測之用。書其由如用者將讀於狀態線。
- **用此技以證冗循環**：若「吾何所察」誠答含糊，無時距可救——循環本不宜存。
- **於提示中手限**：勿於推理中限（「吾將限於 3600 以安」）。行時自限，任其自為。
- **忘七日之老**：動循環默七日後收（用者可調至三十日）。長行之循環宜設其盡遠於上限，非與之競。

## 例

### 例一——緩存溫之主察

`bun build` 方啟；使者欲速察使緩存尚溫於果至時。

- 分（第一步）：主察
- 階（第二步）：緩存溫，擇 **240 秒**
- 分界（第三步）：最壞實待約 300 秒——仍於五分之壽內含 60 秒餘
- 由（第五步）：`checking long bun build`

### 例二——閒之心跳

自主使者一時察低量之饋一次，尋值行之事。

- 分（第一步）：閒
- 階（第二步）：閒之常，擇 **1800 秒**（三十分）
- 分界（第三步）：無關——此律下 60 秒之偏微不足道
- 由（第五步）：`idle heartbeat — watching the feed`

### 例三——反式

使者欲「待五分」於遠端 API 再試之時。所求 300 秒。

- 問：緩存於五分冷，故 300 秒已失——而 300 秒太短不足攤其失
- 補：或降至 270 秒（保溫）或定 1500 秒（攤其失）。勿擇 300。

## 參

- `manage-token-budget` — 長存使者循環之本限；緩存之量其一桿也
- `du-dum` — 察行分離之式；此技量察鍾之距於循環無 cron 時
- `read-continue-here` — 跨會話之交接；此技涵會話內之醒寐
- `write-continue-here` — `read-continue-here` 之補

<!-- Keep under 500 lines. Current: ~200 lines. -->
