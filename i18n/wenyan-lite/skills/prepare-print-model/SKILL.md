---
name: prepare-print-model
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Export and optimize 3D models for FDM/SLA printing including STL/3MF export,
  mesh integrity verification, wall thickness checking, support generation, and
  slicing. Use when exporting from CAD or modeling software for 3D printing,
  verifying STL/3MF files are printable before slicing, troubleshooting models
  that fail to slice correctly, optimizing part orientation for strength or
  surface finish, or converting between model formats while preserving
  printability.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: 3d-printing
  complexity: intermediate
  language: multi
  tags: 3d-printing, fdm, sla, slicing, mesh-repair, supports
---

# 備齊列印模型

為加成製造匯出並最佳化 3D 模型。本技能涵蓋自 CAD／建模軟體匯出，至網格修補、可列印性分析、支撐生成與切片設定之完整流程。確保模型流形、壁厚足、方向正確以利強度與品質。

## 適用時機

- 自 CAD 軟體（Fusion 360、SolidWorks、Onshape）或 3D 建模工具（Blender、Maya）為 3D 列印匯出
- 切片前先驗證既有 STL/3MF 是否可印
- 排除無法正確切片或列印之模型
- 為強度、表面或最少支撐而最佳化擺向
- 為具特定強度或公差需求之機械件作準備
- 在保留可列印性下於格式間轉換（STL、3MF、OBJ）

## 輸入

- **source_model**：CAD 檔或 3D 模型檔之路徑（STEP、F3D、STL、OBJ、3MF）
- **target_process**：列印製程類型（`fdm`、`sla`、`sls`）
- **material**：擬用列印材料（如 `pla`、`petg`、`abs`、`standard-resin`）
- **functional_requirements**：受力方向、公差需求、表面要求
- **printer_specs**：成形體積、噴嘴直徑（FDM）、層高能力
- **slicer_tool**：目標切片軟體（`cura`、`prusaslicer`、`orcaslicer`、`chitubox`）

## 步驟

### 1. 自來源軟體匯出模型

以適合列印之格式匯出 3D 模型：

**FDM/SLA 用**：
```bash
# If starting from CAD (Fusion 360, SolidWorks)
# Export as: STL (binary) or 3MF
# Resolution: High (triangle count sufficient for detail)
# Units: mm (verify scale)

# Example export settings:
# STL: Binary format, refinement 0.1mm
# 3MF: Include color/material data if using multi-material printer
```

**預期：** 以適切解析度匯出之模型檔（機械件用 0.1mm 弦容差，有機形用 0.05mm）。

**失敗時：** 檢查模型是否完整定義（無構造幾何）、無遺面、所有元件皆可見。

### 2. 驗證網格完整性

檢查網格是否流形且可印：

```bash
# Install mesh repair tools if needed
# sudo apt install meshlab admesh

# Check STL file for errors
admesh --check model.stl

# Look for:
# - Non-manifold edges: 0 (every edge connects exactly 2 faces)
# - Holes: 0
# - Backwards/inverted normals: 0
# - Degenerate facets: 0
```

**常見問題**：
- **非流形邊**：多面共享一邊，或邊僅連一面
- **洞**：表面有縫
- **法線反向**：模型內外顛倒
- **相交面**：自交幾何

**預期：** 報告顯示 0 錯，或錯可修。

**失敗時：** 自動或手動修補網格：

```bash
# Automatic repair with admesh
admesh --write-binary-stl=model_fixed.stl \
       --exact \
       --nearby \
       --remove-unconnected \
       --fill-holes \
       --normal-directions \
       model.stl

# Or use meshlab GUI for manual inspection/repair
meshlab model.stl
# Filters → Cleaning and Repairing → Remove Duplicate Vertices
# Filters → Cleaning and Repairing → Remove Duplicate Faces
# Filters → Normals → Re-Orient all faces coherently
```

若自動修補失敗，回到來源軟體修建模錯（重合頂點、開邊、重疊本體）。

### 3. 檢查壁厚

驗證所擇製程之最小壁厚：

**各製程之最小壁厚**：

| Process | Min Wall | Recommended Min | Structural Parts |
|---------|----------|-----------------|------------------|
| FDM (0.4mm nozzle) | 0.8mm | 1.2mm | 2.4mm+ |
| FDM (0.6mm nozzle) | 1.2mm | 1.8mm | 3.6mm+ |
| SLA (standard) | 0.4mm | 0.8mm | 2.0mm+ |
| SLA (engineering) | 0.6mm | 1.2mm | 2.5mm+ |
| SLS (nylon) | 0.7mm | 1.0mm | 2.0mm+ |

