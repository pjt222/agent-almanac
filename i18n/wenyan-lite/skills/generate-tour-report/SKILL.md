---
name: generate-tour-report
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Generate a Quarto-based tour report with embedded maps, daily itineraries,
  logistics tables, and accommodation/transport details. Produces a
  self-contained HTML or PDF document suitable for offline use during travel.
  Use when compiling a planned tour into a shareable document, creating an
  offline-accessible travel guide, documenting a completed trip with photos and
  statistics, or producing a professional tour proposal for a group or client.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: intermediate
  language: multi
  tags: travel, report, quarto, itinerary, logistics
---

# 生行程報告

生含嵌入地圖、每日行程、後勤表格與實用旅行資訊之格式化行程報告。

## 適用時機

- 彙編已計畫行程為可分享文件
- 建離線可用旅行指南
- 以相片、地圖與統計記錄已完成之旅程
- 為團體或客戶製專業行程提案
- 合併路線、住宿與交通資料於一文件

## 輸入

- **必要**：路線資料（航點、段、距離、時間）
- **必要**：行程日期與長度
- **選擇性**：住宿詳情（名稱、地址、確認號）
- **選擇性**：交通預訂（航班、火車、租車）
- **選擇性**：GPX 軌跡或空間資料以嵌地圖
- **選擇性**：預算資訊（各類成本）
- **選擇性**：擬納入之相片或圖像

## 步驟

### 步驟一：彙編路線與景點資料

建報告前收所有行程資料於結構化格式。

```
彙編之資料來源：
┌────────────────────┬──────────────────────────────────────────┐
│ 類別               │ 必要欄位                                 │
├────────────────────┼──────────────────────────────────────────┤
│ 路線段             │ From、To、distance_km、time_hrs、mode    │
│ 航點               │ Name、lat、lon、arrival、departure、notes│
│ 住宿               │ Name、address、check-in/out、cost、conf#  │
│ 交通               │ Type、operator、depart、arrive、ref#      │
│ 活動               │ Name、time、duration、cost、booking_req   │
│ 緊急聯絡           │ 當地急救號、使館、保險                    │
│ 景點               │ Name、category、lat、lon、description     │
└────────────────────┴──────────────────────────────────────────┘
```

依日組織資料以支每日節結構：
1. 依日期分組航點與活動
2. 每交通段派一日
3. 住宿配過夜日
4. 算每日合計（距離、時間、成本）

**預期：** 依日組織之完整資料集，時程無缺口（每夜有住宿，每段有交通）。

**失敗時：** 若資料不全，以 `[TBD]` 佔位記漏缺項目並加於報告末之後續清單。若日期不合（如抵住宿早於自前站出發），標衝突並調時間。

### 步驟二：建每日節結構

建附每日節之 Quarto 文件骨架。

```yaml
---
title: "Tour Name: Region/Country"
subtitle: "Date Range"
author: "Planner Name"
date: today
format:
  html:
    toc: true
    toc-depth: 3
    theme: cosmo
    self-contained: true
    code-fold: true
  pdf:
    documentclass: article
    geometry: margin=2cm
    toc: true
execute:
  echo: false
  warning: false
  message: false
---
```

依下結構建文件：

```
報告結構：
1. 概覽
   - 行程摘要（日期、總距離、亮點）
   - 概覽地圖（所有航點、全路線）
   - 速查表（關鍵日期、預訂、聯絡）

2. 第一日：[標題]
   - 當日摘要（起、止、公里、時數）
   - 當日路線圖
   - 時程/日程表
   - 住宿詳情
   - 景點與活動

3. 第二日：[標題]
   ...（每日重複）

N. 後勤附錄
   - 完整住宿表
   - 交通預訂表
   - 打包清單
   - 緊急聯絡
   - 預算摘要
```

**預期：** 完整 .qmd 檔骨架，附 YAML 首，所有每日節為 H2 標題，每節含佔位內容。

**失敗時：** 若行程單一文件過長（逾十四日），可考慮分週或用標籤頁佈局（`{.tabset}`）以利導覽。若需 PDF 輸出，確無互動小工具（改用靜態地圖）。

### 步驟三：嵌地圖與圖表

於每節加空間視覺化。

**概覽地圖：**

```r
#| label: fig-overview-map
#| fig-cap: "Tour overview with all stops"

leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenTopoMap") |>
  leaflet::addPolylines(data = full_route, color = "#2563eb", weight = 3) |>
  leaflet::addMarkers(data = stops, popup = ~paste(name, "<br>", date))
```

**每日路線圖：**

```r
#| label: fig-day1-map
#| fig-cap: "Day 1 route: City A to City B"

day1_route <- full_route[full_route$day == 1, ]
leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenStreetMap") |>
  leaflet::addPolylines(data = day1_route, color = "#2563eb", weight = 4) |>
  leaflet::addCircleMarkers(data = day1_stops, radius = 6, popup = ~name)
```

**海拔剖面（健行/騎行日）：**

```r
#| label: fig-day3-elevation
#| fig-cap: "Day 3 elevation profile"

ggplot2::ggplot(day3_elevation, ggplot2::aes(x = dist_km, y = elev_m)) +
  ggplot2::geom_area(fill = "#bfdbfe", alpha = 0.5) +
  ggplot2::geom_line(color = "#1d4ed8", linewidth = 0.7) +
  ggplot2::theme_minimal() +
  ggplot2::labs(x = "Distance (km)", y = "Elevation (m)")
```

