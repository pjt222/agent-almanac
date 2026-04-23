---
name: create-spatial-visualization
locale: caveman
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

Make interactive maps, elevation profiles, spatial visualizations from GPX tracks, waypoints, route data.

## When Use

- Visualizing planned or finished tour route on interactive map
- Making elevation profiles for hiking or cycling routes
- Overlaying waypoints, POIs, route corridors on basemap
- Generating static map images for print reports
- Building web-based trip dashboard with spatial data

## Inputs

- **Required**: Spatial data source (GPX file, CSV with lat/lon, GeoJSON, or waypoint list)
- **Required**: Visualization type (interactive map, static map, elevation profile, heatmap)
- **Optional**: Basemap preference (OpenStreetMap, satellite, terrain, topo)
- **Optional**: Styling params (colors, line width, marker icons)
- **Optional**: Output format (HTML widget, PNG, SVG, embedded in Quarto)
- **Optional**: Extra layers (POI markers, area boundaries, distance markers)

## Steps

### Step 1: Import Spatial Data

Load and parse spatial data into usable format.

**R approach (sf package):**

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

**JavaScript approach (for Observable/D3):**

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

Verify CRS is WGS 84 (EPSG:4326) for web maps.

**Got:** Spatial data loaded as sf object (R) or coordinate array (JS) with valid geometries. Point counts match expected input (e.g., GPX track has hundreds to thousands of points).

**If fail:** GPX parsing fails? Check file is valid XML. Common issues: truncated files from GPS battery death, mixed namespaces, GPX 1.0 vs 1.1 differences. CRS missing? Assign explicitly with `sf::st_set_crs(data, 4326)`. Coordinates look inverted (lat/lon swapped)? Check column order.

### Step 2: Process and Clean

Transform raw data into analysis-ready spatial features.

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

**R processing example:**

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

**Got:** Clean spatial data with calculated distances, elevation extracted, geometry simplified for target output. No NA coordinates, no zero-length segments.

**If fail:** Elevation data missing (common with some GPS devices)? Use DEM lookup service or note elevation profile unavailable. Track simplification removes critical shape detail? Lower tolerance value. Distance calculations produce NA? Check for empty geometries with `sf::st_is_empty()`.

### Step 3: Select Visualization Type

Pick and configure right visualization for data and audience.

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

Configure basemap tiles fitting content:
- **OpenStreetMap**: General purpose, good labels
- **Stamen Terrain**: Hiking and outdoor routes
- **ESRI World Imagery**: Satellite context
- **OpenTopoMap**: Topographic contours for elevation context

**Got:** Clear decision on visualization type and toolchain. Basemap picked to complement route data.

**If fail:** Picked tool cannot handle data volume (e.g., 100,000+ track points in leaflet)? Simplify geometry first or switch to canvas-based renderer (deck.gl). Basemap tiles unavailable (rare)? Fall back to OpenStreetMap as most reliable free option.

### Step 4: Render Map or Chart

Build visualization with all layers and styling.

**Interactive map (R/leaflet):**

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

**Elevation profile (R/ggplot2):**

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

Add supplementary layers as needed: distance markers every N km, day-break indicators, difficulty-colored segments, POI icons.

**Got:** Rendered visualization clearly shows route, waypoints, any extra info. Interactive maps responsive with working popups and zoom. Elevation profiles have right axis scales.

**If fail:** Map renders but shows no data? Check coordinates in right CRS (EPSG:4326 for leaflet). Popups empty? Verify column names in popup formula. Elevation profile has extreme spikes? Filter GPS elevation errors (values off more than 100 m from neighbors).

### Step 5: Export and Embed

Save visualization in target format.

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

For Quarto embedding:
1. Place visualization code in code chunk with right labels
2. Use `#| fig-cap:` for static plots or `#| label: fig-map` for cross-referencing
3. Set `self-contained: true` in YAML to bundle tile images (grows file size)

**Got:** Exported file viewable in target context (browser for HTML, report for embedded, print for PNG/SVG). File size reasonable (under 5 MB for HTML widgets, under 1 MB for images).

**If fail:** HTML widget too large? Cut tile caching or simplify geometries. Quarto rendering fails with leaflet? Confirm htmlwidgets package installed and output format is HTML (leaflet does not render to PDF). For PDF output, use static map alternative (tmap with `tmap_mode("plot")`).

## Checks

- [ ] Spatial data imports without errors, has right CRS
- [ ] All track points and waypoints render in expected geographic area
- [ ] Elevation profile (if included) shows plausible values without extreme spikes
- [ ] Interactive map has working zoom, pan, popups
- [ ] Distance and elevation scales labeled right
- [ ] Export file viewable in target format
- [ ] File size fits delivery method

## Pitfalls

- **CRS mismatch**: Mixing EPSG:4326 (degrees) with projected CRS (meters) → data renders in wrong location or wrong scale. Always transform to EPSG:4326 for web maps.
- **GPS elevation noise**: GPS-derived elevation far less accurate than horizontal position. Smooth elevation data or use DEM-based elevation for profiles.
- **Tile server rate limits**: Fetching many tiles fast can trigger rate limits on free tile servers. Cache tiles locally for repeat rendering. Respect usage policies.
- **Over-detailed tracks**: Raw GPS tracks with 1-second logging → huge files. Simplify before web display.
- **Leaflet in PDF**: Leaflet maps cannot render in PDF output. Use tmap or ggplot2 with ggspatial for print formats.
- **Missing popups**: Forgetting to add `popup = ~column_name` → markers with no info on click.

## See Also

- `plan-tour-route` — generate route data this skill visualizes
- `generate-tour-report` — embed visualizations into formatted tour report
- `plan-hiking-tour` — source of GPX and elevation data for hiking visualizations
- `create-quarto-report` — Quarto rendering for embedding spatial visualizations
