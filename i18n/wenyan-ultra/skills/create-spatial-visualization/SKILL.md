---
name: create-spatial-visualization
locale: wenyan-ultra
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

# 造空視

自 GPX 跡、途點、徑數造互動圖、高剖、空視。

## 用

- 於互圖視計或畢遊徑
- 為徒或騎徑造高剖
- 於基圖覆途點、POI、徑帶
- 為印報生靜圖
- 築含空數之網遊板

## 入

- **必**：空源（GPX 檔、含 lat/lon CSV、GeoJSON、途點列）
- **必**：視型（互圖、靜圖、高剖、熱圖）
- **可**：基圖宜（OpenStreetMap、衛、地、拓）
- **可**：風參（色、線寬、標圖）
- **可**：出式（HTML widget、PNG、SVG、嵌 Quarto）
- **可**：加層（POI、域界、距標）

## 行

### 一：引空數

載且解空數為可用式。

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

**JS 法（為 Observable/D3）：**

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

驗 CRS 為 WGS 84（EPSG:4326）為網圖。

**得：** 空數載為 sf 物（R）或坐陣（JS）含有效幾。點數合期入（如 GPX 跡含百至千點）。

**敗：** GPX 解敗→察檔為有效 XML。常問：GPS 電盡致斷檔、混命名空間、GPX 1.0 與 1.1 異。CRS 缺→以 `sf::st_set_crs(data, 4326)` 顯設。坐倒（lat/lon 換）→察列序。

### 二：理與清

化原數為析備空特。

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

**得：** 含算距、取高、簡幾之潔空數。無 NA 坐、無零長段。

**敗：** 高缺（某 GPS 常）→用 DEM 查服或注高剖不可用。跡簡去要形細→減容值。距算 NA→以 `sf::st_is_empty()` 察空幾。

### 三：擇視型

擇且設合數與眾之視。

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

設合內之基圖瓦：
- **OpenStreetMap**：泛用、標佳
- **Stamen Terrain**：徒與外徑
- **ESRI World Imagery**：衛脈
- **OpenTopoMap**：為高脈之拓等

**得：** 視型與具鏈之明決、基圖以補徑數。

**敗：** 擇具不能理數量（如 leaflet 含 100,000+ 跡點）→先簡幾或轉為 canvas 基渲（deck.gl）。基圖瓦不可用→退至 OpenStreetMap 為最靠免選。

### 四：渲圖或圖

含諸層與風築視。

**互圖（R/leaflet）：**

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

**高剖（R/ggplot2）：**

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

須則加補層：每 N km 距標、日分指、難色段、POI 圖。

**得：** 清顯徑、途點、補之渲視。互圖當應、含可用彈與縮。高剖當含正軸尺。

**敗：** 圖渲無數→察坐於正 CRS（leaflet 之 EPSG:4326）。彈空→驗彈式中列名。高剖含極峰→濾 GPS 高誤（偏鄰 100 m 以上者）。

### 五：出與嵌

於目式存視。

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

Quarto 嵌：
1. 置視碼於含合標之碼塊
2. 用 `#| fig-cap:` 為靜圖或 `#| label: fig-map` 為交引
3. 於 YAML 設 `self-contained: true` 以捆瓦像（增檔寸）

**得：** 出檔於目脈可視（HTML 於瀏、嵌於報、印 PNG/SVG）。檔寸合（HTML widgets <5 MB、像 <1 MB）。

**敗：** HTML widget 過大→減瓦快或簡幾。Quarto 渲 leaflet 敗→保 htmlwidgets 包裝、出式為 HTML（leaflet 不渲至 PDF）。PDF 出用靜圖代（tmap `tmap_mode("plot")`）。

## 驗

- [ ] 空數引無誤且含正 CRS
- [ ] 諸跡點與途點渲於期地域
- [ ] 高剖（若含）顯合值而無極峰
- [ ] 互圖含可用縮、移、彈
- [ ] 距與高尺正標
- [ ] 出檔於目式可視
- [ ] 檔寸合交法

## 忌

- **CRS 不合**：混 EPSG:4326（度）與投影 CRS（米）致數渲於誤位或誤尺。網圖恆轉至 EPSG:4326
- **GPS 高噪**：GPS 高遠不及水準。剖用平或 DEM 基高
- **瓦服限**：速取多瓦或觸免瓦服之限。地快瓦為重渲、尊用策
- **過細跡**：一秒誌之原 GPS 跡生巨檔。網顯前簡
- **Leaflet 於 PDF**：Leaflet 圖不可渲於 PDF。印式用 tmap 或 ggplot2 含 ggspatial
- **缺彈**：忘加 `popup = ~column_name` 致標擊無信

## 參

- `plan-tour-route` — 生此技視之徑數
- `generate-tour-report` — 嵌視於式遊報
- `plan-hiking-tour` — 徒視之 GPX 與高源
- `create-quarto-report` — 為嵌空視之 Quarto 渲
