---
name: define-slo-sli-sla
locale: wenyan-lite
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

以服務等級目標立可量之信度標的，以指標測之，以錯誤預算管之。

## 適用時機

- 為面向客戶之服務或 API 定信度標的
- 於服務提供者與使用者之間立明確之期
- 以錯誤預算權衡特性速度與系統信度
- 為事故嚴重性與應對立客觀準則
- 自任意之可用率目標遷於數據驅動之信度指標
- 行 Site Reliability Engineering (SRE) 之法
- 隨時而量並改服務之品質

## 輸入

- **必需**：服務說明及關鍵用戶旅程
- **必需**：歷史指標數據（請求率、延遲、錯誤率）
- **可選**：對客戶現有之 SLA 承諾
- **可選**：業務對服務可用性與性能之要求
- **可選**：事故歷史與客戶影響數據

## 步驟

> 完整配置文件與模板，見 [Extended Examples](references/EXAMPLES.md)。


### 步驟一：明 SLI、SLO、SLA 之層次

學此三概念之關係與別。

**定義**：

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

**層次**：
```
SLA (99.9% uptime, customer refunds)
  ├─ SLO (99.95% success rate, internal target)
  │   └─ SLI (actual measured: 99.97% success rate)
  └─ Error Budget (0.05% failures allowed per month)
```

**要旨**：SLO 宜**嚴於** SLA，留餘地以避客戶受損。

例：
- **SLA**：99.9% 可用性（對客戶之承諾）
- **SLO**：99.95% 可用性（內部標的）
- **緩衝**：0.05% 之餘地，以防 SLA 破約

**預期：** 團隊明其別，同意何指標為 SLI，同意 SLO 標的。

**失敗時：**
- 讀 Google SRE 書中關於 SLI/SLO/SLA 之章
- 與相關人等開會以對齊定義
- 先以簡之成功率 SLI 始，後及複雜之延遲 SLO

### 步驟二：擇宜之 SLI

擇反映用戶體驗與業務影響之 SLI。

**四黃金信號**（Google SRE）：

1. **延遲**：應請求之時
   ```promql
   # P95 latency
   histogram_quantile(0.95,
     sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
   )
   ```

2. **流量**：系統之需求
   ```promql
   # Requests per second
   sum(rate(http_requests_total[5m]))
   ```

3. **錯誤**：失敗請求之率
   ```promql
   # Error rate percentage
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100
   ```

4. **飽和度**：系統「滿」之程度
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

**SLI 擇選之準**：
- **用戶可見**：反映實際用戶體驗
- **可量**：可由現有指標量之
- **可行**：團隊可透過工程改之
- **有義**：與客戶滿意度相關
- **簡明**：易於理解與說明

避之者：
- 用戶不見之內部系統指標（CPU、記憶體）
- 不能預測客戶影響之虛榮指標
- 過於複雜之複合分數

**預期：** 每服務擇 2-4 SLI，至少涵蓋可用性與延遲，團隊同意測量查詢。

**失敗時：**
- 描繪用戶旅程以識別關鍵失敗點
- 析事故歷史：何指標能預測客戶影響？
- 以 A/B 測試驗之 SLI：降級指標，量客戶投訴
- 始以簡之可用性 SLI，漸增其複雜

### 步驟三：定 SLO 標的與時窗

立實可達之信度標的。

**SLO 規格格式**：

```yaml
service: user-api
slos:
  - name: availability
    objective: 99.9
    description: |
      99.9% of requests return non-5xx status codes
# ... (see EXAMPLES.md for complete configuration)
```

**時窗之擇**：

常見之窗：
- **30 日**（月度）：外部 SLA 之典型
- **7 日**（週度）：工程團隊之快速反饋
- **1 日**（日度）：需速應之高頻服務

例 30 日窗之錯誤預算：
```
SLO: 99.9% availability over 30 days
Allowed failures: 0.1%
Total requests per month: 100M
Error budget: 100,000 failed requests
Daily budget: ~3,333 failed requests
```

