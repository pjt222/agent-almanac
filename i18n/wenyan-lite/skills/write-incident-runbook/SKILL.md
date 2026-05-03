---
name: write-incident-runbook
locale: wenyan-lite
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

# 撰寫事件處理手冊

建立可行之事件處理手冊,引導應變者完成事件診斷與解決。

## 適用時機

- 為重複性警報或事件記錄應變程序
- 跨值班輪換成員標準化事件應變
- 以清晰診斷步驟降低平均解決時間（MTTR）
- 為新團隊成員建立事件處理之訓練材料
- 建立升級路徑與溝通協議
- 將部落知識遷移為書面文檔
- 將警報連結至解決程序（警報註解）

## 輸入

- **必要**：事件或警報名稱/描述
- **必要**：歷史事件資料與解決模式
- **選擇性**：診斷查詢（Prometheus、日誌、追蹤）
- **選擇性**：升級聯絡人與溝通管道
- **選擇性**：先前事件之事後檢討

## 步驟

### 步驟一：選擇手冊範本結構

> 完整範本文件見 [Extended Examples](references/EXAMPLES.md#step-1-runbook-template-examples)。

依事件類型與複雜度選擇適當之範本。

**基本手冊範本結構**：
```markdown
# [Alert/Incident Name] Runbook
## Overview | Severity | Symptoms
## Diagnostic Steps | Resolution Steps
## Escalation | Communication | Prevention | Related
```

**進階 SRE 手冊範本**（節錄）：
```markdown
# [Service Name] - [Incident Type] Runbook

## Metadata
- Service, Owner, Severity, On-Call, Last Updated

## Diagnostic Phase
### Quick Health Check (< 5 min): Dashboard, error rate, deployments
### Detailed Investigation (5-20 min): Metrics, logs, traces, failure patterns
# ... (see EXAMPLES.md for complete template)
```

關鍵範本元件：
- **元資料**：服務所有權、嚴重性、值班輪換
- **診斷階段**：快速檢查 → 詳細調查 → 失敗模式
- **解決階段**：立即緩解 → 根因修復 → 驗證
- **升級**：準則與聯絡路徑
- **溝通**：內部/外部範本
- **預防**：短期/長期行動

**預期：** 所選範本匹配事件複雜度,各段適合服務類型。

**失敗時：**
- 始於基本範本,依事件模式迭代
- 審查業界範例（Google SRE 書籍、廠商手冊）
- 首次使用後依團隊回饋調整範本

### 步驟二：記錄診斷程序

> 完整診斷查詢與決策樹見 [Extended Examples](references/EXAMPLES.md#step-2-complete-diagnostic-procedures)。

以特定查詢建立逐步調查程序。

**六步診斷清單**：

1. **驗證服務健康**：健康端點檢查與運行指標
   ```bash
   curl -I https://api.example.com/health  # Expected: HTTP 200 OK
   ```
   ```promql
   up{job="api-service"}  # Expected: 1 for all instances
   ```

2. **檢查錯誤率**：當前錯誤百分比與按端點之分解
   ```promql
   sum(rate(http_requests_total{status=~"5.."}[5m]))
   / sum(rate(http_requests_total[5m])) * 100  # Expected: < 1%
   ```

3. **分析日誌**：自 Loki 之近期錯誤與最高錯誤訊息
   ```logql
   {job="api-service"} |= "error" | json | level="error"
   ```

4. **檢查資源用量**：CPU、記憶體與連線池狀態
   ```promql
   avg(rate(container_cpu_usage_seconds_total{pod=~"api-service.*"}[5m])) * 100
   # Expected: < 70%
   ```

5. **審查近期變更**：部署、git 提交、基礎設施變更

6. **檢視依賴**：下游服務健康、資料庫/API 延遲

**失敗模式決策樹**（節錄）：
- 服務當機？→ 檢查所有 pod/實例
- 錯誤率升高？→ 檢查特定錯誤類型（5xx、閘道、資料庫、超時）
- 何時開始？→ 部署後（回滾）、漸進（資源洩漏）、突然（流量/依賴）

**預期：** 診斷程序具體,含預期對實際值,引導應變者完成調查。

**失敗時：**
- 記錄前先於實際監看系統測試查詢
- 加入儀表板截圖以供視覺參考
- 為頻繁漏掉之步驟加「常見錯誤」段
- 依事件應變者之回饋迭代

### 步驟三：定義解決程序

> 5 種解決選項之完整命令與回滾程序見 [Extended Examples](references/EXAMPLES.md#step-3-complete-resolution-procedures)。

記錄逐步補救與回滾選項。

**五種解決選項**（簡要摘要）：

1. **回滾部署**（最快）：對部署後錯誤
   ```bash
   kubectl rollout undo deployment/api-service
   ```
   驗證 → 監看 → 確認解決（錯誤率 < 1%、延遲正常、無警報）

2. **擴容資源**：對高 CPU/記憶體、連線池耗盡
   ```bash
   kubectl scale deployment/api-service --replicas=$((current * 3/2))
   ```

3. **重啟服務**：對記憶體洩漏、卡住之連線、快取損毀
   ```bash
   kubectl rollout restart deployment/api-service
   ```

4. **功能旗標/熔斷器**：對特定功能錯誤或外部依賴失敗
   ```bash
   kubectl set env deployment/api-service FEATURE_NAME=false
   ```

5. **資料庫補救**：對資料庫連線、慢查詢、池耗盡
   ```sql
   -- Kill long-running queries, restart connection pool, increase pool size
   ```

**通用驗證清單**：
- [ ] 錯誤率 < 1%
- [ ] 延遲 P99 < 閾值
- [ ] 吞吐量回基線
- [ ] 資源用量健康（CPU < 70%、Memory < 80%）
- [ ] 依賴健康
- [ ] 面向用戶之測試通過
- [ ] 無活躍警報

**回滾程序**：若解決使情況惡化 → 暫停/取消 → 還原 → 重評估

**預期：** 解決步驟清晰,含驗證檢查,為各行動提供回滾選項。

**失敗時：**
- 對複雜程序加更細之步驟
- 對多步驟過程加截圖或圖表
- 記錄命令輸出（預期對實際）
- 為複雜解決程序建獨立手冊

### 步驟四：建立升級路徑

> 完整升級層級與聯絡目錄範本見 [Extended Examples](references/EXAMPLES.md#step-4-complete-escalation-guidelines)。

定義何時、如何升級事件。

**何時立即升級**：
- 面向客戶之停機 > 15 分鐘
- SLO 錯誤預算 > 10% 耗盡
- 疑似資料喪失/損毀或安全漏洞
- 20 分鐘內無法辨識根因
- 緩解嘗試失敗或惡化情況

**五個升級層級**：
1. **主要值班**（5 分鐘回應）：部署修復、回滾、擴容（最多單獨 30 分鐘）
2. **次要值班**（15 分鐘後自動）：額外調查支援
3. **團隊主管**（架構決策）：資料庫變更、廠商升級、事件 > 1 小時
4. **事件指揮官**（跨團隊協調）：多團隊、客戶溝通、事件 > 2 小時
5. **高階主管**（C 級）：重大影響（>50% 用戶）、SLA 違反、媒體/PR、停機 > 4 小時

**升級流程**：
1. 通知目標,含：當前狀態、影響、已採行動、所需協助、儀表板連結
2. 若需,交接：分享時間軸、行動、存取,保持在線
3. 勿沉默：每 15 分鐘更新、提問、提供回饋

**聯絡目錄**：維持表,含角色、Slack、電話、PagerDuty,涵蓋：
- 平台/資料庫/安全/網路團隊
- 事件指揮官
- 外部廠商（AWS、資料庫廠商、CDN 提供商）

**預期：** 升級之清晰準則、聯絡資訊隨手可得、升級路徑與組織結構對齊。

**失敗時：**
- 驗證聯絡資訊為當前（每季測試）
- 加何時升級之決策樹
- 含升級訊息之範例
- 記錄各層級之回應時間期望

### 步驟五：建立溝通範本

> 所有內部與外部範本及完整格式見 [Extended Examples](references/EXAMPLES.md#step-5-complete-communication-templates)。

提供事件更新之預寫訊息。

**內部範本**（Slack #incident-response）：

1. **初始宣告**：
   ```
   🚨 INCIDENT: [Title] | Severity: [Critical/High/Medium]
   Impact: [users/services] | Owner: @username | Dashboard: [link]
   Quick Summary: [1-2 sentences] | Next update: 15 min
   ```

2. **進度更新**（每 15-30 分鐘）：
   ```
   📊 UPDATE #N | Status: [Investigating/Mitigating/Monitoring]
   Actions: [what we tried and outcomes]
   Theory: [what we think is happening]
   Next: [planned actions]
   ```

3. **緩解完成**：
   ```
   ✅ MITIGATION | Metrics: Error [before→after], Latency [before→after]
   Root Cause: [brief or "investigating"] | Monitoring 30min before resolved
   ```

4. **解決**：
   ```
   🎉 RESOLVED | Duration: [time] | Root Cause + Impact + Follow-up actions
   ```

5. **誤報**：無影響,無需後續

**外部範本**（狀態頁）：
- **初始**：調查中、開始時間、15 分鐘內下次更新
- **進度**：已辨識原因（對客戶友善）、實施修復、預估解決時間
- **解決**：解決時間、根因（簡單）、持續時間、預防措施

**客戶 email 範本**：時間軸、影響描述、解決、預防、補償（若適用）

**預期：** 範本於事件中節省時間,確保一致溝通,降低應變者之認知負擔。

**失敗時：**
- 自訂範本以匹配公司溝通風格
- 為常見事件類型預填範本
- 建 Slack 工作流/機器人以自動填充範本
- 於事件回顧期間審查範本

### 步驟六：將手冊連結至監看

> 完整 Prometheus 警報配置與 Grafana 儀表板 JSON 見 [Extended Examples](references/EXAMPLES.md#step-6-alert-integration-examples)。

將手冊與警報及儀表板整合。

**將手冊連結加至 Prometheus 警報**：
```yaml
- alert: HighErrorRate
  annotations:
    runbook_url: "https://wiki.example.com/runbooks/high-error-rate"
    dashboard_url: "https://grafana.example.com/d/service-overview"
    incident_channel: "#incident-platform"
```

**於手冊嵌入快速診斷連結**：
- 服務概覽儀表板
- 過去 1 小時錯誤率（Prometheus 直連）
- 近期錯誤日誌（Loki/Grafana Explore）
- 近期部署（GitHub/CI）
- PagerDuty 事件

**建立 Grafana 儀表板面板**,含手冊連結（markdown 面板列出所有事件手冊及值班與升級資訊）

**預期：** 應變者可自警報或儀表板直接存取手冊、診斷查詢已預填、相關工具一鍵存取。

**失敗時：**
- 驗證手冊 URL 無 VPN/登入即可存取
- 對複雜 Grafana/Prometheus 連結用 URL 縮短器
- 每季測試連結以確保不破裂
- 為頻繁使用之手冊建瀏覽器書籤

## 驗證

- [ ] 手冊遵循一致之範本結構
- [ ] 診斷程序含特定查詢與預期值
- [ ] 解決步驟可行,含清晰命令
- [ ] 升級準則與聯絡為當前
- [ ] 提供內外部對象之溝通範本
- [ ] 手冊已自監看警報與儀表板連結
- [ ] 手冊已於事件模擬或實際事件中測試
- [ ] 應變者之回饋已納入手冊
- [ ] 修訂歷史含日期與作者已追蹤
- [ ] 手冊無認證即可存取（或離線快取）

## 常見陷阱

- **過於通用**：含模糊步驟（如「檢查日誌」而無特定查詢）之手冊不可行。要具體
- **資訊過時**：引用舊系統或命令之手冊變無用。每季審查
- **無驗證步驟**：無驗證之解決致誤報。永遠含「如何確認已修復」
- **缺回滾程序**：每行動應有回滾計畫。勿將應變者困於更糟狀態
- **假設知識**：僅供專家之手冊排除資淺工程師。為輪換中經驗最少者撰寫
- **無所有權**：無所有者之手冊變陳舊。指派團隊/個人負責更新
- **藏於認證後**：於 VPN/SSO 問題期間不可存取之手冊在危機中無用。快取副本或用公共 wiki

## 相關技能

- `configure-alerting-rules` — 將手冊連結至警報註解,以於事件中立即存取
- `build-grafana-dashboards` — 於儀表板與診斷面板嵌入手冊連結
- `setup-prometheus-monitoring` — 將 Prometheus 之診斷查詢納入手冊程序
- `define-slo-sli-sla` — 於事件嚴重性分類中參照 SLO 影響
