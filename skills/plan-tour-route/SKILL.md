---
name: plan-tour-route
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

Plan and optimize a multi-stop tour route with time estimates, distance calculations, and points of interest along the way.

## When to Use

- Planning a road trip or walking tour with multiple destinations
- Optimizing visit order to minimize total travel time or distance
- Discovering restaurants, viewpoints, or cultural sites along a route
- Generating a day-by-day itinerary with realistic time budgets
- Comparing driving vs. walking vs. public transport options

## Inputs

- **Required**: List of waypoints (place names, addresses, or coordinates)
- **Required**: Travel mode (driving, walking, cycling, public transport)
- **Optional**: Start and end points (if different from first/last waypoint)
- **Optional**: Time constraints (departure time, must-arrive-by, opening hours)
- **Optional**: POI categories to discover (food, viewpoints, museums, fuel)
- **Optional**: Preferred route type (fastest, shortest, scenic)

## Procedure

### Step 1: Define Waypoints

Collect and structure all stops the tour must include.

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

Separate fixed-order waypoints (e.g., hotel at start and end) from reorderable waypoints.

**Expected:** A structured list of all waypoints with at minimum a name and either an address or coordinates for each.

**On failure:** If a waypoint is ambiguous (e.g., "the castle"), use WebSearch to resolve it to a specific location. If coordinates are needed but only a name is available, defer to Step 2 for geocoding.

### Step 2: Geocode and Validate

Convert all waypoints to latitude/longitude coordinates and verify they are reachable.

```
Geocoding Sources (in preference order):
1. Nominatim (OpenStreetMap) - free, no key required
   https://nominatim.openstreetmap.org/search?q=QUERY&format=json

2. Overpass API - for POI-type queries
   https://overpass-api.de/api/interpreter

3. Manual coordinates from mapping services
```

For each waypoint:
1. Query the geocoding service with the address or place name
2. Verify the returned coordinates are in the expected region
3. Check that multiple results are disambiguated (pick the correct one)
4. Store coordinates alongside the original waypoint data

**Expected:** Every waypoint has valid latitude/longitude coordinates, and all points fall within a plausible geographic region (no outliers on wrong continents).

**On failure:** If geocoding returns no results, try alternative spellings, add region/country qualifiers, or search for nearby landmarks. If a waypoint is in a remote area with poor OSM coverage, use WebSearch to find coordinates from travel blogs or tourism sites.

### Step 3: Optimize Route Order

Determine the visit sequence that minimizes total travel time or distance.

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

For the nearest-neighbor heuristic:
1. Start at the designated origin
2. From the current position, select the unvisited waypoint closest by travel time
3. Move to that waypoint and mark it visited
4. Repeat until all waypoints are visited
5. Return to the designated end point (if round trip)

For multi-day tours, cluster waypoints by geographic proximity first, then optimize within each day.

**Expected:** An ordered sequence of waypoints that produces a route without excessive backtracking. Total distance should be within 20% of the theoretical optimum for fewer than 10 stops.

**On failure:** If the nearest-neighbor result has obvious backtracking (later stops are closer to earlier ones), try reversing the route or use a 2-opt improvement: swap pairs of edges and keep the swap if it shortens the route. For time-window constraints, verify that arrival times at each stop fall within opening hours.

### Step 4: Calculate Times and Distances

Compute travel time and distance for each leg of the route.

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
1. Calculate straight-line (haversine) distance as a baseline
2. Apply a detour factor (1.3 for roads, 1.4 for urban, 1.2 for highways)
3. Estimate travel time from adjusted distance and mode speed
4. Add buffer time: 10% for driving, 15% for public transport
5. Sum leg times plus dwell times at each stop for total tour duration

**Expected:** A time/distance matrix for all legs, with a running cumulative time that accounts for both travel and dwell time at each stop. Total tour duration should be realistic (not exceeding available daylight for walking tours).

**On failure:** If estimated times seem unrealistic (e.g., 2 hours for a 10 km city drive), check whether the detour factor is appropriate. For mountain roads, increase the detour factor to 1.6-2.0. For public transport, use WebSearch to check actual timetables rather than estimating.

### Step 5: Generate Itinerary with POIs

Compile the optimized route into a complete itinerary with discovered points of interest.

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

Build the itinerary document:
1. Header with tour name, dates, total distance, total time
2. For each day (if multi-day):
   - Day summary (start, end, total km, total hours)
   - For each leg: departure time, travel mode, distance, duration
   - For each stop: arrival time, dwell time, description, POIs nearby
3. Logistics section: parking, fuel stops, rest areas, emergency contacts
4. Map reference (link to route on OpenStreetMap or export as GPX)

**Expected:** A complete, time-budgeted itinerary document with realistic schedules, POI suggestions at each stop, and practical logistics information.

**On failure:** If POI queries return too many results, filter by rating or relevance. If the itinerary exceeds available time, mark lower-priority stops as optional or split into additional days. If no POIs are found in remote areas, note this and suggest the traveler research locally on arrival.

## Validation

- [ ] All waypoints are geocoded with valid coordinates
- [ ] Route order minimizes backtracking (no obvious inefficiencies)
- [ ] Travel times are realistic for the chosen mode
- [ ] Dwell times at each stop are accounted for
- [ ] Total tour duration fits within the available time window
- [ ] POIs are relevant and located near the route
- [ ] Opening hours of time-sensitive stops are respected
- [ ] Itinerary includes practical logistics (parking, fuel, rest stops)

## Common Pitfalls

- **Ignoring opening hours**: Optimizing purely by distance can route you to a museum after it closes. Always check time-window constraints for attractions.
- **Underestimating urban travel**: City driving and parking can double the expected time. Add generous buffers for urban stops.
- **Over-packing the itinerary**: Filling every minute leaves no room for delays or spontaneous discoveries. Build in 30-60 minutes of slack per half-day.
- **Straight-line distance fallacy**: Haversine distance severely underestimates actual road distance, especially in mountainous or coastal terrain. Always apply a detour factor.
- **Forgetting return logistics**: One-way routes need plans for returning rental cars, catching trains, or arranging pickup.
- **Seasonal road closures**: Mountain passes, ferries, and scenic routes may be closed seasonally. Verify access dates before routing.

## Related Skills

- `create-spatial-visualization` — render the planned route on an interactive map
- `generate-tour-report` — compile the itinerary into a formatted Quarto report
- `plan-hiking-tour` — specialized planning for hiking segments within a tour
- `assess-trail-conditions` — check conditions for any walking/hiking legs
