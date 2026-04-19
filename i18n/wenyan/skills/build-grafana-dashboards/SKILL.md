---
name: build-grafana-dashboards
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create production-ready Grafana dashboards with reusable panels, template variables,
  annotations, and provisioning for version-controlled dashboard deployment. Use when
  creating visual representations of Prometheus, Loki, or other data source metrics,
  building operational dashboards for SRE teams, migrating from manual dashboard creation
  to version-controlled provisioning, or establishing executive-level SLO compliance
  reporting.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: intermediate
  language: multi
  tags: grafana, dashboards, visualization, panels, provisioning
---

# 建 Grafana 之盤

設而交 Grafana 之盤，循可維、可復、受版控之善法。

## 用時

- 建 Prometheus、Loki 或他源度量之視
- 為 SRE 隊與事故應者建運之盤
- 立 SLO 合之執行級報
- 自手建之盤遷於版控之供
- 以模變跨隊規盤之佈
- 建自概至詳之下鑽

## 入

- **必要**：源設（Prometheus、Loki、Tempo 等）
- **必要**：欲視之度量或日誌及其詢模
- **可選**：多服或多境視之模變
- **可選**：現盤 JSON 為遷或改
- **可選**：事件關之注詢（交、事故）

## 法

> 全設檔與範見 [Extended Examples](references/EXAMPLES.md)。


### 第一步：設盤之構

建板之前，規盤之佈與組。

作盤之規檔：

```markdown
# Service Overview Dashboard

## Purpose
Real-time operational view for on-call engineers monitoring the API service.

## Rows
1. High-Level Metrics (collapsed by default)
   - Request rate, error rate, latency (RED metrics)
   - Service uptime, instance count
2. Detailed Metrics (expanded by default)
   - Per-endpoint latency breakdown
   - Error rate by status code
   - Database connection pool status
3. Resource Utilization
   - CPU, memory, disk usage per instance
   - Network I/O rates
4. Logs (collapsed by default)
   - Recent errors from Loki
   - Alert firing history

## Variables
- `environment`: production, staging, development
- `instance`: all instances or specific instance selection
- `interval`: aggregation window (5m, 15m, 1h)

## Annotations
- Deployment events from CI/CD system
- Alert firing/resolving events
```

要設之律：
- **最要者先**：要度量居上，詳在下
- **時段一致**：諸板同步時
- **下鑽徑**：自概至詳之連
- **響應佈**：用行與板寬合諸屏

**得：** 盤構已錄，利者於度量與佈之先同。

**敗則：**
- 行盤設之審於末用者（SRE、開者）
- 較之於業準（USE、RED、四金信）
- 察隊中現盤之一致模式

### 第二步：以模變建盤

以可復之篩變建盤之基。

建盤 JSON 構（或於 UI 作後出）：

```json
{
  "dashboard": {
    "title": "API Service Overview",
    "uid": "api-service-overview",
    "version": 1,
    "timezone": "browser",
    "editable": true,
    "graphTooltip": 1,
    "time": {
      "from": "now-6h",
      "to": "now"
    },
    "refresh": "30s",
    "templating": {
      "list": [
        {
          "name": "environment",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\"}, environment)",
          "multi": false,
          "includeAll": false,
          "refresh": 1,
          "sort": 1,
          "current": {
            "selected": false,
            "text": "production",
            "value": "production"
          }
        },
        {
          "name": "instance",
          "type": "query",
          "datasource": "Prometheus",
          "query": "label_values(up{job=\"api-service\",environment=\"$environment\"}, instance)",
          "multi": true,
          "includeAll": true,
          "refresh": 1,
          "allValue": ".*",
          "current": {
            "selected": true,
            "text": "All",
            "value": "$__all"
          }
        },
        {
          "name": "interval",
          "type": "interval",
          "options": [
            {"text": "1m", "value": "1m"},
            {"text": "5m", "value": "5m"},
            {"text": "15m", "value": "15m"},
            {"text": "1h", "value": "1h"}
          ],
          "current": {
            "text": "5m",
            "value": "5m"
          },
          "auto": false
        }
      ]
    },
    "annotations": {
      "list": [
        {
          "name": "Deployments",
          "datasource": "Prometheus",
          "enable": true,
          "expr": "changes(app_version{job=\"api-service\",environment=\"$environment\"}[5m]) > 0",
          "step": "60s",
          "iconColor": "rgba(0, 211, 255, 1)",
          "tagKeys": "version"
        }
      ]
    }
  }
}
```

