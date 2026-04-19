---
name: build-grafana-dashboards
locale: wenyan-lite
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

# Build Grafana Dashboards

以可維、可復用、版控之最佳實踐設計並部署 Grafana 儀表板。

## 適用時機

- 視覺化 Prometheus、Loki、或他數源之指標
- 為 SRE 團隊與事件應對者建運營儀表板
- 建高管級 SLO 合規之報告儀表板
- 自手創儀表板遷至版控之配置
- 以模板變數統一團隊之儀表板版型
- 自高階總覽至詳指標之下鑽

## 輸入

- **必要**：數源配（Prometheus、Loki、Tempo 等）
- **必要**：欲視覺化之指標或日誌及其查詢模式
- **選擇性**：多服務或多環境視圖之模板變數
- **選擇性**：遷移或修改之既有儀表板 JSON
- **選擇性**：事件關聯之註釋查詢（部署、事故）

## 步驟

> See [Extended Examples](references/EXAMPLES.md) for complete configuration files and templates.


### 步驟一：設計儀表板結構

建面板前先計儀表板版型與組。

創儀表板規文檔：

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

要設計原則：
- **要指標在上**：關鍵指標於頂，細節於下
- **時段一致**：諸面板同步時
- **下鑽路**：自高階連至詳儀表板
- **響應式版型**：用適屏之列與面板寬

**預期：** 明之儀表板結構已錄，與用戶（SRE、開發）對齊於指標與版型之先。

**失敗時：**
- 與終用戶行儀表板設計審
- 以業界標（USE 法、RED 法、四金信號）為基準
- 審團隊既有儀表板以求一致

### 步驟二：以模板變數創儀表板

以濾用之復變建儀表板基礎。

創儀表板 JSON 結構（或用 UI 後出）：

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

變數類與用例：
- **查詢變數**：自數源之動態列（`label_values()`、`query_result()`）
- **間隔變數**：查詢之聚合窗
- **自訂變數**：非指標選之靜列
- **常數變數**：跨面板共用之值（數源名、門檻）
- **文字框變數**：濾之自由輸入

**預期：** 變數自數源正填，級聯濾工（環境濾實例），預設擇合。

**失敗時：**
- 於 Prometheus UI 獨測變數查詢
- 查環依（A 依 B 依 A）
- 驗多選變數之 `allValue` 中 regex 模式
- 審變數刷新設（儀表板載時對時段變時）

### 步驟三：建視覺化面板

為每指標創合之視覺化類之面板。

**時序面板**（請率）：

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

**Stat 面板**（錯率）：

