---
name: prepare-print-model
locale: wenyan-ultra
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

# 備印模

出優 3D 模為加製。涵自 CAD/塑軟出至網修、印性析、支生、切配之全程。確模流形、壁足、向正為強印質。

## 用

- 自 CAD（Fusion 360、SolidWorks、Onshape）或 3D 塑（Blender、Maya）出為印→用
- 驗現 STL/3MF 印性於切前→用
- 排不切或印之模→用
- 優件向為強、面、少支→用
- 備機件含特強或差需→用
- 模式間轉（STL、3MF、OBJ）保印性→用

## 入

- **source_model**：CAD 或 3D 模檔徑（STEP、F3D、STL、OBJ、3MF）
- **target_process**：印程型（`fdm`、`sla`、`sls`）
- **material**：欲印材（如 `pla`、`petg`、`abs`、`standard-resin`）
- **functional_requirements**：載向、差需、面需
- **printer_specs**：建容、鼻徑（FDM）、層高能
- **slicer_tool**：標切（`cura`、`prusaslicer`、`orcaslicer`、`chitubox`）

## 行

### 一：自源軟出模

出 3D 模於合印之式：

**FDM/SLA**：
```bash
# If starting from CAD (Fusion 360, SolidWorks)
# Export as: STL (binary) or 3MF
# Resolution: High (triangle count sufficient for detail)
# Units: mm (verify scale)

# Example export settings:
# STL: Binary format, refinement 0.1mm
# 3MF: Include color/material data if using multi-material printer
```

得：模出含合解（機件 0.1mm 弦差、有機 0.05mm）。

敗：察模全定（無建幾何）、無缺面、諸組件可見。

### 二：驗網整

察網流形可印：

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

**常事**：
- **非流形邊**：多面共邊或邊唯一面
- **孔**：網面缺
- **法反**：模內外反
- **交面**：自交幾何

得：報示 0 誤、或誤可修。

敗：自動或手修網：

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

自修敗→返源軟修塑誤（合頂、開邊、疊體）。

### 三：察壁厚

驗擇程之最小壁厚：

**程之最小壁厚**：

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

得：諸壁達擇程之最小。薄壁標察。

敗：返 CAD 厚壁、或：
- 換小鼻（FDM）
- 用「detect thin walls」切設
- 雛形受減強

### 四：定印向

擇向以優強、面、支用：

**向決陣**：

**為強**：
- 向使層線垂於主載向
- 例：張力托→豎印使層沿載軸疊

**為面**：
- 大/顯面平於床（少階）
- 要寸合 X/Y 平（精高於 Z）

**為少支**：
- 少 >45°（FDM）或 >30°（SLA）懸
- 可則平面於床

**載向析**：
```
If part experiences:
- Tensile load along axis → print with layers perpendicular to axis
- Compressive load → layers can be parallel (less critical)
- Bending moment → layers perpendicular to neutral axis
- Shear → avoid layer interfaces parallel to shear direction
```

得：向擇含明強、面、支取捨之由。

敗：無向皆合→序為：功強→寸精→面→支少。

### 五：生支構

配自動或手支於懸：

**支角限**：
- FDM：自豎 45°（橋至 60° 可）
- SLA：自豎 30°（橋少能）
- SLS：無需支（粉床支）

**支型**：

**樹支**（FDM、薦）：
- 與模少接點
- 易除
- 宜有機形
- 配：枝角 40-50°、枝密中

**線支**（FDM、傳統）：
- 大懸穩
- 多接點（難除）
- 配：式格、密 15-20%、介層 2-3

**重支**（SLA）：
- 重件厚接點
- 險面痕
- 配：接徑 0.5-0.8mm、密按重

**介層**：
- 支與模間加 2-3 介層
- 減面痕
- 略易除

```bash
# In slicer (PrusaSlicer example):
# Print Settings → Support material
# - Generate support material: Yes
# - Overhang threshold: 45° (FDM) / 30° (SLA)
# - Pattern: Rectilinear / Tree (auto)
# - Interface layers: 3
# - Interface pattern spacing: 0.2mm
```

得：支生於諸過限懸、覽無浮幾何。

敗：自支不足：
- 要區加手支強
- 薄懸近增支密
- 支不可→分模印段

### 六：配切設

設程合參：

**FDM 層高**：
- 草：0.28-0.32mm（速、見層）
- 標：0.16-0.20mm（衡質速）
- 細：0.08-0.12mm（滑、緩）
- 則：層高 = 鼻徑 25-75%

**SLA 層高**：
- 標：0.05mm（衡）
- 細：0.025mm（微、高細）
- 速：0.1mm（雛形）

**程之要參**：

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

得：設配程合默、為材/模需改。

敗：參不確→始切默「Standard Quality」設於擇材、後迭。

### 七：層覽切

察切 G-code 為事：

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

**覽紅旗**：
- **實區白缺**：壁過薄於今線寬
- **長距旅**：增退或加 z-跳
- **首層不擠**：Z 差降 0.05mm
- **頂層稀**：頂實層增至 5+

得：覽示連邊、正填、清旅、無顯缺。

敗：調切設重切。常修：
- 薄壁缺→啟「Detect thin walls」或減線寬
- 劣橋→橋速減 30mm/s、增冷
- 拉絲→退距 +1mm、溫 -5°C

### 八：出 G-code 並驗

存切 G-code 含述名：

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

**印前清單**：
- [ ] 床平且清
- [ ] 正材入而乾
- [ ] 溫合材需
- [ ] 首層 Z 差校
- [ ] 餘絲/樹脂足
- [ ] 印時於監計可

得：G-code 檔存含內元、溫驗、印時/材估合理。

敗：印時過（>12 時）→計：
- 增層高（0.2 → 0.28mm 省 ~30%）
- 減邊（4 → 3）
- 減填（40% → 20% 為非結）
- 縮模若大不要

## 驗

- [ ] 模自源軟出含正單位（mm）與規
- [ ] 網整驗：流形、無孔、法正
- [ ] 壁厚達擇程最小（≥0.8mm FDM、≥0.4mm SLA）
- [ ] 印向為強、面、支取捨優
- [ ] 諸 >45°（FDM）或 >30°（SLA）懸支生
- [ ] 切設含合層高與參
- [ ] 層覽察、無缺或浮區
- [ ] G-code 出含驗溫與合理印時
- [ ] 印前清單畢（床平、材入等）

## 忌

1. **略網修**：非流形可切而印敗含缺或畸層
2. **忽壁厚**：薄壁（< 最小）有缺、大減強
3. **強之向誤**：張件含層平於載生弱離層
4. **支不足**：輕懸角致下垂、拉絲、全敗
5. **首層忽**：90% 印敗於首層——Z 差與床粘為要
6. **網路溫**：諸印機/材組獨；必以塔試校溫
7. **層高過細**：細於 2× 層高之微特不解
8. **不覽切**：切可作未期決（薄壁缺、怪填）；印前必覽
9. **材吸濕**：濕絲（尤 Nylon、TPU、PETG）致層粘劣、拉絲、脆
10. **支自信**：含大懸重件即支亦可垂——先試於小模

## 參

- **[select-print-material](../select-print-material/SKILL.md)**：按機、熱、化需擇材
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**：備模仍敗診修
- **Model with Blender**（未技）：自始為印優塑 3D 模
- **Calibrate 3D Printer**（未技）：E 步、流率、溫塔、退調
