---
name: create-spatial-visualization
locale: caveman-ultra
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

# Create Spatial Visualization

Interactive maps + elev profiles + spatial viz from GPX/waypoints/routes.

## Use When

- Viz tour route on map
- Elev profile hike/bike
- Overlay waypoints + POIs
- Static map → print
- Web trip dashboard

## In

- **Required**: Spatial src (GPX, CSV lat/lon, GeoJSON, waypoints)
- **Required**: Viz type (interactive, static, elev profile, heatmap)
- **Optional**: Basemap (OSM, satellite, terrain, topo)
- **Optional**: Styling (colors, width, icons)
- **Optional**: Out fmt (HTML widget, PNG, SVG, Quarto)
- **Optional**: Extra layers (POI, areas, dist markers)

## Do

### Step 1: Import

**R (sf):**

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

**JS (Observable/D3):**

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

CRS = WGS 84 (EPSG:4326) for web maps.

**Got:** Data as sf / coord array, valid geometries. Pt counts match (GPX track = 100s-1000s pts).

**If err:** GPX parse fail → check XML valid. Common: truncated (GPS battery), mixed ns, GPX 1.0 vs 1.1. No CRS → `sf::st_set_crs(data, 4326)`. Inverted coords → check col order.

### Step 2: Process + Clean

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

**R:**

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

**Got:** Clean data + distances + elev + simplified geom. No NA coords, no zero-length.

**If err:** No elev (some GPS) → DEM lookup / note unavail. Simplify removes detail → reduce tol. Dist NA → check empties: `sf::st_is_empty()`.

### Step 3: Viz Type

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

Basemap tiles:
- **OSM**: General, good labels
- **Stamen Terrain**: Hike/outdoor
- **ESRI World Imagery**: Satellite
- **OpenTopoMap**: Topo contours (elev context)

**Got:** Viz type + toolchain + basemap decided.

**If err:** Tool can't handle vol (100k+ pts leaflet) → simplify / switch canvas (deck.gl). Tiles unavail → fallback OSM.

### Step 4: Render

**Interactive (R/leaflet):**

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

**Elev profile (R/ggplot2):**

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

Add layers: dist markers / N km, day-break, difficulty-color, POI icons.

**Got:** Viz shows route + waypoints + info. Interactive = responsive popups + zoom. Profile = correct scales.

**If err:** No data → CRS correct (EPSG:4326 leaflet). Empty popups → col name in formula. Elev spikes → filter GPS elev errs (>100m deviation from neighbors).

### Step 5: Export + Embed

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

Quarto embed:
1. Code chunk w/ labels
2. `#| fig-cap:` static / `#| label: fig-map` xref
3. `self-contained: true` YAML → bundle tiles (bigger file)

**Got:** File viewable in target. Size OK (<5MB HTML widget, <1MB images).

**If err:** HTML too big → reduce tile cache / simplify geom. Quarto fail w/ leaflet → htmlwidgets installed + HTML out (leaflet no PDF). PDF → static map alt (tmap `tmap_mode("plot")`).

## Check

- [ ] Data imports no err, correct CRS
- [ ] All pts render in expected area
- [ ] Elev profile plausible, no spikes
- [ ] Interactive map: zoom + pan + popups work
- [ ] Scales labeled
- [ ] Export viewable
- [ ] Size OK

## Traps

- **CRS mismatch**: EPSG:4326 (deg) vs projected (m) → wrong loc/scale. Transform to EPSG:4326 web.
- **GPS elev noise**: GPS elev less accurate than horizontal. Smooth / use DEM.
- **Tile rate limits**: Many tiles → rate limit on free servers. Cache local, respect policies.
- **Over-detailed tracks**: 1s GPS → huge files. Simplify before web.
- **Leaflet in PDF**: No render in PDF. Use tmap / ggplot2 + ggspatial for print.
- **Missing popups**: Forgot `popup = ~column_name` → no info on click.

## →

- `plan-tour-route` — gen route data
- `generate-tour-report` — embed viz in report
- `plan-hiking-tour` — GPX + elev src
- `create-quarto-report` — Quarto render