**立實之標的**：

1. **當前性能之基線**：
   ```promql
   # Check actual availability over past 90 days
   avg_over_time(
     (sum(rate(http_requests_total{status!~"5.."}[5m]))
     / sum(rate(http_requests_total[5m])))[90d:5m]
   )
   # Result: 99.95% → Set SLO at 99.9% (safer than current)
   ```

2. **計九之代價**：
   ```
   99%    → 7.2 hours downtime/month (low reliability)
   99.9%  → 43 minutes downtime/month (good)
   99.95% → 22 minutes downtime/month (very good)
   99.99% → 4.3 minutes downtime/month (expensive)
   99.999% → 26 seconds downtime/month (very expensive)
   ```

3. **權衡用戶滿意與工程代價**：
   - 過嚴：貴，阻礙特性開發
   - 過寬：體驗差，客戶流失
   - **最佳點**：略優於用戶之期

**預期：** SLO 標的得業務相關人支持，載明理由，算出錯誤預算。

**失敗時：**
- 始以可達之標的（如當前 98.5%，則定 99%）
- 每季依實際性能迭代 SLO 標的
- 為實之標的爭取高層支持，而非「五九」之求
- 為每增一九載明成本效益分析

### 步驟四：以 Sloth 行 SLO 監控

用 Sloth 從 SLO 規格生 Prometheus 錄制規則與告警。

**裝 Sloth**：

```bash
# Binary installation
wget https://github.com/slok/sloth/releases/download/v0.11.0/sloth-linux-amd64
chmod +x sloth-linux-amd64
sudo mv sloth-linux-amd64 /usr/local/bin/sloth

# Or Docker
docker pull ghcr.io/slok/sloth:latest
```

**建 Sloth SLO 規格**（`slos/user-api.yml`）：

```yaml
version: "prometheus/v1"
service: "user-api"
labels:
  team: "platform"
  tier: "1"
slos:
# ... (see EXAMPLES.md for complete configuration)
```

**生 Prometheus 規則**：

```bash
# Generate recording and alerting rules
sloth generate -i slos/user-api.yml -o prometheus/rules/user-api-slo.yml

# Validate generated rules
promtool check rules prometheus/rules/user-api-slo.yml
```

**所生之錄制規則**（節選）：

```yaml
groups:
  - name: sloth-slo-sli-recordings-user-api-requests-availability
    interval: 30s
    rules:
      # SLI: Ratio of good events
      - record: slo:sli_error:ratio_rate5m
# ... (see EXAMPLES.md for complete configuration)
```

**所生之告警**：

```yaml
groups:
  - name: sloth-slo-alerts-user-api-requests-availability
    rules:
      # Fast burn: 2% budget consumed in 1 hour
      - alert: UserAPIHighErrorRate
        expr: |
# ... (see EXAMPLES.md for complete configuration)
```

**載規則入 Prometheus**：

```yaml
# prometheus.yml
rule_files:
  - "rules/user-api-slo.yml"
```

重載 Prometheus：
```bash
curl -X POST http://localhost:9090/-/reload
```

**預期：** Sloth 生多窗多燃率告警，錄制規則評估成功，告警於事故時適時觸發。

**失敗時：**
- 以 `yamllint slos/user-api.yml` 驗 YAML 語法
- 檢 Sloth 版本相容性（建議 v0.11+）
- 驗 Prometheus 錄制規則評估：`curl http://localhost:9090/api/v1/rules`
- 以合成錯誤注入測告警
- 查 Sloth 文檔知 SLI 事件查詢格式

### 步驟五：建錯誤預算儀表板

於 Grafana 視覺化 SLO 合規與錯誤預算消耗。

**Grafana 儀表板 JSON**（節選）：

```json
{
  "dashboard": {
    "title": "SLO Dashboard - User API",
    "panels": [
      {
        "type": "stat",
# ... (see EXAMPLES.md for complete configuration)
```