```bash
# Check wall thickness visually in slicer:
# - Import model
# - Enable "Thin walls" detection
# - Slice with 0 infill to see wall structure

# For precise measurement, use CAD software:
# - Measure distance between parallel surfaces
# - Check in critical load-bearing areas
```

**預期：** 各壁皆達所擇製程之最小厚。薄壁標記以便檢視。

**失敗時：** 回 CAD 加厚壁，或：
- 改用較小噴嘴（FDM）
- 啟用切片之「detect thin walls」
- 對原型接受較弱之強度

### 4. 判定列印擺向

擇擺向以最佳化強度、表面與支撐用量：

**擺向決策矩陣**：

**為強度**：
- 使層線垂直於主受力方向
- 例：受拉之托架→直立列印，使層沿受力軸堆疊

**為表面**：
- 使最大／最顯眼之面平於床（最少階梯）
- 關鍵尺寸對齊 X/Y 平面（精度高於 Z）

**為最少支撐**：
- 將懸垂 >45°（FDM）或 >30°（SLA）最小化
- 可能時將平面置於床上

**受力方向分析**：
```
If part experiences:
- Tensile load along axis → print with layers perpendicular to axis
- Compressive load → layers can be parallel (less critical)
- Bending moment → layers perpendicular to neutral axis
- Shear → avoid layer interfaces parallel to shear direction
```

**預期：** 已擇擺向並明示為強度、表面或支撐取捨之理由。

**失敗時：** 若無單一擺向滿足所有需求，依序排優：功能強度→尺寸精度→表面→最少支撐。

### 5. 生成支撐結構

為懸垂配置自動或手動支撐：

**支撐角門檻**：
- FDM：垂直 45°（部分搭橋可至 60°）
- SLA：垂直 30°（搭橋能力較弱）
- SLS：無需支撐（粉床支撐）

**支撐類型**：

**樹狀支撐**（FDM，建議）：
- 與模型接點較少
- 易拆
- 有機形佳
- 設定：分支角 40-50°、密度中

**線性支撐**（FDM，傳統）：
- 對大懸垂較穩
- 接點較多（拆較難）
- 設定：格紋、密度 15-20%、介面層 2-3

**重支撐**（SLA）：
- 重件用厚接點
- 表面留痕之風險
- 設定：接觸直徑 0.5-0.8mm、密度依重量

**介面層**：
- 於支撐與模型間加 2-3 介面層
- 減少表面痕
- 略易拆

```bash
# In slicer (PrusaSlicer example):
# Print Settings → Support material
# - Generate support material: Yes
# - Overhang threshold: 45° (FDM) / 30° (SLA)
# - Pattern: Rectilinear / Tree (auto)
# - Interface layers: 3
# - Interface pattern spacing: 0.2mm
```

**預期：** 已為超出門檻之懸垂生成支撐，預覽顯示無浮空幾何。

**失敗時：** 若自動支撐不足：
- 於關鍵區加手動支撐強制器
- 於薄懸垂附近增支撐密度
- 切分模型分節列印（若無法支撐）

### 6. 設定切片設定檔

設製程適當之參數：

**FDM 層高**：
- 草稿：0.28-0.32mm（快、層紋顯）
- 標準：0.16-0.20mm（質速兼顧）
- 精細：0.08-0.12mm（順、慢）
- 規則：層高 = 噴嘴直徑之 25-75%

**SLA 層高**：
- 標準：0.05mm（兼顧）
- 精細：0.025mm（小件、高細）
- 快：0.1mm（原型）

**各製程關鍵參數**：

**FDM**：
```yaml
layer_height: 0.2mm
line_width: 0.4mm (= nozzle diameter)
perimeters: 3-4 (structural), 2 (cosmetic)
top_bottom_layers: 5 (0.2mm layers = 1mm solid)
infill_percentage: 20% (cosmetic), 40-60% (functional)
infill_pattern: gyroid (FDM), grid (basic)
print_speed: 50mm/s perimeter, 80mm/s infill
temperature: material-specific (see select-print-material skill)
```

**SLA**：
```yaml
layer_height: 0.05mm
bottom_layers: 6-8 (strong bed adhesion)
exposure_time: material-specific (2-8s per layer)
bottom_exposure_time: 30-60s
lift_speed: 60-80mm/min
retract_speed: 150-180mm/min
```

**預期：** 設定檔以製程適當之預設配置，並依特定材料／模型需求微調。

