---
name: plan-tour-route
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  謀多停之行徑：優化途點、估駕/行之時、用 OSM 數據沿途發掘 POI。
  含地理編碼、近鄰與 TSP 序、時/距矩算、生附景點之行程。
  謀多目地之公路行或徒步行、優訪序減旅時、發掘沿途之地、
  比駕/行/公共交通之選時用之。
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

# 謀行徑

謀並優化多停之行徑，附時估、距算、沿途景點。

## 用時

- 謀多目地之公路行或徒步行
- 優訪序以減總旅時或距
- 發掘沿途之餐館、觀景、文化地
- 生實時預算之日行程
- 比駕/行/公共交通之選

## 入

- **必要**：途點之列（地名、址、座標）
- **必要**：旅模（駕、行、騎、公共）
- **可選**：起終點（若異於首末途點）
- **可選**：時制（出發時、必至時、開放時）
- **可選**：欲發掘之 POI 類（食、觀景、博物館、燃料）
- **可選**：徑型之偏（最速、最短、景觀）

## 法

### 第一步：定途點

採並結構行所必含之諸停。

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

分定序途點（如起終之店）與可重序之途點。

得：諸途點之結構列，至少含名與址或座標。

敗則：若途點模糊（如「該城堡」），用 WebSearch 釋為特定地。若需座標而唯有名，留至第二步地理編碼。

### 第二步：地理編碼並驗

化諸途點為緯經座標並驗其可達。

```
Geocoding Sources (in preference order):
1. Nominatim (OpenStreetMap) - free, no key required
   https://nominatim.openstreetmap.org/search?q=QUERY&format=json

2. Overpass API - for POI-type queries
   https://overpass-api.de/api/interpreter

3. Manual coordinates from mapping services
```

各途點：
1. 對地理編碼服務查址或地名
2. 驗返之座標於預期區
3. 察多結果消歧（擇正確者）
4. 將座標與原途點數據並存

得：諸途點皆有有效緯經座標，諸點皆於合理地理區（無越洲之異點）。

敗則：若地理編碼無果，試他拼、加區/國限、或搜近地標。若途點於 OSM 覆稀之偏地，用 WebSearch 自旅遊網或文找座標。

### 第三步：優徑序

定減總旅時或距之訪序。

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

近鄰啟發法：
1. 自指定之起點始
2. 自當前位，擇旅時最近之未訪途點
3. 移至該途點並標已訪
4. 重至諸途點皆訪
5. 返指定之終點（若往返）

多日之行，先依地理近聚途點，再各日內優化。

得：途點有序之序，徑無過倒回。少於 10 停者，總距當於理論最優之 20% 內。

敗則：若近鄰之果有顯倒回（後停近於前者），試反徑或用 2-opt 改進：交對邊，若縮徑則留交。時窗制者，驗各停之至時於開放時內。

### 第四步：算時與距

對徑各段算旅時與距。

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

各連續途點對：
1. 算直線（haversine）距為基
2. 施繞路因子（路 1.3、城 1.4、高速 1.2）
3. 自調距與模速估旅時
4. 加緩衝時：駕 10%、公共 15%
5. 段時加各停之停留時為總行久

得：諸段之時/距矩，附累時計旅與停留。總行久當實（徒步行不逾日光）。

敗則：若估時不實（如 2 時於 10 km 城駕），察繞路因子是否宜。山路者，繞路因子升至 1.6-2.0。公共交通者，用 WebSearch 察實時表而非估。

### 第五步：附 POI 生行程

將優化之徑匯為含發掘景點之完整行程。

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

立行程文：
1. 含行名、日、總距、總時之首
2. 各日（多日者）：
   - 日要（始、終、總 km、總時）
   - 各段：出發時、旅模、距、久
   - 各停：至時、停留、述、近 POI
3. 事務節：泊、燃料、休、緊急聯
4. 圖參（OpenStreetMap 之徑連結或 GPX 匯）

得：完備、時預算之行程文，含實時、各停 POI 薦、實事務訊。

敗則：若 POI 查返果太多，依評或相關濾。若行程逾可用時，標較低優先停為可選或分日。若偏地無 POI，記之並建議旅人至而地察。

## 驗

- [ ] 諸途點皆已地理編碼附有效座標
- [ ] 徑序減倒回（無顯不效）
- [ ] 旅時對所擇模實際
- [ ] 各停之停留時計入
- [ ] 總行久於可用時窗內
- [ ] POI 相關且近徑
- [ ] 時敏停之開放時受尊
- [ ] 行程含實事務（泊、燃料、休）

## 陷

- **忽開放時**：純依距優化或致館閉後而至。常察景之時窗制。
- **低估城旅**：城駕與泊或倍預期時。城停加豐之緩衝。
- **行程過載**：填每分留無延誤或自發發現之餘。每半日留 30-60 分之鬆。
- **直線距之謬**：Haversine 距嚴重低估實路距，尤山地或海岸。常施繞路因子。
- **忘返事務**：單向徑需謀返租車、追火車、或安接送。
- **季節閉路**：山口、渡輪、景觀道或季節閉。徑前驗准入日。

## 參

- `create-spatial-visualization` — 於互動圖渲染所謀徑
- `generate-tour-report` — 將行程匯為格式之 Quarto 報
- `plan-hiking-tour` — 行內徒步段之專謀
- `assess-trail-conditions` — 察任何步行/徒步段之情
