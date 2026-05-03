---
name: write-incident-runbook
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Create structured incident runbooks with diagnostic steps, resolution procedures, escalation
  paths, and communication templates for effective incident response. Use when documenting
  response procedures for recurring alerts, standardizing incident response across an on-call
  rotation, reducing MTTR with clear diagnostic steps, creating training materials for new
  team members, or linking alert annotations directly to resolution procedures.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: observability
  complexity: basic
  language: multi
  tags: runbook, incident-response, diagnostics, escalation, documentation
---

# 書事故行冊

立可行行冊以引應者過診與解。

## 用

- 錄復警或事故之應程→用
- 標 on-call 輪事故應→用
- 以清診步減 MTTR→用
- 為新員建事故應訓→用
- 立升路與通協→用
- 移部落知於書文→用
- 警鏈解程（警註）→用

## 入

- **必**：事故或警名/述
- **必**：歷事故數與解式
- **可**：診詢（Prometheus、日、跡）
- **可**：升聯與通道
- **可**：前事故覆盤

## 行

### 一：擇行冊模構

> 全模檔見 [Extended Examples](references/EXAMPLES.md#step-1-runbook-template-examples)。

按事故型與複擇模。

**基行冊模構**：
```markdown
# [Alert/Incident Name] Runbook
## Overview | Severity | Symptoms
## Diagnostic Steps | Resolution Steps
## Escalation | Communication | Prevention | Related
```

**進 SRE 行冊模**（節）：
```markdown
# [Service Name] - [Incident Type] Runbook

## Metadata
- Service, Owner, Severity, On-Call, Last Updated

## Diagnostic Phase
### Quick Health Check (< 5 min): Dashboard, error rate, deployments
### Detailed Investigation (5-20 min): Metrics, logs, traces, failure patterns
# ... (see EXAMPLES.md for complete template)
```

關模件：
- **元**：服屬、嚴、輪
- **診階**：速察→詳究→敗式
- **解階**：即減→根修→驗
- **升**：標與聯路
- **通**：內外模
- **防**：短長期行

得：擇模合事故複，節宜服型。

敗：
- 由基模始、按事故式迭
- 察業例（Google SRE 書、商行冊）
- 首用後按團饋改模

### 二：錄診程

> 全診詢與決樹見 [Extended Examples](references/EXAMPLES.md#step-2-complete-diagnostic-procedures)。

立步步究程附特詢。

**六步診清單**：

1. **驗服健**：健端察與運時度
   ```bash
   curl -I https://api.example.com/health  # Expected: HTTP 200 OK
   ```
   ```promql
   up{job="api-service"}  # Expected: 1 for all instances
   ```

2. **察誤率**：今誤百與按端分
   ```promql
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100  # Expected: < 1%
   ```

3. **析日**：近誤與 Loki 頂誤訊
   ```logql
   {job="api-service"} |= "error" | json | level="error"
   ```

4. **察資用**：CPU、記、連池
   ```promql
   avg(rate(container_cpu_usage_seconds_total{pod=~"api-service.*"}[5m])) * 100
   # Expected: < 70%
   ```

5. **審近變**：部署、git 提、設變

6. **察依**：下游服健、庫/API 延

**敗式決樹**（節）：
- 服死乎？→察諸 pod/實
- 誤率升乎？→察特誤型（5xx、閘、庫、超時）
- 何始？→部署後（還）、漸（資漏）、驟（流/依）

得：診程具體、含期 vs 實值、引應者究。

敗：
- 錄前於實察系試詢
- 含表板影為視參
- 加「常誤」節為常漏步
- 按應者饋迭

### 三：定解程

> 五解選之全命與還程見 [Extended Examples](references/EXAMPLES.md#step-3-complete-resolution-procedures)。

錄步步補與還選。

**五解選**（簡摘）：

1. **還部署**（最速）：部署後誤
   ```bash
   kubectl rollout undo deployment/api-service
   ```
   驗→察→確解（誤率 < 1%、延正、無警）

2. **擴資**：CPU/記高、連池竭
   ```bash
   kubectl scale deployment/api-service --replicas=$((current * 3/2))
   ```

3. **重啟服**：記漏、連黏、緩污
   ```bash
   kubectl rollout restart deployment/api-service
   ```

4. **特旗/斷器**：特能誤或外依敗
   ```bash
   kubectl set env deployment/api-service FEATURE_NAME=false
   ```

5. **庫補**：庫連、慢詢、池竭
   ```sql
   -- Kill long-running queries, restart connection pool, increase pool size
   ```

**通驗清單**：
- [ ] 誤率 < 1%
- [ ] 延 P99 < 閾
- [ ] 量於基線
- [ ] 資用健（CPU < 70%、Memory < 80%）
- [ ] 依健
- [ ] 用面試過
- [ ] 無活警

**還程**：解惡況→暫/取→還→重評

得：解步清、含驗察、各行附還選。

敗：
- 為複程加更細步
- 含表或圖為多步流
- 錄命出（期 vs 實）
- 為複解程建別行冊

### 四：立升路

> 全升級與聯目模見 [Extended Examples](references/EXAMPLES.md#step-4-complete-escalation-guidelines)。

定何時何升事故。

**即升時**：
- 用面斷 > 15 分
- SLO 誤算 > 10% 耗
- 數失/壞或安洩疑
- 20 分內不能辨根因
- 補敗或惡況

**五升級**：
1. **首 On-Call**（5 分應）：施修、還、擴（單獨至 30 分）
2. **次 On-Call**（15 分後自動）：增究支
3. **團頭**（構決）：庫變、商升、事故 > 1 時
4. **事故指**（跨團協）：多團、用通、事故 > 2 時
5. **執**（C 級）：大影（>50% 用）、SLA 違、媒/PR、斷 > 4 時

**升程**：
1. 通標附：今態、影、已行、需助、表板鏈
2. 須交：分時、行、權、留候
3. 勿默：每 15 分更、問、饋

**聯目**：附角、Slack、電、PagerDuty 表予：
- 平/庫/安/網團
- 事故指
- 外商（AWS、庫商、CDN 商）

得：升標清、聯易得、升路合機構構。

敗：
- 驗聯為今（季試）
- 加升決樹
- 含升訊例
- 錄各級應時期

### 五：建通模

> 全內外模附全式見 [Extended Examples](references/EXAMPLES.md#step-5-complete-communication-templates)。

予預書訊為事故更。

**內模**（Slack #incident-response）：

1. **初告**：
   ```
   🚨 INCIDENT: [Title] | Severity: [Critical/High/Medium]
   Impact: [users/services] | Owner: @username | Dashboard: [link]
   Quick Summary: [1-2 sentences] | Next update: 15 min
   ```

2. **進更**（每 15-30 分）：
   ```
   📊 UPDATE #N | Status: [Investigating/Mitigating/Monitoring]
   Actions: [what we tried and outcomes]
   Theory: [what we think is happening]
   Next: [planned actions]
   ```

3. **減畢**：
   ```
   ✅ MITIGATION | Metrics: Error [before→after], Latency [before→after]
   Root Cause: [brief or "investigating"] | Monitoring 30min before resolved
   ```

4. **解**：
   ```
   🎉 RESOLVED | Duration: [time] | Root Cause + Impact + Follow-up actions
   ```

5. **偽警**：無影、無隨

**外模**（態頁）：
- **初**：究中、始時、15 分內次更
- **進**：因辨（用友）、施修、估解
- **解**：解時、根因（簡）、時、防措

**用信模**：時線、影述、解、防、補（若應）

得：模省事故時、確一通、減應者認負。

敗：
- 客化模合公司通格
- 預填常事故型
- 建 Slack 流/機為自動填模
- 事故覆盤審模

### 六：行冊鏈察

> 全 Prometheus 警設與 Grafana 表板 JSON 見 [Extended Examples](references/EXAMPLES.md#step-6-alert-integration-examples)。

整行冊於警與表板。

**Prometheus 警加行冊鏈**：
```yaml
- alert: HighErrorRate
  annotations:
    runbook_url: "https://wiki.example.com/runbooks/high-error-rate"
    dashboard_url: "https://grafana.example.com/d/service-overview"
    incident_channel: "#incident-platform"
```

**行冊嵌速診鏈**：
- 服覽表板
- 末 1 時誤率（Prometheus 直鏈）
- 近誤日（Loki/Grafana Explore）
- 近部署（GitHub/CI）
- PagerDuty 事故

**建 Grafana 表板面**附行冊鏈（markdown 面列諸事故行冊附 on-call 與升信）

得：應者可由警或表板直訪行冊、診詢預填、一擊訪關工。

敗：
- 驗行冊 URL 無 VPN/登入可訪
- 為複 Grafana/Prometheus 鏈用 URL 縮
- 季試鏈確不破
- 為常用行冊建瀏書籤

## 驗

- [ ] 行冊從一致模構
- [ ] 診程含特詢與期值
- [ ] 解步可行附清命
- [ ] 升標與聯為今
- [ ] 通模予內外受
- [ ] 行冊由察警與表板鏈
- [ ] 行冊於事故模或實事故試
- [ ] 應者饋納行冊
- [ ] 修史跡附日與作者
- [ ] 行冊無認可訪（或暫存離線）

## 忌

- **過泛**：行冊含泛步如「察日」無特詢→不可行。具體
- **舊信**：行冊參舊系或命→廢。季審
- **無驗步**：解無驗致偽過。恆含「如何確修」
- **缺還程**：每行應有還計。勿陷應者於更劣態
- **假知**：僅專之行冊排新工。為輪中最少經之人書
- **無屬**：無主之行冊舊。派團/人責更
- **匿認後**：VPN/SSO 疾時不可訪之行冊危時無用。暫複或用公 wiki

## 參

- `configure-alerting-rules` - 鏈行冊於警註以事故時即訪
- `build-grafana-dashboards` - 嵌行冊鏈於表板與診面
- `setup-prometheus-monitoring` - 行冊程中含 Prometheus 詢
- `define-slo-sli-sla` - 事故嚴分中參 SLO 影
