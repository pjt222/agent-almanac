---
name: observe-insect-behavior
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Conduct structured insect behavior observations using sampling protocols,
  ethogram categories, event recording, interaction logging, environmental
  context, and summary analysis. Covers focal animal sampling, scan sampling,
  all-occurrences sampling, and instantaneous sampling methods. Defines a
  standard insect ethogram with locomotion, feeding, grooming, mating,
  defense, communication, and rest categories. Includes timestamped event
  recording, intraspecific and interspecific interaction logging, environmental
  covariate documentation, and time budget analysis. Use when studying insect
  behavior for ecological research, documenting behavioral repertoires for
  a species, observing pollinator activity or predator-prey dynamics, or
  supporting conservation assessments with behavioral data.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: intermediate
  language: natural
  tags: entomology, insects, behavior, ethology, observation, ecology
---

# 觀察昆蟲行為

以標準化抽樣協議、行為譜（ethogram）與量化記錄方法，施行結構化之昆蟲行為觀察。

## 適用時機

- 為生態或昆蟲學研究而觀察昆蟲行為
- 欲記錄某地某物種之行為清單
- 觀察開花植物上之傳粉者活動
- 記錄掠食—被食互動或寄生蜂行為
- 須行為資料以支持保育或管理決策
- 透過結構化田野實踐培養動物行為學技能

## 輸入

- **必要**：可資觀察之焦點昆蟲或群聚
- **必要**：計時器具（手錶、手機或秒錶）
- **必要**：記錄方法（筆記本、錄音機或資料輸入裝置）
- **選擇性**：手鏡（10x）以細觀行為
- **選擇性**：望遠鏡以觀遠處昆蟲（如巡邏中之蜻蜓）
- **選擇性**：相機以錄行為事件之影片
- **選擇性**：溫度計、濕度計或氣象站以採環境資料
- **選擇性**：預印之資料表或行為譜範本

## 步驟

### 步驟一：擇抽樣協議

擇合於研究問題與目標昆蟲行為之協議。各協議皆有特定強項與偏差。

```
Sampling Protocols:
+--------------------+------------------------------------------+
| Protocol           | Description and Best Use                 |
+--------------------+------------------------------------------+
| Focal animal       | Follow one individual continuously for   |
| sampling           | a fixed time period. Record all          |
|                    | behaviors as they occur.                 |
|                    | Best for: detailed behavioral sequences, |
|                    | time budgets, individual-level data.     |
|                    | Duration: 5-30 minutes per focal bout.   |
|                    | Bias: loses data when individual moves   |
|                    | out of sight.                            |
+--------------------+------------------------------------------+
| Scan sampling      | At fixed intervals (e.g., every 60       |
|                    | seconds), quickly scan all visible       |
|                    | individuals and record what each is      |
|                    | doing at that instant.                   |
|                    | Best for: group-level behavior, activity |
|                    | proportions, social insects.             |
|                    | Bias: misses rare or brief behaviors.    |
+--------------------+------------------------------------------+
| All-occurrences    | Record every instance of a specific      |
| sampling           | behavior (e.g., every flower visit,      |
|                    | every aggressive encounter) within a     |
|                    | defined area and time.                   |
|                    | Best for: rare but conspicuous events,   |
|                    | interaction rates, pollinator visits.    |
|                    | Bias: misses simultaneous events.        |
+--------------------+------------------------------------------+
| Instantaneous      | At fixed intervals, record the behavior  |
| (point) sampling   | of one focal individual at that exact    |
|                    | instant. Often combined with focal       |
|                    | animal sampling.                         |
|                    | Best for: time budget calculation with   |
|                    | statistical rigor.                       |
|                    | Bias: misses brief behaviors between     |
|                    | sample points.                           |
+--------------------+------------------------------------------+

Choosing a Protocol:
- "I want to know everything one individual does" → focal animal
- "I want to know what a group is doing right now" → scan
- "I want to count how often a specific event happens" → all-occurrences
- "I want statistically rigorous time budgets" → instantaneous
```

**預期：** 已擇並依研究問題、目標分類群與田野條件論證之抽樣協議。觀察開始前已定記錄間隔或焦點時段持續時間。

