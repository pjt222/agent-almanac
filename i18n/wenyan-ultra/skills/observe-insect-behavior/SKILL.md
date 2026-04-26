---
name: observe-insect-behavior
locale: wenyan-ultra
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

# 觀蟲行

以採樣程、行譜、事錄、互錄、環錄、要析作結構之蟲行觀。

## 用

- 為生態/蟲究觀蟲行
- 錄某地某種行譜
- 觀粉蟲於花
- 錄捕食/寄生
- 為保育/治決供行料
- 藉野作練蟲學

## 入

- **必**：焦蟲或群
- **必**：計時器（錶、機、停錶）
- **必**：錄法（簿、聲錄、機）
- **可**：放鏡（10x）
- **可**：望遠鏡（觀遠蟲，如蜻蜓巡）
- **可**：相機錄影
- **可**：溫、濕計或氣站
- **可**：預印錄表/譜模

## 行

### 一：擇採樣程

依問+標蟲擇程。各程有強有偏。

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

**得：** 程已擇+具因、間或焦期已定。

**敗：** 標蟲過動（速飛之蜻蜓）→改全發採以特事（領追、復棲）。不能辨個→群掃。適而行、勿棄觀。

### 二：定行譜

譜為將錄諸行之冊。觀前先定，勿臨場造類。

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

**得：** 觀前譜全。類互斥+遍盡。

**敗：** 異行不合譜→照錄（如「靜止快振翅、不合任類」）+觀後修譜。勿強入不合之類。

### 三：時錄行事

始觀、各事/態變記精時。

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

**得：** 連或間之事錄+時、覆全觀期。

**敗：** 焦中失→錄時+因。返則續。否則殘錄亦料—錄實期。掃時某不見→只錄可見+記未錄數。

### 四：錄互動

錄焦與他生之互動。互動為涉二者以上之事。

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

**得：** 諸觀互動皆錄起者、伴名（盡低分類）、雙方行、結果。

**敗：** 互動過速不可全錄（如競雄群）→焦於本蟲行+記「多同時、詳近似」。伴不知→描（如「小黑膜翅、約 8mm」）。

### 五：錄環境

環強影行。錄協變以使行料可入生態境。

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

**得：** 環協變記於起末、長過時則中加錄。

**敗：** 無器→估溫（「暖、約 25C」）、濕（「乾」/「濕」）、風（覺）。粗料勝無料。最少：日時、雲覆、估溫。

### 六：要析觀

析錄出時序、頻、模之結構要。

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

**得：** 結構要含時序或頻、互動要、所見模、明承之限。

**敗：** 觀過短不足成時序（< 10 分連料）→報生事計、勿報比。記短期為限。誠實之短觀亦益—5 分罕見行（如寄生產卵）勝多時靜息。

## 驗

- [ ] 觀前已擇程+具因
- [ ] 譜定—類互斥+遍盡
- [ ] 行事皆有時錄
- [ ] 互動錄起者、伴、雙行、結
- [ ] 環協變於起末錄
- [ ] 要析具時序或頻
- [ ] 限（期、失焦、氣）皆記

## 忌

- **無譜而觀**：場上造類→錄不一致—觀前定譜，後可修
- **以釋代描**：錄「下顎於葉緣速張閉」非「攻食」。釋於析、勿於野。擬人標（「怒」「喜」「惑」）於行學無位
- **觀疲**：連焦觀耗神—焦期 15-30 分、間休—疲者漏事多誤
- **擾標**：汝在擾行—保距、少動、勿投影、許適期（2-5 分）後始正錄
- **忽「無事」**：靜息亦正之態—六成時靜為要生態發現、非可略之悶料
- **態↔事之惑**：態有期（食三分）；事即時（一翅閃）。態錄起末；事錄一時。混則時序失序

## 參

- `document-insect-sighting`
- `identify-insect`
- `collect-preserve-specimens`
- `survey-insect-population`
