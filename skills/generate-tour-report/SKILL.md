---
name: generate-tour-report
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

# Generate Tour Report

Generate a formatted tour report with embedded maps, daily itineraries, logistics tables, and practical travel information.

## When to Use

- Compiling a planned tour into a shareable document
- Creating an offline-accessible travel guide for a trip
- Documenting a completed trip with photos, maps, and statistics
- Producing a professional tour proposal for a group or client
- Consolidating route, accommodation, and transport data into one document

## Inputs

- **Required**: Route data (waypoints, legs, distances, times)
- **Required**: Tour dates and duration
- **Optional**: Accommodation details (name, address, confirmation numbers)
- **Optional**: Transport bookings (flights, trains, car rental)
- **Optional**: GPX tracks or spatial data for map embedding
- **Optional**: Budget information (costs per category)
- **Optional**: Photos or images to include

## Procedure

### Step 1: Compile Route and POI Data

Gather all tour data into a structured format before building the report.

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

Organize data by day to support the daily section structure:
1. Group waypoints and activities by date
2. Assign each transport leg to a day
3. Match accommodations to overnight dates
4. Calculate daily totals (distance, time, cost)

**Expected:** A complete data collection organized by day, with no gaps in the schedule (every night has accommodation, every leg has transport).

**On failure:** If data is incomplete, mark missing items with `[TBD]` placeholders and add them to a follow-up checklist at the end of the report. If dates don't align (e.g., arrival at accommodation before departure from previous stop), flag the conflict and adjust times.

### Step 2: Structure Daily Sections

Create the Quarto document skeleton with daily sections.

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

Structure the document as follows:

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

**Expected:** A complete .qmd file skeleton with YAML header, all daily sections as H2 headings, and placeholder content for each section.

**On failure:** If the tour is too long for a single document (more than 14 days), consider splitting into weekly parts or using a tabset layout (`{.tabset}`) to keep the document navigable. If PDF output is required, ensure no interactive widgets are included (use static maps instead).

### Step 3: Embed Maps and Charts

Add spatial visualizations to each section.

**Overview map:**

```r
#| label: fig-overview-map
#| fig-cap: "Tour overview with all stops"

leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenTopoMap") |>
  leaflet::addPolylines(data = full_route, color = "#2563eb", weight = 3) |>
  leaflet::addMarkers(data = stops, popup = ~paste(name, "<br>", date))
```

**Daily route map:**

```r
#| label: fig-day1-map
#| fig-cap: "Day 1 route: City A to City B"

day1_route <- full_route[full_route$day == 1, ]
leaflet::leaflet() |>
  leaflet::addProviderTiles("OpenStreetMap") |>
  leaflet::addPolylines(data = day1_route, color = "#2563eb", weight = 4) |>
  leaflet::addCircleMarkers(data = day1_stops, radius = 6, popup = ~name)
```

**Elevation profile (for hiking/cycling days):**

```r
#| label: fig-day3-elevation
#| fig-cap: "Day 3 elevation profile"

ggplot2::ggplot(day3_elevation, ggplot2::aes(x = dist_km, y = elev_m)) +
  ggplot2::geom_area(fill = "#bfdbfe", alpha = 0.5) +
  ggplot2::geom_line(color = "#1d4ed8", linewidth = 0.7) +
  ggplot2::theme_minimal() +
  ggplot2::labs(x = "Distance (km)", y = "Elevation (m)")
```

**Expected:** Each daily section has at minimum a route map. Multi-modal days (driving + hiking) have both a road map and an elevation profile. Overview section has a map showing the complete tour.

**On failure:** If leaflet maps fail to render (common in PDF mode), fall back to static maps using `tmap::tmap_mode("plot")` or `ggplot2` with `ggspatial::annotation_map_tile()`. If spatial data is not available for a day, include a simple text description of the route instead.

### Step 4: Add Logistics Tables

Insert structured tables for accommodations, transport, and budget.

**Accommodation table:**

