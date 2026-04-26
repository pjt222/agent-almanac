---
name: plan-tour-route
locale: wenyan-lite
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

# 規劃行程路線

為多停靠點之行程規劃並最佳化路線，附時間估算、距離計算與沿途之興趣點。

## 適用時機

- 規劃多目的地之自駕或徒步行程
- 最佳化造訪順序以縮短總行進時間或距離
- 發掘沿途之餐廳、景觀點或文化古蹟
- 產生附合理時間預算之逐日行程
- 比較自駕、徒步與大眾運輸方案

## 輸入

- **必要**：停靠點清單（地名、地址或座標）
- **必要**：交通模式（自駕、徒步、單車、大眾運輸）
- **選擇性**：起點與終點（若異於首末停靠點）
- **選擇性**：時間限制（出發時間、必抵時刻、營業時間）
- **選擇性**：欲發掘之 POI 類別（餐飲、景觀、博物館、加油）
- **選擇性**：偏好路線類型（最快、最短、景觀）

## 步驟

### 步驟一：界定停靠點

蒐集並結構化行程必含之全部停靠點。

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

將順序固定之停靠點（如起末旅館）與可重排者分開。

**預期：** 一份結構化清單，至少含名稱與一處地址或座標。

**失敗時：** 若停靠點含糊（如「那座城堡」），以 WebSearch 解析為具體地點。若需座標但僅有名稱，俟步驟二行地理編碼。

### 步驟二：地理編碼與驗證

將所有停靠點轉為經緯座標，並驗證可達。

```
Geocoding Sources (in preference order):
1. Nominatim (OpenStreetMap) - free, no key required
   https://nominatim.openstreetmap.org/search?q=QUERY&format=json

2. Overpass API - for POI-type queries
   https://overpass-api.de/api/interpreter

3. Manual coordinates from mapping services
```

對每一停靠點：
1. 以地址或名稱向地理編碼服務查詢
2. 驗證所返座標位於預期區域
3. 若有多項結果，須消歧（擇正確者）
4. 將座標與原停靠點資料一併儲存

**預期：** 每一停靠點皆有有效之經緯座標，所有點皆於合理之地理區域（無誤落他洲之離群點）。

**失敗時：** 若地理編碼無結果，嘗試替代拼寫、加入區域／國家修飾，或搜鄰近地標。若停靠點位於 OSM 覆蓋稀疏之偏遠區域，以 WebSearch 自旅遊部落格或觀光網站尋座標。

### 步驟三：最佳化路線順序

判定能縮短總行進時間或距離之造訪順序。

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

最近鄰啟發式：
1. 自指定起點開始
2. 自當前位置擇行進時間最近之未訪停靠點
3. 移至該點並標為已訪
4. 重複至全部停靠點皆訪
5. 若為環狀，返回指定終點

多日行程，先依地理鄰近性將停靠點分群，再於各日內最佳化。

**預期：** 一個有序之停靠序列，路線無顯著折返。停靠點少於 10 處時，總距離應於理論最佳之 20% 以內。

**失敗時：** 若最近鄰結果出現顯著折返（後段停靠點較近於前段），嘗試反向；或用 2-opt 改良：對換邊對，若可縮短則保留。對含時間窗約束者，驗證各停靠點之抵達時間落於營業時間內。

### 步驟四：計算時間與距離

為路線之每一段計算行進時間與距離。

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

對連續每對停靠點：
1. 以直線（haversine）距離為基線
2. 加迂迴係數（道路 1.3、市區 1.4、高速 1.2）
3. 自調整距離與模式速度估行進時間
4. 加緩衝時間：自駕 10%、大眾運輸 15%
5. 將各段行進時間加各停靠點之停留時間，得行程總長

**預期：** 一張各段之時間／距離矩陣，含累進時間（涵蓋行進與停留）。徒步行程之總長不應超出可用日照。

**失敗時：** 若估時不合理（如 10 km 市區駕車估 2 小時），檢視迂迴係數是否適當。山路調至 1.6-2.0；大眾運輸宜以 WebSearch 查實際時刻表，不以推估代之。

### 步驟五：產生含 POI 之行程

將最佳化後之路線整理為含沿途興趣點之完整行程。

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

製作行程文件：
1. 標頭含行程名、日期、總距離、總時間
2. 每日（多日時）：
   - 當日摘要（起、終、總公里數、總時數）
   - 每段：出發時間、模式、距離、時長
   - 每停靠點：抵達時間、停留時間、描述、附近 POI
3. 行政事務章：停車、加油站、休息區、緊急聯絡
4. 地圖參照（OpenStreetMap 連結或匯出 GPX）

**預期：** 一份完整、含時間預算之行程文件，含合理時程、各停靠點之 POI 建議與實務行政資訊。

**失敗時：** 若 POI 查詢結果過多，依評分或相關性過濾。若行程超出可用時間，將低優先停靠點標為可選或拆為更多日。若偏遠區無 POI，註記之並建議旅人現場再查。

## 驗證

- [ ] 所有停靠點皆地理編碼為有效座標
- [ ] 路線順序使折返最小（無顯著無效率）
- [ ] 行進時間於所擇模式下合理
- [ ] 各停靠點之停留時間皆已計入
- [ ] 行程總長落於可用時間窗內
- [ ] POI 與路線相關且位置鄰近
- [ ] 已尊重時間敏感停靠點之營業時間
- [ ] 行程含實務行政資訊（停車、加油、休息）

## 常見陷阱

- **忽略營業時間**：純依距離最佳化恐使你抵達已閉館之博物館。對景點之時間窗約束務必檢查。
- **低估市區行進**：市區駕車與停車可使預估時間倍增。市區停靠點宜留充裕緩衝。
- **行程過滿**：分秒填滿則無餘裕應變或順遊發現。每半日預留 30-60 分鐘鬆動。
- **直線距離謬誤**：Haversine 距離嚴重低估實際路距，山地或海岸尤甚。務必加迂迴係數。
- **遺忘返程**：單程行程須安排還車、搭火車或接送。
- **季節性封路**：山口、渡輪與景觀道路可能季節性封閉。安排路線前驗證通行日。

## 相關技能

- `create-spatial-visualization` —— 將所規劃路線渲染至互動地圖
- `generate-tour-report` —— 將行程編成格式化之 Quarto 報告
- `plan-hiking-tour` —— 行程內徒步段之專門規劃
- `assess-trail-conditions` —— 為任何步行／徒步段查條件
