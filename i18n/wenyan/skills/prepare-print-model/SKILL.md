---
name: prepare-print-model
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  匯出並優化 3D 模型以為 FDM/SLA 印：STL/3MF 匯、網格完整驗、壁厚察、
  支持生、切片。自 CAD 或建模軟體匯出以 3D 印、切片前驗 STL/3MF 可印、
  解模型切片敗、為強度或表面終光優部位向、保可印性而換模格式時用之。
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

# 備印模型

匯出並優化 3D 模型以為加成製造。此技能涵自 CAD/建模軟體匯出至網格修、可印性析、支持生、切片器配之全流。確模型為流形、有足壁厚、為強度與印質適向。

## 用時

- 自 CAD 軟體（Fusion 360、SolidWorks、Onshape）或 3D 建模具（Blender、Maya）匯出模型以 3D 印
- 送切片器前驗既 STL/3MF 文件可印
- 解模型切片或印敗
- 為強度、表面終光、最少支持材優部位向
- 備有特定強度或公差所需之機械部
- 保可印性而換模格式（STL、3MF、OBJ）

## 入

- **source_model**：CAD 文件或 3D 模型文件之徑（STEP、F3D、STL、OBJ、3MF）
- **target_process**：印程型（`fdm`、`sla`、`sls`）
- **material**：欲印材（如 `pla`、`petg`、`abs`、`standard-resin`）
- **functional_requirements**：載向、公差所需、表面終光所需
- **printer_specs**：建體、噴嘴徑（FDM）、層高之能
- **slicer_tool**：目標切片器（`cura`、`prusaslicer`、`orcaslicer`、`chitubox`)

## 法

### 1. 自源軟體匯出模型

匯出 3D 模型以宜印之格：

**為 FDM/SLA**：
```bash
# If starting from CAD (Fusion 360, SolidWorks)
# Export as: STL (binary) or 3MF
# Resolution: High (triangle count sufficient for detail)
# Units: mm (verify scale)

# Example export settings:
# STL: Binary format, refinement 0.1mm
# 3MF: Include color/material data if using multi-material printer
```

得：模型文件以宜解析匯（機械部 0.1mm 弦容差，有機形 0.05mm）。

敗則：察模型已全定（無構造幾何）、無缺面、諸組件可見。

### 2. 驗網格完整

察網格為流形且可印：

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
- **非流形邊**：多面共邊，或邊唯一面
- **孔**：網格表之缺
- **反法線**：模型內外反
- **交面**：自交幾何

得：報示 0 誤，或誤可修。

敗則：自動或手修網格：

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

若自動修敗，返源軟體修建模誤（重合頂點、開邊、疊體）。

### 3. 察壁厚

驗所擇程之最小壁厚：

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

得：諸壁達所擇程之最小厚。薄壁標待察。

敗則：返 CAD 增壁，或：
- 換較小噴嘴（FDM）
- 用「察薄壁」切片器設
- 為原型受減強度

### 4. 定印向

擇向以優強度、表面終光、支持用：

**向決矩**：

**為強度**：
- 向之使層線垂於主載向
- 例：拉力下之托架 → 立印使層沿載軸疊

**為表面終光**：
- 最大/最顯之面平於床（最少階梯）
- 關鍵尺對 X/Y 平面（高於 Z 之精）

**為最少支持**：
- 減 >45°（FDM）或 >30°（SLA）之懸
- 可時平面置床

**載向析**：
```
If part experiences:
- Tensile load along axis → print with layers perpendicular to axis
- Compressive load → layers can be parallel (less critical)
- Bending moment → layers perpendicular to neutral axis
- Shear → avoid layer interfaces parallel to shear direction
```

得：擇向附明確之強度、終光、支持權衡之因。

敗則：若無向滿諸需，依序分優：功能強度 → 尺精 → 表面終光 → 支持最少。

### 5. 生支持結構

為懸配自動或手支持：

**支持角閾**：
- FDM：垂之 45°（部分橋至 60° 可）
- SLA：垂之 30°（橋能少）
- SLS：無需支持（粉床支）

**支持型**：

**樹支**（FDM，建議）：
- 與模較少接點
- 易除
- 宜有機形
- 配：枝角 40-50°，枝密中