**失敗時：** 若目標昆蟲過動而不能行焦點動物抽樣（如疾飛之蜻蜓），改為以特定事件為焦點之全發生抽樣（領域追逐、棲枝回返）。若不能分辨個體以行焦點抽樣，對群行掃描抽樣。改適協議於可行者，而非棄觀察。

### 步驟二：定義行為譜

行為譜乃所將記錄之所有行為清單。觀察前定之，免於田中現編類別。

```
Standard Insect Ethogram:
+--------------------+------------------------------------------+
| Category           | Behavioral States and Events             |
+--------------------+------------------------------------------+
| Locomotion         | Walking, running, flying (straight,      |
|                    | hovering, patrolling, pursuit), jumping, |
|                    | crawling, climbing, burrowing, swimming  |
+--------------------+------------------------------------------+
| Feeding            | Probing (flower, substrate), chewing     |
|                    | (leaf, prey), sucking (phloem, blood,    |
|                    | nectar), lapping, regurgitating, filter  |
|                    | feeding (aquatic larvae)                 |
+--------------------+------------------------------------------+
| Grooming           | Leg rubbing (cleaning antennae with      |
|                    | front legs), wing cleaning, body         |
|                    | brushing, proboscis extension/retraction |
+--------------------+------------------------------------------+
| Reproduction       | Courtship display, copulation attempt,   |
|                    | copulation, mate guarding, oviposition   |
|                    | (egg-laying), nest construction          |
+--------------------+------------------------------------------+
| Defense            | Fleeing, dropping (thanatosis/death      |
|                    | feigning), startle display (wing flash), |
|                    | stinging, biting, chemical release       |
|                    | (spraying, bleeding), aggregation        |
+--------------------+------------------------------------------+
| Communication      | Stridulation (sound production),         |
|                    | pheromone release (wing fanning, gland   |
|                    | exposure), visual signaling (wing        |
|                    | display, bioluminescence), vibrational   |
|                    | signaling (substrate drumming)           |
+--------------------+------------------------------------------+
| Rest               | Stationary with no visible activity,     |
|                    | basking (thermoregulation in sun),       |
|                    | roosting, sheltering                     |
+--------------------+------------------------------------------+

Modifiers (append to any category):
- Substrate: on leaf, on flower, on bark, on ground, on water, in flight
- Orientation: upward, downward, horizontal, head-into-wind
- Intensity: low (slow, intermittent), medium, high (rapid, sustained)
```

**預期：** 觀察開始前已為目標分類群定義完整行為譜。類別應互斥（任何行為合於剛好一類）且窮盡（所有觀察行為皆可分類）。

**失敗時：** 若出意外行為不合行為譜，逐字記之（如「靜止時翼速振，不合任何已定類別」）並於觀察後修譜時加新類。勿強塞新行為入不合之類。

### 步驟三：以時戳錄行為事件

始觀察並以精確計時錄每行為事件或狀態變化。

```
Recording Format:

Continuous recording (focal animal):
  Time    | Behavior         | Substrate   | Notes
  --------+------------------+-------------+------------------
  00:00   | Rest             | Leaf (upper)| Dorsal basking
  00:45   | Grooming         | Leaf (upper)| Front legs cleaning antennae
  01:12   | Walking          | Leaf (upper)| Toward leaf edge
  01:30   | Flying           | In flight   | Short flight, 2m
  01:35   | Landing          | Flower head | Tarsi gripping petals
  01:40   | Feeding (nectar) | Flower head | Proboscis extended
  03:15   | Flying           | In flight   | Left observation area
  03:15   | END — focal lost |             | Duration: 3 min 15 sec

Instantaneous recording (at 30-second intervals):
  Time    | Behavior         | Substrate
  --------+------------------+-------------
  00:00   | Rest             | Leaf
  00:30   | Rest             | Leaf
  01:00   | Feeding          | Flower
  01:30   | Feeding          | Flower
  02:00   | Grooming         | Flower
  02:30   | Flying           | In flight

Rules:
- Start the timer before observing; record time to nearest second
  for continuous, to nearest interval for instantaneous
- Record state changes immediately — do not wait for the next interval
  in continuous recording
- If behavior is ambiguous, record what you see, not what you interpret
  (e.g., "rapid wing vibration" not "aggression")
- Note when focal individual is lost and reason (flew away, obscured)
```

