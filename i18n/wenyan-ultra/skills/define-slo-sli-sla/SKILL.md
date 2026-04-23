---
name: define-slo-sli-sla
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Establish Service Level Objectives (SLO), Service Level Indicators (SLI), and Service Level
  Agreements (SLA) with error budget tracking, burn rate alerts, and automated reporting using
  Prometheus and tools like Sloth or Pyrra. Use when defining reliability targets for
  customer-facing services, balancing feature velocity against system reliability through error
  budgets, migrating from arbitrary uptime goals to data-driven metrics, or implementing Site
  Reliability Engineering practices.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: intermediate
  language: multi
  tags: slo, sli, sla, error-budget, burn-rate
---

# 定 SLO/SLI/SLA

立可量可靠目標，以指標測之，理誤差預算。

## 用

- 定客端服務可靠目標
- 立供需雙方明約
- 以誤差預算衡功能速度+可靠
- 建事故嚴重度+應對客觀標準
- 由任意在線目標→數據驅動
- 行 SRE 之法
- 測並改品質

## 入

- **必**：服務述+關鍵用戶路徑
- **必**：歷史度量（請求率、時延、錯誤率）
- **可**：現存 SLA 承諾
- **可**：業務要求
- **可**：事故史+客影響

## 法

> 詳例見 [Extended Examples](references/EXAMPLES.md)。

### 一：識 SLI、SLO、SLA 層級

三者之別與繫。

**定義：**

```markdown
SLI (Service Level Indicator)
- **What**: A quantitative measure of service behavior
- **Example**: Request success rate, request latency, system throughput
- **Measurement**: `successful_requests / total_requests * 100`

SLO (Service Level Objective)
- **What**: Target value or range for an SLI over a time window
- **Example**: 99.9% of requests succeed in 30-day window
- **Purpose**: Internal reliability target to guide operations

SLA (Service Level Agreement)
- **What**: Contractual commitment with consequences for missing SLO
- **Example**: 99.9% uptime SLA with refunds if breached
- **Purpose**: External promise to customers with penalties
```

**層級：**
```
SLA (99.9% uptime, customer refunds)
  ├─ SLO (99.95% success rate, internal target)
  │   └─ SLI (actual measured: 99.97% success rate)
  └─ Error Budget (0.05% failures allowed per month)
```

**要：** SLO 當**嚴於** SLA，留緩衝於客受影前。

例：
- **SLA**：99.9% 可用（對客）
- **SLO**：99.95% 可用（內部）
- **緩衝**：0.05% 墊

**得：** 團識別。度量選為 SLI 一致。SLO 目標共識。

**敗：**
- 讀 Google SRE 書 SLI/SLO/SLA 章
- 辦相關者工坊齊定義
- 先簡成功率 SLI，後繁時延 SLO

### 二：擇 SLI

繫用戶體驗+業務影響。

**四金信號**（Google SRE）：

1. **時延**：服務請求時
   ```promql
   # P95 latency
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
   )
   ```

2. **流量**：系統需求
   ```promql
   # Requests per second
   sum(rate(http_requests_total[5m]))
   ```

3. **錯誤**：失敗率
   ```promql
   # Error rate percentage
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100
   ```

4. **飽和**：系統「滿」度
   ```promql
   # CPU saturation
   avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))
   ```

**常見 SLI 型：**

```yaml
# Availability SLI
availability:
  description: "Percentage of successful requests"
  query: |
    sum(rate(http_requests_total{status!~"5.."}[5m]))
    / sum(rate(http_requests_total[5m]))
  good_threshold: 0.999  # 99.9%

# Latency SLI
latency:
  description: "P99 request latency under 500ms"
  query: |
    histogram_quantile(0.99,
      sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
    ) < 0.5
  good_threshold: 0.95  # 95% of windows meet target

# Throughput SLI
throughput:
  description: "Requests processed per second"
  query: |
    sum(rate(http_requests_total[5m]))
  good_threshold: 1000  # Minimum 1000 req/s

# Data freshness SLI (for batch jobs)
freshness:
  description: "Data updated within last hour"
  query: |
    (time() - max(data_last_updated_timestamp)) < 3600
  good_threshold: 1  # Always fresh
```

