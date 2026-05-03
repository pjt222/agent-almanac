---
name: select-print-material
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Choose 3D printing materials based on mechanical, thermal, and chemical
  requirements. Covers PLA, PETG, ABS, ASA, TPU, Nylon, and resin variants
  with property comparisons. Use when selecting material for parts with
  specific mechanical or thermal requirements, choosing for outdoor or chemical
  exposure, evaluating food-safe or biocompatible applications, balancing
  printability vs. performance, or troubleshooting material-related print
  failures.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: 3d-printing
  complexity: intermediate
  language: multi
  tags: 3d-printing, materials, fdm, sla, material-selection, properties
---

# 擇印料

按機、熱、化需擇 3D 印料。覆 PLA、PETG、ABS、ASA、TPU、尼龍、樹脂諸變含屬比。

## 用

- 件含特機需→用
- 溫敏應→用
- 件露化、UV、外候→用
- 食安或生容應→用
- 衡可印 vs 性→用
- 除料相關印敗或件性問題→用
- 為產均衡費 vs 屬→用

## 入

- **functional_requirements**：載型（拉、壓、彎、扭）、量、責周
- **environmental_conditions**：操溫範、UV 露、化觸、濕
- **mechanical_properties_needed**：強、靈、衝、疲
- **surface_finish**：貌需、後處
- **printability_constraints**：印機能（熱床、罩）、用驗級
- **special_requirements**：食安、生容、電絕、透

## 行

### 一：識主需類

定主導料選之需：

**機性**：高負強、衝吸、靈、疲
**境耐**：高/低溫、UV/外候、化耐、濕
**特應**：食觸、生容、電屬、光屬
**可印/費**：原型易印、少翹/支需、巨件低費、廣可

得：主需識（如「外 UV 耐」或「高衝強」）。

敗：諸需同關→用決陣評料於諸需（見步六）。

### 二：施料選濾

用需濾候：

**濾一：程型**
- FDM：諸熱塑（PLA、PETG、ABS、ASA、TPU、尼龍）
- SLA：諸樹脂（標、強、靈、可鑄、高溫）
- 印機限：ABS/ASA/尼龍需熱床（60-110°C）；ABS/ASA 需罩

**濾二：溫範**
```
< 45°C:  PLA, PLA+, Standard Resin, Tough Resin
< 60°C:  PETG, Flexible Resin
< 80°C:  ABS, ASA, CPE
< 100°C: Nylon, Polycarbonate, High-Temp Resin
> 100°C: PEEK, PEI (Ultem) - specialty printers only
```

**濾三：機需**
```
High tensile strength:    Nylon > ABS/ASA > PETG > PLA > TPU
High impact resistance:   Nylon > PETG > ABS > ASA > PLA
Flexibility:              TPU > Flexible Resin > PLA (brittle)
Fatigue resistance:       Nylon > PETG > ABS > PLA
```

**濾四：境**
```
UV resistance:            ASA > PETG > ABS > PLA (poor)
Chemical resistance:      Nylon > PETG > ABS/ASA > PLA
Outdoor durability:       ASA > Nylon > PETG > PLA (degrades)
Moisture resistance:      ABS/ASA > PETG > PLA > Nylon (hygroscopic)
```

得：濾後 2-5 候料留。

敗：無料過諸濾→鬆最低關需或考後處（如 PLA 加 UV 塗）。

### 三：較料屬

詳較表：

## FDM Filament Properties

| Material | Print Temp | Bed Temp | Tensile Strength | Elongation | Tg/HDT | UV Resist | Ease | Hygroscopic |
|----------|------------|----------|------------------|------------|--------|-----------|------|-------------|
| **PLA** | 190-220°C | 50-60°C | 50-70 MPa | 5-7% | 55-60°C | Poor | Easy | Low |
| **PLA+** | 200-230°C | 50-60°C | 60-75 MPa | 10-15% | 60-65°C | Poor | Easy | Low |
| **PETG** | 220-250°C | 70-85°C | 50-60 MPa | 15-20% | 75-80°C | Good | Medium | Medium |
| **ABS** | 230-260°C | 95-110°C | 40-50 MPa | 20-40% | 95-105°C | Fair | Hard | Low |
| **ASA** | 240-260°C | 95-110°C | 45-55 MPa | 15-30% | 95-105°C | Excellent | Hard | Low |
| **TPU** | 210-230°C | 40-60°C | 30-50 MPa | 400-600% | 60-80°C | Good | Medium | Low |
| **Nylon** | 240-270°C | 70-90°C | 70-80 MPa | 50-150% | 75-90°C | Excellent | Hard | Very High |

## SLA Resin Properties

| Resin Type | Cure Time | Tensile Strength | Elongation | HDT | Hardness | Best For |
|------------|-----------|------------------|------------|-----|----------|----------|
| **Standard** | 2-4s | 45-55 MPa | 6-8% | 60-70°C | 82-85 Shore D | Miniatures |
| **Tough** | 4-6s | 55-65 MPa | 15-25% | 70-80°C | 80-85 Shore D | Functional |
| **Flexible** | 6-8s | 5-10 MPa | 80-120% | 50-60°C | 60-70 Shore A | Gaskets |
| **High-Temp** | 8-12s | 60-70 MPa | 6-10% | 120-150°C | 85-88 Shore D | Heat parts |
| **Castable** | 3-5s | 35-45 MPa | 8-12% | 60°C | 80 Shore D | Jewelry |

得：屬較、按需識 1-3 上候。

敗：屬不明→用 WebFetch 諮製商技單。

### 四：評可印衡

評諸候印難 vs 性：

