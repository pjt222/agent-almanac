---
name: identify-gemstone
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Identify gemstones using optical properties, physical tests, and
  inclusion analysis. Covers refractive index, specific gravity,
  pleochroism, spectroscopy indicators, and common simulant detection.
  Use when identifying an unknown gemstone, verifying a seller's claim about
  species identity, distinguishing natural stones from simulants or synthetics,
  building gemological literacy through structured observation, or identifying
  rough material before cutting to ensure safe handling.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: lapidary
  complexity: intermediate
  language: natural
  tags: lapidary, gemstones, identification, mineralogy, optics
---

# 寶石之識

以系統之物理與光學性測、內含物析、對已知種之排除識寶石。

## 用時

- 有未知寶石或疑似而欲識種
- 欲驗賣家對寶石身份之稱
- 欲別天然寶石於常見仿或合成
- 以結構察與測建寶石學識
- 切割前識原料以確安全處

## 入

- **必要**：寶石標本（裸石為優；鑲石限測）
- **可選**：折射儀與接觸液（RI 液，1.81 標準）
- **可選**：二色鏡（多色性測）
- **可選**：Chelsea 濾色片
- **可選**：比重秤或重液
- **可選**：10x 手鏡或寶石顯微
- **可選**：UV 燈（長波 365nm 與短波 254nm）
- **可選**：偏光鏡（測光性）

## 法

### 第一步：目察

先以肉眼察標本，後以 10x 放大。

```
Visual Inspection Checklist:
+--------------------+------------------------------------------+
| Observation        | Record                                   |
+--------------------+------------------------------------------+
| Colour             | Hue (red, blue, green...), saturation    |
|                    | (vivid, moderate, weak), tone            |
|                    | (light, medium, dark)                    |
+--------------------+------------------------------------------+
| Transparency       | Transparent, translucent, opaque         |
+--------------------+------------------------------------------+
| Luster             | Adamantine, vitreous, waxy, pearly,      |
|                    | silky, resinous                          |
+--------------------+------------------------------------------+
| Cut style          | Faceted, cabochon, carved, rough         |
+--------------------+------------------------------------------+
| Estimated size     | Approximate dimensions (mm) and weight   |
+--------------------+------------------------------------------+
| Surface condition  | Scratches, chips, abrasion, wear pattern |
+--------------------+------------------------------------------+
| Phenomena          | Star (asterism), cat's eye               |
|                    | (chatoyancy), play of colour, colour     |
|                    | change, adularescence                    |
+--------------------+------------------------------------------+
```

1. 於日光等效光（5500-6500K）下記體色
2. 異角察石查色帶
3. 評透與光澤——此即縮候選列
4. 察光學現象（星、貓眼、變彩）
5. 肉眼記任何可見內含物

**得：** 完整目察檔含色、透、光澤、現象。此即縮候選為可管短列。

**敗則：** 若光差（黃室光），記限。強優日光或日光等效燈。白熾光移色覺或致變色石誤識。

### 第二步：物理性測

測可量之物理性以縮識。

```
Key Physical Properties:
+--------------------+------------------------------------------+
| Property           | Method                                   |
+--------------------+------------------------------------------+
| Hardness (Mohs)    | Scratch test against reference minerals  |
|                    | or hardness pencils. CAUTION: Do NOT     |
|                    | scratch faceted gemstones — use other    |
|                    | tests instead for cut stones             |
+--------------------+------------------------------------------+
| Specific gravity   | Hydrostatic weighing:                    |
| (SG)               | SG = weight in air / (weight in air -    |
|                    | weight in water)                         |
|                    |                                          |
|                    | Common SG values:                        |
|                    | Quartz: 2.65                             |
|                    | Beryl: 2.68-2.74                         |
|                    | Tourmaline: 3.02-3.26                    |
|                    | Topaz: 3.53                              |
|                    | Corundum: 3.99-4.01                      |
|                    | Zircon: 4.60-4.73                        |
|                    | CZ: 5.65-5.95                            |
+--------------------+------------------------------------------+
| Heft               | Does the stone feel heavier or lighter   |
|                    | than expected for its size?              |
|                    | CZ and zircon feel noticeably heavy      |
|                    | Quartz and glass feel average            |
+--------------------+------------------------------------------+
```

