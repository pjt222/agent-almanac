---
name: select-print-material
locale: wenyan-lite
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

# 選擇列印材料

依機械、熱與化學要求選擇 3D 列印材料，將材料屬性對應至功能需求。此技能涵蓋 FDM 線材（PLA、PETG、ABS、ASA、TPU、Nylon）與 SLA 樹脂（標準、堅韌、彈性、可鑄）並附機械強度、耐溫性、耐化性、彈性與後處理選項之詳細屬性比較。

## 適用時機

- 為具特定機械要求（拉伸強度、抗衝擊、彈性）之零件選材
- 為對溫度敏感之應用（高溫環境、低溫環境）選材
- 暴露於化學品、UV 光或戶外風化之零件
- 食用安全或生物相容應用
- 為原型 vs. 生產零件平衡可列印性 vs. 效能
- 排解材料相關之列印失敗或零件效能問題
- 為生產批次優化成本 vs. 屬性

## 輸入

- **functional_requirements**：負載類型（拉伸、壓縮、彎曲、扭轉）、量值、工作週期
- **environmental_conditions**：操作溫度範圍、UV 暴露、化學接觸、濕氣
- **mechanical_properties_needed**：強度、彈性、抗衝擊、抗疲勞
- **surface_finish**：外觀要求、計劃之後處理
- **printability_constraints**：印表機能力（加熱床、機殼）、用戶經驗等級
- **special_requirements**：食品安全、生物相容、電氣絕緣、透明度

## 步驟

### 1. 識別主要要求類別

決定主導材料選擇之主要要求：

**機械效能**：
- 高強度負載
- 衝擊/震動吸收
- 彈性或彈性行為
- 抗疲勞（重複負載）

**環境耐久性**：
- 高/低溫暴露
- UV/戶外風化
- 耐化學性（溶劑、油類、酸）
- 濕氣/水暴露

**特殊應用**：
- 食品接觸安全
- 生物相容（醫療）
- 電氣屬性（絕緣、導電）
- 光學屬性（透明、顏色）

**可列印性/成本**：
- 原型之列印簡易性
- 最小翹曲/支撐要求
- 大零件之低材料成本
- 廣泛可獲性

**預期：** 已識別主要要求（如「戶外抗 UV」或「高抗衝擊強度」）。

**失敗時：** 若多個要求同等關鍵，用決策矩陣為跨要求之材料評分（見步驟六）。

### 2. 套用材料選擇過濾

用要求過濾候選材料：

**過濾一：製程類型**
- FDM 可用：所有熱塑性塑膠（PLA、PETG、ABS、ASA、TPU、Nylon）
- SLA 可用：所有樹脂（標準、堅韌、彈性、可鑄、高溫）
- 印表機限制：ABS/ASA/Nylon 需加熱床（60-110°C）；ABS/ASA 需機殼

**過濾二：溫度範圍**
```
Operating Temperature → Minimum Material Glass Transition (Tg):

< 45°C:  PLA, PLA+, Standard Resin, Tough Resin
< 60°C:  PETG, Flexible Resin
< 80°C:  ABS, ASA, CPE
< 100°C: Nylon, Polycarbonate, High-Temp Resin
> 100°C: PEEK, PEI (Ultem) - specialty printers only
```

**過濾三：機械要求**
```
High tensile strength:     Nylon > ABS/ASA > PETG > PLA > TPU
High impact resistance:    Nylon > PETG > ABS > ASA > PLA
Flexibility:              TPU > Flexible Resin > PLA (brittle)
Fatigue resistance:       Nylon > PETG > ABS > PLA
```

**過濾四：環境**
```
UV resistance:            ASA > PETG > ABS > PLA (poor)
Chemical resistance:      Nylon > PETG > ABS/ASA > PLA
Outdoor durability:       ASA > Nylon > PETG > PLA (degrades)
Moisture resistance:      ABS/ASA > PETG > PLA > Nylon (hygroscopic)
```

**預期：** 過濾後剩 2-5 候選材料。

**失敗時：** 若無材料通過所有過濾，放鬆最不關鍵之要求或考慮後處理（如為 PLA 加 UV 塗層）。

### 3. 比較材料屬性

查閱材料屬性表作詳細比較：

## FDM 線材屬性

