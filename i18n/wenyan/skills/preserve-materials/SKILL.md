---
name: preserve-materials
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  保存與保護圖書館與檔案之材。含環境控制（溫、濕、光）、操作程序、修書術
  （頁裂、書背鬆、霉斑）、無酸貯、為保存之數位化、災後復原謀。
  立新或既藏之保存修、材有壞徵、設貯之環境控、謀數位化以保脆原、
  或為館藏立災後復原謀時用之。
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: library-science
  complexity: advanced
  language: natural
  tags: library-science, preservation, conservation, book-repair, archival, acid-free, digitization
---

# 保存材料

以環境控制、適操、修術、災備保存與保護圖書與檔案之材。

## 用時

- 立新或既藏之保存修
- 材有壞徵（霉斑、脆、訂鬆）
- 需設貯或展區之環境控
- 謀數位化以保脆原
- 為館或檔案需災後復原謀

## 入

- **必要**：欲保之材（書、稿、照、圖、媒）
- **必要**：當前貯況（溫、濕、光曝）
- **可選**：保存料具之預算
- **可選**：數位化具（掃、相、軟）
- **可選**：既藏之況察

## 法

### 第一步：察當前況

察環境與材以立基線。

```
Environmental Assessment Checklist:
+-----------------------+------------------+---------------------+
| Factor                | Ideal Range      | Measure With        |
+-----------------------+------------------+---------------------+
| Temperature           | 18-21°C          | Thermometer with    |
|                       | (65-70°F)        | min/max recording   |
+-----------------------+------------------+---------------------+
| Relative Humidity     | 30-50% RH        | Hygrometer or       |
|                       |                  | datalogger          |
+-----------------------+------------------+---------------------+
| Light (storage)       | <50 lux          | Light meter         |
|                       | No UV            |                     |
+-----------------------+------------------+---------------------+
| Light (display)       | <200 lux         | Light meter +       |
|                       | UV filtered      | UV filter readings  |
+-----------------------+------------------+---------------------+
| Air quality           | Low dust, no     | Visual inspection,  |
|                       | pollutants       | HVAC filter check   |
+-----------------------+------------------+---------------------+

Material Condition Survey (sample 10% of collection):
- Excellent: No visible damage, binding intact, pages flexible
- Good: Minor wear, slight yellowing, binding sound
- Fair: Moderate foxing, some loose pages, spine cracked
- Poor: Brittle pages, detached covers, active mold or pest damage
- Critical: Pages fragmenting, structural failure, immediate intervention needed

Record the percentage in each condition category.
```

得：環境況與材健之基線數，識即時險與長期趨。

敗則：若監測具不可得，用五金店之基本溫濕計。粗數遠勝無數。優監濕——其為單一最害之環境因。

### 第二步：立環境控

立並維緩壞之況。

```
Environmental Control Priorities (in order of impact):

1. HUMIDITY CONTROL (most critical)
   - Target: 30-50% RH, with <5% daily fluctuation
   - Too high (>60%): mold growth, foxing, warping
   - Too low (<25%): brittleness, cracking, flaking
   - Solutions: dehumidifier, humidifier, HVAC control, silica gel
   - Monitor continuously with datalogger

2. TEMPERATURE CONTROL
   - Target: 18-21°C (65-70°F), with <3°C daily fluctuation
   - Lower is better for long-term preservation (slows chemical decay)
   - Stability matters more than exact temperature
   - Never store near exterior walls, heating vents, or pipes

3. LIGHT MANAGEMENT
   - UV radiation causes irreversible fading and embrittlement
   - Filter all windows with UV film (blocks >99% UV)
   - Use LED lighting (no UV emission) instead of fluorescent
   - Keep lights off in storage areas when not in use
   - Display items on rotation (3-6 months on, then rest)

4. AIR QUALITY
   - HVAC filters: minimum MERV 8, ideally MERV 13
   - No food or drink near materials
   - Avoid off-gassing materials (fresh paint, new carpet, cardboard)
   - Ensure air circulation to prevent microclimate pockets

5. PEST MANAGEMENT (IPM)
   - Inspect incoming materials before shelving
   - Sticky traps at floor level, checked monthly
   - No cardboard boxes (pest habitat) — use archival containers
   - If pests found: isolate affected items, freeze treatment
     (-20°C for 72 hours kills most book pests)
```

