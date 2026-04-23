---
name: define-slo-sli-sla
locale: wenyan
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

以 SLO 立可測之信賴標的，以 SLI 察之，以錯額管之。

## 用時

- 為面客之服或 API 定信賴標的
- 立供者與用者之明約
- 以錯額衡新功之速與系統之穩
- 為事故輕重立客觀之則
- 由妄定之在線標的移至據數之信賴量度
- 行 SRE 之道
- 久而量之，改服之質

## 入

- **必要**：服之述與關鍵用者歷程
- **必要**：往昔量度（請求率、延時、錯率）
- **可選**：已許客之 SLA
- **可選**：業之可用與性能所求
- **可選**：事故史與客受影之數

## 法

> 詳見 [Extended Examples](references/EXAMPLES.md) 全備之配置模板。


### 第一步：明 SLI、SLO、SLA 之次第

察此三者之別與所連。

**義**：

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

**次第**：
```
SLA (99.9% uptime, customer refunds)
  ├─ SLO (99.95% success rate, internal target)
  │   └─ SLI (actual measured: 99.97% success rate)
  └─ Error Budget (0.05% failures allowed per month)
```

**要**：SLO 宜**嚴於** SLA，以作客受影之前之緩衝。

舉例：
- **SLA**：99.9% 可用（許客者）
- **SLO**：99.95% 可用（內標）
- **緩衝**：0.05% 至 SLA 破之前

**得：** 組員明其別，約哪些度為 SLI，同定 SLO 之標。

**敗則：**
- 重讀 Google SRE 書論 SLI/SLO/SLA 之章
- 集關者開會以同其義
- 由簡之成功率 SLI 始，延時 SLO 後議

### 第二步：擇適之 SLI

擇反映用者體驗與業之衝擊者。

**四黃金信號**（Google SRE）：

1. **延時**：服一請求所費之時
   ```promql
   # P95 latency
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
   )
   ```

2. **流量**：系統所受之需
   ```promql
   # Requests per second
   sum(rate(http_requests_total[5m]))
   ```

3. **錯**：敗之率
   ```promql
   # Error rate percentage
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100
   ```

4. **飽和**：系統已盈幾何
   ```promql
   # CPU saturation
   avg(rate(node_cpu_seconds_total{mode!="idle"}[5m]))
   ```

**常見 SLI 模式**：

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

**SLI 擇之則**：
- **用者可見**：反映真實體驗
- **可量**：可由既有度計之
- **可為**：團隊可以工程之力改之
- **有意**：與客戶滿意相關
- **簡單**：易懂易釋

宜避者：
- 用者不見之內部度（CPU、內存）
- 虛榮之度，不預示客受影者
- 過繁之複合分

**得：** 每服擇 2-4 SLI，最少含可用與延時；團隊同意其度查語。

**敗則：**
- 繪用者歷程以識關鍵敗點
- 析事故史：何度預示客受影？
- 以 A/B 驗 SLI：劣其度，量客之怨
- 由簡之可用 SLI 始，漸加繁

### 第三步：立 SLO 標與時窗

定實際可達之信賴標。

**SLO 規格式**：

```yaml
service: user-api
slos:
  - name: availability
    objective: 99.9
    description: |
      99.9% of requests return non-5xx status codes
# ... (see EXAMPLES.md for complete configuration)
```

**擇時窗**：

常見者：
- **三十日**（月）：典外部 SLA
- **七日**（週）：工程團之速反饋
- **一日**（日）：高頻服需速應

三十日窗錯額例：
```
SLO: 99.9% availability over 30 days
Allowed failures: 0.1%
Total requests per month: 100M
Error budget: 100,000 failed requests
Daily budget: ~3,333 failed requests
```

**立實際之標**：

1. **基於當前之表現**：
   ```promql
   # Check actual availability over past 90 days
   avg_over_time(
     (sum(rate(http_requests_total{status!~"5.."}[5m]))
     / sum(rate(http_requests_total[5m])))[90d:5m]
   )
   # Result: 99.95% → Set SLO at 99.9% (safer than current)
   ```

2. **算九之價**：
   ```
   99%    → 7.2 hours downtime/month (low reliability)
   99.9%  → 43 minutes downtime/month (good)
   99.95% → 22 minutes downtime/month (very good)
   99.99% → 4.3 minutes downtime/month (expensive)
   99.999% → 26 seconds downtime/month (very expensive)
   ```

3. **衡用者之樂與工程之費**：
   - 過嚴：費大，緩新功
   - 過鬆：用者體驗劣，客散
   - **甘處**：略優於用者之期

**得：** SLO 標經業關者同意而立，有由有據，錯額已算。

**敗則：**
- 由可達之標始（如當前 98.5%，定 99%）
- 依實際表現每季調 SLO
- 求高層支持實際之標，非「五九」之妄求
- 記每加一九之成本效益析

### 第四步：以 Sloth 行 SLO 監

以 Sloth 由 SLO 規生 Prometheus 記錄律與警。

**裝 Sloth**：

```bash
# Binary installation
wget https://github.com/slok/sloth/releases/download/v0.11.0/sloth-linux-amd64
chmod +x sloth-linux-amd64
sudo mv sloth-linux-amd64 /usr/local/bin/sloth

# Or Docker
docker pull ghcr.io/slok/sloth:latest
```

**建 Sloth SLO 規**（`slos/user-api.yml`）：

