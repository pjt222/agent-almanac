---
name: mineral-identification
locale: wenyan-lite
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

# 礦物鑑定

於野外用物理性質、系統排除與簡單野外測試以鑑別礦物。

## 適用時機

- 得未知岩石或礦物標本而欲鑑之
- 勘探時須評一地是否顯貴礦指標
- 欲於野外辨含礦岩與貧岩
- 欲由系統觀察建地質素養

## 輸入

- **必要**：可檢之礦物標本或露頭
- **選擇性**：條痕板（無釉瓷磚或浴室磚背）
- **選擇性**：鋼釘或刀刃（硬度約 5.5）
- **選擇性**：玻璃板（硬度約 5.5）
- **選擇性**：銅幣（硬度約 3.5）
- **選擇性**：手放大鏡（10x）
- **選擇性**：稀鹽酸（10% HCl）以行碳酸鹽試

## 步驟

### 步驟一：未觸即觀

操之前，於上下文中觀標本。

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

**預期：** 操標本前已記野外上下文。

**失敗時：** 若地質上下文不明（散落之標本、城市所獲），僅依物理性質續之——上下文本可助縮候選，但非嚴格必須。

### 步驟二：測物理性質

系統地施診斷測試。

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

**預期：** 標本之輪廓：光澤、硬度範圍、條痕色、解理或斷口類型與相對密度。

**失敗時：** 若性質含糊（如光澤介於金屬與玻璃之間——「亞金屬」），記兩選。含糊降信而不阻鑑定。

### 步驟三：施特殊試

對特定礦物群之附加試。

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

**預期：** 附加診斷資料更縮鑑定範圍。

**失敗時：** 若特殊試不可（無磁鐵、無酸），依基本性質續之——對多數常見礦物已足。

### 步驟四：以排除而鑑

將性質輪廓對照已知礦物。

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

**預期：** 一礦物鑑定或二三候選之短名單，連同辨之所需試。

**失敗時：** 若標本不合任何常礦，可能為岩石（多礦合）非單一礦，或須實驗室分析（薄片、XRD）。

## 驗證

- [ ] 操前已記野外上下文
- [ ] 於自然光下評光澤
- [ ] 至少對二參考材料試硬度
- [ ] 已記條痕色（若標本軟於條痕板）
- [ ] 已記解理或斷口模式
- [ ] 鑑定由系統排除而成，非猜測
- [ ] 已明考並辨相似礦物

## 常見陷阱

- **混黃鐵礦與金**：「愚人金」（黃鐵礦）較硬（6 對 2.5）、脆（金為延展）、條痕黑（金條痕為金）。試確然——用之
- **忽條痕**：標本色不可靠（赤鐵礦可灰、紅或黑）。條痕色一致而診斷
- **以污工具劃**：銹鋼釘生假條痕。用前先清試具
- **設晶形**：多數礦物於野外少現完好之晶。塊狀或粒狀更常——勿要求可見晶以鑑定
- **混風化面與真色**：先破標本以露新面再試。風化殼可全偽其下之礦

## 相關技能

- `gold-washing` — 沖積金回收用礦物鑑定技以讀河流沉積並評含金礫石