**預期：** 每日節至少有路線圖。多模式日（駕車+健行）兼有道路圖與海拔剖面。概覽節含示全行程之地圖。

**失敗時：** 若 leaflet 地圖無法渲染（PDF 模式常見），退回靜態地圖：用 `tmap::tmap_mode("plot")` 或 `ggplot2` 配 `ggspatial::annotation_map_tile()`。若某日空間資料不可得，以路線之簡單文字描述代之。

### 步驟四：加後勤表

插入住宿、交通與預算之結構化表。

**住宿表：**

```markdown
| Night | Date       | Accommodation      | Address            | Check-in | Cost   | Conf# |
|-------|------------|--------------------|--------------------|----------|--------|-------|
| 1     | 2025-07-01 | Hotel Alpine       | Bergstrasse 12     | 15:00    | EUR 95 | AB123 |
| 2     | 2025-07-02 | Mountain Hut       | Zugspitze Huette   | 16:00    | EUR 45 | --    |
| 3     | 2025-07-03 | Pension Edelweiss  | Dorfplatz 3        | 14:00    | EUR 72 | CD456 |
```

**交通表：**

```markdown
| Date       | Type  | From          | To            | Depart | Arrive | Ref#   |
|------------|-------|---------------|---------------|--------|--------|--------|
| 2025-07-01 | Train | Munich Hbf    | Garmisch      | 08:15  | 09:32  | DB1234 |
| 2025-07-03 | Bus   | Zugspitze     | Ehrwald        | 10:00  | 10:25  | --     |
| 2025-07-04 | Train | Innsbruck     | Munich Hbf    | 16:45  | 18:30  | OBB567 |
```

**預算摘要：**

```markdown
| Category        | Estimated | Actual | Notes                   |
|-----------------|-----------|--------|-------------------------|
| Accommodation   | EUR 212   |        | 3 nights                |
| Transport       | EUR 85    |        | Rail passes recommended |
| Food            | EUR 150   |        | EUR 50/day estimate     |
| Activities      | EUR 60    |        | Cable car, museum       |
| **Total**       | **EUR 507** |      |                         |
```

**預期：** 完整後勤表，所有預訂依時間列出。住宿表無漏日。預算合計正確計算。

**失敗時：** 若預訂詳情未定，用 `[TBD]` 並標示該列。若行程涉多幣別，加幣別欄並於註腳附匯率。

### 步驟五：渲染報告

編譯 Quarto 文件為最終輸出格式。

```bash
# 渲染為獨立 HTML（離線用佳）
quarto render tour-report.qmd --to html

# 渲染為 PDF（列印用）
quarto render tour-report.qmd --to pdf

# 編輯時即時預覽
quarto preview tour-report.qmd
```

渲染後檢查：
1. 開 HTML 檔驗所有地圖正確載入
2. 測目錄連結可用
3. 驗所有圖像與圖表以合宜大小渲染
4. 核獨立 HTML 離線可用（斷網重載）
5. PDF：驗分頁點於合理位置（日間）

**預期：** 完整、獨立之文件，離線可用，所有行程資訊可導覽之格式。

**失敗時：** 若渲染失敗，核 R 主控台之套件錯（漏 sf、leaflet 或 ggplot2）。若獨立 HTML 過大（逾二十 MB），降低圖層解析度或用 PNG 截圖替互動地圖。若 PDF 渲染以 LaTeX 錯失敗，以 `quarto install tinytex` 裝 TinyTeX。

## 驗證

- [ ] 報告於目標格式無錯渲染
- [ ] 概覽地圖示完整路線與所有停點
- [ ] 每日有路線圖與時程
- [ ] 住宿表含行程每夜
- [ ] 交通表含所有段
- [ ] 預算合計正確
- [ ] 獨立 HTML 離線可用
- [ ] 目錄正確導覽至所有節
- [ ] 無殘留 [TBD] 佔位（或已刻意標示）

## 常見陷阱

- **PDF 中之互動地圖**：Leaflet 與他 HTML 小工具於 PDF 中無法渲染。永為 PDF 輸出提供靜態地圖替代。
- **獨立 HTML 過大**：嵌多圖層生極大檔。限縮放層級或用靜態地圖截圖於圖層密集之地圖。
- **缺時區**：國際行程跨時區。永為出發抵達時間明指時區以免混淆。
- **陳舊預訂參考**：確認號與時間可變。納入「最後更新」日期並提醒用戶旅行前驗證。
- **無離線退路**：若報告依賴網載圖層，離線空白。用 `self-contained: true` 或預渲染地圖為圖像。
- **日期格式不一**：DD/MM 與 MM/DD 混用致混淆。全文一致用 ISO 8601（YYYY-MM-DD）。

## 相關技能

- `plan-tour-route` — 生此報告所彙編之路線資料
- `create-spatial-visualization` — 建報告中嵌之地圖與圖表
- `create-quarto-report` — 通用 Quarto 文件建立與配置
- `plan-hiking-tour` — 為山地行程報告提供健行專屬資料
- `check-hiking-gear` — 為後勤附錄產打包清單
