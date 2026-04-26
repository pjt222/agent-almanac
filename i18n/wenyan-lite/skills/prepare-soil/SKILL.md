---
name: prepare-soil
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Assess and improve garden soil through testing, amendment, composting, and
  biodynamic preparations. Covers jar test, spade test, earthworm count,
  amendment by soil type (clay, sandy, depleted, compacted), composting methods
  (hot, cold, vermicomposting), no-till practices, cover cropping, and
  biodynamic preparations 500-508. Use when starting a new garden bed, when
  plants underperform despite adequate water and light, when transitioning to
  organic or biodynamic practice, when soil has become compacted or depleted,
  or when building a composting system.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gardening
  complexity: intermediate
  language: natural
  tags: gardening, soil, compost, biodynamic, amendment, no-till, cover-crop
---

# 整備土壤

評估土壤狀況，並透過改良、堆肥與生物活化，建立健康、活生之土。

## 適用時機

- 開新畦時，需評估既有土壤
- 雖供水供光皆足而植株表現不佳（土壤恐為主因）
- 欲自慣行轉至有機或生物動力法
- 土壤已板結、貧化或疏水
- 需建堆肥系統
- 欲施生物動力配方（500-508）

## 輸入

- **必要**：可達待評之土壤（菜畦、田地或盆器）
- **選擇性**：當前土壤檢測結果（pH、N-P-K、有機質 %）
- **選擇性**：園圃歷史（往昔作物、所施改良、耕作年數）
- **選擇性**：擬種之目標作物
- **選擇性**：路線偏好（有機、生物動力、樸門）

## 步驟

### 步驟一：評估土壤

以下三項田野測試無需實驗室——三者皆作。

```
Test 1: Jar Test (Texture — Sand/Silt/Clay Ratio)
1. Fill a quart jar 1/3 full with soil from 15cm depth
2. Fill to top with water, add 1 tablespoon dish soap
3. Shake vigorously for 3 minutes, then set on level surface
4. Read layers after settling:
   - Sand settles in 1 minute (bottom layer)
   - Silt settles in 4-6 hours (middle layer)
   - Clay settles in 24-48 hours (top layer)
5. Measure each layer as % of total soil depth
   - Ideal garden soil: ~40% sand, ~40% silt, ~20% clay (loam)

Test 2: Spade Test (Structure and Compaction)
1. Push a spade into moist soil to full depth (25cm)
2. Lever up a block of soil and place on a board
3. Observe:
   - Crumbles easily → good structure
   - Breaks into angular blocks → compacted
   - Smears or is sticky → too much clay or waterlogged
   - Layers visible → hardpan or plough pan present
4. Smell the soil:
   - Sweet, earthy → healthy aerobic biology
   - Sour, sulphurous → anaerobic conditions (drainage problem)

Test 3: Earthworm Count (Biological Activity)
1. Dig a 30cm × 30cm × 30cm cube of soil
2. Place on a tarp or board
3. Gently break apart and count earthworms
   - 0-5: Poor biology — needs organic matter
   - 5-10: Fair — improving but not yet thriving
   - 10-20: Good — healthy biological activity
   - 20+: Excellent — this soil is alive
```

**預期：** 對土壤之質地、結構與生物之清晰圖像。一個 jar test 結果、一個結構評等、一個蚯蚓計數。

**失敗時：** 若 jar test 之分層難辨，以更清水與更猛力搖動重作。若蚯蚓為零且土有酸味，土可能為厭氧——須先解決排水方可改良。

### 步驟二：診斷並擬改良計畫

使評估對應改良計畫。

```
Amendment by Soil Type:
┌────────────────┬─────────────────────────┬──────────────────────────────┐
│ Diagnosis      │ Symptoms                │ Amendment                    │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Heavy clay     │ Sticky, slow drainage,  │ Gypsum (calcium sulfate)     │
│                │ >40% clay in jar test   │ 1 kg/m², worked into top     │
│                │                         │ 15cm. Add coarse compost.    │
│                │                         │ Plant daikon radish to break │
│                │                         │ hardpan biologically.        │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Sandy          │ Drains instantly, won't │ Compost 5-10cm thick, worked │
│                │ hold moisture, <20%     │ into top 20cm. Add biochar   │
│                │ silt+clay in jar test   │ (pre-charged with compost    │
│                │                         │ tea) for moisture retention.  │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Depleted       │ Pale colour, low worm   │ 10cm compost top-dress.      │
│                │ count, poor growth      │ Cover crop (legume mix) for  │
│                │ despite watering        │ nitrogen fixation. Foliar    │
│                │                         │ seaweed spray monthly.       │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Compacted      │ Angular blocks in spade │ Broadfork (not rototiller)   │
│                │ test, surface pooling,  │ to fracture without          │
│                │ hard when dry           │ inverting. Deep mulch (15cm  │
│                │                         │ wood chips on paths). Plant  │
│                │                         │ deep-rooted comfrey.         │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Acidic (pH<6)  │ Blueberries thrive but  │ Wood ash (light application) │
│                │ brassicas struggle      │ or dolomite lime. Test pH    │
│                │                         │ before and after — adjust    │
│                │                         │ slowly over 2 seasons.       │
├────────────────┼─────────────────────────┼──────────────────────────────┤
│ Alkaline (pH>7)│ Iron chlorosis (yellow  │ Elemental sulphur or acidic  │
│                │ leaves, green veins)    │ compost (pine needles, oak   │
│                │                         │ leaves). Very slow to shift. │
└────────────────┴─────────────────────────┴──────────────────────────────┘
```

