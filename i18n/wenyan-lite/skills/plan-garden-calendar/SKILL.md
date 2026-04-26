---
name: plan-garden-calendar
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan garden activities using solar, lunar, and biodynamic calendars. Covers
  USDA hardiness zones, frost date calculation, equinox/solstice anchoring,
  synodic lunar cycle (waxing/waning), ascending/descending moon, Maria Thun
  biodynamic calendar (root/leaf/flower/fruit days), succession planting
  schedules, and seasonal task planning. Use when planning a new growing season
  and needing a planting schedule, integrating lunar or biodynamic timing into
  garden practice, calculating frost dates and planting windows for a specific
  zone, setting up succession planting for continuous harvest, or conducting
  end-of-season review.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: gardening
  complexity: intermediate
  language: natural
  tags: gardening, calendar, lunar, biodynamic, solar, frost-dates, succession-planting
---

# 規劃園圃曆

以日、月與生物動力曆三系統規劃園圃活動，求得最佳時機。

## 適用時機

- 規劃新一季栽種，需排定播種時程
- 欲將月相或生物動力時序納入園圃實作
- 需計算所在區之霜期與播種視窗
- 欲建立逐次播種以求連續收成
- 季末檢討並為來年規劃

## 輸入

- **必要**：USDA 耐寒區或地理位置（用於霜期）
- **必要**：欲排程之作物或植物
- **選擇性**：所偏好之曆系統（純日曆、月曆或生物動力曆）
- **選擇性**：園圃面積與畦數
- **選擇性**：上一季之園圃日誌

## 步驟

### 步驟一：建立日曆框架

日曆界定硬性邊界——霜期與日長。

```
Solar Calendar Anchors:
1. Find your USDA Hardiness Zone:
   - Zone determines minimum winter temperature and which perennials survive
   - Also correlates with growing season length
   - Look up at: planthardiness.ars.usda.gov (US) or local equivalent

2. Determine frost dates:
   - Last spring frost (LSF): Date after which frost is unlikely (50% threshold)
   - First autumn frost (FAF): Date after which frost becomes likely
   - Growing season = FAF minus LSF (in days)

   Example (Zone 7b, mid-Atlantic US):
   - Last spring frost: April 15
   - First autumn frost: October 15
   - Growing season: ~180 days

3. Anchor seasonal milestones:
   ┌───────────────────┬───────────────┬────────────────────────────┐
   │ Event             │ Approx. Date  │ Garden Significance        │
   ├───────────────────┼───────────────┼────────────────────────────┤
   │ Winter solstice   │ Dec 21        │ Seed ordering, planning    │
   │ Spring equinox    │ Mar 20        │ Start indoor seeds (cool   │
   │                   │               │ crops: 6-8 wk before LSF)  │
   │ Last spring frost │ Zone-specific │ Direct sow tender crops    │
   │ Summer solstice   │ Jun 21        │ Peak day length, begin     │
   │                   │               │ autumn crop planning       │
   │ Autumn equinox    │ Sep 22        │ Harvest season, cover crop │
   │ First autumn frost│ Zone-specific │ Protect or harvest tender  │
   │                   │               │ crops before this date     │
   └───────────────────┴───────────────┴────────────────────────────┘
```

**預期：** 所在地之明確霜期與生長季長度。

**失敗時：** 若霜期不明，採保守估計（於平均春末霜期再加 2 週為安全直播日）。地方園藝會或農業推廣中心為最佳之區域來源。

### 步驟二：覆上月曆

月相牽動樹液、發芽與土壤生物。兩個週期皆關鍵。

```
Lunar Cycle 1: Synodic (Phase Cycle — 29.5 days)
┌─────────────────────┬────────────────────────────────────────────┐
│ Phase               │ Garden Activity                            │
├─────────────────────┼────────────────────────────────────────────┤
│ New Moon → 1st Qtr  │ Plant leafy crops (lettuce, spinach,      │
│ (Waxing crescent)   │ cabbage). Sap rises — good for above-     │
│                     │ ground vegetative growth.                  │
├─────────────────────┼────────────────────────────────────────────┤
│ 1st Qtr → Full Moon │ Plant fruiting crops (tomato, pepper,     │
│ (Waxing gibbous)    │ beans, squash). Strong light + rising sap  │
│                     │ = vigorous above-ground growth.            │
├─────────────────────┼────────────────────────────────────────────┤
│ Full Moon → 3rd Qtr │ Plant root crops (carrot, beet, potato,   │
│ (Waning gibbous)    │ onion). Sap descends — energy moves to    │
│                     │ roots. Good for transplanting.             │
├─────────────────────┼────────────────────────────────────────────┤
│ 3rd Qtr → New Moon  │ Rest period. No planting. Good for:       │
│ (Waning crescent)   │ weeding, composting, soil preparation,    │
│                     │ pruning, harvesting for storage.           │
└─────────────────────┴────────────────────────────────────────────┘

Lunar Cycle 2: Sidereal (Ascending/Descending — ~27.3 days)
- Ascending moon (moon moves higher in sky each night):
  Sap rises in plants. Good for: grafting, taking cuttings, harvesting
  fruit and aerial parts, sowing above-ground crops
- Descending moon (moon moves lower in sky each night):
  Sap descends to roots. Good for: planting, transplanting, root
  pruning, applying soil preparations, planting root crops

Note: Ascending/descending is NOT the same as waxing/waning.
Ascending = moon's position in the zodiac moving northward.
Check a biodynamic calendar for daily ascending/descending status.
```

