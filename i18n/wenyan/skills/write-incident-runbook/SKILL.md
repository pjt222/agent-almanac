---
name: write-incident-runbook
locale: wenyan
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

立可行之冊，導應者過事故診與解。

## 用時

- 錄常警或事故之應程
- 統一輪值間之事故應
- 以明診步減平均解時（MTTR）
- 為新員立事故處之訓材
- 立升路與通協
- 移群知於書文
- 連警於解程（警注）

## 入

- **必要**：事故或警之名/述
- **必要**：歷事故數與解模
- **可選**：診查（Prometheus、記、跡）
- **可選**：升聯與通道
- **可選**：前事後檢

## 法

### 第一步：擇行冊模

> 見 [Extended Examples](references/EXAMPLES.md#step-1-runbook-template-examples) 為全模文。

依事故類與複擇宜模。

**基行冊模結構**：
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

模之要件：
- **元**：服之屬、嚴重、輪值
- **診階**：速察 → 詳查 → 敗模
- **解階**：即緩 → 根修 → 驗
- **升**：準與聯路
- **通**：內/外模
- **防**：短/長行

得：擇之模配事故複，段宜服類。

敗則：
- 自基模始，依事故模迭
- 察行例（Google SRE 書、廠行冊）
- 用後依員饋調模

### 第二步：錄診程

> 見 [Extended Examples](references/EXAMPLES.md#step-2-complete-diagnostic-procedures) 為全診查與決樹。

立逐步查程附特查。

**六步診清**：

1. **驗服健**：健端察與在線指
   ```bash
   curl -I https://api.example.com/health  # Expected: HTTP 200 OK
   ```
   ```promql
   up{job="api-service"}  # Expected: 1 for all instances
   ```

2. **察訛率**：當前訛百分與依端分
   ```promql
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100  # Expected: < 1%
   ```

3. **析記**：近訛與最常訛辭自 Loki
   ```logql
   {job="api-service"} |= "error" | json | level="error"
   ```

4. **察資用**：CPU、記、連池
   ```promql
   avg(rate(container_cpu_usage_seconds_total{pod=~"api-service.*"}[5m])) * 100
   # Expected: < 70%
   ```

5. **覽近變**：部、git 提、基設變

6. **察依**：下游服健、庫/API 延

**敗模決樹**（節）：
- 服敗乎？→ 察諸 pod/實例
- 訛率升乎？→ 察特訛類（5xx、閘道、庫、超時）
- 何時始？→ 部後（回滾）、漸（資漏）、驟（流/依）

得：診程具，含期對實值，導應者過查。

敗則：
- 錄前於實監系試查
- 含面板圖以視參
- 加常忽步之「常誤」段
- 依事故應者饋迭

### 第三步：定解程

> 見 [Extended Examples](references/EXAMPLES.md#step-3-complete-resolution-procedures) 為全五解選含全命與回滾程。

錄逐步修附回滾選。

**五解選**（簡摘）：

1. **回滾部**（最速）：部後訛
   ```bash
   kubectl rollout undo deployment/api-service
   ```
   驗 → 監 → 確解（訛率 < 1%、延正、無警）

2. **擴資**：高 CPU/記、連池竭
   ```bash
   kubectl scale deployment/api-service --replicas=$((current * 3/2))
   ```

3. **重啟服**：記漏、卡連、緩污
   ```bash
   kubectl rollout restart deployment/api-service
   ```

4. **特旗/斷路**：特功訛或外依敗
   ```bash
   kubectl set env deployment/api-service FEATURE_NAME=false
   ```

5. **庫修**：庫連、慢查、池竭
   ```sql
   -- Kill long-running queries, restart connection pool, increase pool size
   ```

**通驗清**：
- [ ] 訛率 < 1%
- [ ] 延 P99 < 閾
- [ ] 流量於基線
- [ ] 資用健（CPU < 70%、記 < 80%）
- [ ] 依健
- [ ] 用面試過
- [ ] 無活警

**回滾程**：解惡狀者 → 暫/取 → 反 → 重評

得：解步明、含驗察、為每行供回滾選。

敗則：
- 為複程加更細步
- 含面板或圖為多步流
- 錄命出（期對實）
- 為複解程立別行冊

### 第四步：立升路

> 見 [Extended Examples](references/EXAMPLES.md#step-4-complete-escalation-guidelines) 為全升層與聯目模。

定何時何升事故。

**即升之時**：
- 顧客向斷 > 15 分
- SLO 訛預 > 10% 耗
- 數失/污或安破疑
- 20 分內不能識根因
- 緩之嘗敗或惡狀

**五升層**：
1. **主值**（5 分應）：部修、回滾、擴（獨至 30 分）
2. **副值**（15 分後自）：增查支
3. **隊領**（架決）：庫變、廠升、事故 > 1 時
4. **事故指揮**（跨隊合）：多隊、客通、事故 > 2 時
5. **executive**（C 級）：大影（>50% 用戶）、SLA 破、媒/PR、斷 > 4 時

**升程**：
1. 通標附：當前狀、影、所行、所需助、面板鏈
2. 需者交：分時、行、權，續可得
3. 勿默：每 15 分更、問、饋

**聯目**：守表含角、Slack、電、PagerDuty 為：
- Platform/Database/Security/Network 隊
- 事故指揮
- 外廠（AWS、庫廠、CDN 供）

得：升準明、聯信易得、升路合組結構。

敗則：
- 驗聯信當前（每季試）
- 加決樹為何時升
- 含升辭之例
- 錄各層應時期

### 第五步：立通模

> 見 [Extended Examples](references/EXAMPLES.md#step-5-complete-communication-templates) 為全內與外模含全格。

供事故更之預書辭。

**內模**（Slack #incident-response）：

1. **初宣**：
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

3. **緩畢**：
   ```
   ✅ MITIGATION | Metrics: Error [before→after], Latency [before→after]
   Root Cause: [brief or "investigating"] | Monitoring 30min before resolved
   ```

4. **解**：
   ```
   🎉 RESOLVED | Duration: [time] | Root Cause + Impact + Follow-up actions
   ```

5. **假警**：無影、無續行

**外模**（狀頁）：
- **初**：查中、始時、15 分內次更
- **進**：因已識（客向）、修中、估解
- **解**：解時、根因（簡）、時長、防

**客郵模**：時序、影述、解、防、補（若用）

得：模於事故時省時、保通一致、減應者認知擔。

敗則：
- 模配公司通風
- 為常事故類預填模
- 立 Slack 流/bot 自填模
- 事故回顧時察模

### 第六步：連行冊於監

> 見 [Extended Examples](references/EXAMPLES.md#step-6-alert-integration-examples) 為全 Prometheus 警設與 Grafana 面板 JSON。

整行冊於警與面板。

**加行冊鏈於 Prometheus 警**：
```yaml
- alert: HighErrorRate
  annotations:
    runbook_url: "https://wiki.example.com/runbooks/high-error-rate"
    dashboard_url: "https://grafana.example.com/d/service-overview"
    incident_channel: "#incident-platform"
```

**嵌速診鏈於行冊**：
- 服覽面板
- 訛率最後 1 時（Prometheus 直鏈）
- 近訛記（Loki/Grafana Explore）
- 近部（GitHub/CI）
- PagerDuty 事故

**立 Grafana 面板含行冊鏈**（markdown 板列諸事故行冊附值與升信）

得：應者可自警或面板直入行冊，診查預填，一擊入相關具。

敗則：
- 驗行冊 URL 無 VPN/登入可達
- 用 URL 縮為複 Grafana/Prometheus 鏈
- 每季試鏈以確不斷
- 立常用行冊之瀏書籤

## 驗

- [ ] 行冊依一致模結構
- [ ] 診程含具查與期值
- [ ] 解步可行附明命
- [ ] 升準與聯當前
- [ ] 內與外通模已供
- [ ] 行冊自監警與面板連
- [ ] 行冊於事故模或實事故中已試
- [ ] 應者饋已入行冊
- [ ] 修史含日與作者已追
- [ ] 行冊無證可達（或離線快取）

## 陷

- **過泛**：行冊步糊如「察記」而無具查者非可行。具之
- **陳信**：行冊引舊系或命無用。每季察
- **無驗步**：解無驗致假正。常含「如何確已修」
- **缺回滾程**：每行宜有回滾計。勿陷應者於更劣
- **假知**：唯為家之行冊排新工。為輪中最少經者書
- **無屬**：無屬之行冊陳。授隊/人責更
- **隱於證後**：VPN/SSO 疾時不可達之行冊危時無用。快副本或用公 wiki

## 參

- `configure-alerting-rules` - 連行冊於警注以即入
- `build-grafana-dashboards` - 嵌行冊鏈於面板與診板
- `setup-prometheus-monitoring` - 含 Prometheus 之診查於行冊程
- `define-slo-sli-sla` - 引 SLO 影於事故嚴重分