| 材料 | 列印溫度 | 床溫度 | 拉伸強度 | 延伸 | Tg/HDT | UV 耐性 | 簡易性 | 吸濕性 |
|----------|------------|----------|------------------|------------|--------|-----------|------|-------------|
| **PLA** | 190-220°C | 50-60°C | 50-70 MPa | 5-7% | 55-60°C | 差 | 易 | 低 |
| **PLA+** | 200-230°C | 50-60°C | 60-75 MPa | 10-15% | 60-65°C | 差 | 易 | 低 |
| **PETG** | 220-250°C | 70-85°C | 50-60 MPa | 15-20% | 75-80°C | 良 | 中 | 中 |
| **ABS** | 230-260°C | 95-110°C | 40-50 MPa | 20-40% | 95-105°C | 尚可 | 難 | 低 |
| **ASA** | 240-260°C | 95-110°C | 45-55 MPa | 15-30% | 95-105°C | 極佳 | 難 | 低 |
| **TPU** | 210-230°C | 40-60°C | 30-50 MPa | 400-600% | 60-80°C | 良 | 中 | 低 |
| **Nylon** | 240-270°C | 70-90°C | 70-80 MPa | 50-150% | 75-90°C | 極佳 | 難 | 極高 |

**註**：
- **拉伸強度**：愈高 = 拉力下愈強
- **延伸**：愈高 = 斷前愈彈性
- **Tg/HDT**：玻璃轉換 / 熱變形溫度（最大操作溫度）
- **簡易性**：列印難度（翹曲、附著、拉絲、支撐）
- **吸濕性**：自空氣吸水（需乾燥盒儲存）

## SLA 樹脂屬性

| 樹脂類型 | 固化時間 | 拉伸強度 | 延伸 | HDT | 硬度 | 最適 |
|------------|-----------|------------------|------------|-----|----------|----------|
| **標準** | 2-4s | 45-55 MPa | 6-8% | 60-70°C | 82-85 Shore D | 微縮、原型 |
| **堅韌** | 4-6s | 55-65 MPa | 15-25% | 70-80°C | 80-85 Shore D | 功能零件、卡扣 |
| **彈性** | 6-8s | 5-10 MPa | 80-120% | 50-60°C | 60-70 Shore A | 墊圈、握把 |
| **高溫** | 8-12s | 60-70 MPa | 6-10% | 120-150°C | 85-88 Shore D | 耐熱零件 |
| **可鑄** | 3-5s | 35-45 MPa | 8-12% | 60°C | 80 Shore D | 珠寶（脫蠟） |

**預期：** 材料屬性已比較，依要求識別 1-3 頂級候選。

**失敗時：** 若屬性不清，以 WebFetch 工具查閱製造商技術資料表。

### 4. 評估可列印性權衡

評估候選之列印難度 vs. 效能：

**可列印性因素**：

**易（PLA、PLA+）**：
- 最小翹曲、良好之床附著
- 寬廣溫度容忍
- 低拉絲、支撐易移除
- 對初學者與原型理想
- **權衡**：較低之耐溫、UV 降解、脆

**中（PETG、TPU）**：
- 中度翹曲（PETG 需 70°C+ 床）
- 部分拉絲（調整收縮）
- TPU 需直驅擠出機、慢速
- 良好之強度對簡易比
- **權衡**：PETG 易拉絲、TPU 對懸垂具挑戰性

**難（ABS、ASA、Nylon）**：
- 無機殼則嚴重翹曲
- 強烈氣味（ABS/ASA 需通風）
- Nylon 極吸濕（需乾燥盒）
- 高床溫（95-110°C）與腔室熱
- **權衡**：極佳之機械與環境屬性

**成本考量**：
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

**預期：** 可列印性已相對於印表機能力與用戶經驗評估。決策平衡效能需求 vs. 實際限制。

**失敗時：** 若材料對當前設置過難，選較易之替代並以設計變更補償（更厚壁、圓角等）。

### 5. 檢查特殊要求

驗證材料與特殊用例之相容性：

**食品安全**：
- **正確列印時安全**：PLA、PETG（含食品安全添加劑）
- **絕不食用安全**：ABS、ASA（毒性添加劑）、Nylon（多孔、吸菌）
- **要求**：用食品安全噴嘴（不鏽鋼、非黃銅）、以食品安全環氧樹脂封表面
- **註**：FDM 層線困菌——SLA 平滑樹脂對食品接觸更佳

**生物相容**（醫療/牙科）：
- **FDM**：Nylon（部分等級）、PLA（有限）
- **SLA**：醫療級樹脂（認證為皮膚/組織接觸）
- **警告**：家用 3D 列印非無菌；醫療設備諮詢規範

