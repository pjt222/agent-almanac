---
name: generate-tour-report
locale: caveman
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

# Generate Tour Report

Make formatted tour report. Embedded maps, daily itineraries, logistics tables, practical travel info.

## When Use

- Compile planned tour into shareable document
- Make offline-accessible travel guide
- Document completed trip with photos, maps, stats
- Make professional tour proposal for group or client
- Consolidate route, accommodation, transport data into one doc

## Inputs

- **Required**: Route data (waypoints, legs, distances, times)
- **Required**: Tour dates + duration
- **Optional**: Accommodation details (name, address, confirmation numbers)
- **Optional**: Transport bookings (flights, trains, car rental)
- **Optional**: GPX tracks or spatial data for map embedding
- **Optional**: Budget info (costs per category)
- **Optional**: Photos or images to include

## Steps

### Step 1: Compile Route + POI Data

Gather all tour data into structured format before building report.

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

Organize data by day for daily section structure:
1. Group waypoints + activities by date
2. Assign each transport leg to day
3. Match accommodations to overnight dates
4. Compute daily totals (distance, time, cost)

**Got:** Complete data collection organized by day, no schedule gaps (every night has accommodation, every leg has transport).

**If fail:** Data incomplete? Mark missing with `[TBD]` + add to follow-up checklist at report end. Dates don't align (arrival at accommodation before departure from previous stop)? Flag + adjust times.

### Step 2: Structure Daily Sections

Make Quarto document skeleton with daily sections.

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

Structure document:

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

**Got:** Complete .qmd file skeleton with YAML header, all daily sections as H2 headings, placeholder content.

**If fail:** Tour too long for single doc (more than 14 days)? Split weekly parts or tabset layout (`{.tabset}`). PDF output required? No interactive widgets (static maps).

### Step 3: Embed Maps + Charts

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

**Got:** Each daily section has at least route map. Multi-modal days (driving + hiking) → road map + elevation profile. Overview section has map showing complete tour.

**If fail:** Leaflet maps fail to render (common in PDF mode)? Fall back to static maps via `tmap::tmap_mode("plot")` or `ggplot2` with `ggspatial::annotation_map_tile()`. Spatial data unavailable for day → simple text description instead.

### Step 4: Add Logistics Tables

Insert structured tables for accommodations, transport, budget.

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

**Got:** Complete logistics tables with all bookings listed chronologically. No missing dates in accommodation table. Budget totals correct.

**If fail:** Booking details not confirmed? Use `[TBD]` + highlight row. Tour involves multiple currencies? Add currency column + exchange rates in footnote.

### Step 5: Render Report

Compile Quarto document into final output format.

```bash
# Render to self-contained HTML (best for offline use)
quarto render tour-report.qmd --to html

# Render to PDF (for printing)
quarto render tour-report.qmd --to pdf

# Preview with live reload during editing
quarto preview tour-report.qmd
```

Post-rendering checks:
1. Open HTML file + verify all maps load correctly
2. Test table of contents links work
3. Verify all images + charts render at appropriate sizes
4. Check self-contained HTML works offline (disconnect + reload)
5. PDF: verify page breaks at logical points (between days)

**Got:** Complete, self-contained document works offline, contains all tour info in navigable format.

**If fail:** Rendering fails? Check R console for package errors (missing sf, leaflet, ggplot2). Self-contained HTML too large (over 20 MB)? Reduce map tile resolution or use PNG screenshots. PDF rendering fails with LaTeX errors? Install TinyTeX with `quarto install tinytex`.

## Checks

- [ ] Report renders no errors in target format
- [ ] Overview map shows complete route with all stops
- [ ] Each day has route map + schedule
- [ ] Accommodation table covers every night of trip
- [ ] Transport table includes all legs
- [ ] Budget totals accurate
- [ ] Self-contained HTML works offline
- [ ] Table of contents navigates correct to all sections
- [ ] No [TBD] placeholders remain (or intentionally flagged)

## Pitfalls

- **Interactive maps in PDF**: Leaflet + HTML widgets can't render in PDF. Always provide static map alternatives for PDF output.
- **Oversized self-contained HTML**: Embedding many map tiles → huge files. Limit zoom levels or static map screenshots for tile-heavy maps.
- **Missing time zones**: International tours cross time zones. Always specify time zone for departure + arrival.
- **Stale booking references**: Confirmation numbers + times can change. Include "last updated" date + remind users verify before travel.
- **No offline fallback**: Report relies on web-loaded map tiles → blank offline. Use `self-contained: true` or pre-render maps as images.
- **Inconsistent date formats**: Mix of DD/MM + MM/DD → confusion. Use ISO 8601 (YYYY-MM-DD) consistently.

## See Also

- `plan-tour-route` — generates route data compiled into this report
- `create-spatial-visualization` — creates maps + charts embedded in report
- `create-quarto-report` — general Quarto document creation + config
- `plan-hiking-tour` — hiking-specific data for mountain tour reports
- `check-hiking-gear` — packing checklists for logistics appendix
