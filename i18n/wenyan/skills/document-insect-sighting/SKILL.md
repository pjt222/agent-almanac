---
name: document-insect-sighting
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Record insect sightings with location, date, habitat, photography, behavior
  notes, preliminary identification, and citizen science submission. Covers
  GPS coordinates, weather conditions, microhabitat description, macro
  photography techniques, behavioral observations, preliminary identification
  to order using body plan, and submission to citizen science platforms such
  as iNaturalist. Use when encountering an insect you want to document,
  contributing to citizen science biodiversity databases, building a personal
  observation journal, or supporting ecological surveys with georeferenced
  photographic records.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: entomology
  complexity: basic
  language: natural
  tags: entomology, insects, documentation, citizen-science, iNaturalist, photography
---

# 蟲遇之錄

以結構資料、高質之影、公民科學之投稿記蟲遇，以資生物多樣性之究。

## 用時

- 遇欲記之蟲作個人或究之錄
- 投觀察於公民科學平臺（如 iNaturalist 或 BugGuide）
- 為某生境或區域立系統觀察日誌
- 欲以具地標且帶照之記支持生態調查
- 初學察並記蟲之多樣

## 入

- **必要**：蟲之遇（野中活蟲或近遇標本）
- **必要**：能近拍之相機或智慧手機
- **可選**：GPS 裝置或開定位之智慧手機
- **可選**：筆記本或野外日誌以書觀察
- **可選**：手持放大鏡（10x）以察細節
- **可選**：尺或硬幣以作照中比例參
- **可選**：iNaturalist 或同類公民科學平臺之帳戶

## 法

### 第一步：錄地、時、氣

近蟲之前先捕上下文。諸種常限於特定生境與季，故此元資與照本身同要。

```
Sighting Record — Context:
+--------------------+------------------------------------------+
| Field              | Record                                   |
+--------------------+------------------------------------------+
| Date               | Full date and time (e.g., 2026-06-15,    |
|                    | 14:30 local time)                        |
+--------------------+------------------------------------------+
| Location           | GPS coordinates if available; otherwise   |
|                    | describe precisely (e.g., "south bank of |
|                    | Elm Creek, 200m east of footbridge")     |
+--------------------+------------------------------------------+
| Elevation          | Meters above sea level if available       |
+--------------------+------------------------------------------+
| Weather            | Temperature (estimate is fine), cloud     |
|                    | cover, wind, recent rain                 |
+--------------------+------------------------------------------+
| Season phase       | Early spring, late spring, summer, early  |
|                    | autumn, late autumn, winter              |
+--------------------+------------------------------------------+
```

**得：** 完整上下文錄，含日、時、精確位置（宜以 GPS 坐標）、觀察時之氣。

**敗則：** 無 GPS 則以地標（小徑交會、建築、水特徵）相對述位，足詳以能復至該處。氣資不確則估溫範圍，記「陰」或「晴」勿留空。

### 第二步：書生境與微生境

記景觀中蟲所在及其用之即時基質或結構。

```
Habitat Recording:
+--------------------+------------------------------------------+
| Factor             | Record                                   |
+--------------------+------------------------------------------+
| Broad habitat      | Deciduous forest, grassland, wetland,    |
|                    | urban garden, riparian corridor, desert   |
+--------------------+------------------------------------------+
| Microhabitat       | Underside of leaf, bark crevice, flower   |
|                    | head, soil surface, under rock, on water  |
|                    | surface, in flight                       |
+--------------------+------------------------------------------+
| Substrate          | Specific plant species if known, dead     |
|                    | wood, dung, carrion, bare soil, rock     |
+--------------------+------------------------------------------+
| Plant association  | What plant is the insect on or near?     |
|                    | (host plant relationships are diagnostic) |
+--------------------+------------------------------------------+
| Light conditions   | Full sun, partial shade, deep shade       |
+--------------------+------------------------------------------+
| Moisture           | Dry, damp, wet, submerged margin          |
+--------------------+------------------------------------------+
```

**得：** 生境之述置蟲於生態上下文，含廣景與蟲所在之即時微生境。

**敗則：** 微生境難以述（如飛中之蟲）則記其飛近或落之物。書「飛於草地上 1 米」勿留空。

### 第三步：以診斷之質攝影

佳照為遇錄之最要元。公民科學之識幾全賴影質。

```
Photography Protocol:

Shots to take (in priority order):
1. DORSAL (top-down) — shows wing pattern, body shape, coloration
2. LATERAL (side view) — shows leg structure, body profile, antennae
3. FRONTAL (head-on) — shows eyes, mouthparts, antennae base
4. VENTRAL (underside) — if accessible, shows leg joints, abdominal pattern
5. SCALE REFERENCE — place a coin, ruler, or finger near the insect
   for size comparison (do not touch the insect)

Tips for quality macro photographs:
- Get as close as your camera allows while maintaining focus
- Use natural light; avoid flash if possible (causes glare and flattens detail)
- Shoot against a neutral background when feasible (leaf, paper, hand)
- Hold the camera parallel to the insect's body plane for maximum sharpness
- Take multiple shots at each angle — at least 3 per view
- If the insect is moving, use burst mode or continuous shooting
- Photograph the insect in situ first, then closer shots if it remains
- Include at least one photo showing the insect in its habitat context
- If wings are open, photograph quickly — the pattern may change when
  wings close (especially butterflies and dragonflies)
```

**得：** 至少三可用照：背、側、含比例參者。宜五以上照覆多角。

**敗則：** 多角未捕前蟲已動則先背視（自上而下），其攜最多識別資訊。單清晰背照勝多模糊之影。蟲於任何照前飛去則即刻記身形與色於憶。

