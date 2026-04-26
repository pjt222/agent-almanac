---
name: preserve-materials
locale: wenyan-lite
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

# 保存材料

透過環境調控、得宜操作、修補技術與災備，保存並維護圖書與檔案材料。

## 適用時機

- 為新或既有典藏建立保存實作
- 材料顯露惡化跡象（狐斑、脆化、裝訂鬆動）
- 須為儲存或展示區設環境調控
- 規劃數位化以保存脆弱原件
- 為圖書館或檔案館擬災難復原計畫

## 輸入

- **必要**：待保存之材料（書籍、手稿、相片、地圖、媒體）
- **必要**：當前儲存條件（溫度、濕度、光暴）
- **選擇性**：保存用品與設備之預算
- **選擇性**：數位化設備（掃描器、相機、軟體）
- **選擇性**：既有典藏之狀況調查

## 步驟

### 步驟一：評估當前條件

調查環境與材料以建基線。

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

**預期：** 環境條件與材料健康之基線資料，能辨明立即風險與長期趨勢。

**失敗時：** 若無監測設備，以五金行之基本溫濕度計即可。粗略資料遠勝無資料。先以濕度監測為要——其為最具破壞性之單一環境因子。

### 步驟二：建立環境調控

建立並維持能延緩劣化之條件。

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

**預期：** 環境條件落於目標範圍內，連續監測，並記錄越界時之回應程序。

**失敗時：** 若 HVAC 不可控（租用空間、歷史建築），聚焦於微環境：檔案盒、矽膠包與密封展示櫃，即便房間無法管理仍可建立局部氣候調控。

### 步驟三：得宜操作材料

防範最常見之損害源——人為操作。

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

**預期：** 全部使用者與工作人員皆遵循操作程序。日常使用無新損害。

**失敗時：** 若操作致損，及時修補（步驟四）並重訓相關人員。多數操作損害為累積性——一次以書頂提書不致毀書，但日復一日則不然。

### 步驟四：修補受損材料

依損害程度施對應之修護處理。

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

**預期：** 受損物以可逆處理穩定，並記錄於目錄。

**失敗時：** 若修補超出能力，將物品穩定後（以無酸紙包裹、置於保護盒）標示供專業修護。糟糕之修補比不修更糟。

### 步驟五：以檔案級材料儲存

以無酸替代品取代有害之儲存材料。

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

**預期：** 全部材料皆置於合宜之檔案級容器，免於酸性或有害包裝。

**失敗時：** 若檔案用品超預算，先處理最珍貴與脆弱者。即便僅在書與紙箱間加無酸紙，亦能顯著減緩酸遷移。

### 步驟六：規劃災難應變

備齊水、火、霉與其他緊急事件之應變計畫。

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

**預期：** 一份書面之災難計畫、預先就位之物資、與經訓練之應變團隊（即便僅一人）。

**失敗時：** 若無計畫而災難發生，水損之 48 小時規則即關鍵：48 小時內將濕物送風乾或冷凍，其餘可待。

## 驗證

- [ ] 已建立環境基線（溫度、濕度、光）
- [ ] 已就位之監測（連續資料記錄器或每日讀數）
- [ ] 操作程序已文件化並落實
- [ ] 受損品已分類並修補或穩定
- [ ] 有害儲存材料已換為無酸替代品
- [ ] 災難計畫已書面化，附優先清單與緊急聯絡
- [ ] 高價或脆弱品已優先納入保存

## 常見陷阱

- **疏忽濕度**：溫度受過多注意，惟濕度才是黴、狐斑、變形與蟲害之主因。先監濕度。
- **不可逆修補**：強力膠、壓敏膠帶與橡膠膠水會永久損害紙張。永用可逆黏劑（小麥澱粉糊、PVA）。
- **過度操作之保存**：諷刺地，過熱之保存努力比放任更易致操作損害。良好環境下不擾動，有時即最佳保存。
- **狐斑攻治過猛**：漂白可去狐斑，惟弱化紙纖。除影響可讀性外，宜接受美觀瑕疵。
- **無災難計畫**：多數因水損失典藏之圖書館，皆無計畫且無預備物資。計畫不費分文，損失難以衡量。

## 相關技能

- `catalog-collection` —— 目錄記錄應註保存措施與狀況
- `curate-collection` —— 剔除決策應併考品項狀況與使用
- `maintain-hand-tools` —— 工具養護原則（潔、油、妥儲）與材料保存原則一脈