**預期：** 一份對應所診之具體改良計畫。

**失敗時：** 若多病並見（如黏重又貧化），先處理結構（石膏 + broadfork），再處理生物（堆肥 + 覆作）。一次處理全部會讓土壤難以承受。

### 步驟三：建堆肥

依可用空間、材料與時程擇法。

```
Composting Methods:
┌────────────────┬──────────────┬──────────────┬─────────────────────────┐
│ Method         │ Time to      │ Space Needed │ Best For                │
│                │ Finished     │              │                         │
├────────────────┼──────────────┼──────────────┼─────────────────────────┤
│ Hot compost    │ 4-8 weeks    │ 1m³ minimum  │ Large gardens, weed     │
│                │              │              │ seed / disease kill      │
├────────────────┼──────────────┼──────────────┼─────────────────────────┤
│ Cold compost   │ 6-12 months  │ Any size     │ Low effort, small       │
│                │              │              │ quantities              │
├────────────────┼──────────────┼──────────────┼─────────────────────────┤
│ Vermicompost   │ 3-6 months   │ 0.5m² indoor │ Kitchen scraps, indoor  │
│                │              │              │ / apartment gardens     │
└────────────────┴──────────────┴──────────────┴─────────────────────────┘

Hot Compost Protocol:
1. Build pile in layers — 2 parts brown (carbon) to 1 part green (nitrogen)
   - Brown: dried leaves, straw, cardboard, wood chips
   - Green: kitchen scraps, fresh grass, manure, coffee grounds
2. Moisten each layer (damp sponge consistency)
3. Pile must be at least 1m × 1m × 1m to reach temperature
4. Internal temperature should reach 55-65°C (130-150°F) within 3-5 days
5. Turn pile when temperature drops below 45°C (every 5-7 days)
6. After 3-4 turns, cure for 2-4 weeks without turning
7. Finished compost: dark, crumbly, smells like forest floor, no recognizable inputs

Never Compost:
- Meat, dairy, oils (attract pests)
- Diseased plant material (unless hot compost reaches 60°C+ for 3 days)
- Treated wood, glossy paper
- Pet waste (pathogen risk)
```

**預期：** 堆肥系統已建，首批正在進行。

**失敗時：** 若熱堆肥不升溫：檢水分（過乾或過濕）、檢 C:N 比（加綠以增氮）、檢堆量（< 1m³ 不易升溫）。

### 步驟四：實行免耕與覆作

不翻土而保護並建立土壤結構。

```
No-Till Sheet Mulching (New Bed from Lawn or Weeds):
1. Mow or scythe existing vegetation as low as possible
2. Layer cardboard (overlapping edges) directly on ground — no gaps
3. Wet cardboard thoroughly
4. Add 5cm compost on top of cardboard
5. Add 10-15cm organic mulch (straw, wood chips, leaves)
6. Wait 3-6 months (autumn application → spring planting)
7. Plant through mulch by pulling it aside — do not till

Cover Crop Quick Reference:
┌─────────────────┬────────────────┬───────────────────────────────┐
│ Crop            │ Season         │ Benefit                       │
├─────────────────┼────────────────┼───────────────────────────────┤
│ Crimson clover  │ Autumn sow     │ Nitrogen fixation, bee forage │
│ Winter rye      │ Autumn sow     │ Biomass, weed suppression     │
│ Buckwheat       │ Summer sow     │ Fast cover, phosphorus mining │
│ Phacelia        │ Spring/autumn  │ Pollinator magnet, breaks up  │
│                 │                │ compaction                    │
│ Daikon radish   │ Autumn sow     │ Deep root breaks hardpan,     │
│                 │                │ decomposes in place over      │
│                 │                │ winter (bio-drill)            │
└─────────────────┴────────────────┴───────────────────────────────┘

Terminate cover crops by:
- Crimp and roll (best — leaves roots in place)
- Scythe and lay as mulch
- Never rototill — this destroys the soil structure you're building
```

**預期：** 土壤終年受護、生物未受擾、有機質漸增。

**失敗時：** 若覆作未能立成，檢播種深度（多數宜表面或淺播）與水分。再播或以厚覆蓋為替代之地表保護。

### 步驟五：生物動力配方（選擇性——進階）

供 Demeter 或生物動力法之修習者。

