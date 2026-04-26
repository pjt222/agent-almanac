---
name: preserve-materials
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Preserve and conserve library and archival materials. Covers environmental
  controls (temperature, humidity, light), handling procedures, book repair
  techniques (torn pages, loose spines, foxing), acid-free storage, digitization
  for preservation, and disaster recovery planning. Use when establishing
  preservation practices for a new or existing collection, when materials show
  signs of deterioration, when setting up environmental controls for storage,
  when planning digitization to preserve fragile originals, or when creating a
  disaster recovery plan for a library or archive.
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

# 護材

護藏館材、過環控、處則、修術、災備也。

## 用

- 為新或現藏立護→用
- 材顯壞（斑、脆、鬆裝）→用
- 立藏或展之環控→用
- 數化以護脆原→用
- 為館或檔立災復→用

## 入

- **必**：欲護材（書、稿、像、圖、媒）
- **必**：當前藏況（溫、濕、光暴）
- **可**：護備預算
- **可**：數化具（掃、機、軟）
- **可**：現藏況察

## 行

### 一：察當前況

察環與材以立基。

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

得：環況與材健之基資、識即險與長勢。

敗：監具未得→用五金店之基溫濕計。粗資遠優於無。先監濕——單最害環因。

### 二：立環控

建養減壞之況。

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

得：環況於標範、續監、超範時記應程。

敗：HVAC 不可控（租間、史建）→聚於微環：檔盒、矽膠、封展櫃立地控即室不可管。

### 三：正處材

防最常源之害：人處。

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

得：諸用與員遵處則。常用無新害。

敗：處致害→速修（步四）並再訓人。多處害為累——一拉頭蓋不破書、然日為則破矣。

### 四：修壞材

行合害級之護治。

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

得：壞項以可逆治穩、含目錄記。

敗：修過己技→穩之（裹無酸紙、置護盒）標為專護。劣修惡於無修。

### 五：存於檔材

易害藏材為無酸代。

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

得：諸材於合檔質容、無酸或害圍。

敗：檔備過預算→先要寶與脆者。即書與紙板間置無酸紙亦大減酸移。

### 六：計災

備水、火、霉等急應計。

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

得：書災計、預置備、訓應隊（即「隊」一人）。

敗：災起無計→水害 48 時則為要：濕材於 48 時內氣乾或凍。餘可待。

## 驗

- [ ] 環基立（溫、濕、光）
- [ ] 監在（續記或日讀）
- [ ] 處則記而行
- [ ] 壞項分類修或穩
- [ ] 害藏材易為無酸代
- [ ] 災計書含序列與急聯
- [ ] 高值或脆者先護注

## 忌

- **忽濕**：溫得諸注、然濕為霉、斑、翹、蟲之主驅。先監濕
- **不可逆修**：超膠、感壓帶、橡膠膠永害紙。必用可逆膠（澱粉糊、PVA）
- **過處於護**：諷之、熱護可致更多處害於善忽。有時最佳護為留項於善環
- **激治斑**：漂除斑而弱紙纖。受美缺除非威讀
- **無災計**：多失藏於水之館皆無計與預備。計無本；失代諸

## 參

- `catalog-collection` — 目錄記當注護行與況
- `curate-collection` — 剔決計項況與用
- `maintain-hand-tools` — 具養則（清、油、正存）平於材護
