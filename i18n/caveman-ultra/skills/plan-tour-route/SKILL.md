---
name: plan-tour-route
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan multi-stop tour route: waypoint optimization, drive/walk time est, POI
  discovery via OSM. Covers geocoding, nearest-neighbor + TSP ordering,
  time/distance matrix, itinerary w/ POIs. Use → road trip or walking tour
  multi-dest, optimize visit order, discover sites, compare drive/walk/transit.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: travel
  complexity: intermediate
  language: multi
  tags: travel, routing, waypoints, osm, itinerary
---

# Plan Tour Route

Plan + optimize multi-stop tour: time est, distance, POIs along way.

## Use When

- Road trip or walking tour w/ multiple destinations
- Optimize visit order → min total travel time/distance
- Discover restaurants, viewpoints, cultural sites along route
- Day-by-day itinerary w/ realistic time budgets
- Compare driving vs walking vs transit

## In

- **Required**: Waypoint list (place names, addresses, coordinates)
- **Required**: Travel mode (driving, walking, cycling, transit)
- **Optional**: Start + end (if different from first/last waypoint)
- **Optional**: Time constraints (departure, must-arrive-by, opening hours)
- **Optional**: POI categories (food, viewpoints, museums, fuel)
- **Optional**: Route type pref (fastest, shortest, scenic)

## Do

### Step 1: Define Waypoints

Collect + structure all stops.

```
Waypoint Schema:
┌──────────┬────────────────────────────────────────────┐
│ Field    │ Description                                │
├──────────┼────────────────────────────────────────────┤
│ name     │ Human-readable label for the stop          │
│ address  │ Street address or place name               │
│ lat/lon  │ Coordinates (if known; otherwise geocode)  │
│ duration │ Time to spend at this stop (minutes)       │
│ priority │ Must-visit vs. nice-to-have                │
│ hours    │ Opening/closing times (if applicable)      │
│ notes    │ Parking, accessibility, booking required    │
└──────────┴────────────────────────────────────────────┘
```

Separate fixed-order (hotel start/end) from reorderable.

→ Structured waypoint list w/ min name + address or coordinates each.

If err: ambiguous waypoint ("the castle") → WebSearch to resolve. Coordinates needed but only name → Step 2 geocoding.

### Step 2: Geocode + Validate

Convert waypoints → lat/lon, verify reachable.

```
Geocoding Sources (in preference order):
1. Nominatim (OpenStreetMap) - free, no key required
   https://nominatim.openstreetmap.org/search?q=QUERY&format=json

2. Overpass API - for POI-type queries
   https://overpass-api.de/api/interpreter

3. Manual coordinates from mapping services
```

Per waypoint:
1. Query geocoding service w/ address or name
2. Verify returned coords in expected region
3. Multiple results → disambiguate (pick correct)
4. Store coords w/ waypoint data

→ Every waypoint has valid lat/lon, all in plausible region (no continent outliers).

If err: no results → try alt spellings, add region/country qualifiers, search nearby landmarks. Remote area w/ poor OSM coverage → WebSearch travel blogs/tourism sites.

### Step 3: Optimize Route Order

Visit sequence → min total travel time/distance.

```
Optimization Strategies:
┌─────────────────────┬────────────────────────────────────────┐
│ Strategy            │ When to use                            │
├─────────────────────┼────────────────────────────────────────┤
│ Fixed order         │ Stops must be visited in given sequence│
│ Nearest neighbor    │ Quick approximation for 5-15 stops     │
│ TSP solver          │ Optimal ordering for any number        │
│ Time-window aware   │ Stops have opening hours constraints   │
│ Cluster-then-route  │ Stops span multiple days/regions       │
└─────────────────────┴────────────────────────────────────────┘
```

Nearest-neighbor heuristic:
1. Start at origin
2. From current pos, pick unvisited closest by travel time
3. Move + mark visited
4. Repeat until all visited
5. Return to end (if round trip)

Multi-day → cluster by geo proximity first, then optimize within day.

→ Ordered waypoint sequence, no excessive backtracking. Total distance within 20% of theoretical optimum for <10 stops.

