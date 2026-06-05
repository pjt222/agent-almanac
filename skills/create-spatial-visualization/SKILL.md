---
name: create-spatial-visualization
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

Create interactive maps, elevation profiles, and spatial visualizations from GPX tracks, waypoints, or route data.

## When to Use

- Visualizing a planned or completed tour route on an interactive map
- Creating elevation profiles for hiking or cycling routes
- Overlaying waypoints, POIs, and route corridors on a basemap
- Generating static map images for print reports
- Building a web-based trip dashboard with spatial data

## Inputs

- **Required**: Spatial data source (GPX file, CSV with lat/lon, GeoJSON, or waypoint list)
- **Required**: Visualization type (interactive map, static map, elevation profile, heatmap)
- **Optional**: Basemap preference (OpenStreetMap, satellite, terrain, topo)
- **Optional**: Styling parameters (colors, line width, marker icons)
- **Optional**: Output format (HTML widget, PNG, SVG, embedded in Quarto)
- **Optional**: Additional layers (POI markers, area boundaries, distance markers)

## Procedure

### Step 1: Import Spatial Data

Load and parse the spatial data into a usable format.

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

Verify the coordinate reference system (CRS) is WGS 84 (EPSG:4326) for web maps.

**Expected:** Spatial data loaded as an sf object (R) or coordinate array (JS) with valid geometries. Point counts match expected input (e.g., a GPX track has hundreds to thousands of points).

**On failure:** If GPX parsing fails, check the file is valid XML. Common issues: truncated files from GPS battery death, mixed namespaces, or GPX 1.0 vs 1.1 differences. If CRS is missing, assign it explicitly with `sf::st_set_crs(data, 4326)`. If coordinates appear inverted (lat/lon swapped), check the column order.

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

**Expected:** Clean spatial data with calculated distances, elevation extracted, and geometry simplified for the target output. No NA coordinates, no zero-length segments.

**On failure:** If elevation data is missing (common with some GPS devices), use a DEM lookup service or note that elevation profile is unavailable. If track simplification removes critical shape detail, reduce the tolerance value. If distance calculations produce NA, check for empty geometries with `sf::st_is_empty()`.

### Step 3: Select Visualization Type

Choose and configure the appropriate visualization for the data and audience.

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

Configure basemap tiles appropriate for the content:
- **OpenStreetMap**: General purpose, good labels
- **Stamen Terrain**: Hiking and outdoor routes
- **ESRI World Imagery**: Satellite context
- **OpenTopoMap**: Topographic contours for elevation context

**Expected:** A clear decision on visualization type and toolchain, with basemap selected to complement the route data.

**On failure:** If the chosen tool cannot handle the data volume (e.g., 100,000+ track points in leaflet), simplify the geometry first or switch to a canvas-based renderer (deck.gl). If basemap tiles are unavailable (rare), fall back to OpenStreetMap as the most reliable free option.

### Step 4: Render Map or Chart

Build the visualization with all layers and styling.

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

**Expected:** A rendered visualization that clearly shows the route, waypoints, and any supplementary information. Interactive maps should be responsive with working popups and zoom. Elevation profiles should have correct axis scales.

**On failure:** If the map renders but shows no data, check that coordinates are in the correct CRS (EPSG:4326 for leaflet). If popups are empty, verify the column names in the popup formula. If the elevation profile has extreme spikes, filter out GPS elevation errors (values deviating more than 100 m from neighbors).

### Step 5: Export and Embed

Save the visualization in the target format.

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
1. Place the visualization code in a code chunk with appropriate labels
2. Use `#| fig-cap:` for static plots or `#| label: fig-map` for cross-referencing
3. Set `self-contained: true` in YAML to bundle tile images (increases file size)

**Expected:** Exported file is viewable in the target context (browser for HTML, report for embedded, print for PNG/SVG). File size is reasonable (under 5 MB for HTML widgets, under 1 MB for images).

**On failure:** If the HTML widget is too large, reduce tile caching or simplify geometries. If Quarto rendering fails with leaflet, ensure the htmlwidgets package is installed and the output format is HTML (leaflet does not render to PDF). For PDF output, use a static map alternative (tmap with `tmap_mode("plot")`).

## Validation

- [ ] Spatial data imports without errors and has correct CRS
- [ ] All track points and waypoints render in the expected geographic area
- [ ] Elevation profile (if included) shows plausible values without extreme spikes
- [ ] Interactive map has working zoom, pan, and popups
- [ ] Distance and elevation scales are correctly labeled
- [ ] Export file is viewable in the target format
- [ ] File size is appropriate for the delivery method

## Common Pitfalls

- **CRS mismatch**: Mixing EPSG:4326 (degrees) with projected CRS (meters) causes data to render in the wrong location or at wrong scale. Always transform to EPSG:4326 for web maps.
- **GPS elevation noise**: GPS-derived elevation is far less accurate than horizontal position. Smooth elevation data or use DEM-based elevation for profiles.
- **Tile server rate limits**: Fetching many tiles rapidly can trigger rate limits on free tile servers. Cache tiles locally for repeated rendering, and respect usage policies.
- **Over-detailed tracks**: Raw GPS tracks with 1-second logging produce enormous files. Simplify before web display.
- **Leaflet in PDF**: Leaflet maps cannot render in PDF output. Use tmap or ggplot2 with ggspatial for print formats.
- **Missing popups**: Forgetting to add `popup = ~column_name` results in markers with no information on click.

## Related Skills

- `plan-tour-route` — generate the route data that this skill visualizes
- `generate-tour-report` — embed visualizations into a formatted tour report
- `plan-hiking-tour` — source of GPX and elevation data for hiking visualizations
- `create-quarto-report` — Quarto rendering for embedding spatial visualizations
