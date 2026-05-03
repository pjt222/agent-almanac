---
name: select-print-material
locale: wenyan
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

# 擇印之材

依機械、熱、化之求，擇 3D 印之材。涵 PLA、PETG、ABS、ASA、TPU、Nylon、與樹脂諸變，附性之比。

## 用時

- 部件有特機械之求（拉強、衝擊、彈）擇材乃用
- 為溫敏之應用（熱境、冷境）擇材乃用
- 部件曝化、紫外、外候者乃用
- 食安或生相容之應用乃用
- 原型 vs 生產之印性與性能權衡乃用
- 材所致之印敗或部件性能之察乃用
- 生產之費 vs 性之優乃用

## 入

- **functional_requirements**：載類（拉、壓、彎、扭）、量、循
- **environmental_conditions**：操溫範、紫外曝、化觸、濕
- **mechanical_properties_needed**：強、彈、衝擊、疲耐
- **surface_finish**：外觀求、後處之計
- **printability_constraints**：印之能（熱床、罩）、用之驗
- **special_requirements**：食安、生相容、電絕、透

## 法

### 一、識首要之求類

定主導材擇之求：

**機械性能**：

- 載下之高強
- 衝/震之吸
- 彈或彈性之為
- 疲耐（重載）

**境之耐**：

- 高/低溫之曝
- 紫外/外候
- 化耐（溶、油、酸）
- 濕/水之曝

**特殊應用**：

- 食觸之安
- 生相容（醫）
- 電性（絕、導）
- 光性（透、色）

**印性/費**：

- 原型印之易
- 翹/支之少
- 大件之低材費
- 廣可得

**得**：首要之求已識（如「外候紫外耐」或「高衝擊強」）。

**敗則**：諸求皆要，用決矩陣依求評材（參第六步）。

### 二、施材擇之濾

依求濾候材：

**濾一：程類**

- FDM 可：諸熱塑（PLA、PETG、ABS、ASA、TPU、Nylon）
- SLA 可：諸樹脂（標、堅、彈、可鑄、高溫）
- 印之限：熱床（60-110°C）需於 ABS/ASA/Nylon；罩需於 ABS/ASA

**濾二：溫範**

```
Operating Temperature → Minimum Material Glass Transition (Tg):

< 45°C:  PLA, PLA+, Standard Resin, Tough Resin
< 60°C:  PETG, Flexible Resin
< 80°C:  ABS, ASA, CPE
< 100°C: Nylon, Polycarbonate, High-Temp Resin
> 100°C: PEEK, PEI (Ultem) - specialty printers only
```

**濾三：機械之求**