變類與用例：
- **詢變**：自源之動列（`label_values()`、`query_result()`）
- **間變**：詢之聚窗
- **自訂變**：非度量擇之靜列
- **常變**：跨板之共值（源名、閾）
- **文變**：自由輸之篩

**得：** 變自源正填，串聯篩行（境篩實例），默擇合。

**敗則：**
- 於 Prometheus UI 獨試變詢
- 察環依（A 依 B 依 A）
- 驗多擇變中 `allValue` 之正則
- 察變重整設（盤載時 vs 時段變時）

### 第三步：建視之板

為各度量以合視類建板。

**時序板**（請率）：

```json
{
  "type": "timeseries",
  "title": "Request Rate",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
  "targets": [
    {
      "expr": "sum(rate(http_requests_total{job=\"api-service\",environment=\"$environment\",instance=~\"$instance\"}[$interval])) by (method)",
      "legendFormat": "{{method}}",
      "refId": "A"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "unit": "reqps",
      "color": {
        "mode": "palette-classic"
      },
      "custom": {
        "drawStyle": "line",
        "lineInterpolation": "smooth",
        "fillOpacity": 10,
        "spanNulls": true
      },
      "thresholds": {
        "mode": "absolute",
        "steps": [
          {"value": null, "color": "green"},
          {"value": 1000, "color": "yellow"},
          {"value": 5000, "color": "red"}
        ]
      }
    }
  },
  "options": {
    "tooltip": {
      "mode": "multi",
      "sort": "desc"
    },
    "legend": {
      "displayMode": "table",
      "placement": "right",
      "calcs": ["mean", "max", "last"]
    }
  }
}
```

**Stat 板**（錯率）：

