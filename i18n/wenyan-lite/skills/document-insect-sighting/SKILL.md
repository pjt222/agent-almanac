---
name: document-insect-sighting
locale: wenyan-lite
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

# 錄昆蟲目擊

以結構化數據、良照片、公民科學提交之方式錄昆蟲目擊，供生物多樣性之研究。

## 適用時機

- 遇昆蟲欲錄之以供個人或研究之用
- 向 iNaturalist 或 BugGuide 等公民科學平臺貢獻觀察
- 為某生境或地區建系統觀察日誌
- 欲以地理參照之照片記錄支持生態調查
- 為初學者學察並錄昆蟲多樣性

## 輸入

- **必要**：昆蟲目擊（野外之活昆蟲或近遇之標本）
- **必要**：能近拍之相機或手機
- **選擇**：GPS 裝置或啟用定位服務之手機
- **選擇**：供書面觀察之記事本或野外日誌
- **選擇**：察細節之放大鏡（10x）
- **選擇**：作照片比例參考之尺或硬幣
- **選擇**：iNaturalist 或同等公民科學平臺之帳號

## 步驟

### 步驟一：錄位置、日期、天氣

於近昆蟲前捕其背景。許多種繫於特定生境且有季節活動之性，故此元數據與照片同要。

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

**預期：** 背景記錄齊備，含日期、時間、精確位置（理想為 GPS 座標）、觀察時之天氣條件。

**失敗時：** GPS 不可用時，以地標（步道交口、建築、水景）相對描述位置，詳至可重尋之度。天氣數據不確時，估溫度範圍並註「陰」或「晴」，勿空之。

### 步驟二：錄生境與微生境

錄昆蟲於景觀中之何處及其所用之直接底質或結構。

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

**預期：** 生境之描述，置昆蟲於生態背景之中，含廣景觀與發現之直接微生境。

**失敗時：** 微生境難以刻畫（如飛行中之昆蟲）時，錄其所飛近者或所停者。錄「飛於草地之上 1 公尺」而勿空欄。

### 步驟三：以診斷質量拍照

良照片為目擊記錄之最要。公民科學之鑑定幾全賴圖像質量。

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

**預期：** 至少三張可用照片：一張背面、一張側面、一張帶比例參考。理想為五張以上，涵蓋多角度。

**失敗時：** 昆蟲於多角度拍前移動時，優先拍背面（自上而下），其攜最多之鑑定信息。一張銳利之背面照優於多張模糊之圖。昆蟲於任何照片前即飛走時，立即憑記憶繪其體形並錄其色。

### 步驟四：記行為與互動

行為觀察添生態之價，此照片所不能捕。

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

**預期：** 至少三項行為觀察：活動、移動模式、豐度。

**失敗時：** 昆蟲短暫相遇（如落下即飛）時，錄所觀察者並註觀察時長。即「停於葉面、獨居、近則飛、觀察時長 5 秒」亦為有用之數據。

### 步驟五：初步鑑定至目

不必鑑定至種。置昆蟲於其目即大幅縮鑑定，有助公民科學之審者。

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

**預期：** 初步鑑定至目（如「Coleoptera — 甲蟲」），或誠實之「目不確定」附物理描述。

**失敗時：** 昆蟲不明合任何目之快鍵時，錄其體形、翅類、足數。iNaturalist 等平臺接受「Insecta」為初步鑑定，社群鑑定者將精之。誠實之「未知」恆優於勉強之猜。

### 步驟六：提交至公民科學平臺

上傳目擊至平臺，專家與社群鑑定者可驗並精其鑑定。

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

**預期：** 完整觀察已提交至公民科學平臺，含照片、位置、日期、初步鑑定，備社群審查。

**失敗時：** 野外無網路可用時，先存照片與筆記於本地，擬後上傳。多數平臺允後補提交。若無帳號，存於個人日誌——數據仍有價於己之學習，後可上傳。

## 驗證

- [ ] 於近昆蟲前已錄日期、時間、精確位置
- [ ] 天氣與生境背景已錄
- [ ] 至少三張照片由不同角度拍之
- [ ] 至少一張照片含比例參考
- [ ] 行為與活動已記
- [ ] 已試初步鑑定至目（或誠實標為未知）
- [ ] 觀察已提交至公民科學平臺或存於結構化日誌

## 常見陷阱

- **近得太速**：多昆蟲逢速近則逃。緩動而勿投影於之。先由遠而拍，後漸近之
- **忽生境背景**：白牆上之昆蟲照失其生態背景。恆至少一張原地照示其自然環境
- **賴單張照**：一張圖常不足鑑定。翅紋、足構、觸角或唯自特定角度可見
- **忘比例**：無大小參考，5 mm 甲蟲與 50 mm 甲蟲於照中或同。恆含硬幣、尺、手指作比例
- **勉強鑑定**：於公民科學平臺提交信心雖足然誤之鑑定，為研究者製噪音。「Insecta」或「目未知」恆可接受，勝於錯之屬種
- **不錄否定**：「乳草叢中未見昆蟲」為調查之有價缺席數據。錄所查者，非僅所得者

## 相關技能

- `identify-insect` — 需超初步目級定位時之詳細形態鑑定程序
- `observe-insect-behavior` — 為深入行為研究之結構化倫理觀察協議
- `collect-preserve-specimens` — 需實體標本以作最終鑑定時
- `survey-insect-population` — 將個別目擊擴為系統之種群調查
