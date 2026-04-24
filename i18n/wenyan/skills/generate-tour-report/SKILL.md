---
name: generate-tour-report
locale: wenyan
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

# 旅行報告之生

生格式化旅行報告，嵌地圖、日程、物流表、實用旅資。

## 用時

- 編已計劃之旅為可分享文檔
- 為旅行創可離線閱之指南
- 記已完成之旅附照片、地圖、統計
- 為團或客生專業旅行提案
- 合路線、住宿、交通資料為一文檔

## 入

- **必要**：路線資料（途點、段、距離、時）
- **必要**：旅日與時長
- **可選**：住宿細節（名、址、確認號）
- **可選**：交通預訂（航班、火車、租車）
- **可選**：GPX 軌或空間資料以嵌地圖
- **可選**：預算資訊（按類之費）
- **可選**：含入之照片或影像

## 法

### 第一步：編路線與 POI 資料

建報告前先收所有旅資為結構化格式。

```
Data Sources to Compile:
┌────────────────────┬──────────────────────────────────────────┐
│ Category           │ Required Fields                          │
├────────────────────┼──────────────────────────────────────────┤
│ Route legs         │ From, To, distance_km, time_hrs, mode   │
│ Waypoints          │ Name, lat, lon, arrival, departure, notes│
│ Accommodation      │ Name, address, check-in/out, cost, conf#│
│ Transport          │ Type, operator, depart, arrive, ref#     │
│ Activities         │ Name, time, duration, cost, booking_req  │
│ Emergency contacts │ Local emergency #, embassy, insurance    │
│ POIs               │ Name, category, lat, lon, description    │
└────────────────────┴──────────────────────────────────────────┘
```

按日組資料以支日節結構：
1. 按日組途點與活動
2. 每交通段賦於日
3. 配住宿於過夜日
4. 算日總（距、時、費）

**得：** 按日組之完整資料集，行程無隙（每夜有住宿、每段有交通）。

**敗則：** 若資料不全，以 `[TBD]` 標缺項並加入末尾跟進清單。若日期不合（如住宿抵達早於前站離開），標衝突並調時。

### 第二步：結構日節

以日節創 Quarto 文檔骨架。

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

結構如下：

```
Report Structure:
1. Overview
   - Tour summary (dates, total distance, highlights)
   - Overview map (all waypoints, full route)
   - Quick reference table (key dates, bookings, contacts)

2. Day 1: [Title]
   - Day summary (start, end, km, hours)
   - Route map for the day
   - Timeline / schedule table
   - Accommodation details
   - POIs and activities

3. Day 2: [Title]
   ... (repeat for each day)

N. Logistics Appendix
   - Full accommodation table
   - Transport bookings table
   - Packing checklist
   - Emergency contacts
   - Budget summary
```

**得：** 完整 .qmd 檔骨架附 YAML 頭、所有日節為 H2 標題、每節占位內容。

**敗則：** 若旅過長（逾十四日）不宜單文檔，慮分週部或用標籤頁佈局（`{.tabset}`）保文檔可航。若需 PDF 輸出，確無交互組件（用靜態地圖）。

### 第三步：嵌地圖與圖

於各節加空間可視化。

**總覽地圖：**

```r
#| label: fig-overview-map
#| fig-cap: "Tour overview with all stops"

leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenTopoMap") |>
  leaflet::addPolylines(data = full_route, color = "#2563eb", weight = 3) |>
  leaflet::addMarkers(data = stops, popup = ~paste(name, "<br>", date))
```

**日程路線圖：**

```r
#| label: fig-day1-map
#| fig-cap: "Day 1 route: City A to City B"

day1_route <- full_route[full_route$day == 1, ]
leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenStreetMap") |>
  leaflet::addPolylines(data = day1_route, color = "#2563eb", weight = 4) |>
  leaflet::addCircleMarkers(data = day1_stops, radius = 6, popup = ~name)
```

**高程剖面（徒步/騎行日）：**

```r
#| label: fig-day3-elevation
#| fig-cap: "Day 3 elevation profile"

ggplot2::ggplot(day3_elevation, ggplot2::aes(x = dist_km, y = elev_m)) +
  ggplot2::geom_area(fill = "#bfdbfe", alpha = 0.5) +
  ggplot2::geom_line(color = "#1d4ed8", linewidth = 0.7) +
  ggplot2::theme_minimal() +
  ggplot2::labs(x = "Distance (km)", y = "Elevation (m)")
```

**得：** 每日節至少一路線圖。多模態日（駕+徒）有道路圖與高程剖面。總覽節有顯全旅之地圖。

**敗則：** 若 leaflet 地圖不渲染（PDF 常見），退為靜態地圖用 `tmap::tmap_mode("plot")` 或 `ggplot2` 配 `ggspatial::annotation_map_tile()`。若某日無空間資料，以簡文字描述代。

### 第四步：加物流表

為住宿、交通、預算插結構化表。

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

**得：** 完整物流表，所有預訂按時序列。住宿表無缺日。預算總算正確。

**敗則：** 若預訂未確，用 `[TBD]` 並高亮該行。若旅涉多幣，加幣列並於腳注載匯率。

### 第五步：渲染報告

編譯 Quarto 文檔為末輸出格式。

```bash
# Render to self-contained HTML (best for offline use)
quarto render tour-report.qmd --to html

# Render to PDF (for printing)
quarto render tour-report.qmd --to pdf

# Preview with live reload during editing
quarto preview tour-report.qmd
```

渲染後察：
1. 開 HTML 檔驗所有地圖正載
2. 測目錄鏈接有效
3. 驗所有影像與圖按合適尺寸渲染
4. 察自包 HTML 離線可用（斷網重載）
5. PDF：驗分頁落於邏輯點（日間）

**得：** 完整自包文檔離線可用，含所有旅資於可航格式。

**敗則：** 若渲染敗，察 R 控制台之包誤（缺 sf、leaflet、ggplot2）。若自包 HTML 過大（逾 20 MB），減地圖瓦片解析度或用 PNG 截圖代交互地圖。若 PDF 渲染敗有 LaTeX 誤，以 `quarto install tinytex` 裝 TinyTeX。

## 驗

- [ ] 報告於目標格式無誤渲染
- [ ] 總覽地圖顯全路線與所有站
- [ ] 每日有路線圖與時程
- [ ] 住宿表覆每夜
- [ ] 交通表含所有段
- [ ] 預算總精確
- [ ] 自包 HTML 離線可用
- [ ] 目錄正航至所有節
- [ ] 無 [TBD] 占位（或已有意標）

## 陷

- **PDF 中交互地圖**：Leaflet 等 HTML 組件於 PDF 不可渲染。為 PDF 輸出必備靜態地圖替代
- **過大自包 HTML**：嵌多地圖瓦片成大檔。限縮放級或用瓦片重地圖之靜態截圖
- **缺時區**：國際旅跨時區。必定出發與抵達時之時區避混淆
- **陳舊預訂參考**：確認號與時可變。含「末更新」日並提醒用者旅前驗
- **無離線備援**：若報告賴網載地圖瓦片，離線空白。用 `self-contained: true` 或預渲染地圖為影像
- **日期格式不一**：DD/MM 與 MM/DD 混致混淆。始終用 ISO 8601（YYYY-MM-DD）

## 參

- `plan-tour-route` — 生編入此報告之路線資料
- `create-spatial-visualization` — 創嵌於報告之地圖與圖
- `create-quarto-report` — 通用 Quarto 文檔創建與配置
- `plan-hiking-tour` — 為山旅報告供徒步特定資料
- `check-hiking-gear` — 為物流附錄生裝備清單