```json
{
  "type": "stat",
  "title": "Error Rate",
  "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

**Heatmap 面板**（延分佈）：

```json
{
  "type": "heatmap",
  "title": "Request Duration Heatmap",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

面板擇指南：
- **時序**：時之趨勢（率、計數、時長）
- **Stat**：帶門檻色之單一當前值
- **Gauge**：百分率（CPU、記憶、盤用）
- **Bar gauge**：某時點比多值
- **Heatmap**：時之值分佈（延百分位）
- **Table**：多指標之詳析
- **Logs**：Loki 之原日誌列，帶濾

**預期：** 面板以數正渲，視覺化合所意之指標類，圖例描，門檻示題。

**失敗時：**
- 於 Explore 視圖以同時段與變數測查詢
- 查指標名打字錯或誤標濾
- 驗聚合函合指標類（計數器用 rate、gauge 用 avg）
- 審單位配（bytes、seconds、reqps）
- 開「Show query inspector」以調空結果

### 步驟四：配列與版型

組面板入可折行以作邏輯組。

```json
{
  "panels": [
    {
      "type": "row",
      "title": "High-Level Metrics",
      "collapsed": false,
# ... (see EXAMPLES.md for complete configuration)
```

版型最佳實踐：
- 格寬 24 單位，每面板指 `w`（寬）與 `h`（高）
- 用行組關聯之面板，預設折不關鍵之段
- 置最關鍵指標於首可見區（y=0-8）
- 於行內維一致之面板高（典型 4、8、12 單位）
- 時序用全寬（24），比較用半寬（12）

**預期：** 儀表板版型合邏輯，行折／展正確，面板視覺對齊而無隙。

**失敗時：**
- 驗 gridPos 坐標不重
- 查行面板陣列含面板（非 null）
- 驗 y 坐標合邏輯下增
- 以 Grafana UI「Edit JSON」察格位

### 步驟五：加連與下鑽

創相關儀表板間之導航路。

JSON 中儀表板級連：

```json
{
  "links": [
    {
      "title": "Service Details",
      "type": "link",
      "icon": "external link",
# ... (see EXAMPLES.md for complete configuration)
```

面板級數連：

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs for ${__field.labels.instance}",
# ... (see EXAMPLES.md for complete configuration)
```

連變數：
- `$service`、`$environment`：儀表板模板變
- `${__field.labels.instance}`：所點數點之標值
- `${__from}`、`${__to}`：當前儀表板時段
- `$__url_time_range`：URL 編之時段

**預期：** 點面板元或儀表板連至相關視，脈絡保全（時段、變數）。

**失敗時：**
- 於查詢參中 URL 編特字
- 以諸變擇（全對特值）測連
- 驗目儀表板 UID 存且可達
- 查 `includeVars` 與 `keepTime` 旗如期工

### 步驟六：立儀表板配置

版控儀表板為代碼以可復部。

創配置目錄結構：

```bash
mkdir -p /etc/grafana/provisioning/{dashboards,datasources}
```

數源配置（`/etc/grafana/provisioning/datasources/prometheus.yml`）：

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
# ... (see EXAMPLES.md for complete configuration)
```

儀表板配置（`/etc/grafana/provisioning/dashboards/default.yml`）：

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

存儀表板 JSON 文件於 `/var/lib/grafana/dashboards/`：

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

用 Docker Compose：

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

**預期：** 儀表板於 Grafana 啟時自動載，JSON 文件之變於更間後反映，版控追儀表板變。

**失敗時：**
- 查 Grafana 日誌：`docker logs grafana | grep -i provisioning`
- 驗 JSON 語法：`python -m json.tool dashboard.json`
- 確文件權允 Grafana 讀：`chmod 644 *.json`
- 以 `allowUiUpdates: false` 測以止 UI 修
- 驗配置：`curl http://localhost:3000/api/admin/provisioning/dashboards/reload -X POST -H "Authorization: Bearer $GRAFANA_API_KEY"`

## 驗證

- [ ] 儀表板於 Grafana UI 無錯載
- [ ] 諸模板變以期值填
- [ ] 變級聯工（擇環境濾實例）
- [ ] 面板於配時段顯數
- [ ] 面板查詢正用變（無硬編值）
- [ ] 門檻合宜示問態
- [ ] 圖例格式描而不亂
- [ ] 註釋於相關事件顯
- [ ] 連導至正儀表板附脈絡
- [ ] 儀表板自 JSON 文件配置（版控）
- [ ] 響應式版型於多屏工
- [ ] 工具提示與懸停交互提有用脈絡

## 常見陷阱

- **變不更面板**：確查詢用 `$variable` 語法，非硬編值。查變刷新設。
- **查詢正而面板空**：驗時段含數點。查抓取間對聚合窗（五分 rate 需大於五分之數）。
- **圖例過詳**：用 `legendFormat` 顯相關標，非全指標名。例：`{{method}} - {{status}}` 代預設。
- **時段不一致**：設儀表板時同步以使諸面板共同時窗。用「Sync cursor」作關聯調查。
- **效能題**：避返高基數序（>1000）之查詢。用錄規或預聚合。對貴查詢限時段。
- **儀表板偏移**：無配置，手 UI 變生版控衝。生產用 `allowUiUpdates: false`。
- **缺數連**：數連須精確標名。`${__field.labels.labelname}` 慎用，驗標存於查詢果。
- **註釋過多**：多註釋亂視。按要濾註釋或用獨立註釋軌。

## 相關技能

- `setup-prometheus-monitoring` - 配 Grafana 儀表板所食之 Prometheus 數源
- `configure-log-aggregation` - 立 Loki 以供日誌面板查詢與基日誌之註釋
- `define-slo-sli-sla` - 以 Grafana 之 stat 與 gauge 面板視覺化 SLO 合規與錯預算
- `instrument-distributed-tracing` - 自指標面板加軌 ID 連至 Tempo 軌視