**電氣屬性**：
- **絕緣**：PLA、PETG、ABS、ASA 皆良好絕緣（>10^14 Ω·m）
- **導電**：用導電線材（炭黑、金屬填充）
- **考量**：濕氣吸收（Nylon）降低絕緣

**透明度**：
- **FDM**：幾乎不可能（層線散光）；用極薄壁或廣泛拋光
- **SLA**：透明樹脂可經後處理達透明（砂磨/拋光/塗層）

**UV 耐性**：
- **極佳**：ASA（為戶外設計）、Nylon
- **良**：PETG、TPU
- **差**：PLA（黃化並降解）、ABS（黃化）

**預期：** 特殊要求已對照材料能力驗證。

**失敗時：** 若材料不符特殊要求，套用後處理（如 PLA 上 UV 抗性塗層）或選不同材料。

### 6. 以決策矩陣作最終選擇

跨加權標準為候選評分：

**戶外功能零件之範例**：

| 標準 | 權重 | PLA | PETG | ABS | ASA | Nylon |
|-----------|--------|-----|------|-----|-----|-------|
| UV 耐性 | 30% | 1 | 6 | 5 | 10 | 9 |
| 強度 | 25% | 6 | 7 | 6 | 7 | 9 |
| 可列印性 | 20% | 10 | 7 | 4 | 3 | 3 |
| 溫度 | 15% | 2 | 6 | 8 | 8 | 9 |
| 成本 | 10% | 10 | 8 | 8 | 6 | 4 |
| **加權總計** | | **5.35** | **6.80** | **5.90** | **7.25** | **7.45** |

**評分**：1（差）至 10（極佳）

**決策**：Nylon 得分最高（7.45）但 ASA（7.25）幾乎並列且可列印性更佳。**選 ASA** 若印表機有機殼，或 **PETG**（6.80）若可列印性重要。

**預期：** 最終材料已選，附依加權優先級之書面理由。

**失敗時：** 若決策不明，FDM 預設 PETG 或 SLA 預設堅韌樹脂（最佳全方位折衷）。

### 7. 記錄材料設定

記錄材料特定列印設定供未來使用：

**FDM 設定範本**：
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

**SLA 設定範本**：
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

**預期：** 設定已於項目筆記或切片器設定檔庫中記錄。

**失敗時：** 從製造商建議設定起步，再反覆並記錄成功變更。

## 驗證清單

- [ ] 主要功能要求已識別（機械、環境、特殊）
- [ ] 材料候選依製程、溫度與要求過濾
- [ ] 材料屬性經參考表或製造商資料表比較
- [ ] 可列印性已相對於印表機能力評估（床溫、機殼、通風）
- [ ] 特殊要求已檢查（食品安全、UV 耐性、透明度等）
- [ ] 最終選擇以加權優先級之決策矩陣作出
- [ ] 材料特定列印設定已記錄供可重現
- [ ] 成本與可獲性已對計劃量驗證

## 常見陷阱

1. **諸事皆選 PLA**：PLA 易但不適 >50°C 之溫度、戶外使用或長期耐久
2. **忽視吸濕性**：Nylon 與 TPU 自空氣吸濕，引發冒泡、附著差與脆——須用乾燥盒
3. **無機殼之 ABS**：ABS 無加熱腔嚴重翹曲；ASA 略佳但仍需機殼
4. **假設食品安全**：FDM 零件多孔且困菌；真食品安全需封閉或用 SLA 平滑樹脂
5. **過度設計強度**：PETG 足時用昂貴 Nylon；過量浪費錢且增列印難度
6. **低估溫度**：靠近馬達、加熱床或於車中之零件達 60°C+，PLA 將軟化
7. **忽視 UV 暴露**：PLA 與 ABS 於陽光中數月內黃化降解；用 ASA 或塗 UV 抗性飾面
8. **濕線材列印**：濕氣於擠出機中引發蒸氣泡、弱層附著、拉絲——應始終乾燥吸濕材料
9. **忽視氣味**：ABS 與 ASA 排放苯乙烯氣味；需主動通風（非僅開窗）
10. **樹脂處理**：未固化樹脂為皮膚致敏物且有毒；應始終戴手套並於通風區工作

## 相關技能

- **[prepare-print-model](../prepare-print-model/SKILL.md)**：為所選材料配置切片器設定
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**：修材料相關之列印失敗（拉絲、翹曲、附著）
- **乾燥線材**（未來技能）：吸濕材料之適當乾燥程序
- **後處理 3D 列印**（未來技能）：砂磨、蒸氣平滑、噴漆、退火以改善屬性