```
High tensile strength:     Nylon > ABS/ASA > PETG > PLA > TPU
High impact resistance:    Nylon > PETG > ABS > ASA > PLA
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

**得**：濾後留 2-5 候材。

**敗則**：無材過諸濾，鬆最不要之求，或考後處（如 PLA 之 UV 塗）。

### 三、比材性

察材性表為詳比：

## FDM 絲材性

| 材 | 印溫 | 床溫 | 拉強 | 伸長 | Tg/HDT | 紫外耐 | 易 | 吸濕 |
|----------|------------|----------|------------------|------------|--------|-----------|------|-------------|
| **PLA** | 190-220°C | 50-60°C | 50-70 MPa | 5-7% | 55-60°C | 差 | 易 | 低 |
| **PLA+** | 200-230°C | 50-60°C | 60-75 MPa | 10-15% | 60-65°C | 差 | 易 | 低 |
| **PETG** | 220-250°C | 70-85°C | 50-60 MPa | 15-20% | 75-80°C | 良 | 中 | 中 |
| **ABS** | 230-260°C | 95-110°C | 40-50 MPa | 20-40% | 95-105°C | 可 | 難 | 低 |
| **ASA** | 240-260°C | 95-110°C | 45-55 MPa | 15-30% | 95-105°C | 優 | 難 | 低 |
| **TPU** | 210-230°C | 40-60°C | 30-50 MPa | 400-600% | 60-80°C | 良 | 中 | 低 |
| **Nylon** | 240-270°C | 70-90°C | 70-80 MPa | 50-150% | 75-90°C | 優 | 難 | 甚高 |

**注**：

- **拉強**：愈高 = 拉載下愈強
- **伸長**：愈高 = 破前愈彈
- **Tg/HDT**：玻轉/熱變溫（最大操溫）
- **易**：印之難（翹、附、拉絲、支）
- **吸濕**：自氣吸水（需乾盒存）

## SLA 樹脂性

| 樹脂類 | 固時 | 拉強 | 伸長 | HDT | 硬 | 宜於 |
|------------|-----------|------------------|------------|-----|----------|----------|
| **標準** | 2-4s | 45-55 MPa | 6-8% | 60-70°C | 82-85 Shore D | 微像、原型 |
| **堅** | 4-6s | 55-65 MPa | 15-25% | 70-80°C | 80-85 Shore D | 功件、卡扣 |
| **彈** | 6-8s | 5-10 MPa | 80-120% | 50-60°C | 60-70 Shore A | 墊、握 |
| **高溫** | 8-12s | 60-70 MPa | 6-10% | 120-150°C | 85-88 Shore D | 耐熱件 |
| **可鑄** | 3-5s | 35-45 MPa | 8-12% | 60°C | 80 Shore D | 珠寶（失蠟） |

**得**：材性已比，依求識 1-3 首候。

**敗則**：性不明，以 WebFetch 查廠之技術文檔。

### 四、量印性之權衡

量候材之印難 vs 性能：

**印性諸素**：

**易（PLA、PLA+）**：

- 翹少、床附良
- 溫容寬
- 拉絲少、支易除
- 宜於初者與原型
- **權衡**：耐溫低、紫外降、脆

**中（PETG、TPU）**：

- 翹中（PETG 需 70°C+ 床）
- 微拉絲（調回抽）
- TPU 需直驅擠、慢速
- 強度與易之比良
- **權衡**：PETG 易拉絲、TPU 難於懸

**難（ABS、ASA、Nylon）**：

- 無罩則翹甚
- 重氣（ABS/ASA 需通風）
- Nylon 極吸濕（需乾盒）
- 高床溫（95-110°C）與室熱
- **權衡**：機械與境性皆優

**費之考**：

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

**得**：印性已量於印之能與用之驗。決衡性能之需 vs 實之限。

**敗則**：材於當前設過難，擇易之代而以設計補（厚壁、圓角等）。

### 五、察特殊之求

驗材合特殊應用：

**食安**：

- **印正則安**：PLA、PETG（附食安添）
- **永不食安**：ABS、ASA（毒添）、Nylon（孔多、藏菌）
- **求**：用食安之噴嘴（不鏽鋼，非黃銅），以食安之環氧封面
- **注**：FDM 之層線藏菌——SLA 滑樹脂宜於食觸

**生相容**（醫/牙）：

- **FDM**：Nylon（某等）、PLA（限）
- **SLA**：醫級樹脂（皮/組之認證）
- **戒**：家 3D 印非滅菌；醫器諮規

**電性**：

- **絕**：PLA、PETG、ABS、ASA 皆良絕（>10^14 Ω·m）
- **導**：用導絲（碳黑、金屬填）
- **考**：濕吸（Nylon）減絕

**透**：

- **FDM**：近不可能（層線散光）；用甚薄壁或廣磨
- **SLA**：清樹脂可達透，附後處（磨/拋/塗）

**紫外耐**：

- **優**：ASA（為外設）、Nylon
- **良**：PETG、TPU
- **差**：PLA（黃而降）、ABS（黃）

**得**：特求驗於材力。

**敗則**：材不合特求，施後處（如 PLA 之 UV 耐塗）或擇他材。

### 六、以決矩陣作終擇

依加權之準評諸候：

**例：外功之件**：

| 準 | 重 | PLA | PETG | ABS | ASA | Nylon |
|-----------|--------|-----|------|-----|-----|-------|
| 紫外耐 | 30% | 1 | 6 | 5 | 10 | 9 |
| 強 | 25% | 6 | 7 | 6 | 7 | 9 |
| 印性 | 20% | 10 | 7 | 4 | 3 | 3 |
| 溫 | 15% | 2 | 6 | 8 | 8 | 9 |
| 費 | 10% | 10 | 8 | 8 | 6 | 4 |
| **加權總** | | **5.35** | **6.80** | **5.90** | **7.25** | **7.45** |

**評**：1（差）至 10（優）

**決**：Nylon 最高（7.45），然 ASA（7.25）近平且印性佳。**擇 ASA** 若印有罩，或 **PETG**（6.80）若印性要。

**得**：終材已擇，附書面之由依加權優。

**敗則**：決不明，FDM 默 PETG，SLA 默堅樹脂（最佳全圓妥）。

### 七、書材之設

錄材特之印設以後用：

**FDM 設模**：

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

**SLA 設模**：

```yaml
resin: "Anycubic Tough Resin"
color: "Clear"
layer_height: 0.05mm
exposure_time: 6s
bottom_exposure: 40s
lift_distance: 6mm
lift_speed: 65mm/min
notes: "Post-cure 15min at 60°C for full strength. Brittle without cure."
```

**得**：設書於項目之記或切片之配庫。

**敗則**：始於廠之議設，後反復而書成之變。

## 驗

- [ ] 首功求已識（機、境、特）
- [ ] 候材依程、溫、求濾
- [ ] 材性以參表或廠文檔比
- [ ] 印性量於印之能（床溫、罩、通風）
- [ ] 特求已察（食安、紫外耐、透等）
- [ ] 以加權決矩陣作終擇
- [ ] 材特印設書以重
- [ ] 計量之費與可得已驗

## 陷

1. **諸事用 PLA**：PLA 易，然不宜溫 >50°C、外用、或久耐
2. **忽吸濕**：Nylon 與 TPU 自氣吸水致泡、附差、脆——必用乾盒
3. **無罩印 ABS**：ABS 無熱室甚翹；ASA 微佳而仍需罩
4. **假食安**：FDM 件孔多藏菌；真食安需封面或用 SLA 滑樹脂
5. **過設求強**：PETG 足而用貴 Nylon；過殺費錢加印難
6. **低估溫**：近馬達、熱床、車內之件達 60°C+，PLA 軟
7. **忽紫外**：PLA 與 ABS 數月內陽光下黃而降；用 ASA 或塗紫外耐之飾
8. **濕絲印**：濕致擠中蒸泡、層附弱、拉絲——常乾吸濕之材
9. **忽氣**：ABS 與 ASA 排苯乙烯氣；需活通風（非僅開窗）
10. **樹脂之處**：未固樹脂為皮敏與毒；常戴手套於通風處作業

## 參

- **[prepare-print-model](../prepare-print-model/SKILL.md)**：為所擇材配切片設
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**：修材所致印敗（拉絲、翹、附）
- **Dry Filament**（未來技）：吸濕材之乾程
- **Post-Process 3D Prints**（未來技）：磨、蒸熏、塗、退火以進性
