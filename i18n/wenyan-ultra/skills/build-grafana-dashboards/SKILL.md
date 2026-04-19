---
name: build-grafana-dashboards
locale: wenyan-ultra
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

# 建 Grafana 儀表

設發 Grafana 儀表附可維、可重用、版控之佳慣。

## 用

- 造 Prometheus、Loki 或他資源指之視
- 建 SRE 隊與事應者之運儀
- 立高管 SLO 合規報儀
- 移儀自手造至版控發
- 以模變一跨隊儀布
- 造自高概至細指之鑽探

## 入

- **必**：資源配（Prometheus、Loki、Tempo 等）
- **必**：當視之指或志附查模
- **可**：多服或多環視之模變
- **可**：現儀 JSON 為移或改
- **可**：事關註查（發、事件）

## 行

> 詳 [Extended Examples](references/EXAMPLES.md) 備全配檔與模。

### 一：設儀構

建板前→謀儀布與組。

造儀規文：

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

要設則：
- **要指先**：頂為危指、下為詳
- **一致時範**：諸板同時
- **鑽探路**：自高連至細儀
- **適布**：用列與板寬適諸屏

**得：** 儀構已錄，當事人合指與布之優序。

**敗：**
- 與末用者（SRE、開發者）行儀設察
- 較業標（USE 法、RED 法、四金號）
- 察隊現儀以求一致模

### 二：以模變造儀

建儀基附可重用變為濾。

造儀 JSON 構（或用 UI 後出）：

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
- **查變**：自資源動列（`label_values()`、`query_result()`）
- **區變**：查之集區
- **客變**：非指擇之靜列
- **恆變**：跨板共值（資源名、閾）
- **文變**：濾之自入

**得：** 變自資源正充、級聯濾行（env 濾實）、默擇宜。

**敗：**
- 於 Prometheus UI 獨試變查
- 察循依（A 依 B 依 A）
- 驗 `allValue` 之正則於多擇變
- 察變刷設（載儀時對時範變時）

### 三：建視板

每指造宜視類之板。

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

**stat 板**（誤率）：

```json
{
  "type": "stat",
  "title": "Error Rate",
  "gridPos": {"h": 4, "w": 6, "x": 12, "y": 0},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

**熱圖板**（延分布）：

```json
{
  "type": "heatmap",
  "title": "Request Duration Heatmap",
  "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
  "targets": [
    {
# ... (see EXAMPLES.md for complete configuration)
```

板擇導：
- **時序**：時趨（率、計、時長）
- **Stat**：單當值附閾色
- **表**：百分值（CPU、記、盤）
- **條表**：一時多值較
- **熱圖**：時值分布（延分位）
- **表**：多指細分
- **志**：Loki 原志附濾

**得：** 板正渲附資、視合指類、圖例述、閾顯題。

**敗：**
- Explore 視中以同時範與變試查
- 察指名或標濾誤
- 驗集函合指類（counter 用 rate、gauge 用 avg）
- 察單位配（bytes、seconds、requests per second）
- 啟「Show query inspector」除空結

### 四：配列與布

組板入可折列以邏分。

```json
{
  "panels": [
    {
      "type": "row",
      "title": "High-Level Metrics",
      "collapsed": false,
# ... (see EXAMPLES.md for complete configuration)
```

布佳慣：
- 格 24 單寬，每板定 `w`（寬）與 `h`（高）
- 用列組相關板，默折較不危段
- 置最危指於首視區（y=0-8）
- 列內守一致板高（典 4、8、12 單）
- 時序用全寬（24），較用半寬（12）

**得：** 儀布邏組、列正折展、板視齊無隙。

**敗：**
- 驗 gridPos 坐標不疊
- 察列 panels 陣含板（非 null）
- 驗 y 坐標於頁下遞
- 用 Grafana UI「Edit JSON」察格位

### 五：加連與鑽探

造相關儀間導路。

儀級連於 JSON：

```json
{
  "links": [
    {
      "title": "Service Details",
      "type": "link",
      "icon": "external link",
# ... (see EXAMPLES.md for complete configuration)
```

板級資連：

```json
{
  "fieldConfig": {
    "defaults": {
      "links": [
        {
          "title": "View Logs for ${__field.labels.instance}",
# ... (see EXAMPLES.md for complete configuration)
```

連變：
- `$service`、`$environment`：儀模變
- `${__field.labels.instance}`：點擊資點之標值
- `${__from}`、`${__to}`：當儀時範
- `$__url_time_range`：URL 之編時範

**得：** 點板元或儀連→導相關視附脈留（時範、變）。

**敗：**
- URL 編查參中特字
- 以諸變擇（All 對具值）試連
- 驗標儀 UID 存且可達
- 察 `includeVars` 與 `keepTime` 如望行

### 六：設儀發

版控儀為碼以可復發。

造發目構：

```bash
mkdir -p /etc/grafana/provisioning/{dashboards,datasources}
```

資源發（`/etc/grafana/provisioning/datasources/prometheus.yml`）：

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
# ... (see EXAMPLES.md for complete configuration)
```

儀發（`/etc/grafana/provisioning/dashboards/default.yml`）：

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

存儀 JSON 檔於 `/var/lib/grafana/dashboards/`：

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

**得：** 儀於 Grafana 起時自載、JSON 改後於更區映、版控跟儀變。

**敗：**
- 察 Grafana 志：`docker logs grafana | grep -i provisioning`
- 驗 JSON 法：`python -m json.tool dashboard.json`
- 確檔權允 Grafana 讀：`chmod 644 *.json`
- 以 `allowUiUpdates: false` 試防 UI 改
- 驗發配：`curl http://localhost:3000/api/admin/provisioning/dashboards/reload -X POST -H "Authorization: Bearer $GRAFANA_API_KEY"`

## 驗

- [ ] 儀於 Grafana UI 無誤載
- [ ] 諸模變以望值充
- [ ] 變級聯行（擇環濾實）
- [ ] 板顯配時範資
- [ ] 板查正用變（無硬值）
- [ ] 閾宜顯題態
- [ ] 圖例格述且不雜
- [ ] 註現於相關事
- [ ] 連導正儀附脈留
- [ ] 儀自 JSON 發（版控）
- [ ] 適布行於異屏大
- [ ] 提示與懸互供益脈

## 忌

- **變不更板**：確查用 `$variable` 法，非硬值。察變刷設。
- **空板而查正**：驗時範含資點。察取區對集區（5m rate 需 >5m 資）。
- **圖例冗**：用 `legendFormat` 示相關標，非全指名。例：`{{method}} - {{status}}` 代默。
- **時範不一**：設儀時同令諸板共時窗。用「Sync cursor」為關探。
- **效題**：避返高基數系（>1000）。用錄律或預集。限貴查之時範。
- **儀漂**：無發→手改生版控撞。產用 `allowUiUpdates: false`。
- **缺資連**：資連需精標名。細用 `${__field.labels.labelname}`，驗標存查結。
- **註泛**：過多註雜視。依要濾註或用別註軌。

## 參

- `setup-prometheus-monitoring` — 配 Grafana 所食之 Prometheus 資源
- `configure-log-aggregation` — 設 Loki 為志板查與志註
- `define-slo-sli-sla` — 以 Grafana stat 與 gauge 視 SLO 合規與誤預算
- `instrument-distributed-tracing` — 自指板加蹤 ID 連至 Tempo 蹤視