**宜視覺化之關鍵指標**：
- SLO 標的 vs 當前 SLI
- 剩餘之錯誤預算（百分比與絕對值）
- 燃率（預算消耗之速）
- SLI 之歷史趨勢（30 日滾動窗）
- 若當前燃率續，至枯竭之時

**錯誤預算政策儀表板**（markdown 面板）：

```markdown
## Error Budget Policy

**Current Status**: 78% budget remaining

### If Error Budget > 50%
- ✅ Full speed ahead on new features
# ... (see EXAMPLES.md for complete configuration)
```

**預期：** 儀表板示實時 SLO 合規，錯誤預算消耗可見，團隊可為特性速度作明智之決。

**失敗時：**
- 驗錄制規則存：`curl http://localhost:9090/api/v1/rules | jq '.data.groups[].rules[] | select(.name | contains("slo:"))'`
- 檢 Grafana 中 Prometheus 資料源之 URL
- 於 Explore 視圖驗查詢結果，後加入儀表板
- 保時間範圍設為合適窗（如月度 SLO 用 30d）

### 步驟六：立錯誤預算政策

為管理錯誤預算立組織流程。

**錯誤預算政策模板**：

```yaml
service: user-api
slo:
  availability: 99.9%
  latency_p99: 200ms
  window: 30 days

# ... (see EXAMPLES.md for complete configuration)
```

**政策自動執行**：

```python
# Example: Deployment gate script
import requests
import sys

def check_error_budget(service):
    # Query Prometheus for error budget
# ... (see EXAMPLES.md for complete configuration)
```

整合入 CI/CD 管線：

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

**預期：** 政策明載，自動閘阻止預算枯竭時之險部署，團隊於信度優先級對齊。

**失敗時：**
- 始以人工政策執行（Slack 提醒）
- 漸以軟閘自動化（警告，非阻擋）
- 硬閘（阻部署）前須得高層支持
- 每季檢視政策效能，依需調閾值

## 驗證

- [ ] 所擇之 SLI 反映用戶體驗與業務影響
- [ ] SLO 標的得相關人同意，載明理由
- [ ] Prometheus 錄制規則成功生 SLI 指標
- [ ] 多燃率告警已配置並以合成錯誤測之
- [ ] Grafana 儀表板示實時 SLO 合規與錯誤預算
- [ ] 錯誤預算政策載明並告知團隊
- [ ] 自動閘阻止預算枯竭時之險部署
- [ ] 已排週/月度 SLO 回顧會議
- [ ] 事故回顧含 SLO 影響分析
- [ ] SLO 合規報告與相關人分享

## 常見陷阱

- **SLO 過嚴**：無成本分析而定「五九」致倦怠與特性速度減緩。宜始以可達者，漸增之。
- **SLI 過多**：追 10+ 指標致混亂。宜專注 2-4 關鍵之用戶可見指標。
- **SLO 無 SLA 緩衝**：SLO 等於 SLA 則無餘地避客戶受損。宜留 0.05-0.1% 之緩衝。
- **忽錯誤預算**：追 SLO 而不因預算枯竭而行則失義。宜行錯誤預算政策。
- **以虛榮指標為 SLI**：用內部指標（CPU、記憶體）而非用戶可見指標（延遲、錯誤）致優先級偏。
- **相關人無支持**：無產品/業務同意之工程 SLO 致衝突。宜得高層支持。
- **SLO 靜止**：不隨系統演進而檢視調整。宜每季依實績與用戶反饋重議。

## 相關技能

- `setup-prometheus-monitoring` - 配 Prometheus 收指標以算 SLI
- `configure-alerting-rules` - 整合 SLO 燃率告警入 Alertmanager 以通知值班
- `build-grafana-dashboards` - 視覺化 SLO 合規與錯誤預算消耗
- `write-incident-runbook` - 於運行手冊中含 SLO 影響以優先處理事故