**SLI 擇標：**
- **用戶可見**：繫實體驗
- **可量**：由現指標可量
- **可行**：團可工程改之
- **有義**：繫客滿意
- **簡**：易懂易釋

避：
- 內部指標（CPU、內存）用戶不見
- 虛榮指標
- 過繁復合分

**得：** 每服務選 2-4 SLI，至少含可用+時延。團一致於查詢。

**敗：**
- 繪用戶路徑識關鍵失敗點
- 析事故史：何指標預客影響？
- A/B 驗：劣化指標→測客訴
- 先簡可用 SLI，漸加繁

### 三：定 SLO 目標+窗

現實可達目標。

**SLO 規範格式：**

```yaml
service: user-api
slos:
  - name: availability
    objective: 99.9
    description: |
      99.9% of requests return non-5xx status codes
# ... (see EXAMPLES.md for complete configuration)
```

**時窗：**

- **30 日**（月）：典型外 SLA
- **7 日**（週）：工程反饋速
- **1 日**（日）：高頻服務需急應

30 日窗誤差預算例：
```
SLO: 99.9% availability over 30 days
Allowed failures: 0.1%
Total requests per month: 100M
Error budget: 100,000 failed requests
Daily budget: ~3,333 failed requests
```

**定現實目標：**

1. **基線現況：**
   ```promql
   # Check actual availability over past 90 days
   avg_over_time(
     (sum(rate(http_requests_total{status!~"5.."}[5m]))
     / sum(rate(http_requests_total[5m])))[90d:5m]
   )
   # Result: 99.95% → Set SLO at 99.9% (safer than current)
   ```

2. **計九成之價：**
   ```
   99%    → 7.2 hours downtime/month (low reliability)
   99.9%  → 43 minutes downtime/month (good)
   99.95% → 22 minutes downtime/month (very good)
   99.99% → 4.3 minutes downtime/month (expensive)
   99.999% → 26 seconds downtime/month (very expensive)
   ```

3. **衡用戶喜+工程價：**
   - 太嚴：昂，緩功能開發
   - 太鬆：差體驗，客流失
   - **最佳**：略優於期望

**得：** SLO 目標定，業務相關者贊同，錄理由，計誤差預算。

**敗：**
- 起於可達（若現 98.5%→目標 99%）
- 按實績每季調 SLO
- 獲高層支持現實目標抗「五九」
- 錄每加一九之價效析

### 四：以 Sloth 行 SLO 監

由 SLO 規範生 Prometheus 記錄規則+告警。

**裝 Sloth：**

```bash
# Binary installation
wget https://github.com/slok/sloth/releases/download/v0.11.0/sloth-linux-amd64
chmod +x sloth-linux-amd64
sudo mv sloth-linux-amd64 /usr/local/bin/sloth

# Or Docker
docker pull ghcr.io/slok/sloth:latest
```

**建 Sloth SLO 規範** (`slos/user-api.yml`)：

```yaml
version: "prometheus/v1"
service: "user-api"
labels:
  team: "platform"
  tier: "1"
slos:
# ... (see EXAMPLES.md for complete configuration)
```

**生 Prometheus 規則：**

```bash
# Generate recording and alerting rules
sloth generate -i slos/user-api.yml -o prometheus/rules/user-api-slo.yml

# Validate generated rules
promtool check rules prometheus/rules/user-api-slo.yml
```

**生記錄規則**（節錄）：

```yaml
groups:
  - name: sloth-slo-sli-recordings-user-api-requests-availability
    interval: 30s
    rules:
      # SLI: Ratio of good events
      - record: slo:sli_error:ratio_rate5m
# ... (see EXAMPLES.md for complete configuration)
```

**生告警：**

```yaml
groups:
  - name: sloth-slo-alerts-user-api-requests-availability
    rules:
      # Fast burn: 2% budget consumed in 1 hour
      - alert: UserAPIHighErrorRate
        expr: |
# ... (see EXAMPLES.md for complete configuration)
```

**載規則入 Prometheus：**

```yaml
# prometheus.yml
rule_files:
  - "rules/user-api-slo.yml"
```