1. 原料：以莫氏尺參考點測硬度
2. 切石：以水中法測比重
3. 評手感——熟手可以手感別 CZ 與鑽
4. 記表面可見解理面

**得：** 硬度範（原料）或 SG 值（切石）以別候選種。SG 常為切石之單最強診。

**敗則：** 若無水中秤，以手感為粗導。「大於其尺寸之重」石或高 SG（>3.5）。若硬度測將損切石，跳光學測。

### 第三步：光學測

施寶石光學儀得定性。

```
Optical Property Tests:
+--------------------+------------------------------------------+
| Test               | What It Reveals                          |
+--------------------+------------------------------------------+
| Refractive Index   | Measured on refractometer with RI fluid  |
| (RI)               | Diagnostic for most species:             |
|                    | Quartz: 1.544-1.553                      |
|                    | Beryl: 1.577-1.583                       |
|                    | Tourmaline: 1.624-1.644                  |
|                    | Topaz: 1.609-1.617                       |
|                    | Corundum: 1.762-1.770                    |
|                    | Spinel: 1.718                            |
|                    | Diamond: 2.417 (OTL on refractometer)    |
|                    | CZ: 2.15 (OTL on refractometer)          |
+--------------------+------------------------------------------+
| Birefringence      | Difference between high and low RI       |
| (BR)               | Quartz: 0.009                            |
|                    | Corundum: 0.008                          |
|                    | Tourmaline: 0.018-0.020                  |
|                    | Singly refractive: 0 (spinel, garnet,    |
|                    | diamond)                                 |
+--------------------+------------------------------------------+
| Pleochroism        | Colour variation with crystal direction  |
| (dichroscope)      | Strong: tourmaline, tanzanite, iolite    |
|                    | Moderate: corundum, topaz                |
|                    | None: singly refractive stones           |
+--------------------+------------------------------------------+
| Optic character    | Singly refractive (SR), doubly           |
| (polariscope)      | refractive (DR), aggregate (AGG)         |
+--------------------+------------------------------------------+
| UV fluorescence    | Long-wave and short-wave UV response     |
|                    | Diamond: often blue (LWUV)               |
|                    | Ruby: strong red (LWUV)                  |
|                    | Emerald: usually inert                   |
+--------------------+------------------------------------------+
| Chelsea filter     | Transmits deep red and yellow-green      |
|                    | Emerald (Cr): appears red/pink           |
|                    | Aquamarine: appears green                |
|                    | Blue synthetic spinel: appears red       |
+--------------------+------------------------------------------+
```

1. 以折射儀測 RI——取高低讀以算雙折射
2. 以二色鏡測多色性——慢轉記色變
3. 以偏光鏡察光性（SR vs DR vs AGG）
4. 於長波與短波皆測 UV 螢光
5. 若疑鉻致色石用 Chelsea 濾片

**得：** RI 值（至 0.001）、雙折射、光性、多色述、UV 響。合第二步，此即定多數種。

**敗則：** 若 RI 超限（OTL，>1.81），石或鑽、CZ、高型鋯、或高 RI 合成。以 SG 與熱導別。若無折射儀，賴 SG + 目性 + 內含物。

### 第四步：內含物析

於放大下察內部特徵以確種與別天然合成。

