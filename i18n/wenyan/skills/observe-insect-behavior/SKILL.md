---
name: observe-insect-behavior
locale: wenyan
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

# 觀蟲之行

行結構之蟲行觀，以採法、行譜、事記、互記、環境脈、與摘析。

## 用時

- 為生態或昆蟲研欲觀蟲行乃用
- 欲書一地一種之行譜乃用
- 欲觀傳粉者於花之活乃用
- 欲書捕食或寄生之互乃用
- 為保護或管之決，需行據乃用
- 以結構田實養行為學之技乃用

## 入

- **必要**：焦蟲或蟲群以觀
- **必要**：計時器（錶、機、或停錶）
- **必要**：記法（簿、聲錄、或數據器）
- **可選**：手鏡（10x）以近觀
- **可選**：望遠鏡以遠觀（如蜻蜓巡）
- **可選**：相機以錄行事
- **可選**：溫計、濕計、或氣象站
- **可選**：預印數紙或行譜模

## 法

### 第一步：選採法

依研問與所觀蟲之行擇法。各法有強有偏。

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

**得：** 已擇之採法附依據（基於研問、所觀類、田況）。記隔或焦次長於觀始前已定。

**敗則：** 焦蟲過動而不能焦觀者（如速飛之蜻蜓），轉至全發採焦於具事（領追、棲返）。不能辨個體者，以掃採於群。隨可行調法，勿棄觀。

### 第二步：定行譜

行譜者，將記諸行之目錄也。觀始前定之，免於田中即興立類。

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

**得：** 觀始前已定全行譜。類宜互斥（任行恰入一類）且窮盡（諸觀行可分之）。

**敗則：** 不期之行不入譜者，原樣記之（如「靜止間翼快振，不合任類」）並於後譜修加新類。勿強新行入不合之類。

### 第三步：記行事附時印

始觀，各行事或態變以精時記之。

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

**得：** 全觀期之連續或隔記，附時印。

**敗則：** 觀中失焦者，記時與因。返者續記。否則，部分記亦為據——記實際觀期。掃採時某蟲於掃時被遮者，僅記可見者並注未計之數。

### 第四步：記互

記焦蟲與他者諸互。互者，二或多個體之行事也。

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

**得：** 諸觀互記，附啟者、夥識（至最低分類層）、二方行、與果。

**敗則：** 互速太快不能全記者（如競雄群），焦於焦蟲行並注「多同時互——細約」。夥識不明者，述之（如「黑膜翅，約 8mm」）。

### 第五步：記環境脈

環境強影蟲行。記協變以使行據可於生態脈中釋。

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

**得：** 觀始終記環境協變，逾一時者中間亦讀。

**敗則：** 無器者，估溫（「暖，約 25C」）、濕（「乾」或「濕」）、風自感。約之環境據遠勝無據。最少：時、雲、估溫。

### 第六步：摘觀

析所記據以生結構摘，附時占、行頻、與所識模。

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

**得：** 結構摘含時占或行頻（依採法）、互摘、所識模、與限明承。

**敗則：** 觀座過短（少於連續十分）不能成有意之時占者，報原事計而非比。注短期為限。短觀亦益若誠報——五分觀記稀行（如寄生產卵）勝於數時靜息。

## 驗

- [ ] 觀始前已選採法並依據之
- [ ] 行譜已定，類互斥窮盡
- [ ] 觀全期附時印記行事
- [ ] 互附啟者、夥、行、果記之
- [ ] 觀始終記環境協變
- [ ] 生摘析含時占或行頻
- [ ] 觀之限（期、失焦時、天）已注

## 陷

- **無譜而始**：觀中即興行類致記不一。觀前定類，雖後修
- **釋而非述**：記「下顎於葉緣速啟閉」非「攻食」。釋於析非田記。擬人標（「怒」「喜」「困」）無位於行為學據
- **觀者疲**：連焦觀心耗。焦次限 15-30 分，間有休。疲觀漏事且記誤
- **擾標**：汝在改行。守距、少動、勿投影於蟲、記前留適應期（2-5 分）
- **忽「無事」**：息與不活為效行態，須記。蟲六成時息為要生態察，非可略之乏據
- **混態與事**：態有期（食三分）。事即時（一翼閃）。態記始終時；事記單時印。混之則時占不諧

## 參

- `document-insect-sighting` — 以照、位、元數據記見以補行觀
- `identify-insect` — 識所觀種，於分類脈中釋行所必
- `collect-preserve-specimens` — 集憑樣以確所觀種之識
- `survey-insect-population` — 跨群擴行觀以解群層行為生態