```markdown
| Night | Date       | Accommodation      | Address            | Check-in | Cost   | Conf# |
|-------|------------|--------------------|--------------------|----------|--------|-------|
| 1     | 2025-07-01 | Hotel Alpine       | Bergstrasse 12     | 15:00    | EUR 95 | AB123 |
| 2     | 2025-07-02 | Mountain Hut       | Zugspitze Huette   | 16:00    | EUR 45 | --    |
| 3     | 2025-07-03 | Pension Edelweiss  | Dorfplatz 3        | 14:00    | EUR 72 | CD456 |
```

**Transport table:**

```markdown
| Date       | Type  | From          | To            | Depart | Arrive | Ref#   |
|------------|-------|---------------|---------------|--------|--------|--------|
| 2025-07-01 | Train | Munich Hbf    | Garmisch      | 08:15  | 09:32  | DB1234 |
| 2025-07-03 | Bus   | Zugspitze     | Ehrwald        | 10:00  | 10:25  | --     |
| 2025-07-04 | Train | Innsbruck     | Munich Hbf    | 16:45  | 18:30  | OBB567 |
```

**Budget summary:**

```markdown
| Category        | Estimated | Actual | Notes                   |
|-----------------|-----------|--------|-------------------------|
| Accommodation   | EUR 212   |        | 3 nights                |
| Transport       | EUR 85    |        | Rail passes recommended |
| Food            | EUR 150   |        | EUR 50/day estimate     |
| Activities      | EUR 60    |        | Cable car, museum       |
| **Total**       | **EUR 507** |      |                         |
```

**Expected:** Complete logistics tables with all bookings listed chronologically. No missing dates in the accommodation table. Budget totals are calculated correctly.

**On failure:** If booking details are not yet confirmed, use `[TBD]` and highlight the row. If the tour involves multiple currencies, add a currency column and include exchange rates in a footnote.

### Step 5: Render Report

Compile the Quarto document into the final output format.

```bash
# Render to self-contained HTML (best for offline use)
quarto render tour-report.qmd --to html

# Render to PDF (for printing)
quarto render tour-report.qmd --to pdf

# Preview with live reload during editing
quarto preview tour-report.qmd
```

Post-rendering checks:
1. Open the HTML file and verify all maps load correctly
2. Test that the table of contents links work
3. Verify all images and charts render at appropriate sizes
4. Check that the self-contained HTML works offline (disconnect and reload)
5. For PDF: verify page breaks fall at logical points (between days)

**Expected:** A complete, self-contained document that works offline and contains all tour information in a navigable format.

**On failure:** If rendering fails, check the R console for package errors (missing sf, leaflet, or ggplot2). If self-contained HTML is too large (over 20 MB), reduce map tile resolution or use PNG screenshots instead of interactive maps. If PDF rendering fails with LaTeX errors, install TinyTeX with `quarto install tinytex`.

## Validation

- [ ] Report renders without errors in the target format
- [ ] Overview map shows the complete route with all stops
- [ ] Each day has a route map and schedule
- [ ] Accommodation table covers every night of the trip
- [ ] Transport table includes all legs
- [ ] Budget totals are accurate
- [ ] Self-contained HTML works offline
- [ ] Table of contents navigates correctly to all sections
- [ ] No [TBD] placeholders remain (or they are intentionally flagged)

## Common Pitfalls

- **Interactive maps in PDF**: Leaflet and other HTML widgets cannot render in PDF. Always provide static map alternatives for PDF output.
- **Oversized self-contained HTML**: Embedding many map tiles creates very large files. Limit zoom levels or use static map screenshots for tile-heavy maps.
- **Missing time zones**: International tours cross time zones. Always specify the time zone for departure and arrival times to avoid confusion.
- **Stale booking references**: Confirmation numbers and times can change. Include a "last updated" date and remind users to verify before travel.
- **No offline fallback**: If the report relies on web-loaded map tiles, it will be blank offline. Use `self-contained: true` or pre-render maps as images.
- **Inconsistent date formats**: Mix of DD/MM and MM/DD causes confusion. Use ISO 8601 (YYYY-MM-DD) consistently throughout.

## Related Skills

- `plan-tour-route` — generates the route data compiled into this report
- `create-spatial-visualization` — creates the maps and charts embedded in the report
- `create-quarto-report` — general Quarto document creation and configuration
- `plan-hiking-tour` — provides hiking-specific data for mountain tour reports
- `check-hiking-gear` — generates packing checklists for the logistics appendix
