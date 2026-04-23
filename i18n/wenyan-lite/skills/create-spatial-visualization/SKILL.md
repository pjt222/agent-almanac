---
name: create-spatial-visualization
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create interactive maps, elevation profiles, and spatial visualizations
  from GPX tracks, waypoints, or route data using R (sf, leaflet, tmap)
  or Observable (D3, deck.gl). Covers data import, coordinate system
  handling, map styling, and export to HTML or image formats. Use when
  visualizing a planned or completed tour route on an interactive map,
  creating elevation profiles for hiking or cycling routes, overlaying
  waypoints and POIs on a basemap, or building a web-based trip dashboard.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: advanced
  language: multi
  tags: travel, maps, leaflet, gpx, elevation, visualization
---

# 造空間可視化

自 GPX 軌、路徑點、路線資料造互動地圖、高度曲線、空間可視化。

## 適用時機

- 於互動地圖可視化已計畫或完之遊路線
- 為徒步或單車路線造高度曲線
- 於底圖上疊路徑點、POI、路線走廊
- 為印報告生靜態地圖圖像
- 建含空間資料之網基遊程儀表板

## 輸入

- **必要**：空間資料源（GPX 檔、含緯/經之 CSV、GeoJSON、路徑點清單）
- **必要**：可視化型（互動地圖、靜態地圖、高度曲線、熱圖）
- **選擇性**：底圖偏好（OpenStreetMap、衛星、地形、地勢）
- **選擇性**：樣式參數（色、線寬、標記圖示）
- **選擇性**：輸出格式（HTML widget、PNG、SVG、Quarto 內嵌）
- **選擇性**：他層（POI 標記、區界、距離標記）

## 步驟

### 步驟一：匯入空間資料

載並解析空間資料為可用格式。

**R 法（sf 套件）：**

```r
# GPX file
track <- sf::st_read("route.gpx", layer = "tracks")
waypoints <- sf::st_read("route.gpx", layer = "waypoints")

# CSV with coordinates
points <- readr::read_csv("stops.csv") |>
  sf::st_as_sf(coords = c("lon", "lat"), crs = 4326)

# GeoJSON
route <- sf::st_read("route.geojson")
```

**JavaScript 法（供 Observable/D3）：**

```javascript
// GPX parsing
const gpxText = await FileAttachment("route.gpx").text();
const parser = new DOMParser();
const gpxDoc = parser.parseFromString(gpxText, "text/xml");

// Extract track points
const trkpts = gpxDoc.querySelectorAll("trkpt");
const coordinates = Array.from(trkpts).map(pt => ({
  lat: +pt.getAttribute("lat"),
  lon: +pt.getAttribute("lon"),
  ele: +pt.querySelector("ele")?.textContent || 0
}));
```

驗座標參考系（CRS）為 WGS 84（EPSG:4326），以供網頁地圖。

**預期：** 空間資料已載為 sf 物件（R）或座標陣列（JS），幾何有效。點數合所期（如 GPX 軌含數百至數千點）。

**失敗時：** 若 GPX 解析敗，察檔為有效 XML。常見問題：GPS 電耗致檔截、混合命名空間、GPX 1.0 與 1.1 之別。若 CRS 缺，以 `sf::st_set_crs(data, 4326)` 明設之。若座標顛倒（緯/經互換），察欄序。

### 步驟二：處理與清

將原始資料轉為分析備之空間特徵。

```
Processing Pipeline:
┌─────────────────────┬──────────────────────────────────────────┐
│ Operation           │ Purpose                                  │
├─────────────────────┼──────────────────────────────────────────┤
│ Remove duplicates   │ GPS often logs identical points at stops │
│ Smooth track        │ Reduce GPS jitter in dense urban areas   │
│ Calculate distances │ Cumulative distance along track          │
│ Extract elevation   │ Build elevation profile data             │
│ Segment by day      │ Split multi-day tracks into daily legs   │
│ Buffer route        │ Create corridor for POI discovery        │
│ Simplify geometry   │ Reduce point count for web performance   │
└─────────────────────┴──────────────────────────────────────────┘
```

