---
name: plan-garden-calendar
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  以日、月、生機曆謀劃園事。含 USDA 耐寒區、霜期算、二分二至錨、
  朔望月週（盈/虧）、升/降月、Maria Thun 生機曆（根/葉/花/果日）、
  接續種植時程、季節事務謀。新種季謀劃需種植時程、欲納月或生機時於園、
  特定區算霜期種窗、設接續種植以續收、行季末檢時用之。
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

# 謀園曆

以日、月、生機曆系謀劃園事，求最宜之時。

## 用時

- 新種季謀劃需種植時程
- 欲納月或生機時於園
- 需算所在區之霜期與種窗
- 欲設接續種植以續收
- 季末檢與翌年謀

## 入

- **必要**：USDA 耐寒區或地理位置（為霜期）
- **必要**：欲排之作物或植
- **可選**：曆系之偏（唯日、月、或生機）
- **可選**：園之大小與畦數
- **可選**：上季之園誌

## 法

### 第一步：立日曆之框

日曆供硬界——霜期與晝長。

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

得：所在地之明確霜期與種季長。

敗則：若霜期未知，用保守估（為穩之直播日，於均 LSF 上加 2 週）。地之園藝會或農推站為地域之最佳源。

### 第二步：疊月曆

月影液之流、種之萌、土之生機。二週可重。

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

得：明二月週與其園用。

敗則：若月曆覺繁，先以朔望週（盈 = 地上、虧 = 地下），次季再加恆星層。

### 第三步：納生機曆（可選——進階）

Maria Thun 生機曆依月於黃道之位，將每日分為四植部之一。

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

得：覺生機日型與如何用年曆。

敗則：若生機曆不可得，月相曆（第二步）已捕最要之時訊。得年曆時再加生機日型。

### 第四步：建接續種植時程

錯開種植以續收，免一時之巨穫。

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

得：依區制之週種植曆，含接續間隔之注。

敗則：若時程覺繁，擇汝最要之三作物，唯為其謀接續。次季待韻律已立，再加他作物。

### 第五步：季事時程

種植之外，園有循環之維護事。

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

得：補週種植時程之季節之框。

敗則：若事常誤，時程或過勤。減畦或作物，至韻律可持。

### 第六步：冥想檢點——季末省思

種季之末（首霜之後），與園誌靜坐。

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

得：省思之要，使翌年之謀立於今年之實。

敗則：若省思淪自責，重構之：園為師。每「敗」皆數據。唯一之真敗為不察。

## 驗

- [ ] 所在 USDA 區與霜期已識
- [ ] 日曆錨已標（二分、二至、霜期）
- [ ] 月週已明（最少：盈/虧 = 地上/地下）
- [ ] 種植時程含接續間隔
- [ ] 時程含室內始時（LSF 前數週）
- [ ] 季事框依地適
- [ ] 園誌已始或以本年曆更
- [ ] 種季末已畢冥想檢點

## 陷

1. **太早種**：急春於冷土種，廢種。土溫較氣溫要——用土溫計
2. **忽微氣候**：南向牆溫，低處集霜。汝園有區中之區
3. **曆之僵**：曆為指、非令。氣若違，待之。植不讀曆
4. **無接續種植**：一巨種致一巨穫後即無。錯開以續
5. **略省思**：不察其行，謀自望而非自證。誌為最要之具
6. **過排**：滿曆致竭。留呼吸之餘——園自填之

## 參

- `read-garden` — 觀察之術，告中季之曆調
- `prepare-soil` — 土改之時依季曆
- `cultivate-bonsai` — 盆景之季照同循日/月之框
- `meditate` — 季末省思檢點（全儀）
- `maintain-hand-tools` — 冬之具養為已排之季事