得：環境況於目標範內、續監、附逸出之記應對程序。

敗則：若 HVAC 不可控（租或史建），焦於微環：檔案盒、矽膠包、封展櫃立局氣控，雖室不能管。

### 第三步：適操材

防最常源之損：人手。

```
Handling Rules:
1. Clean, dry hands — no gloves for paper (reduces grip and
   dexterity; gloves are for photographs and metal objects)
2. Support the spine: never pull a book by the headcap
   - Push neighboring books back, then grip the desired book
     by both boards at the middle of the spine
3. Never force a book open past its natural opening angle
4. Use book cradles or foam wedges for fragile bindings
5. Pencils only near materials — never pen or ink
6. Flatwork (maps, prints): handle with two hands, support
   full sheet, never fold or roll unless already in that format
7. Photographs: handle by edges only, cotton gloves required
8. Transport: use book trucks with padded shelves, never stack
   more than 3 volumes, never carry more than you can control

Shelving Rules:
- Books upright, snug but not tight
- Oversize volumes flat (never leaning at an angle)
- No bookends that press into the text block
- Pamphlets in acid-free pamphlet binders, not loose on shelves
```

得：諸用者與員守操程序。日用無新損。

敗則：若操致損，速修（第四步）並重訓涉者。多操損為累積——一次拉頭帽不毀書，日為之則矣。

### 第四步：修壞之材

依損度行保護治。

```
Repair Triage Matrix:
+---------------------+---------------------+----------------------------+
| Damage              | Severity            | Treatment                  |
+---------------------+---------------------+----------------------------+
| Torn page           | Minor               | Japanese tissue + wheat    |
|                     |                     | starch paste (reversible)  |
+---------------------+---------------------+----------------------------+
| Loose page          | Minor               | Tip-in with PVA adhesive   |
|                     |                     | along inner margin         |
+---------------------+---------------------+----------------------------+
| Detached cover      | Moderate            | Recase: new endsheets,     |
|                     |                     | reattach cover boards      |
+---------------------+---------------------+----------------------------+
| Cracked spine       | Moderate            | Spine repair with airplane |
|                     |                     | linen and adhesive         |
+---------------------+---------------------+----------------------------+
| Foxing (brown spots)| Cosmetic            | Do NOT bleach. Reduce      |
|                     |                     | humidity to prevent spread  |
+---------------------+---------------------+----------------------------+
| Brittle pages       | Severe              | Deacidification spray      |
|                     |                     | (Bookkeeper or Wei T'o)    |
+---------------------+---------------------+----------------------------+
| Mold (active)       | Critical            | Isolate immediately.       |
|                     |                     | Dry in moving air. Brush   |
|                     |                     | off when dry. HEPA vacuum. |
+---------------------+---------------------+----------------------------+
| Water damage        | Critical/Emergency  | Air dry within 48 hours    |
|                     |                     | or freeze for later drying |
+---------------------+---------------------+----------------------------+

Conservation Principles:
1. REVERSIBILITY: Any treatment should be undoable without
   damaging the original (use wheat starch paste, not superglue)
2. MINIMAL INTERVENTION: Do the least necessary to stabilize.
   Not every old book needs to look new
3. DOCUMENTATION: Photograph before and after. Record materials
   and methods used in the catalog record
4. KNOW YOUR LIMITS: Complex repairs (rebinding, leaf casting,
   leather treatment) require trained conservators

Essential Repair Supplies:
- Japanese tissue (various weights: 3-12 gsm)
- Wheat starch paste (cook fresh or use premixed)
- PVA adhesive (pH-neutral, archival grade)
- Bone folder
- Microspatula
- Waxed paper (for interleaving during drying)
- Book press or weights
```

得：壞之物以可逆治穩，附目錄記。

敗則：若修逾汝技，穩之（裹無酸紙、置護盒）並標待專業保護。劣修惡於不修。

### 第五步：以檔案級材貯

以無酸代品易害之貯料。