**預期：** 連續或間隔之行為事件記錄附時戳，涵全觀察期。

**失敗時：** 若焦點個體於觀察中失去，記時間與因。若回返，續記。若未返，部分記錄仍為有效資料——記實際觀察時間。掃描抽樣若有個體於掃描時被遮，但記可見者並記未計個體之數。

### 步驟四：記錄互動

記焦點昆蟲與他生物間之所有互動。互動為涉二或多個體之行為事件。

```
Interaction Recording Format:
  Time  | Focal behavior  | Partner(s)       | Partner behavior | Outcome
  ------+-----------------+------------------+------------------+----------
  02:10 | Chase (flying)  | Conspecific male  | Fleeing          | Focal won
  04:30 | Feeding (flower)| Honey bee         | Approaching      | Focal left
  06:15 | Death feigning  | Spider (Salticid) | Stalking         | Spider left

Interaction Types:
+--------------------+------------------------------------------+
| Type               | Examples                                 |
+--------------------+------------------------------------------+
| Intraspecific      | Territorial defense, courtship, mate     |
| (same species)     | competition, dominance, aggregation,     |
|                    | cooperation (social insects)             |
+--------------------+------------------------------------------+
| Predation          | Focal insect capturing prey, or focal    |
|                    | insect being attacked by predator        |
+--------------------+------------------------------------------+
| Parasitism         | Parasitoid ovipositing on/in focal; fly  |
|                    | or mite parasitizing focal               |
+--------------------+------------------------------------------+
| Mutualism          | Pollination (insect-plant), ant-aphid    |
|                    | tending, mycangial fungi transport       |
+--------------------+------------------------------------------+
| Competition        | Displacement from food source,           |
| (interspecific)    | interference at nest site                |
+--------------------+------------------------------------------+

For each interaction record:
- Who initiated (focal or partner)
- Duration of the interaction
- Outcome (winner/loser, successful/unsuccessful, mutual withdrawal)
- Distance at which interaction began
```

**預期：** 所有觀察互動皆記錄發起者、夥伴身分（盡可能至最低分類層級）、雙方行為與結局。

**失敗時：** 若互動快得不能完錄（如雄性競爭群湧），專於焦點個體之行為並記「同時多互動——細節近似」。若夥伴身分未知，描述之（如「小型黑色膜翅目，約 8mm」）。

### 步驟五：記錄環境上下文

環境條件強烈影響昆蟲行為。記協變量使行為資料可置於生態上下文中釋。

```
Environmental Context Record:
+--------------------+------------------------------------------+
| Variable           | How to Record                            |
+--------------------+------------------------------------------+
| Air temperature    | Thermometer reading at insect height,    |
|                    | in shade. Record at start and end of     |
|                    | observation, and hourly for long sessions|
+--------------------+------------------------------------------+
| Relative humidity  | Hygrometer reading. Particularly         |
|                    | important for small insects sensitive    |
|                    | to desiccation                           |
+--------------------+------------------------------------------+
| Wind speed         | Estimate: calm, light (leaves rustle),   |
|                    | moderate (small branches move), strong   |
|                    | (large branches sway). Anemometer if    |
|                    | available                                |
+--------------------+------------------------------------------+
| Cloud cover        | Estimate in oktas (eighths): 0 = clear,  |
|                    | 4 = half-covered, 8 = overcast          |
+--------------------+------------------------------------------+
| Light intensity    | Full sun, partial shade, full shade, or  |
|                    | lux meter reading if available           |
+--------------------+------------------------------------------+
| Time of day        | Record start and end times. Note         |
|                    | position relative to sunrise/sunset for  |
|                    | crepuscular species                      |
+--------------------+------------------------------------------+
| Substrate temp     | Surface temperature where insect is      |
|                    | resting (IR thermometer if available).   |
|                    | Important for basking behavior           |
+--------------------+------------------------------------------+
| Recent weather     | Rain in past 24 hours, frost, drought    |
|                    | conditions — these affect emergence and  |
|                    | activity levels                          |
+--------------------+------------------------------------------+
```