```
Diagnostic Inclusions by Species:
+------------------+------------------------------------------+
| Species          | Characteristic Inclusions                |
+------------------+------------------------------------------+
| Diamond          | Crystals (garnet, diopside), feathers,   |
|                  | cloud, graining, pinpoints               |
+------------------+------------------------------------------+
| Ruby/Sapphire    | Silk (rutile needles), fingerprints,     |
|                  | colour zoning (straight angular),        |
|                  | crystal inclusions                       |
+------------------+------------------------------------------+
| Emerald          | Three-phase inclusions (solid + liquid + |
|                  | gas), jardin (garden-like fractures),    |
|                  | pyrite crystals                          |
+------------------+------------------------------------------+
| Tourmaline       | Growth tubes, liquid-filled fractures    |
+------------------+------------------------------------------+
| Quartz/Amethyst  | Tiger stripes, phantoms, two-phase       |
|                  | inclusions, negative crystals            |
+------------------+------------------------------------------+

Synthetic Indicators:
+------------------+------------------------------------------+
| Synthetic Type   | Telltale Inclusions                      |
+------------------+------------------------------------------+
| Flame fusion     | Curved growth lines (striae),            |
| (Verneuil)       | gas bubbles (spherical)                  |
+------------------+------------------------------------------+
| Flux grown       | Flux fingerprints (wispy veils),         |
|                  | platinum platelets                       |
+------------------+------------------------------------------+
| Hydrothermal     | Chevron or zigzag growth patterns,       |
|                  | seed plate remnant                       |
+------------------+------------------------------------------+
| Glass simulants  | Round gas bubbles, swirl marks,          |
|                  | conchoidal fracture chips                |
+------------------+------------------------------------------+
```

1. 於暗視野（寶石顯微）或 10x 手鏡之斜光下察石
2. 先尋種診斷內含物
3. 察合成指標——曲生長線與氣泡為火焰融合合成之確證
4. 記內含物類、位、頻
5. 可則為記攝之

**得：** 種確認之內含物模與天然/合成斷。有種識於內含物勝於光學性（如祖母綠之 jardin）。

**敗則：** 若眼淨於 10x 無見內含物，或極淨天然石或合成。無內含物使合成率升——參光學與物理測以確。或需實驗室析（FTIR、拉曼）。

### 第五步：以排除識

交叉比對所收資料以達末識。

1. 編性檔：
   - 色 + 透 + 光澤
   - 硬度或 SG
   - RI + 雙折射 + 光性
   - 多色 + UV 螢光
   - 內含物模
2. 對候選種之參考表比
3. 略去與任何所測性衝突之種
4. 若餘二或更多候選，識區別測：
   - 例：藍托帕石對海藍寶——SG 定（3.53 對 2.70）
5. 附信心等陳識：
   - **確定**：多性確單種
   - **或然**：性合一種，然缺一測
   - **不確**：資衝或測不足——薦實驗室

**得：** 末種識（如「天然藍寶，加熱處理」）附每測類之支證據。或若野測不足，明勸實驗室析。

**敗則：** 若以現備不能識，記所測性並送寶石實驗室。予實驗室所測資——加速其析。

## 驗

- [ ] 日光等效光下完目察
- [ ] 至少測二物理性（硬度/SG + 一他）
- [ ] 測 RI 並算雙折射（若有折射儀）
- [ ] 測多色性（若有二色鏡）
- [ ] 至少於 10x 放大察內含物
- [ ] 以系統排除達識，非假設
- [ ] 常仿已顯慮並排
- [ ] 天然對合成斷已作（或標不確）

## 陷

- **僅憑色**：色為最弱識性。藍石含藍寶、托帕石、海藍寶、坦桑石、堇青石、尖晶、玻璃、CZ。始終以可測性確
- **鑲石略 SG**：鑲石限測，然仍可察 RI、多色、內含物、UV。記限勿猜
- **高 RI 合成混天然**：火焰融合紅藍寶與天然同 RI 與 SG。唯內含物（曲紋對直生長）別之
- **設貴=天然**：商品珠寶常含處理、合成、或仿石。不論出處稱每石皆測
- **損標本**：勿硬度測切石——留可見刮。切石用非破測（RI、SG、內含物）

## 參

- `cut-gemstone` — 識定該種之安全切割參數與取向
- `appraise-gemstone` — 正識為任何有意估值之前提
- `mineral-identification` — 野外礦物識法以物理性（勘探域）共系統排除法
