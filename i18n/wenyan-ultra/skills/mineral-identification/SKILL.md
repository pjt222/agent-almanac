---
name: mineral-identification
locale: wenyan-ultra
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

# 識礦

於野以實性、系除、簡試識礦。

## 用

- 得未知岩礦欲識
- 探地估其顯貴礦兆
- 於野分含礦岩與貧岩
- 由系察築地識

## 入

- **必**：礦樣或露頭可察
- **可**：條紋板（無釉瓷或浴瓷之背）
- **可**：鋼釘或刀（硬約 5.5）
- **可**：玻璃板（硬約 5.5）
- **可**：銅幣（硬約 3.5）
- **可**：手鏡（10x）
- **可**：稀鹽酸（10% HCl）為碳酸試

## 行

### 一：未觸先察

握前察樣於脈絡。

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

得：握前已記野脈。

敗：地脈不明（散樣、市發）→唯施實性。脈助縮候而非必。

### 二：試實性

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

得：樣之譜：澤、硬範、紋色、解/斷型、相對密。

敗：性含糊（如「次金」澤介金與玻間）→兩記。糊減信而不阻識。

### 三：施特試

特礦群之試。

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

得：補診數縮識。

敗：特試無（無磁、無酸）→以基性行——足於諸常礦。

### 四：以除識

對性譜與已知礦。

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

得：識或 2-3 候之短單含分試。

敗：諸常礦皆不合→或為岩（多礦聚），或需室析（薄片、XRD）。

## 驗

- [ ] 握前已記野脈
- [ ] 澤於日光下評
- [ ] 硬試對至少二參
- [ ] 紋色已記（樣軟於板）
- [ ] 解或斷模已注
- [ ] 識由系除非猜
- [ ] 似礦明慮且分

## 忌

- **混黃鐵與金**：「愚之金」（黃鐵）較硬（6 對 2.5）、脆（金可鍛）、紋黑（金紋金）。試確——用之
- **忽紋**：樣色不可信（赤鐵或灰、紅、黑）。紋色恆且診
- **以污器刮**：銹釘致偽紋。試前清器
- **假晶習**：野中多礦少顯成晶。塊或粒形更常——不必顯晶以識
- **混風面與真色**：碎樣顯新面後試。風皮全偽下礦

## 參

- `gold-washing`