```json
{
  "type": "stat",
  "title": "Error Rate",
  "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

**Heatmap 板**（延分佈）：

```json
{
  "type": "heatmap",
  "title": "Request Duration Heatmap",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

板擇之引：
- **時序**：時之趨（率、計、久）
- **Stat**：一當值附閾色
- **Gauge**：百分值（CPU、記、盤用）
- **Bar gauge**：某刻諸值較
- **Heatmap**：值於時之分（延百分位）
- **Table**：諸度量之詳
- **Logs**：Loki 之原日誌附篩

**得：** 板正渲染資料，視合度量類，圖例清述，閾顯題。

**敗則：**
- 於 Explore 以同時段與變試詢
- 察度量名誤或標篩誤
- 驗聚函合度量類（計數用 rate，儀用 avg）
- 察單位設（字節、秒、請/秒）
- 啟「Show query inspector」以調空果

### 第四步：設行與佈

組板於可折之行以邏集。

```json
{
  "panels": [
    {
      "type": "row",
      "title": "High-Level Metrics",
      "collapsed": false,
# ... (see EXAMPLES.md for complete configuration)
```

佈善法：
- 格廿四寬，各板指 `w`（寬）與 `h`（高）
- 用行集相關板，默折次要區
- 最要度量居首見區（y=0-8）
- 行內板高一致（典四、八、十二）
- 時序用全寬（24），較用半寬（12）

**得：** 盤佈邏組，行正折展，板視合無隙。

**敗則：**
- 驗 gridPos 不疊
- 察行板陣含板（非 null）
- 驗 y 座下頁邏增
- 用 Grafana UI「Edit JSON」察格位

### 第五步：加鏈與下鑽

建相關盤間之航徑。

盤級 JSON 鏈：

```json
{
  "links": [
    {
      "title": "Service Details",
      "type": "link",
      "icon": "external link",
# ... (see EXAMPLES.md for complete configuration)
```

板級資料鏈：

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs for ${__field.labels.instance}",
# ... (see EXAMPLES.md for complete configuration)
```

鏈之變：
- `$service`、`$environment`：盤模變
- `${__field.labels.instance}`：所點之標值
- `${__from}`、`${__to}`：當盤時段
- `$__url_time_range`：URL 之編時段

**得：** 點板元或盤鏈航至相視，脈（時段、變）保。

**敗則：**
- 詢參中特字 URL 編
- 以諸變擇試鏈（All vs 特值）
- 驗標盤 UID 存而可取
- 察 `includeVars` 與 `keepTime` 旗如期行

### 第六步：設盤之供

版控盤如碼以可復之交。

建供目構：

```bash
mkdir -p /etc/grafana/provisioning/{dashboards,datasources}
```

源供（`/etc/grafana/provisioning/datasources/prometheus.yml`）：

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
# ... (see EXAMPLES.md for complete configuration)
```

盤供（`/etc/grafana/provisioning/dashboards/default.yml`）：

```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: 'Services'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
      foldersFromFilesStructure: true
```

盤 JSON 置 `/var/lib/grafana/dashboards/`：

```bash
/var/lib/grafana/dashboards/
├── api-service/
│   ├── overview.json
│   └── details.json
├── database/
│   └── postgres.json
└── infrastructure/
    ├── nodes.json
    └── kubernetes.json
```

以 Docker Compose：

```yaml
version: '3.8'
services:
  grafana:
    image: grafana/grafana:10.2.0
    ports:
      - "3000:3000"
    volumes:
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Viewer
```

**得：** 盤於 Grafana 啟時自動載，JSON 變於更間後反映，版控蹤盤之變。

**敗則：**
- 察 Grafana 日誌：`docker logs grafana | grep -i provisioning`
- 驗 JSON 語：`python -m json.tool dashboard.json`
- 確檔權令 Grafana 可讀：`chmod 644 *.json`
- 以 `allowUiUpdates: false` 試，防 UI 改
- 驗供設：`curl http://localhost:3000/api/admin/provisioning/dashboards/reload -X POST -H "Authorization: Bearer $GRAFANA_API_KEY"`

## 驗

- [ ] 盤於 Grafana UI 載無錯
- [ ] 諸模變以預值填
- [ ] 變串聯行（擇境篩實例）
- [ ] 板於設時段顯資料
- [ ] 板詢正用變（無硬值）
- [ ] 閾合顯題態
- [ ] 圖例格清不雜
- [ ] 注現於相關事件
- [ ] 鏈航至正盤而脈保
- [ ] 盤自 JSON 檔供（版控）
- [ ] 響應佈行於異屏
- [ ] 提示與懸互供有用脈

## 陷

- **變不更板**：確詢用 `$variable` 之語，勿硬值。察變重整設
- **詢正而板空**：驗時段含資料點。察採間 vs 聚窗（5m 率須 >5m 之資料）
- **圖例冗**：用 `legendFormat` 只示相關標，非全度量名。例：`{{method}} - {{status}}` 非默
- **時段不一**：立盤時同步令諸板共同時窗。用「Sync cursor」為關察
- **性題**：避返高基之詢（>1000）。用記律或預聚。貴詢限時段
- **盤偏**：無供，手 UI 改生版衝。生用 `allowUiUpdates: false`
- **缺資料鏈**：資鏈須確標名。慎用 `${__field.labels.labelname}`，驗標存於詢果
- **注過載**：注太多亂視。按要篩注或用別注軌

## 參

- `setup-prometheus-monitoring` - 設 Grafana 之 Prometheus 源
- `configure-log-aggregation` - 設 Loki 為日板詢與日基注
- `define-slo-sli-sla` - 以 Grafana stat 與 gauge 視 SLO 合與錯預
- `instrument-distributed-tracing` - 自度量板加 trace ID 鏈於 Tempo trace 視