**失敗時：** 若不確定參數，先用切片之「Standard Quality」預設，再迭代。

### 7. 逐層預覽切片

檢視切片之 G-code：

```bash
# In slicer:
# - Slice model
# - Use layer preview slider to inspect each layer
# - Check for:
#   * Gaps in perimeters (indicates thin walls)
#   * Floating regions (missing supports)
#   * Excessive stringing paths (reduce travel)
#   * First layer: proper squish and adhesion
#   * Top layers: sufficient solid infill
```

**預覽中之警訊**：
- **實體區出現白色縫隙**：壁過薄不及當前線寬
- **長距離移動**：增回抽或加 z-hop
- **首層未壓實**：將 Z-offset 下調 0.05mm
- **頂層稀薄**：將頂層加至 5+

**預期：** 預覽顯示連續之周線、適切之填充、乾淨之移動，無顯著缺陷。

**失敗時：** 調整切片參數重切。常見修補：
- 薄壁縫→啟用「Detect thin walls」或減線寬
- 搭橋差→將搭橋速降至 30mm/s、增冷卻
- 拉絲→回抽距離 +1mm、溫度 -5°C

### 8. 匯出 G-code 並驗證

以描述性名稱儲存切片之 G-code：

```bash
# Naming convention:
# <part_name>_<material>_<layer_height>_<profile>.gcode
# Example: bracket_petg_0.2mm_standard.gcode

# Verify G-code:
grep "^;PRINT_TIME:" model.gcode  # Check estimated time
grep "^;Filament used:" model.gcode  # Check material usage
head -n 50 model.gcode | grep "^M104\|^M140"  # Verify temperatures

# Expected first layer temp:
# M140 S85  (bed temp for PETG)
# M104 S245 (hotend temp for PETG)
```

**列印前查核表**：
- [ ] 床已平整且潔淨
- [ ] 已載正確且乾燥之材料
- [ ] 溫度與材料需求相符
- [ ] 首層 Z-offset 已校正
- [ ] 線材／樹脂量足
- [ ] 列印時間於監控計畫內可承

**預期：** G-code 檔已儲存並含中繼資料、溫度已驗證、列印時間／材料估值合理。

**失敗時：** 若列印時間過長（>12 小時），可考慮：
- 增層高（0.2 → 0.28mm 約省 30% 時間）
- 減周線（4 → 3）
- 減填充（40% → 20%，非結構件）
- 若尺寸非關鍵，縮小模型

## 驗證

- [ ] 模型已自來源軟體以正確單位（mm）與比例匯出
- [ ] 網格完整性已驗：流形、無洞、法線正確
- [ ] 壁厚達所擇製程之最低（FDM ≥0.8mm、SLA ≥0.4mm）
- [ ] 列印擺向已為強度、表面或支撐取捨而最佳化
- [ ] 已為所有 >45°（FDM）或 >30°（SLA）之懸垂生成支撐
- [ ] 切片設定檔已配適當之層高與參數
- [ ] 已逐層預覽，無縫隙或浮空
- [ ] G-code 已匯出，溫度已驗、列印時間合理
- [ ] 列印前查核表已完成（床整、料載入等）

## 常見陷阱

1. **跳過網格修補**：非流形網格雖能切片，但會以縫隙或畸層失印
2. **忽略壁厚**：壁過薄會出現縫隙，強度大減
3. **強度擺向錯**：將受拉件以層平行於受力方向列印，造成弱層分離面
4. **支撐不足**：低估懸垂角致下塌、拉絲或全敗
5. **疏忽首層**：90% 失印起於首層——Z-offset 與床附著至關緊要
6. **網路上抓溫度**：每組印機／材料皆獨特；務必以塔測校正
7. **細節過於層高**：小於 2 倍層高之精細特徵無法正解
8. **未預覽切片**：切片可能作出意外決策（薄壁縫、奇填充）；列印前務必預覽
9. **材料吸濕**：濕線材（尤其 Nylon、TPU、PETG）致層附差、拉絲、易脆
10. **過信支撐**：含大懸垂之重件即便有支撐仍可能下塌——先以小件試之

## 相關技能

- **[select-print-material](../select-print-material/SKILL.md)**：依機械、熱、化學需求擇適切材料
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**：若已備齊之模型仍失印，診斷並修
- **Model with Blender**（未來技能）：自零起建可印之 3D 模型
- **Calibrate 3D Printer**（未來技能）：E-steps、流量、溫度塔、回抽調校
