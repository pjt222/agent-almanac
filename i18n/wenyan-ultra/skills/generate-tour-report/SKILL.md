---
name: generate-tour-report
locale: wenyan-ultra
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

# 生遊報

生格式化遊報，含嵌入地圖、日程、後勤表、實用旅訊。

## 用

- 將所計劃之遊整為可分享文檔
- 造可離線旅遊指南
- 記已畢之旅（照、圖、統計）
- 造供團或客之專業遊案
- 合路、宿、運數據於一文

## 入

- **必**：路數據（航點、段、距、時）
- **必**：遊日期與時長
- **可**：宿詳（名、址、確認號）
- **可**：運訂（航班、列車、租車）
- **可**：GPX 軌或空間數據供嵌圖
- **可**：預算訊（各類費）
- **可**：照或像

## 行

### 一：合路與 POI 數據

建報前收全遊數據為結構化格式。

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

按日組數據供日節構：
1. 航點與活動按日組
2. 各運段分配一日
3. 宿配夜日
4. 算日總（距、時、費）

得：全數據按日組，程無缺（每夜有宿，每段有運）。

敗：數據缺→標 `[TBD]` 並置報末後續清單。日期不齊（如抵宿於前站出發前）→標衝突並調時。

### 二：構日節

造 Quarto 文骨，含日節。

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

文構如下：

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

得：全 .qmd 骨具 YAML 頭，諸日節為 H2 頭，各節有佔位內容。

敗：遊過長（逾 14 日）→分週部或用標籤布局（`{.tabset}`）。需 PDF 出→不含交互部件（用靜態圖）。

### 三：嵌圖與圖表

各節加空間視覺。

**總覽圖：**

```r
#| label: fig-overview-map
#| fig-cap: "Tour overview with all stops"

leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenTopoMap") |>
  leaflet::addPolylines(data = full_route, color = "#2563eb", weight = 3) |>
  leaflet::addMarkers(data = stops, popup = ~paste(name, "<br>", date))
```

**日路圖：**

```r
#| label: fig-day1-map
#| fig-cap: "Day 1 route: City A to City B"

day1_route <- full_route[full_route$day == 1, ]
leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenStreetMap") |>
  leaflet::addPolylines(data = day1_route, color = "#2563eb", weight = 4) |>
  leaflet::addCircleMarkers(data = day1_stops, radius = 6, popup = ~name)
```

**高程剖（徒步/騎日）：**

```r
#| label: fig-day3-elevation
#| fig-cap: "Day 3 elevation profile"

ggplot2::ggplot(day3_elevation, ggplot2::aes(x = dist_km, y = elev_m)) +
  ggplot2::geom_area(fill = "#bfdbfe", alpha = 0.5) +
  ggplot2::geom_line(color = "#1d4ed8", linewidth = 0.7) +
  ggplot2::theme_minimal() +
  ggplot2::labs(x = "Distance (km)", y = "Elevation (m)")
```

得：各日節至少有路圖。多模日（駕+徒）有道圖與高程剖。總覽節有全遊圖。

敗：leaflet 敗（PDF 常）→回退靜態圖（`tmap::tmap_mode("plot")` 或 `ggplot2` 配 `ggspatial::annotation_map_tile()`）。空間數據無→簡文字描路。

### 四：加後勤表

插宿、運、預算之結構化表。

**宿表：**

```markdown
| Night | Date       | Accommodation      | Address            | Check-in | Cost   | Conf# |
|-------|------------|--------------------|--------------------|----------|--------|-------|
| 1     | 2025-07-01 | Hotel Alpine       | Bergstrasse 12     | 15:00    | EUR 95 | AB123 |
| 2     | 2025-07-02 | Mountain Hut       | Zugspitze Huette   | 16:00    | EUR 45 | --    |
| 3     | 2025-07-03 | Pension Edelweiss  | Dorfplatz 3        | 14:00    | EUR 72 | CD456 |
```

**運表：**

```markdown
| Date       | Type  | From          | To            | Depart | Arrive | Ref#   |
|------------|-------|---------------|---------------|--------|--------|--------|
| 2025-07-01 | Train | Munich Hbf    | Garmisch      | 08:15  | 09:32  | DB1234 |
| 2025-07-03 | Bus   | Zugspitze     | Ehrwald        | 10:00  | 10:25  | --     |
| 2025-07-04 | Train | Innsbruck     | Munich Hbf    | 16:45  | 18:30  | OBB567 |
```

**預算摘：**

```markdown
| Category        | Estimated | Actual | Notes                   |
|-----------------|-----------|--------|-------------------------|
| Accommodation   | EUR 212   |        | 3 nights                |
| Transport       | EUR 85    |        | Rail passes recommended |
| Food            | EUR 150   |        | EUR 50/day estimate     |
| Activities      | EUR 60    |        | Cable car, museum       |
| **Total**       | **EUR 507** |      |                         |
```

得：全後勤表按時序列。宿表無缺日。預算總計正確。

敗：訂詳未確→用 `[TBD]` 並標列。多幣→加幣列並於腳注列匯率。

### 五：渲染報

將 Quarto 文編為最終出格式。

```bash
# Render to self-contained HTML (best for offline use)
quarto render tour-report.qmd --to html

# Render to PDF (for printing)
quarto render tour-report.qmd --to pdf

# Preview with live reload during editing
quarto preview tour-report.qmd
```

渲後察：
1. 開 HTML 驗諸圖正確載
2. 試目錄鏈接
3. 驗諸像與圖於合適尺寸繪
4. 察自含 HTML 離線可（斷網重載）
5. PDF：驗頁斷於邏輯點（日間）

得：全自含文檔離線可用，含全遊訊於可導格式。

敗：渲染敗→察 R 控台之包誤（sf、leaflet 或 ggplot2 缺）。自含 HTML 過大（>20 MB）→減瓦片分辨或用 PNG 代交互圖。PDF 渲染 LaTeX 誤→`quarto install tinytex`。

## 驗

- [ ] 報於目標格式無誤渲
- [ ] 總覽圖示全路與諸站
- [ ] 各日有路圖與程
- [ ] 宿表涵每夜
- [ ] 運表含諸段
- [ ] 預算總正確
- [ ] 自含 HTML 離線可用
- [ ] 目錄正確導至諸節
- [ ] 無 [TBD] 佔位（除有意標）

## 忌

- **PDF 中交互圖**：Leaflet 等 HTML 部件於 PDF 不可繪。恆備靜態圖於 PDF 出
- **自含 HTML 過大**：嵌眾瓦致極大檔。限縮放層或用靜截圖
- **缺時區**：跨國遊跨時區。恆明發抵時區
- **訂引用陳**：確認號與時或變。含「末更」日並提醒旅前驗
- **無離線回退**：倚網載瓦片→離線空白。用 `self-contained: true` 或預渲圖為像
- **日期格不一**：DD/MM 與 MM/DD 混致惑。用 ISO 8601（YYYY-MM-DD）

## 參

- `plan-tour-route`
- `create-spatial-visualization`
- `create-quarto-report`
- `plan-hiking-tour`
- `check-hiking-gear`