If err: nearest-neighbor obvious backtracking (later stops closer to earlier) → reverse route or 2-opt: swap pairs, keep if shortens. Time-window constraints → verify arrival w/in opening hours.

### Step 4: Calc Times + Distances

Compute travel time + distance per leg.

```
Time Estimation Methods:
┌──────────────┬────────────┬────────────────────────────────┐
│ Mode         │ Avg Speed  │ Notes                          │
├──────────────┼────────────┼────────────────────────────────┤
│ Highway      │ 100 km/h   │ Varies by country/road type    │
│ Rural road   │ 60 km/h    │ Add 20% for winding roads      │
│ City driving │ 30 km/h    │ Add time for parking            │
│ Walking      │ 4.5 km/h   │ Flat terrain; reduce for hills │
│ Cycling      │ 15 km/h    │ Touring pace with luggage      │
│ Hiking       │ 3-4 km/h   │ Use Munter formula for accuracy│
└──────────────┴────────────┴────────────────────────────────┘
```

Per consecutive pair:
1. Straight-line (haversine) distance baseline
2. Detour factor (1.3 roads, 1.4 urban, 1.2 highways)
3. Travel time from adjusted distance + mode speed
4. Buffer: 10% driving, 15% transit
5. Sum legs + dwell times → total tour duration

→ Time/distance matrix, running cumulative time covering travel + dwell. Total realistic (within available daylight for walking).

If err: estimates unrealistic (2 hrs for 10 km city drive) → check detour factor. Mountain roads → 1.6-2.0. Transit → WebSearch actual timetables.

### Step 5: Generate Itinerary w/ POIs

Compile route → complete itinerary w/ discovered POIs.

```
POI Discovery (Overpass API query pattern):
  [out:json];
  (
    node["tourism"="viewpoint"](around:RADIUS,LAT,LON);
    node["amenity"="restaurant"](around:RADIUS,LAT,LON);
    node["amenity"="cafe"](around:RADIUS,LAT,LON);
  );
  out body;

Recommended search radius:
- Along route corridor: 500 m for walking, 2 km for driving
- At waypoints: 1 km radius
```

Build itinerary doc:
1. Header: tour name, dates, total distance, total time
2. Per day (multi-day):
   - Day summary (start, end, total km, hrs)
   - Per leg: departure, mode, distance, duration
   - Per stop: arrival, dwell, desc, nearby POIs
3. Logistics: parking, fuel, rest, emergency contacts
4. Map ref (link to OSM or GPX export)

→ Complete time-budgeted itinerary w/ realistic schedules, POI suggestions, practical logistics.

If err: POI queries → too many → filter by rating/relevance. Itinerary exceeds time → mark low-pri optional or add days. No POIs in remote → note + suggest local research on arrival.

## Check

- [ ] All waypoints geocoded w/ valid coords
- [ ] Route order min backtracking
- [ ] Travel times realistic for mode
- [ ] Dwell times accounted
- [ ] Total tour duration fits time window
- [ ] POIs relevant + near route
- [ ] Opening hours of time-sensitive stops respected
- [ ] Itinerary has practical logistics (parking, fuel, rest)

## Traps

- **Ignore opening hours**: Optimize only by distance → arrive after museum closes. Check time-window constraints.
- **Underestimate urban**: City driving + parking → double expected time. Add buffers for urban stops.
- **Over-pack itinerary**: Every minute filled → no room for delays/spontaneous. Build 30-60 min slack per half-day.
- **Straight-line fallacy**: Haversine severely underestimates road distance, especially mountainous/coastal. Always apply detour factor.
- **Forget return logistics**: One-way routes → plan for rental return, train, pickup.
- **Seasonal closures**: Mountain passes, ferries, scenic routes → seasonal closures. Verify access dates.

## →

- `create-spatial-visualization` — render planned route on interactive map
- `generate-tour-report` — compile itinerary → formatted Quarto report
- `plan-hiking-tour` — specialized planning for hiking segments
- `assess-trail-conditions` — check conditions for walking/hiking legs
