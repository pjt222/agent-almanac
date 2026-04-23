---
name: create-spatial-visualization
locale: wenyan
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

# 建空間視

由 GPX 跡、航點、途數建互動圖、高程圖、空視。

## 用時

- 將劃或畢之遊途視於互動圖
- 為步行或單車途建高程圖
- 於底圖疊航點、POI、途廊
- 為印報建靜圖
- 建基於網之含空數之遊儀盤

## 入

- **必要**：空數源（GPX、含經緯之 CSV、GeoJSON、航點列）
- **必要**：視類（互動圖、靜圖、高程圖、熱圖）
- **可選**：底圖之擇（OpenStreetMap、衛星、地形、等高）
- **可選**：樣參（色、線寬、標圖）
- **可選**：出式（HTML 部件、PNG、SVG、嵌於 Quarto）
- **可選**：他層（POI 標、域界、距標）

## 法

### 第一步：入空數

加載而解空數為可用式。

**R 法（sf 包）：**

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

**JS 法（Observable/D3）：**

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

驗坐標參系（CRS）為 WGS 84（EPSG:4326）以適網圖。

**得：** 空數加載為 sf 物（R）或坐標陣（JS），幾何合法。點數合期入（如 GPX 跡有數百至數千點）。

**敗則：** 若 GPX 解敗，察文件為合法 XML。常問：GPS 電盡致截、混名空間、GPX 1.0 對 1.1 異。若 CRS 缺，明賦 `sf::st_set_crs(data, 4326)`。若坐標反（經緯倒），察列序。

### 第二步：處清

轉原數為析之空特徵。

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

**R 處例：**

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

**得：** 清空數，距已算、高程已抽、幾何已簡以合目標出。無 NA 坐標、無零長段。

**敗則：** 若高程缺（某 GPS 常見），用 DEM 查服或記高程圖不可得。若簡去要形細，減容差值。若距算生 NA，以 `sf::st_is_empty()` 察空幾何。

### 第三步：擇視類

為數與聽者擇配視。

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

依內容設底圖瓦：
- **OpenStreetMap**：通用，標佳
- **Stamen Terrain**：步行與野外途
- **ESRI World Imagery**：衛星脈
- **OpenTopoMap**：為高程脈之地形等高

**得：** 視類與工具擇已決，底圖合途數。

**敗則：** 若擇工具不能處數量（如 leaflet 中 100,000+ 跡點），先簡幾何或轉基於 canvas 之渲（deck.gl）。若底圖瓦不可得（罕），退用 OpenStreetMap 為最可靠之免費選。

### 第四步：渲圖

以諸層與樣建視。

**互動圖（R/leaflet）：**

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

**高程圖（R/ggplot2）：**

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

需時增補層：每 N 公里之距標、日斷之示、難度色段、POI 圖。

**得：** 渲之視清示途、航點、補信。互動圖當應含彈出與縮放。高程圖當有正軸尺。

**敗則：** 若圖渲而無數，察坐標於正 CRS（leaflet 為 EPSG:4326）。若彈空，驗彈式之列名。若高程有極峰，濾 GPS 高程誤（偏鄰者逾 100m）。

### 第五步：出而嵌

存視為目標式。

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

Quarto 嵌法：
1. 將視碼置於有合宜標之碼塊
2. 靜圖用 `#| fig-cap:`，交叉參用 `#| label: fig-map`
3. YAML 設 `self-contained: true` 以打包瓦（增尺）

**得：** 出文件於目標脈可觀（HTML 為覽器、嵌為報、印為 PNG/SVG）。尺合（HTML 部件 < 5MB，圖 < 1MB）。

**敗則：** 若 HTML 部件過大，減瓦緩或簡幾何。若 Quarto 以 leaflet 渲敗，確 htmlwidgets 已裝，出式為 HTML（leaflet 不渲 PDF）。PDF 出用靜圖替（tmap 以 `tmap_mode("plot")`）。

## 驗

- [ ] 空數無訛入且有正 CRS
- [ ] 諸跡點與航點渲於期地
- [ ] 高程圖（若含）示合理值，無極峰
- [ ] 互動圖縮、移、彈行
- [ ] 距與高程尺正標
- [ ] 出文件於目標式可觀
- [ ] 尺合交付法

## 陷

- **CRS 不合**：混 EPSG:4326（度）與投影 CRS（米）則數渲於誤位或尺誤。網圖皆轉 EPSG:4326。
- **GPS 高程噪**：GPS 高程精不如水平位。為圖宜平滑高程或用 DEM 基高程。
- **瓦服限**：速取多瓦觸免瓦服之限。本地緩瓦便重渲，守使用策。
- **跡過細**：秒記之原 GPS 跡生巨文件。網顯前先簡。
- **Leaflet 於 PDF**：Leaflet 圖不渲 PDF。印式用 tmap 或 ggplot2 含 ggspatial。
- **缺彈**：忘加 `popup = ~column_name` 則標點無信息。

## 參

- `plan-tour-route` — 生此技所視之途數
- `generate-tour-report` — 嵌視於格之遊報
- `plan-hiking-tour` — 步行視之 GPX 與高程數源
- `create-quarto-report` — Quarto 渲以嵌空視