**預期：** 每觀察會話之始末記錄環境協變量；長於 1 小時之會話加中間量讀。

**失敗時：** 若無儀器，估溫度（「暖，約 25C」）、濕度（「乾」或「濕」）、風自感官提示。近似環境資料遠勝無資料。最低限，記時辰、雲量與估溫。

### 步驟六：摘要觀察

分析所錄資料，產生含時間預算、行為頻率與所觀察模式之結構化摘要。

```
Summary Analysis:

1. TIME BUDGET (from focal or instantaneous sampling):
   Calculate the proportion of observation time spent in each
   ethogram category.
   Example:
     Feeding:    45% (13.5 min of 30 min observation)
     Locomotion: 25% (7.5 min)
     Grooming:   12% (3.6 min)
     Rest:       10% (3.0 min)
     Defense:     5% (1.5 min)
     Reproduction:3% (0.9 min)

2. BEHAVIORAL FREQUENCIES (from all-occurrences sampling):
   Count the number of times each event occurred per unit time.
   Example:
     Flower visits: 12 per 30 minutes = 0.4 visits/min
     Territorial chases: 3 per 30 minutes = 0.1 chases/min
     Grooming bouts: 8 per 30 minutes = 0.27 bouts/min

3. INTERACTION SUMMARY:
   Tabulate interactions by type and outcome.
   Example:
     Intraspecific aggressive: 3 (focal won 2, lost 1)
     Interspecific displacement: 2 (focal displaced 1, was displaced 1)
     Predation attempt on focal: 1 (unsuccessful)

4. PATTERNS AND OBSERVATIONS:
   Note any temporal patterns (behavior changes with time of day),
   environmental correlations (activity increases with temperature),
   or unexpected behaviors not previously documented for the species.

5. LIMITATIONS:
   Note observation duration, number of focal bouts, any periods
   when the focal individual was lost, and weather conditions that
   may have affected behavior.
```

**預期：** 含時間預算或行為頻率（視抽樣協議而定）、互動摘要、所觀模式及對限制之明確承認之結構化摘要。

**失敗時：** 若觀察會話過短而無意義之時間預算（連續資料少於 10 分鐘），報原始事件數而非比例。記短時為限制。即短觀察若誠實報告亦助了解——5 分鐘記錄稀有行為（如寄生蜂產卵）較數小時休息行為更具價值。

## 驗證

- [ ] 觀察開始前已擇並論證抽樣協議
- [ ] 已定義含互斥窮盡類別之行為譜
- [ ] 行為事件於整個觀察期皆附時戳記錄
- [ ] 互動已錄發起者、夥伴、行為與結局
- [ ] 觀察始末已錄環境協變量
- [ ] 已產生含時間預算或行為頻率之摘要分析
- [ ] 觀察之限制（持續時間、焦點失去時間、天氣）已記

## 常見陷阱

- **無行為譜即始**：觀察中現編行為類別致記錄不一。首次觀察前定類別，縱後修訂亦然
- **釋而非描**：記「下顎於葉緣速速開合」非「攻擊性進食」。釋於分析中，非田中記錄。擬人化標籤（「怒」、「樂」、「惑」）不宜入動物行為學資料
- **觀察者疲勞**：連續焦點動物抽樣認知耗大。限焦點時段於 15-30 分鐘並間以休息。疲累觀察者漏事件並記錯
- **擾受試者**：你之存在變行為。保距、減動、勿投影於昆蟲，並允習慣期（2-5 分鐘）後始正式記錄
- **忽略「無事發生」**：休息與不活動為有效行為狀態，須記之。一昆蟲花 60% 時間休息為重要生態發現，非可略之無聊資料
- **混狀態與事件**：狀態有持續時間（餵食 3 分鐘）。事件即時（單次翼閃）。狀態以始末時記；事件以單時戳記。混之生不一致之時間預算

## 相關技能

- `document-insect-sighting` — 以照片、位置與元資料記目擊，作為行為觀察之補
- `identify-insect` — 識別所觀物種，於分類上下文中釋行為所必
- `collect-preserve-specimens` — 採憑證標本以證所觀行為物種之身分
- `survey-insect-population` — 將行為觀察擴及種群以了解群落層級之行為生態