```yaml
version: "prometheus/v1"
service: "user-api"
labels:
  team: "platform"
  tier: "1"
slos:
# ... (see EXAMPLES.md for complete configuration)
```

**生 Prometheus 律**：

```bash
# Generate recording and alerting rules
sloth generate -i slos/user-api.yml -o prometheus/rules/user-api-slo.yml

# Validate generated rules
promtool check rules prometheus/rules/user-api-slo.yml
```

**所生之記錄律**（節錄）：

```yaml
groups:
  - name: sloth-slo-sli-recordings-user-api-requests-availability
    interval: 30s
    rules:
      # SLI: Ratio of good events
      - record: slo:sli_error:ratio_rate5m
# ... (see EXAMPLES.md for complete configuration)
```

**所生之警**：

```yaml
groups:
  - name: sloth-slo-alerts-user-api-requests-availability
    rules:
      # Fast burn: 2% budget consumed in 1 hour
      - alert: UserAPIHighErrorRate
        expr: |
# ... (see EXAMPLES.md for complete configuration)
```

**載律入 Prometheus**：

```yaml
# prometheus.yml
rule_files:
  - "rules/user-api-slo.yml"
```

重載 Prometheus：
```bash
curl -X POST http://localhost:9090/-/reload
```

**得：** Sloth 生多窗多燒率警，記錄律成評，事故時警適發。

**敗則：**
- 以 `yamllint slos/user-api.yml` 驗 YAML 法
- 察 Sloth 版（v0.11+ 宜）
- 驗 Prometheus 記錄律評：`curl http://localhost:9090/api/v1/rules`
- 以人造錯注測警
- 察 Sloth 文檔之 SLI 事件查語

### 第五步：建錯額儀表盤

於 Grafana 可視化 SLO 合規與錯額耗。

**Grafana 儀表盤 JSON**（節錄）：

```json
{
  "dashboard": {
    "title": "SLO Dashboard - User API",
    "panels": [
      {
        "type": "stat",
# ... (see EXAMPLES.md for complete configuration)
```

**宜視之要度**：
- SLO 標與當前 SLI
- 錯額餘（百分比與絕對）
- 燒率（額耗之速）
- 歷史 SLI 趨勢（三十日滾動窗）
- 至盡之時（若當前燒率續）

**錯額政策盤**（markdown 板）：

```markdown
## Error Budget Policy

**Current Status**: 78% budget remaining

### If Error Budget > 50%
- ✅ Full speed ahead on new features
# ... (see EXAMPLES.md for complete configuration)
```

**得：** 儀表盤示實時 SLO 合規，錯額耗可見，團隊可明斷新功之速。

**敗則：**
- 驗記錄律存：`curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name | contains("slo:"))'`
- 察 Grafana 中 Prometheus 數據源 URL 是否正
- 於 Explore 視圖驗查果後再入儀表盤
- 確時域合宜（如月 SLO 用 30d）

### 第六步：立錯額政策

定組織管錯額之程。

**錯額政策模板**：

```yaml
service: user-api
slo:
  availability: 99.9%
  latency_p99: 200ms
  window: 30 days

# ... (see EXAMPLES.md for complete configuration)
```

**自動執政**：

```python
# Example: Deployment gate script
import requests
import sys

def check_error_budget(service):
    # Query Prometheus for error budget
# ... (see EXAMPLES.md for complete configuration)
```

合入 CI/CD 流程：

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

**得：** 政策已記明，自動閘阻額耗時之險部署，團隊同其信賴之要。

**敗則：**
- 由人工行政始（Slack 提）
- 漸自動以軟閘（警而不阻）
- 硬閘（阻部署）前求高層之許
- 每季察政策之效，調閾。

## 驗

- [ ] SLI 所擇反映用者體驗與業之衝擊
- [ ] SLO 標經關者同意立，有由有據
- [ ] Prometheus 記錄律成生 SLI 度
- [ ] 多燒率警已配且以人造錯驗
- [ ] Grafana 儀表盤示實時 SLO 合規與錯額
- [ ] 錯額政策已記並告團隊
- [ ] 自動閘阻額耗時之險部署
- [ ] 週月 SLO 察會已定
- [ ] 事故回顧含 SLO 衝擊析
- [ ] SLO 合規報告告關者

## 陷

- **過嚴之 SLO**：無費析定「五九」致疲與緩功。由可達始，漸進。
- **SLI 過多**：察 10+ 度成惑。聚焦 2-4 關鍵面客之度。
- **SLO 無 SLA 緩衝**：SLO 等 SLA 則客受影前無餘地。留 0.05-0.1% 緩衝。
- **忽錯額**：察 SLO 而不作額耗之應敗其意。行錯額政策。
- **以虛榮度為 SLI**：用內部度（CPU、內存）而非用者可見度（延時、錯）偏其要。
- **無關者同意**：唯工程之 SLO 而無產品業之同致衝突。求高層之支持。
- **靜止之 SLO**：系統變而從不察調標。每季依實際表現與用者回饋重議。

## Related Skills

- `setup-prometheus-monitoring` - 配 Prometheus 以集度供 SLI 算
- `configure-alerting-rules` - 合 SLO 燒率警入 Alertmanager 供值班告
- `build-grafana-dashboards` - 視 SLO 合規與錯額耗
- `write-incident-runbook` - 於運行手冊含 SLO 衝擊以定事故應之先