```
Storage Material Standards:
+-------------------+---------------------------+---------------------------+
| Material          | Avoid                     | Use Instead               |
+-------------------+---------------------------+---------------------------+
| Boxes             | Corrugated cardboard      | Acid-free/lignin-free     |
|                   | (acidic, attracts pests)  | document boxes            |
+-------------------+---------------------------+---------------------------+
| Folders           | Manila folders (acidic)    | Acid-free folders         |
+-------------------+---------------------------+---------------------------+
| Tissue            | Regular tissue paper      | Acid-free, unbuffered     |
|                   |                           | tissue (for photos too)   |
+-------------------+---------------------------+---------------------------+
| Sleeves           | PVC plastic (off-gasses)  | Polyester (Mylar),        |
|                   |                           | polypropylene, or         |
|                   |                           | polyethylene              |
+-------------------+---------------------------+---------------------------+
| Envelopes         | Glassine (not all         | Acid-free paper or        |
|                   | archival grade)           | Tyvek envelopes           |
+-------------------+---------------------------+---------------------------+
| Labels/tape       | Pressure-sensitive tape,  | Linen tape (water-        |
|                   | rubber bands, paper clips | activated), cotton ties   |
+-------------------+---------------------------+---------------------------+

Special Format Storage:
- Photographs: individual sleeves, upright in acid-free boxes
- Newspapers: unfold, interleave with acid-free tissue, flat storage
- Maps/large prints: flat in map cabinets or rolled (face out) on
  acid-free tubes (minimum 4" diameter)
- Audio/video media: upright, in jewel cases, cool and dry
```

得：諸材皆置於宜檔案質之容，免酸或害圍。

敗則：若檔案料逾預算，先優最值與最脆者。即於書與紙板盒間置無酸紙，亦顯緩酸遷。

### 第六步：謀災

備水、火、霉、他急之應。

```
Disaster Preparedness Essentials:

1. PRIORITY LIST: Rank items for salvage priority (1-3)
   - Priority 1: Unique, irreplaceable items (manuscripts, archives)
   - Priority 2: Rare or expensive items
   - Priority 3: Replaceable items

2. EMERGENCY SUPPLIES KIT (pre-positioned):
   - Plastic sheeting and tarps
   - Mops, buckets, sponges
   - Fans (for air drying)
   - Freezer paper and plastic bags (for freeze-drying)
   - Flashlights and batteries
   - Contact list: conservators, freeze-drying services, insurers

3. WATER EMERGENCY PROTOCOL (most common disaster):
   - Stop the water source if possible
   - Remove materials from standing water immediately
   - Separate wet items: do not stack
   - Air dry paper materials within 48 hours (mold starts at 48 hrs)
   - If too many items to dry in 48 hours: freeze them
     (-20°C stops mold, preserves for later vacuum freeze-drying)
   - Interleave wet pages with absorbent paper, change regularly
   - Never use heat to dry (causes warping and cockling)

4. DOCUMENTATION: Photograph damage for insurance before cleaning.
   Record all affected items and their condition.
```

得：書面災謀、預置料、訓之應隊（即「隊」唯一人）。

敗則：若災至無謀，水損之 48 時規為要：48 時內使濕材風乾或凍。餘可待。

## 驗

- [ ] 環境基線已立（溫、濕、光）
- [ ] 監測已置（續記或日讀）
- [ ] 操程序已記並守
- [ ] 損物已分類並修或穩
- [ ] 害貯料以無酸代品易
- [ ] 災謀已書，附優先列與緊急聯
- [ ] 高值或脆物優予保存注

## 陷

- **忽濕**：溫得諸注，然濕為霉、霉斑、翹、蟲患之主因。先監濕
- **不可逆修**：強力膠、壓敏帶、橡膠膠永損紙。常用可逆膠（小麥粉糊、PVA）
- **過操於保**：諷以熱心保護或致多於良忽之操損。有時最佳保存為留物於良環不擾
- **激治霉斑**：漂去霉斑然弱紙纖。除非威脅可讀，受美學瑕
- **無災謀**：失藏於水之多館無謀無預置料。謀無費；損失盡

## 參

- `catalog-collection` — 目錄當記保存動與況
- `curate-collection` — 汰決依物況與用
- `maintain-hand-tools` — 具養之原（清、油、適貯）平行於材養