**R 處理範例：**

```r
# Calculate cumulative distance
track_points <- sf::st_cast(track, "POINT")
distances <- sf::st_distance(track_points[-nrow(track_points), ],
                             track_points[-1, ],
                             by_element = TRUE)
cumulative_km <- cumsum(as.numeric(distances)) / 1000

# Extract elevation profile data
elevation_df <- data.frame(
  distance_km = c(0, cumulative_km),
  elevation_m = sf::st_coordinates(track_points)[, 3]
)

# Simplify for web display (keep 1% of points)
track_simple <- sf::st_simplify(track, dTolerance = 0.001)
```

**預期：** 清潔之空間資料，距離已算、高度已萃、幾何已簡以合目標輸出。無 NA 座標、無零長段。

**失敗時：** 若高度資料缺（某 GPS 裝置常然），用 DEM 查服務或記高度曲線不可得。若軌簡化移關鍵形狀細節，降容差值。若距離計生 NA，以 `sf::st_is_empty()` 察空幾何。

### 步驟三：擇可視化型

為資料與讀者擇並配合宜之可視化。

```
Visualization Decision Matrix:
┌─────────────────────┬──────────────────────┬───────────────────┐
│ Type                │ Best for             │ Tool              │
├─────────────────────┼──────────────────────┼───────────────────┤
│ Interactive map     │ Web, exploration     │ leaflet (R),      │
│                     │                      │ deck.gl (JS)      │
├─────────────────────┼──────────────────────┼───────────────────┤
│ Static map          │ Print, reports       │ tmap (R),         │
│                     │                      │ ggplot2 + ggspatial│
├─────────────────────┼──────────────────────┼───────────────────┤
│ Elevation profile   │ Hiking/cycling       │ ggplot2, D3       │
│                     │ analysis             │                   │
├─────────────────────┼──────────────────────┼───────────────────┤
│ Heatmap             │ Visit density,       │ leaflet.extras,   │
│                     │ coverage             │ deck.gl HeatmapLayer│
├─────────────────────┼──────────────────────┼───────────────────┤
│ 3D terrain          │ Mountain routes      │ rayshader (R),    │
│                     │                      │ deck.gl TerrainLayer│
└─────────────────────┴──────────────────────┴───────────────────┘
```

配合內容之底圖磚：
- **OpenStreetMap**：通用、標籤佳
- **Stamen Terrain**：徒步與戶外路線
- **ESRI World Imagery**：衛星脈絡
- **OpenTopoMap**：高度脈絡之地形等高線

**預期：** 可視化型與工具鏈之明決定，底圖擇以補路線資料。

**失敗時：** 若擇之工具不能處資料量（如 leaflet 中之 100,000+ 軌點），先簡化幾何或改 canvas 基礎渲染器（deck.gl）。若底圖磚不可得（少見），回退至 OpenStreetMap 為最可靠之免費選項。

### 步驟四：渲染地圖或圖表

以所有層與樣式建可視化。

**互動地圖（R/leaflet）：**

```r
leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenTopoMap") |>
  leaflet::addPolylines(
    data = track,
    color = "#2563eb",
    weight = 4,
    opacity = 0.8
  ) |>
  leaflet::addCircleMarkers(
    data = waypoints,
    radius = 8,
    color = "#dc2626",
    fillOpacity = 0.9,
    popup = ~name
  ) |>
  leaflet::addScaleBar(position = "bottomleft") |>
  leaflet::addMiniMap(position = "bottomright")
```

**高度曲線（R/ggplot2）：**

```r
ggplot2::ggplot(elevation_df, ggplot2::aes(x = distance_km, y = elevation_m)) +
  ggplot2::geom_area(fill = "#93c5fd", alpha = 0.4) +
  ggplot2::geom_line(color = "#2563eb", linewidth = 0.8) +
  ggplot2::labs(
    x = "Distance (km)",
    y = "Elevation (m)",
    title = "Elevation Profile"
  ) +
  ggplot2::theme_minimal()
```

