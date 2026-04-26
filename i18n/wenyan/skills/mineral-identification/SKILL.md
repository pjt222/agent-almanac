---
name: mineral-identification
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Field identification of minerals and ores using hardness, streak, luster,
  cleavage, crystal habit, and simple chemical tests. Covers the systematic
  elimination methodology, Mohs scale application, and common ore indicators
  for precious metals, gemstones, and industrial minerals. Use when encountering
  an unknown rock or mineral specimen, when prospecting and assessing whether a
  site shows valuable mineral indicators, when distinguishing ore-bearing rock
  from barren rock in the field, or when building geological literacy through
  systematic observation.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: prospecting
  complexity: intermediate
  language: natural
  tags: prospecting, minerals, geology, identification, hardness, streak, field-geology
---

# 礦識

野中以體性、系除、簡試識礦。

## 用時

- 遇陌石或礦樣欲識
- 探勘評處示貴礦徵乎
- 野中別含礦石與貧石
- 由系察養地識

## 入

- **必**：可察之礦樣或露頭
- **可選**：條板（無釉瓷磚或浴磚背）
- **可選**：鋼釘或刀（硬約 5.5）
- **可選**：玻片（硬約 5.5）
- **可選**：銅幣（硬約 3.5）
- **可選**：手鏡（10x）
- **可選**：稀鹽酸（10% HCl）為碳酸試

## 法

### 第一步：未觸先察

執前察樣於脈絡。

```
Field Context:
+--------------------+------------------------------------------+
| Observation        | Record                                   |
+--------------------+------------------------------------------+
| Host rock          | What type of rock is it in/on?           |
|                    | (granite, basite, sandstone, schist...)   |
+--------------------+------------------------------------------+
| Geological setting | Vein, disseminated, massive, placer,     |
|                    | weathering surface, cave deposit          |
+--------------------+------------------------------------------+
| Associated         | What other minerals are nearby?           |
| minerals           | (quartz veins often host gold; iron       |
|                    | staining suggests oxidation zone)        |
+--------------------+------------------------------------------+
| Crystal form       | Visible crystals? Habit? Size?           |
| (if visible)       | (cubic, prismatic, tabular, massive)     |
+--------------------+------------------------------------------+
```

**得：** 地脈絡執樣前已錄。

**敗則：** 若地脈絡不明（散樣、市得），唯以體性續——脈絡助縮候而非必。

### 第二步：試體性

系施診試。

```
Diagnostic Property Tests:

LUSTER (how it reflects light):
- Metallic: reflects like metal (pyrite, galena, gold)
- Vitreous: glassy (quartz, feldspar)
- Pearly: like a pearl (muscovite, talc surfaces)
- Silky: like silk fibers (asbestos, satin spar gypsum)
- Earthy/dull: no reflection (kaolin, limonite)
- Adamantine: brilliant, diamond-like (diamond, zircon)

HARDNESS (Mohs scale — scratch test):
+------+-----------+----------------------------------+
| Mohs | Reference | Can Be Scratched By              |
+------+-----------+----------------------------------+
| 1    | Talc      | Fingernail                       |
| 2    | Gypsum    | Fingernail (barely)              |
| 3    | Calcite   | Copper coin                      |
| 4    | Fluorite  | Steel nail (easily)              |
| 5    | Apatite   | Steel nail (just)                |
| 6    | Feldspar  | Steel nail cannot scratch        |
| 7    | Quartz    | Scratches glass                  |
| 8    | Topaz     | Scratches quartz                 |
| 9    | Corundum  | Scratches topaz                  |
| 10   | Diamond   | Scratches everything             |
+------+-----------+----------------------------------+

Test: try to scratch the specimen with each reference tool,
starting from soft to hard. The hardness is between the tool
that fails and the tool that succeeds.

STREAK (powder colour on porcelain):
- Drag the specimen firmly across an unglazed porcelain tile
- Record the colour of the powder line
- Streak colour is often different from specimen colour
- Critical: hematite is grey-black but streaks RED
- Critical: pyrite is gold but streaks BLACK
- Minerals harder than the streak plate (~7) will not leave a streak

CLEAVAGE AND FRACTURE:
- Cleavage: breaks along flat planes (mica: 1 direction, feldspar: 2)
- Fracture: breaks irregularly (conchoidal = curved like glass, uneven, fibrous)
- Note number of cleavage directions and angles between them

SPECIFIC GRAVITY (heft test):
- Hold the specimen and assess: does it feel heavier or lighter
  than expected for its size?
- Heavy: possible metallic ore (galena, gold, magnetite)
- Light: possible pumice, sulfur, or organic material
```