**線支**（FDM，傳統）：
- 對大懸更穩
- 多接點（除難）
- 配：格模式，密 15-20%，介面層 2-3

**重支**（SLA）：
- 為重部之較厚接點
- 表面留痕之險
- 配：接徑 0.5-0.8mm，密依部重

**介面層**：
- 支與模間加 2-3 介面層
- 減表面痕
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

得：支生於諸逾閾角之懸，預覽示無浮幾何。

敗則：若自動支不足：
- 於關鍵區加手支強制
- 增薄懸近之支密
- 若支不可行，分模並段印

### 6. 配切片器配

設程適之參：

**FDM 層高**：
- 草稿：0.28-0.32mm（速、層可見）
- 標準：0.16-0.20mm（質速平衡）
- 細：0.08-0.12mm（順、緩）
- 規：層高 = 噴嘴徑之 25-75%

**SLA 層高**：
- 標準：0.05mm（平衡）
- 細：0.025mm（微縮、高細）
- 速：0.1mm（原型）

**諸程之關鍵參**：

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

得：配以程適之默設，依特定材/模需修。

敗則：若不確參，自切片器之「標準質」默配始於所擇材，再迭。

### 7. 逐層預覽切

察切之 G-code 問題：

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

**預覽之紅旗**：
- **實區之白缺**：壁過薄於當前線寬
- **大距之行**：增回抽或加 z-hop
- **首層不擠**：Z-offset 下調 0.05mm
- **頂層稀**：增頂實層至 5+

得：預覽示連周長、適填、淨行、無顯缺。

敗則：調切片器設並重切。常修：
- 薄壁缺 → 啟「察薄壁」或減線寬
- 橋差 → 減橋速至 30mm/s，增冷
- 拉絲 → 增回抽距 +1mm，減溫 -5°C

### 8. 匯出 G-code 並驗

存切之 G-code 附描述名：

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
- [ ] 正材已載且乾
- [ ] 溫合材所需
- [ ] 首層 Z-offset 已校
- [ ] 餘料/樹脂足
- [ ] 印時宜監督謀

得：G-code 文存附嵌元數據、溫已驗、印時/料估合理。

敗則：若印時過（>12 時），考：
- 增層高（0.2 → 0.28mm 省約 30% 時）
- 減周長（4 → 3）
- 減填（40% → 20% 為非結構）
- 若大小不關鍵，縮模

## 驗

- [ ] 模型自源軟體以正單位（mm）與比匯出
- [ ] 網格完整已驗：流形、無孔、法線正
- [ ] 壁厚達所擇程之最小（FDM ≥0.8mm、SLA ≥0.4mm）
- [ ] 印向為強度、終光、支持權衡優
- [ ] 諸 >45°（FDM）或 >30°（SLA）之懸生支
- [ ] 切片器配附宜層高與參
- [ ] 逐層預覽已察，無缺或浮區
- [ ] G-code 匯出附驗溫與合理印時
- [ ] 印前清單已完（床平、材載等）

## 陷

1. **略網格修**：非流形網可切而印敗，含缺或畸層
2. **忽壁厚**：薄壁（< 最小）將有缺，劇減強度
3. **誤強度向**：拉力部以層平於載向印致弱層離面
4. **支不足**：低估懸角致垂、拉絲、或全敗
5. **首層忽**：90% 印敗發於首層——Z-offset 與床附為要
6. **網之溫**：每印機/材組獨；常以塔試校溫
7. **層高之過細**：小於 2× 層高之細徵不能適解
8. **不預覽切**：切片器或作未料決（薄壁缺、怪填）；印前常預覽
9. **材吸濕**：濕料（尤 Nylon、TPU、PETG）致層附差、拉絲、脆
10. **支之過信**：附支之大懸重部仍可垂——先試小模

## 參

- **[select-print-material](../select-print-material/SKILL.md)**：依機、熱、化所需擇宜材
- **[troubleshoot-print-issues](../troubleshoot-print-issues/SKILL.md)**：若備之模仍敗，診斷並修印敗
- **Model with Blender**（未來技能）：自零立優印之 3D 模
- **Calibrate 3D Printer**（未來技能）：E-步、流率、溫塔、回抽調