**易（PLA、PLA+）**：
- 少翹、佳床附
- 寬溫忍、低絲、支易除
- 宜初與原型
- **衡**：低溫耐、UV 降、脆

**中（PETG、TPU）**：
- 中翹（PETG 需 70°C+ 床）
- 些絲（調撤）
- TPU 需直驅擠、緩速
- **衡**：PETG 易絲、TPU 難於懸

**難（ABS、ASA、尼龍）**：
- 無罩重翹
- 強氣（ABS/ASA 需通風）
- 尼龍極吸濕（需乾箱）
- 高床溫（95-110°C）與室熱
- **衡**：佳機與境屬

**費考**：
```
Material cost per kg (typical):
PLA:    $15-25
PETG:   $20-30
ABS:    $18-28
ASA:    $25-35
TPU:    $30-45
Nylon:  $35-55
Standard Resin: $30-50/L
Specialty Resin: $60-150/L
```

得：可印評相對印機能與用驗。決衡性需 vs 實限。

敗：料於當設過難→擇易代並設改補（厚壁、圓角等）。

### 五：察特需

驗料合特用：

**食安**：
- **印正可安**：PLA、PETG（含食安添）
- **永非食安**：ABS、ASA（毒添）、尼龍（孔吸菌）
- **需**：用食安噴（不鏽鋼非銅）、面封食安環氧
- **註**：FDM 層線藏菌—SLA 平樹脂宜食觸

**生容**（醫/牙）：
- **FDM**：尼龍（某級）、PLA（限）
- **SLA**：醫級樹脂（皮/組觸證）
- **警**：家 3D 印非無菌；醫器諮規

**電屬**：
- **絕**：PLA、PETG、ABS、ASA 皆佳絕（>10^14 Ω·m）
- **導**：用導絲（炭黑、金屬填）
- **考**：濕吸（尼龍）減絕

**透**：
- **FDM**：近不能（層線散光）；用極薄壁或多磨
- **SLA**：清樹脂可達透含後處（磨/拋/塗）

**UV 耐**：
- **佳**：ASA（為外設）、尼龍
- **善**：PETG、TPU
- **劣**：PLA（黃降）、ABS（黃）

得：特需驗於料能。

敗：料不達特需→施後處（如 PLA 加 UV 抗塗）或擇異料。

### 六：終選用決陣

評諸候於權準：

**例：外功件**：

| Criterion | Weight | PLA | PETG | ABS | ASA | Nylon |
|-----------|--------|-----|------|-----|-----|-------|
| UV Resistance | 30% | 1 | 6 | 5 | 10 | 9 |
| Strength | 25% | 6 | 7 | 6 | 7 | 9 |
| Printability | 20% | 10 | 7 | 4 | 3 | 3 |
| Temperature | 15% | 2 | 6 | 8 | 8 | 9 |
| Cost | 10% | 10 | 8 | 8 | 6 | 4 |
| **Weighted Total** | | **5.35** | **6.80** | **5.90** | **7.25** | **7.45** |

**評**：1（劣）至 10（佳）

**決**：尼龍最高（7.45）而 ASA（7.25）近平含佳印性。**選 ASA** 若印機含罩，或 **PETG**（6.80）若印性要。

得：終料選附按權先文錄理。

敗：決不明→FDM 默 PETG、SLA 默 Tough Resin（最佳全衡）。

### 七：文錄料設

錄料特印設為將用：

**FDM 設板**：
```yaml
material: PETG
brand: "PolyMaker PolyLite"
color: "Blue"
nozzle_temp: 245°C
bed_temp: 80°C
chamber_temp: ambient
print_speed: 50mm/s
retraction_distance: 4.5mm
retraction_speed: 40mm/s
cooling: 50% (after layer 3)
notes: "Strings moderately, Z-hop helps. Dried 6h at 65°C."
```

**SLA 設板**：
```yaml
resin: "Anycubic Tough Resin"
color: "Clear"
layer_height: 0.05mm
exposure_time: 6s
bottom_exposure: 40s
lift_distance: 6mm
lift_speed: 65mm/min
notes: "Post-cure 15min at 60°C for full strength."
```

得：設文於項註或切片器庫。

敗：始於製商建設、迭並錄成功改。

## 驗

- [ ] 主功需識（機、境、特）
- [ ] 候按程、溫、需濾
- [ ] 屬較經參表或製商單
- [ ] 可印評相對印機能（床溫、罩、通風）
- [ ] 特需察（食安、UV 耐、透等）
- [ ] 終選用決陣含權先
- [ ] 料特印設為復文錄
- [ ] 費與可為計量驗

## 忌

1. **PLA 用諸事**：PLA 易而於 >50°C、外用、長期不宜
2. **忽吸濕**：尼龍與 TPU 吸氣濕生泡、附差、脆—必用乾箱
3. **ABS 無罩**：ABS 無熱室重翹；ASA 微善仍需罩
4. **假食安**：FDM 件孔藏菌；真食安需封或用 SLA 平樹脂
5. **過設強**：PETG 足而用貴尼龍；過殺費錢加印難
6. **低估溫**：近馬達、熱床、車內件達 60°C+ 而 PLA 軟
7. **忽 UV**：PLA 與 ABS 日下數月內黃降；用 ASA 或塗 UV 抗
8. **濕絲印**：濕生擠汽泡、層附弱、絲—必乾吸濕料
9. **忽氣**：ABS 與 ASA 釋苯乙烯；需活通風（非僅開窗）
10. **樹脂處**：未固樹脂為皮敏與毒；恆戴手套於通風處工

## 參

- **[prepare-print-model](../prepare-print-model/SKILL.md)**
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**