**預期：** 對兩種月相週期及其園圃應用之理解。

**失敗時：** 若月曆過於繁複，先以朔望週期入門（盈月＝地上、虧月＝地下），第二季再加入恆星週期。

### 步驟三：整合生物動力曆（選擇性——進階）

Maria Thun 生物動力曆依月於黃道之位，將每日歸於四種植物器官之一。

```
Biodynamic Day Types:
┌───────────┬─────────────────┬──────────────────────────────────────┐
│ Day Type  │ Zodiac Signs    │ Favoured Activities                  │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Root      │ Taurus, Virgo,  │ Sow/transplant root crops (carrot,  │
│           │ Capricorn       │ beet, potato). Soil cultivation.     │
│           │ (Earth signs)   │ Compost turning.                     │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Leaf      │ Cancer, Scorpio,│ Sow/transplant leafy greens. Water  │
│           │ Pisces          │ plants. Lawn care. Prune for growth. │
│           │ (Water signs)   │                                      │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Flower    │ Gemini, Libra,  │ Sow/transplant flowering plants.    │
│           │ Aquarius        │ Harvest flowers and herbs. Apply     │
│           │ (Air signs)     │ preparation 501 (horn silica).       │
├───────────┼─────────────────┼──────────────────────────────────────┤
│ Fruit     │ Aries, Leo,     │ Sow/transplant fruiting crops       │
│           │ Sagittarius     │ (tomato, pepper, bean). Harvest      │
│           │ (Fire signs)    │ fruit. Collect seed.                 │
└───────────┴─────────────────┴──────────────────────────────────────┘

Using the Calendar:
1. Obtain the current year's Maria Thun biodynamic calendar
   (published annually, available from biodynamic associations)
2. Note which days are root/leaf/flower/fruit
3. Schedule your plantings to align day type with crop type
4. Avoid planting on "unfavourable" days (perigee, node crossings)
5. Combine with synodic phase: e.g., plant carrots on a root day
   during waning moon for strongest root growth signal

Practical Reality:
- Perfect alignment (right phase + right day type + good weather + you're free)
  happens 2-3 times per month. Don't wait for perfection.
- Match at least ONE calendar layer. Matching two is good. Three is ideal.
- Weather and your schedule always override calendar — a plant in the ground
  on the "wrong" day beats a seed in the packet on the "right" day.
```

**預期：** 對生物動力日類別與年度曆使用之認識。

**失敗時：** 若無生物動力曆可用，月相曆（步驟二）已足捕捉最重要之時序訊號；待取得年度曆，再加入日類別。

### 步驟四：建立逐次播種時程

錯開播種以求連續收成，免於一次性大量收成之困擾。

```
Succession Planting Principles:
1. Same crop, staggered sowing:
   - Sow lettuce every 2 weeks from LSF to 8 weeks before FAF
   - Sow bush beans every 3 weeks from 2 weeks after LSF to 10 weeks before FAF
   - Sow radish every 2 weeks (spring and autumn — skip midsummer heat)

2. Different crops, same bed:
   - Spring: peas (harvest June) → Summer: beans (harvest Sept) → Autumn: garlic (harvest next June)
   - This is relay planting — each crop follows the previous with minimal gap

3. Example Succession Calendar (Zone 7b):
   ┌─────────┬────────────────┬───────────────────────────────┐
   │ Week    │ Sow Indoors    │ Direct Sow / Transplant      │
   ├─────────┼────────────────┼───────────────────────────────┤
   │ Feb 15  │ Tomato, pepper │                               │
   │ Mar 1   │ Brassica starts│ Peas, spinach (under cloche)  │
   │ Mar 15  │ Lettuce #1     │ Radish #1, carrots (early)    │
   │ Apr 1   │ Lettuce #2     │ Radish #2, beet #1            │
   │ Apr 15  │               │ Transplant brassicas out       │
   │ May 1   │ Lettuce #3     │ Bean #1, squash, cucumber      │
   │ May 15  │               │ Transplant tomato, pepper      │
   │ Jun 1   │               │ Bean #2, lettuce #4 (shade)    │
   │ Jun 15  │               │ Bean #3                        │
   │ Jul 1   │ Autumn brassica│ Beet #2, carrot (autumn)      │
   │ Jul 15  │               │ Transplant autumn brassicas    │
   │ Aug 1   │               │ Lettuce #5 (autumn), radish #3 │
   │ Aug 15  │               │ Spinach (autumn), cover crop   │
   │ Sep 1   │               │ Garlic (plant 4-6 wks pre FAF)│
   └─────────┴────────────────┴───────────────────────────────┘
```

