---
name: generate-tour-report
locale: caveman-ultra
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

Formatted tour report w/ maps, daily itineraries, logistics, travel info.

## Use When

- Compile planned tour → shareable doc
- Offline travel guide
- Completed trip w/ photos, maps, stats
- Pro tour proposal
- Consolidate route + accom + transport

## In

- **Required**: route data (waypoints, legs, distances, times)
- **Required**: dates + duration
- **Optional**: accom (name, address, conf#)
- **Optional**: transport (flights, trains, car)
- **Optional**: GPX tracks / spatial data
- **Optional**: budget info
- **Optional**: photos / images

## Do

### Step 1: Compile route + POI data

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

Organize by day:
1. Group waypoints + activities by date
2. Assign transport leg to day
3. Match accom to overnight dates
4. Daily totals (distance, time, cost)

→ Complete collection by day, no gaps (every night = accom, every leg = transport).

**If err:** incomplete → `[TBD]` placeholders + follow-up checklist. Dates misalign → flag + adjust.

### Step 2: Structure daily sections

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

Structure:

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

→ Complete .qmd skeleton w/ YAML + H2 headings + placeholders.

**If err:** >14 days → split weekly or tabset. PDF → no interactive widgets (static maps).

### Step 3: Embed maps + charts

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

**Elevation profile (hike/cycle):**

```r
#| label: fig-day3-elevation
#| fig-cap: "Day 3 elevation profile"

ggplot2::ggplot(day3_elevation, ggplot2::aes(x = dist_km, y = elev_m)) +
  ggplot2::geom_area(fill = "#bfdbfe", alpha = 0.5) +
  ggplot2::geom_line(color = "#1d4ed8", linewidth = 0.7) +
  ggplot2::theme_minimal() +
  ggplot2::labs(x = "Distance (km)", y = "Elevation (m)")
```

→ Each day ≥ route map. Multi-modal = road + elevation. Overview = full tour map.

**If err:** leaflet fails PDF → fallback `tmap::tmap_mode("plot")` or ggplot2 + `ggspatial::annotation_map_tile()`. No spatial → text description.

### Step 4: Logistics tables

**Accommodation:**

```markdown
| Night | Date       | Accommodation      | Address            | Check-in | Cost   | Conf# |
|-------|------------|--------------------|--------------------|----------|--------|-------|
| 1     | 2025-07-01 | Hotel Alpine       | Bergstrasse 12     | 15:00    | EUR 95 | AB123 |
| 2     | 2025-07-02 | Mountain Hut       | Zugspitze Huette   | 16:00    | EUR 45 | --    |
| 3     | 2025-07-03 | Pension Edelweiss  | Dorfplatz 3        | 14:00    | EUR 72 | CD456 |
```

**Transport:**

```markdown
| Date       | Type  | From          | To            | Depart | Arrive | Ref#   |
|------------|-------|---------------|---------------|--------|--------|--------|
| 2025-07-01 | Train | Munich Hbf    | Garmisch      | 08:15  | 09:32  | DB1234 |
| 2025-07-03 | Bus   | Zugspitze     | Ehrwald        | 10:00  | 10:25  | --     |
| 2025-07-04 | Train | Innsbruck     | Munich Hbf    | 16:45  | 18:30  | OBB567 |
```

**Budget:**

```markdown
| Category        | Estimated | Actual | Notes                   |
|-----------------|-----------|--------|-------------------------|
| Accommodation   | EUR 212   |        | 3 nights                |
| Transport       | EUR 85    |        | Rail passes recommended |
| Food            | EUR 150   |        | EUR 50/day estimate     |
| Activities      | EUR 60    |        | Cable car, museum       |
| **Total**       | **EUR 507** |      |                         |
```

→ Complete logistics tables chronological, no missing dates, totals correct.

**If err:** unconfirmed → `[TBD]` + highlight row. Multi-currency → add column + footnote exchange rates.

### Step 5: Render

```bash
# Render to self-contained HTML (best for offline use)
quarto render tour-report.qmd --to html

# Render to PDF (for printing)
quarto render tour-report.qmd --to pdf

# Preview with live reload during editing
quarto preview tour-report.qmd
```

Post-render checks:
1. HTML opens, maps load
2. TOC links work
3. Images + charts render right sizes
4. Self-contained HTML offline (disconnect + reload)
5. PDF → page breaks logical (between days)

→ Complete self-contained doc, offline, navigable.

**If err:** render fails → check R console pkg errors (sf, leaflet, ggplot2). HTML >20 MB → reduce tile res or PNG screenshots. PDF LaTeX fail → `quarto install tinytex`.

## Check

- [ ] Renders no err in target format
- [ ] Overview map = full route + stops
- [ ] Each day has route map + schedule
- [ ] Accom table = every night
- [ ] Transport table = all legs
- [ ] Budget totals accurate
- [ ] Self-contained HTML offline
- [ ] TOC navigates correctly
- [ ] No `[TBD]` (or intentionally flagged)

## Traps

- **Interactive maps in PDF**: leaflet/widgets no render PDF. Provide static alternative.
- **Oversized HTML**: many tiles → huge file. Limit zoom or PNG screenshots.
- **Missing TZ**: international crosses TZ. Always specify depart/arrive TZ.
- **Stale bookings**: conf#/times change. "Last updated" date + remind verify.
- **No offline fallback**: web-tile maps → blank offline. `self-contained: true` or pre-render.
- **Inconsistent date fmt**: ISO 8601 (YYYY-MM-DD) throughout.

## →

- `plan-tour-route` — route data fed into report
- `create-spatial-visualization` — maps + charts
- `create-quarto-report` — general Quarto
- `plan-hiking-tour` — hiking-specific data
- `check-hiking-gear` — packing checklists