按需加輔助層：每 N km 距離標記、日分隔指示、難度著色段、POI 圖示。

**預期：** 已渲之可視化明顯示路線、路徑點、任何輔助資訊。互動地圖當回應，彈出與縮放可行。高度曲線當有正確軸尺。

**失敗時：** 若地圖渲但無資料顯，察座標於正確 CRS（leaflet 用 EPSG:4326）。若彈出空，驗彈出公式中之欄名。若高度曲線有極端尖峰，濾出 GPS 高度誤（較鄰點偏 100 m 以上）。

### 步驟五：匯出與嵌

存可視化於目標格式。

```
Export Options:
┌───────────────────┬────────────────────────────────────────────┐
│ Format            │ Method                                     │
├───────────────────┼────────────────────────────────────────────┤
│ HTML widget       │ htmlwidgets::saveWidget(map, "map.html")   │
│ PNG (static)      │ mapview::mapshot() or ggplot2::ggsave()    │
│ SVG (vector)      │ ggplot2::ggsave("plot.svg")                │
│ Quarto embed      │ Place leaflet/ggplot code in .qmd chunk    │
│ GeoJSON export    │ sf::st_write(data, "output.geojson")       │
│ KML (Google Earth)│ sf::st_write(data, "output.kml")           │
└───────────────────┴────────────────────────────────────────────┘
```

Quarto 內嵌：
1. 置可視化程式於含當標籤之程式塊
2. 靜態圖用 `#| fig-cap:`，交叉引用用 `#| label: fig-map`
3. 於 YAML 設 `self-contained: true` 以捆磚圖像（增檔大小）

**預期：** 匯出檔於目標脈絡可檢視（HTML 用瀏覽器、嵌入用報告、印用 PNG/SVG）。檔大小合理（HTML widget 5 MB 內、圖像 1 MB 內）。

**失敗時：** 若 HTML widget 過大，減磚快取或簡化幾何。若 Quarto 渲染於 leaflet 時敗，確保 htmlwidgets 套件已裝且輸出格式為 HTML（leaflet 不渲染至 PDF）。PDF 輸出用靜態地圖替代（tmap 以 `tmap_mode("plot")`）。

## 驗證

- [ ] 空間資料匯入無誤且 CRS 正確
- [ ] 所有軌點與路徑點渲於所期之地理區
- [ ] 高度曲線（若含）顯可信值，無極端尖峰
- [ ] 互動地圖之縮放、平移、彈出可行
- [ ] 距離與高度尺標籤正確
- [ ] 匯出檔於目標格式可檢視
- [ ] 檔大小合交付法

## 常見陷阱

- **CRS 不合**：混 EPSG:4326（度）與投影 CRS（米）令資料渲於誤位或誤尺。網頁地圖恒轉為 EPSG:4326
- **GPS 高度雜訊**：GPS 衍生之高度較水平位遠不準。平滑高度資料或用 DEM 基礎之高度作曲線
- **磚伺服器限率**：疾取多磚可觸免費磚伺服器之限率。為重複渲染本地快取磚，守用政策
- **過細軌**：原始 GPS 軌以秒為單位記生巨檔。網頁顯前先簡化
- **PDF 中之 Leaflet**：Leaflet 地圖不能於 PDF 輸出渲染。印用 tmap 或 ggplot2 加 ggspatial
- **缺彈出**：忘加 `popup = ~column_name` 致標記於點擊時無資訊

## 相關技能

- `plan-tour-route` —— 生此技能所可視化之路線資料
- `generate-tour-report` —— 於格式化之遊程報告中嵌可視化
- `plan-hiking-tour` —— 徒步可視化之 GPX 與高度資料源
- `create-quarto-report` —— 嵌空間可視化之 Quarto 渲染