### 第四步：記行為與相作

行為觀察增照所不能捕之生態值。

```
Behavioral Notes:
+--------------------+------------------------------------------+
| Category           | Record what you observe                  |
+--------------------+------------------------------------------+
| Activity           | Feeding, flying, resting, mating,        |
|                    | ovipositing (egg-laying), burrowing,     |
|                    | grooming, basking                        |
+--------------------+------------------------------------------+
| Movement           | Crawling, hovering, darting, undulating   |
|                    | flight, walking on water, jumping        |
+--------------------+------------------------------------------+
| Feeding            | What is it eating? Nectar, pollen, leaf   |
|                    | tissue, other insects, dung, sap?        |
+--------------------+------------------------------------------+
| Interactions       | Other insects nearby? Being predated?     |
|                    | Ants attending? Parasites visible?        |
+--------------------+------------------------------------------+
| Sound              | Buzzing, clicking, stridulation (wing or  |
|                    | leg rubbing)? Silent?                    |
+--------------------+------------------------------------------+
| Abundance          | Solitary individual, a few, many (swarm,  |
|                    | aggregation)?                            |
+--------------------+------------------------------------------+
| Duration           | How long did you observe?                 |
+--------------------+------------------------------------------+
```

**得：** 至少三行為觀察：活動、運動模式、豐度。

**敗則：** 蟲短暫遇（如落即飛）則記所得之察並記觀察時長。即「落於葉上，獨，近則飛，觀察 5 秒」亦有用之資。

### 第五步：初識至目

不必識種。置蟲於其目大幅縮識範並助公民科學之審。

```
Quick Key to Major Insect Orders:

1. Count the legs.
   - 6 legs → insect (proceed below)
   - 8 legs → arachnid (spider, tick, mite) — not an insect
   - More than 8 legs → myriapod (centipede, millipede) — not an insect
   - Wings but hard to count legs → likely insect; look at wings

2. Examine the wings.
   - Hard front wings (elytra) covering body → Coleoptera (beetles)
   - Scaly wings, often colorful → Lepidoptera (butterflies/moths)
   - Two wings + knob-like halteres → Diptera (flies)
   - Four membranous wings + narrow waist → Hymenoptera (bees/wasps/ants)
   - Half-leathery, half-membranous front wings → Hemiptera (true bugs)
   - Large, transparent wings + long abdomen → Odonata (dragonflies/damselflies)
   - Straight, narrow, leathery front wings → Orthoptera (grasshoppers/crickets)
   - No wings, laterally flattened, jumps → Siphonaptera (fleas)
   - No wings, pale body, in wood or soil → Isoptera (termites)

3. If unsure, note: "Order uncertain — resembles [description]"
```

**得：** 初識至目（如「鞘翅目——甲蟲」）或誠實之「目未定」附身形之述。

**敗則：** 蟲不明合速查中任目則記身形、翅型、足數。iNaturalist 等平臺接「昆蟲綱」為初識，社群識者精之。誠實之「未知」恆勝強猜。

### 第六步：投於公民科學平臺

將遇上傳至家與社群識者可驗並精識之平臺。

```
Submission Checklist for iNaturalist (or equivalent):

1. Upload photographs — start with the best dorsal shot
2. Set location — use the map pin or enter GPS coordinates
3. Set date and time of observation
4. Add initial identification (order or family if known; "Insecta" if not)
5. Add observation notes:
   - Habitat and microhabitat
   - Behavior observed
   - Approximate size
   - Any sounds produced
6. Mark as "wild" (not captive/cultivated)
7. Set location accuracy — use the uncertainty circle to reflect GPS precision
8. Submit and monitor for community identifications

Data Quality Tips:
- Observations with 3+ photos from different angles get identified faster
- Including habitat context in one photo helps remote identifiers
- Adding a size reference dramatically improves identification accuracy
- Responding to identifier questions speeds up the process
- "Research Grade" status requires 2+ agreeing identifications at species level
```

**得：** 完整觀察投於公民科學平臺，附照、位置、日期、初識，備社群審。

**敗則：** 野中無網則於本地存諸照與記以待後傳。諸平臺多允追溯投。若無帳戶則存於個人日誌——資仍有學習之值且可後傳。

## 驗

- [ ] 近蟲之前已記日、時、精確位置
- [ ] 氣與生境上下文已書
- [ ] 已從不同角度攝至少三照
- [ ] 至少一照含比例參
- [ ] 行為與活動已記
- [ ] 已試初識至目（或誠實標為未知）
- [ ] 觀察已投公民科學平臺或存結構日誌

## 陷

- **近之過速**：諸蟲急近則逃。緩行，勿以影遮蟲。先遠拍，漸近之
- **略生境上下文**：蟲於白牆之照失生態上下文。恆含至少一現場照示蟲於自然之境
- **賴單照**：單影常不足以識。翅紋、足構、觸角僅自特定角可見
- **忘比例**：無尺參則 5mm 與 50mm 甲蟲於照中相似。恆含硬幣、尺或指以作比例
- **強識**：於公民科學平臺投信心而誤之識為究者生噪。「昆蟲綱」或「目未知」恆可接且勝錯屬種
- **不記空觀察**：「乳草斑未見蟲」於調查為有值之缺證。記所察，非僅所見

## 參

- `identify-insect` — 須超初步目識之詳形態識別
- `observe-insect-behavior` — 更深行為究之結構化行為學觀察程式
- `collect-preserve-specimens` — 須實體標本以作定識時
- `survey-insect-population` — 將單遇擴為系統種群調查