**預期：** 一份依所在區度身製作之逐週播種曆，並標註逐次播種間隔。

**失敗時：** 若時程令人疲憊，先擇最重要之三項作物作逐次播種；待節奏穩定，第二季再增加品項。

### 步驟五：季節任務時程

播種之外，園圃尚有循環之養護任務。

```
Seasonal Task Framework:
┌───────────┬──────────────────────────────────────────────────────┐
│ Season    │ Tasks                                                │
├───────────┼──────────────────────────────────────────────────────┤
│ Winter    │ - Order seeds (January)                              │
│ (Dec-Feb) │ - Plan beds and crop rotation on paper               │
│           │ - Maintain tools (see maintain-hand-tools)           │
│           │ - Apply prep 500 if ground is workable (late Feb)    │
│           │ - Start earliest indoor seeds (Feb, 8-10 wk pre LSF)│
├───────────┼──────────────────────────────────────────────────────┤
│ Spring    │ - Soil assessment and amendment (see prepare-soil)   │
│ (Mar-May) │ - Direct sow cool crops after soil reaches 7°C      │
│           │ - Transplant warm crops after LSF                    │
│           │ - Mulch beds after soil warms                        │
│           │ - First compost turn of the year                     │
├───────────┼──────────────────────────────────────────────────────┤
│ Summer    │ - Succession sow every 2-3 weeks                    │
│ (Jun-Aug) │ - Water deeply, less frequently (morning preferred)  │
│           │ - Harvest regularly to encourage production           │
│           │ - Start autumn crop seeds indoors (July)             │
│           │ - Apply prep 501 on fruit days (biodynamic)          │
├───────────┼──────────────────────────────────────────────────────┤
│ Autumn    │ - Main harvest and preservation                     │
│ (Sep-Nov) │ - Plant garlic (4-6 weeks before FAF)               │
│           │ - Sow cover crops on empty beds                     │
│           │ - Apply prep 500 (late October)                     │
│           │ - Compost final additions, insulate pile for winter  │
│           │ - End-of-season reflection (meditate checkpoint)     │
└───────────┴──────────────────────────────────────────────────────┘
```

**預期：** 一張與逐週播種時程互補之季節框架。

**失敗時：** 若任務屢屢未盡，時程恐過於野心。減少畦數或品項，直至節奏可長可久。

### 步驟六：冥想檢查點——季末省思

於生長季結束（首霜之後），與園圃日誌靜坐。

```
End-of-Season Reflection (20-30 minutes):
1. Find a quiet spot in or overlooking the garden
2. Bring your garden journal and this year's calendar

3. Review without judgment:
   - What grew well? (Note varieties and planting dates)
   - What struggled? (Was it timing, soil, weather, or neglect?)
   - Which calendar alignments felt meaningful?
   - What surprised you?

4. Note three things to carry forward:
   - One success to repeat
   - One failure to investigate
   - One new thing to try

5. Close the journal. Sit quietly for 5 minutes.
   The garden is resting now. You should rest too.
   Planning begins after solstice — not before.

This reflection becomes the first page of next year's plan.
```

**預期：** 一份具反思性之摘要，使來年計畫立基於今年之實況。

**失敗時：** 若反思變成自我批判，重新框定：園圃即師。每一「失敗」皆為資料；唯一真正之失敗是不去觀察。

## 驗證

- [ ] 已辨明所在地之 USDA 區與霜期
- [ ] 已標出日曆之錨點（春秋分、冬夏至、霜期）
- [ ] 已理解月相週期（至少：盈虧＝地上／地下）
- [ ] 已建立含逐次播種間隔之播種時程
- [ ] 時程已納入室內育苗起始時間（春末霜期前若干週）
- [ ] 季節任務框架已適配本地條件
- [ ] 園圃日誌已開啟或更新此年之曆
- [ ] 生長季末已完成冥想檢查點

## 常見陷阱

1. **播種過早**：春末倉促播入冷土徒費種子。土溫比氣溫更要緊——以土壤溫度計為準。
2. **忽略小氣候**：南向牆面較暖，低處易聚霜。一園之內亦有區中之區。
3. **拘泥曆書**：曆為指引，非命令。天時不對則待之；植物不讀曆。
4. **無逐次播種**：單次大量播種帶來短時暴量，繼而空無。錯開以求連續。
5. **跳過省思**：未檢視所經，便由憧憬規劃，不由實證規劃。日誌為最重要之器具。
6. **過度排程**：滿檔曆書招致倦怠。留出餘地——園圃自會填上。

## 相關技能

- `read-garden` —— 觀察技能，於季中提供曆書微調之資訊
- `prepare-soil` —— 土壤改良時機取決於季節曆
- `cultivate-bonsai` —— 盆景之季節照護沿用同一日／月框架
- `meditate` —— 季末省思檢查點（完整協議）
- `maintain-hand-tools` —— 冬季工具養護是排定之季節任務