重載：
```bash
curl -X POST http://localhost:9090/-/reload
```

**得：** Sloth 生多窗多燃率告警，記錄規則評估成，合成錯注入觸發告警。

**敗：**
- `yamllint slos/user-api.yml` 驗 YAML
- 查 Sloth 版本（v0.11+ 宜）
- 驗 Prometheus 記錄規則評估：`curl http://localhost:9090/api/v1/rules`
- 以合成錯注入測告警
- 查 Sloth 文檔 SLI 事件查詢格式

### 五：建誤差預算儀板

於 Grafana 見 SLO 遵守+預算耗用。

**Grafana 儀板 JSON**（節錄）：

```json
{
  "dashboard": {
    "title": "SLO Dashboard - User API",
    "panels": [
      {
        "type": "stat",
# ... (see EXAMPLES.md for complete configuration)
```

**要視指標：**
- SLO 目標 vs 現 SLI
- 預算餘（比例+絕值）
- 燃率（耗速）
- 歷史 SLI 趨勢（30 日滾窗）
- 耗盡時（若現率續）

**誤差預算政策儀板**（markdown 面板）：

```markdown
## Error Budget Policy

**Current Status**: 78% budget remaining

### If Error Budget > 50%
- ✅ Full speed ahead on new features
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 儀板示實時 SLO 遵守，預算耗用可見，團可據以決功能速度。

**敗：**
- 驗記錄規則存：`curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name | contains("slo:"))'`
- 查 Grafana 之 Prometheus 數據源 URL
- Explore 視圖驗查詢結果後加儀板
- 時範圍設合（如 30d 月 SLO）

### 六：立誤差預算政策

定組織級預算管理流程。

**政策模：**

```yaml
service: user-api
slo:
  availability: 99.9%
  latency_p99: 200ms
  window: 30 days

# ... (see EXAMPLES.md for complete configuration)
```

**自動政策執行：**

```python
# Example: Deployment gate script
import requests
import sys

def check_error_budget(service):
    # Query Prometheus for error budget
# ... (see EXAMPLES.md for complete configuration)
```

入 CI/CD：

```yaml
# .github/workflows/deploy.yml
jobs:
  check-error-budget:
    runs-on: ubuntu-latest
    steps:
      - name: Check SLO Error Budget
        run: |
          python scripts/check_error_budget.py user-api
      - name: Deploy
        if: success()
        run: |
          kubectl apply -f deploy/
```

**得：** 政策明錄，自動門防預算耗時險部署，團可靠優先一致。

**敗：**
- 起於手動政策（Slack 提醒）
- 漸自動化以軟門（警非阻）
- 硬門前獲高層贊同
- 每季審政策效，按需調閾

## 驗

- [ ] SLI 繫用戶體驗+業務影響
- [ ] SLO 目標獲相關者贊同，錄理由
- [ ] Prometheus 記錄規則成生 SLI 指標
- [ ] 多燃率告警配並合成錯驗
- [ ] Grafana 儀板示實時 SLO+預算
- [ ] 誤差預算政策錄並通團
- [ ] 自動門防預算耗時險部署
- [ ] 週/月 SLO 審會定
- [ ] 事故復盤含 SLO 影響析
- [ ] SLO 遵守報享相關者

## 忌

- **SLO 過嚴**：「五九」無價析→倦+緩速。起可達，漸升。
- **SLI 過多**：10+ 指標惑人。聚 2-4 關鍵用戶面。
- **SLO 無 SLA 緩衝**：SLO 等 SLA→無餘地。留 0.05-0.1% 緩衝。
- **忽略預算**：只跟蹤不行動→失義。執行政策。
- **虛榮指標為 SLI**：內部指標（CPU、內存）代用戶面（時延、錯）→錯置優先。
- **相關者不贊同**：純工程 SLO 無產品/業務贊同→衝突。獲高層。
- **SLO 僵化**：系統變而不審→每季按實績+客反饋重訪。

## 參

- `setup-prometheus-monitoring`
- `configure-alerting-rules`
- `build-grafana-dashboards`
- `write-incident-runbook`
