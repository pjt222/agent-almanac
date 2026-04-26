---
name: plan-tour-route
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Plan a multi-stop tour route with waypoint optimization, drive/walk time
  estimation, and POI discovery along the route using OSM data. Covers
  geocoding, nearest-neighbor and TSP-based ordering, time/distance matrix
  calculation, and itinerary generation with points of interest. Use when
  planning a road trip or walking tour with multiple destinations, optimizing
  visit order to minimize travel time, discovering sites along a route, or
  comparing driving versus walking versus public transport options.
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

Plan and optimize multi-stop tour route. Time estimates, distance calculations, points of interest along the way.

## When Use

- Planning road trip or walking tour with multiple destinations
- Optimizing visit order to minimize total travel time or distance
- Discovering restaurants, viewpoints, cultural sites along route
- Generating day-by-day itinerary with realistic time budgets
- Comparing driving vs walking vs public transport options

## Inputs

- **Required**: List of waypoints (place names, addresses, coordinates)
- **Required**: Travel mode (driving, walking, cycling, public transport)
- **Optional**: Start and end points (if different from first/last waypoint)
- **Optional**: Time constraints (departure time, must-arrive-by, opening hours)
- **Optional**: POI categories to discover (food, viewpoints, museums, fuel)
- **Optional**: Preferred route type (fastest, shortest, scenic)

## Steps

### Step 1: Define Waypoints

Collect and structure all stops tour must include.

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

Separate fixed-order waypoints (e.g. hotel at start and end) from reorderable waypoints.

**Got:** Structured list of all waypoints. Min: name and either address or coordinates per waypoint.

**If fail:** Waypoint ambiguous (e.g. "the castle")? Use WebSearch to resolve to specific location. Need coordinates but only name available? Defer to Step 2 for geocoding.

### Step 2: Geocode and Validate

Convert all waypoints to latitude/longitude coordinates. Verify they are reachable.

```
Geocoding Sources (in preference order):
1. Nominatim (OpenStreetMap) - free, no key required
   https://nominatim.openstreetmap.org/search?q=QUERY&format=json

2. Overpass API - for POI-type queries
   https://overpass-api.de/api/interpreter

3. Manual coordinates from mapping services
```

For each waypoint:
1. Query geocoding service with address or place name
2. Verify returned coordinates are in expected region
3. Check multiple results disambiguated (pick correct one)
4. Store coordinates alongside original waypoint data

**Got:** Every waypoint has valid latitude/longitude coordinates. All points fall within plausible geographic region (no outliers on wrong continents).

**If fail:** Geocoding returns no results? Try alternative spellings, add region/country qualifiers, search for nearby landmarks. Waypoint in remote area with poor OSM coverage? Use WebSearch to find coordinates from travel blogs or tourism sites.

### Step 3: Optimize Route Order

Determine visit sequence that minimizes total travel time or distance.

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

For nearest-neighbor heuristic:
1. Start at designated origin
2. From current position, select unvisited waypoint closest by travel time
3. Move to that waypoint, mark visited
4. Repeat until all waypoints visited
5. Return to designated end point (if round trip)

For multi-day tours, cluster waypoints by geographic proximity first, then optimize within each day.

**Got:** Ordered sequence of waypoints — route without excessive backtracking. Total distance within 20% of theoretical optimum for fewer than 10 stops.

**If fail:** Nearest-neighbor result has obvious backtracking (later stops closer to earlier ones)? Try reversing route or use 2-opt improvement: swap pairs of edges and keep swap if it shortens route. For time-window constraints, verify arrival times at each stop fall within opening hours.

### Step 4: Calculate Times and Distances

Compute travel time and distance per leg of route.

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

For each consecutive pair of waypoints:
1. Compute straight-line (haversine) distance as baseline
2. Apply detour factor (1.3 for roads, 1.4 for urban, 1.2 for highways)
3. Estimate travel time from adjusted distance and mode speed
4. Add buffer time: 10% for driving, 15% for public transport
5. Sum leg times plus dwell times at each stop for total tour duration

**Got:** Time/distance matrix for all legs. Running cumulative time accounts for both travel and dwell time at each stop. Total tour duration realistic (doesn't exceed available daylight for walking tours).

**If fail:** Estimated times unrealistic (e.g. 2 hours for 10 km city drive)? Check if detour factor appropriate. For mountain roads, increase detour factor to 1.6-2.0. For public transport, use WebSearch to check actual timetables — don't estimate.

### Step 5: Generate Itinerary with POIs

Compile optimized route into complete itinerary with discovered points of interest.

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

Build itinerary document:
1. Header with tour name, dates, total distance, total time
2. For each day (if multi-day):
   - Day summary (start, end, total km, total hours)
   - For each leg: departure time, travel mode, distance, duration
   - For each stop: arrival time, dwell time, description, POIs nearby
3. Logistics section: parking, fuel stops, rest areas, emergency contacts
4. Map reference (link to route on OpenStreetMap or export as GPX)

**Got:** Complete, time-budgeted itinerary document with realistic schedules, POI suggestions at each stop, practical logistics info.

**If fail:** POI queries return too many results? Filter by rating or relevance. Itinerary exceeds available time? Mark lower-priority stops as optional or split into additional days. No POIs found in remote areas? Note this. Suggest traveler research locally on arrival.

## Checks

- [ ] All waypoints geocoded with valid coordinates
- [ ] Route order minimizes backtracking (no obvious inefficiencies)
- [ ] Travel times realistic for chosen mode
- [ ] Dwell times at each stop accounted for
- [ ] Total tour duration fits within available time window
- [ ] POIs relevant and located near route
- [ ] Opening hours of time-sensitive stops respected
- [ ] Itinerary includes practical logistics (parking, fuel, rest stops)

## Pitfalls

- **Ignore opening hours**: Optimizing purely by distance can route to museum after it closes. Always check time-window constraints for attractions.
- **Underestimate urban travel**: City driving and parking can double expected time. Add generous buffers for urban stops.
- **Over-pack itinerary**: Filling every minute leaves no room for delays or spontaneous discoveries. Build in 30-60 minutes of slack per half-day.
- **Straight-line distance fallacy**: Haversine distance severely underestimates actual road distance — especially in mountainous or coastal terrain. Always apply detour factor.
- **Forget return logistics**: One-way routes need plans for returning rental cars, catching trains, arranging pickup.
- **Seasonal road closures**: Mountain passes, ferries, scenic routes may be closed seasonally. Verify access dates before routing.

## See Also

- `create-spatial-visualization` — render planned route on interactive map
- `generate-tour-report` — compile itinerary into formatted Quarto report
- `plan-hiking-tour` — specialized planning for hiking segments within tour
- `assess-trail-conditions` — check conditions for any walking/hiking legs
