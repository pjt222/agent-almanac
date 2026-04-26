---
name: plan-tour-route
locale: wenyan-ultra
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

# 計遊徑

計優多站遊徑、含時估、距算、徑沿景發。

## 用

- 多的之車或步遊計→用
- 優訪序以減總行時或距→用
- 沿徑覓食、景、文景→用
- 生日日行程含實時算→用
- 比車、步、公運→用

## 入

- **必**：途點列（地名、址或座）
- **必**：行式（車、步、騎、公運）
- **可**：起終點（若異於首末途點）
- **可**：時限（發時、必至前、營時）
- **可**：欲覓景類（食、景、館、油）
- **可**：徑偏（速、短、景）

## 行

### 一：定途點

集並構諸需站。

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

分定序途點（如起末旅館）異於可序途點。

得：構諸途點列、各至少含名與址或座。

敗：途點模（如「城堡」）→ WebSearch 解為定處。需座而唯有名→步二地碼解。

### 二：地碼並驗

化諸途點為緯經座、驗其可達。

```
Geocoding Sources (in preference order):
1. Nominatim (OpenStreetMap) - free, no key required
   https://nominatim.openstreetmap.org/search?q=QUERY&format=json

2. Overpass API - for POI-type queries
   https://overpass-api.de/api/interpreter

3. Manual coordinates from mapping services
```

各途點：
1. 問地碼於址或地名
2. 驗返座於預區
3. 多果則明選正者
4. 存座與原途點資

得：諸途點皆有效座、皆於合地區（無錯洲離點）。

敗：地碼無果→試異拼、加區/邦修飾或搜近標。途點於 OSM 弱覆遠區→ WebSearch 自遊誌或遊站覓座。

### 三：優徑序

定減總行時或距之訪序。

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

近鄰啟發：
1. 始於指定起
2. 自當位、選未訪中行時最近
3. 移之、標已訪
4. 至諸已訪
5. 返指定終（若環）

多日遊→先按地近聚、各日內優。

得：序途點生徑無甚回。10 站以下總距當於論最 20% 內。

敗：近鄰果有顯回（晚站近於早）→試反徑或 2-opt 改：換邊對、若縮則留。時窗限→驗各站到時於營時內。

### 四：算時距

各段算行時與距。

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

各連對途點：
1. 算直線（haversine）距為基
2. 施繞因（路 1.3、城 1.4、高速 1.2）
3. 自調距與式速估行時
4. 加緩時：車 10%、公運 15%
5. 諸段時加各站留時為總遊時

得：諸段時/距陣、累時納行與留。總遊時實（步遊不過晝）。

敗：時不實（如 10 km 城車 2 時）→察繞因否宜。山路→繞因加至 1.6-2.0。公運→ WebSearch 察實時表非估。

### 五：生行程含景

匯優徑為完行程含發景。

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

建行程檔：
1. 首含遊名、日、總距、總時
2. 各日（多日則）：
   - 日撮（始、終、總 km、總時）
   - 各段：發時、行式、距、時
   - 各站：到時、留時、述、近景
3. 後勤段：泊、油、休區、急聯
4. 圖參（OSM 徑連或 GPX 出）

得：完時計行程含實表、各站景薦、實後勤。

敗：景問返多→按評或相過。行程過時→標低序為選或分加日。遠區無景→注、薦遊者地研於到。

## 驗

- [ ] 諸途點皆地碼含有效座
- [ ] 徑序減回（無顯失）
- [ ] 行時實於擇式
- [ ] 各站留時納
- [ ] 總遊時於可用時窗內
- [ ] 景相關且近徑
- [ ] 時敏站之營時尊
- [ ] 行程含實後勤（泊、油、休）

## 忌

- **忽營時**：純按距優可入閉館。必察景時窗
- **輕城行**：城車與泊可倍時。城站加豐緩
- **行程過載**：填每分無餘為延或意發。每半日留 30-60 分緩
- **直線謬**：haversine 大輕實路距、尤山海。必加繞因
- **忘返後勤**：單向徑需計返租車、趕車、辦接
- **季閉**：山口、渡、景徑可季閉。發前驗開期

## 參

- `create-spatial-visualization` — 於互動圖呈計徑
- `generate-tour-report` — 匯行程為格 Quarto 報
- `plan-hiking-tour` — 遊內徒段之專計
- `assess-trail-conditions` — 察步/徒段況