**得：** 樣輪廓：澤、硬範、條色、解/折型、相對重。

**敗則：** 若性含混（如澤介金與玻——「亞金」），記二選。含混減信而不阻識。

### 第三步：施特試

特礦群之加試。

```
Special Field Tests:

MAGNETISM:
- Hold a magnet near the specimen
- Strong attraction: magnetite (or possibly pyrrhotite)
- Weak attraction: some iron-bearing minerals

ACID TEST (10% HCl):
- Drop acid on the specimen surface
- Vigorous fizzing: calcite (CaCO3)
- Fizzing on powder only: dolomite (scratch surface first, then apply acid)
- No fizzing: not a carbonate

TASTE (only for suspected halite):
- Salty taste: halite (NaCl)
- Do NOT taste unknown minerals generally — some are toxic

SMELL:
- Sulfur: rotten egg smell (sulfides when scratched)
- Clay: earthy "petrichor" smell when breathed on (clay minerals)

TENACITY:
- Brittle: shatters when struck (most silicates)
- Malleable: deforms without breaking (gold, copper, silver)
- Flexible: bends and stays (chlorite, some micas)
- Elastic: bends and springs back (muscovite mica)
```

**得：** 加診數以更縮識。

**敗則：** 若特試不可（無磁、無酸），續以基性——多常礦足。

### 第四步：除以識

對性輪廓與已知礦互照。

```
Common Mineral Identification Key (simplified):

METALLIC LUSTER:
- Black streak + hard (6+) + cubic crystals = PYRITE
- Black streak + soft (2.5) + heavy + cubic = GALENA
- Red-brown streak + hard (5-6) + heavy = HEMATITE
- Yellow streak + soft (1.5-2.5) + yellow = GOLD (if malleable)
  or CHALCOPYRITE (if brittle, harder, green-black streak)
- Black streak + magnetic = MAGNETITE

NON-METALLIC, LIGHT-COLORED:
- Vitreous + hard (7) + conchoidal fracture = QUARTZ
- Vitreous + hard (6) + 2 cleavage planes = FELDSPAR
- Vitreous + soft (3) + fizzes in acid = CALCITE
- Pearly + very soft (1) + greasy feel = TALC
- Vitreous + soft (2) + 1 perfect cleavage = GYPSUM

NON-METALLIC, DARK-COLORED:
- Vitreous + hard (5-6) + 2 cleavage at ~90 degrees = PYROXENE
- Vitreous + hard (5-6) + 2 cleavage at ~60/120 degrees = AMPHIBOLE
- Vitreous + soft (2.5-3) + 1 perfect cleavage + flexible = BIOTITE (mica)
```

**得：** 一礦識或 2-3 候單附辨之試。

**敗則：** 若樣不合任常礦，或乃石（多礦聚）非單礦，或需庫析（薄片、XRD）。

## 驗

- [ ] 執前已錄野脈絡
- [ ] 自然光下評澤
- [ ] 對至少二參料試硬
- [ ] 已錄條色（若樣較條板軟）
- [ ] 已記解或折模
- [ ] 由系除而識，非猜
- [ ] 似礦已明慮並辨

## 陷

- **誤黃鐵為金**：「愚金」（黃鐵）較硬（6 對 2.5）、脆（金可鍛）、條黑（金條金）。試確——用之
- **忽條**：樣色不可靠（赤鐵可灰、紅、黑）。條色恆而診
- **以汙具刮**：銹鋼釘生偽條。試前淨具
- **設晶習**：多礦野中少現好晶。塊或粒形多——勿求見晶以識
- **誤風蝕面為真色**：破樣露新面再試。風蝕殼可全掩下礦

## 參

- `gold-washing` — 沖金復用礦識讀溪沉與評含金礫