```
Biodynamic Preparations Overview:
┌──────┬───────────────┬──────────────────────┬─────────────────────────┐
│ Prep │ Material      │ Application          │ Purpose                 │
├──────┼───────────────┼──────────────────────┼─────────────────────────┤
│ 500  │ Horn manure   │ Spray on soil,       │ Stimulate soil biology,  │
│      │               │ autumn & spring      │ root growth, humus      │
├──────┼───────────────┼──────────────────────┼─────────────────────────┤
│ 501  │ Horn silica   │ Spray on foliage,    │ Light metabolism, fruit  │
│      │               │ morning, summer      │ quality, ripening       │
├──────┼───────────────┼──────────────────────┼─────────────────────────┤
│ 502  │ Yarrow        │ Added to compost     │ Sulphur and potassium   │
│ 503  │ Chamomile     │ Added to compost     │ Calcium, stabilizes N   │
│ 504  │ Stinging nettle│ Added to compost    │ Iron, stimulates soil   │
│ 505  │ Oak bark      │ Added to compost     │ Calcium, disease resist │
│ 506  │ Dandelion     │ Added to compost     │ Silica, light forces    │
│ 507  │ Valerian      │ Sprayed on compost   │ Warmth, phosphorus      │
├──────┼───────────────┼──────────────────────┼─────────────────────────┤
│ 508  │ Horsetail tea │ Spray on foliage     │ Fungal disease prevent  │
└──────┴───────────────┴──────────────────────┴─────────────────────────┘

Preparation 500 Application:
1. Stir 100g horn manure in 35 litres warm water
2. Stir dynamically for 1 hour — create vortex, reverse, create vortex
   (alternating direction every minute)
3. Apply within 1 hour of stirring
4. Spray in large droplets on soil surface — late afternoon, descending moon
5. Apply autumn (before winter) and early spring (before sowing)

Note: Biodynamic preparations are available from certified suppliers
or local biodynamic farming groups. Making your own requires the
previous season's preparations and specific animal horn sheaths.
```

**預期：** 配方已於正確時間與月相施用。土壤生物之活化於 1-2 季內可見。

**失敗時：** 若無配方可得，良好之堆肥與覆作已能達 80% 之生物效益。配方為加分項，不能替代健全之土壤管理。

### 步驟六：療癒檢查點——改良後評估

改良後六週重新評估土壤。

```
Post-Amendment Soil Health Check:
1. Repeat the spade test:
   - Has structure improved? (Crumbles more easily)
   - Are roots penetrating deeper?
   - Any remaining hardpan layers?

2. Repeat the earthworm count:
   - Has the count increased? (Even 2-3 more is progress)
   - Are worms distributed through the depth or just at surface?

3. Drainage test:
   - Dig a 30cm hole, fill with water, let drain, refill
   - Second fill should drain within 1-4 hours
   - <1 hour: very free draining (may need more organic matter)
   - >4 hours: still compacted or clay-heavy (continue treatment)

4. Surface observation:
   - Fungal threads visible in mulch layer? (Good — decomposition active)
   - Green algae on surface? (Too wet or too compacted)
   - Mulch layer breaking down? (Biology is working)

Triage:
- All improving → Continue current approach, reassess next season
- Structure improved but worms low → Add more diverse organic matter
- Worms present but drainage poor → Broadfork again, add coarse material
- No improvement → Soil may have contamination — consider lab test for heavy metals
```

**預期：** 三項指標（結構、生物、排水）至少二項可量測之改善。

**失敗時：** 若六週後無進步，問題恐深於表土改良所及。考慮以含外購土之高架床作為平行策略，同時於數季持續改善地中之土壤。

## 驗證

- [ ] 三項田野測試皆已完成（jar、spade、earthworm）
- [ ] 已自測試結果正確診斷土壤類型
- [ ] 改良計畫對應所診情狀
- [ ] 堆肥系統已建（hot、cold 或 vermi）
- [ ] 土壤終年受覆（覆蓋、覆作或活植物）
- [ ] 無旋耕或翻土
- [ ] 改良後 6 週已執行 heal 檢查點
- [ ] 園圃日誌已記錄測試結果與所施改良

## 常見陷阱

1. **未測即施**：隨意改良費財又會加劇失衡。永遠先測。
2. **旋耕**：感覺有效，實則破壞土壤結構、殺蚯蚓、把雜草種子翻至表面。如必鬆土，改用 broadfork。
3. **裸地**：暴露之土流失水分、結構與生物。永以覆蓋或覆作護之。
4. **新糞直入畦**：燒根並引病原。所有糞應堆肥至少 6 個月再接觸土。
5. **未測 pH 而施石灰**：過石灰使養分不可用。僅依實測結果調 pH。
6. **期望即見成效**：建土以季與年計，非以週計。

## 相關技能

- `cultivate-bonsai` —— 盆景土（赤玉土／浮石／熔岩）為一種專門之土壤備齊
- `plan-garden-calendar` —— 改良時機與季節曆對齊（秋施石灰、春施堆肥）
- `read-garden` —— 土壤觀察為園圃讀法之一環
- `heal` —— 改良後評估循 heal 之分類流程
- `forage-plants` —— 識土壤－植物關係，助讀野生植物棲地
- `make-fire` —— 火後之木灰為傳統之土壤改良劑（鉀 + 石灰）
