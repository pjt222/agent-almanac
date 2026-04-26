---
name: repair-damage
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Implement regenerative recovery using triage, scaffolding, and progressive
  rebuild. Covers damage assessment, wound classification, emergency
  stabilization, scar tissue management, and resilience strengthening for
  systems that have sustained structural damage. Use when a system has suffered
  an incident needing structured recovery, when a failed transformation left the
  system in a damaged intermediate state, when accumulated technical debt has
  caused partial failure, or when a system is functional but degraded and the
  degradation is worsening.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: intermediate
  language: natural
  tags: morphic, repair, regeneration, resilience, wound-healing
---

# 修復傷損

對已遭結構傷損之系統實施再生性復原——無論起因為事件、失敗之遷移、累積之疏忽或外部擾動。以生物創傷癒合為框架：分流、穩定、支架、漸進重建與疤痕組織管理。

## 適用時機

- 系統遭事件且需「不僅修之」之結構化復原
- 失敗之轉變（見 `adapt-architecture`）令系統處於受損之中間態
- 累積之技術債致系統部分失敗
- 組織傷損（人員離去、知識喪失、士氣崩潰）需結構化修復
- 防禦後復原（見 `defend-colony`），群落已遭傷時
- 系統可運作但已退化，且退化加重

## 輸入

- **必要**：傷損之描述（何破、何時、多重）
- **必要**：當前系統狀態（何仍可、何不可）
- **選擇性**：根因（若已知——或仍未明）
- **選擇性**：傷損前之系統狀態（以資比對）
- **選擇性**：可得之修復資源（時、人、預算）
- **選擇性**：急迫性（系統正退化抑或穩而傷？）

## 步驟

### 步驟一：分流——評估並分類傷口

迅速評估所有傷損並按嚴重度與急迫性分類。

1. 將每已知傷損點編目：
   - 影響哪具體組件、功能或能力？
   - 傷損完全（不可運作）抑或部分（退化）？
   - 傷損正擴散（影響鄰組件）抑或被控？
2. 將每傷口分類：

```
Wound Classification:
┌──────────┬──────────────────────┬────────────────────────────────────┐
│ Class    │ Severity             │ Response                           │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Critical │ Core function lost,  │ Immediate: stop bleeding, activate │
│          │ data at risk,        │ backup, redirect traffic, page     │
│          │ actively spreading   │ on-call team                       │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Serious  │ Important function   │ Urgent: fix within hours/days,     │
│          │ degraded, no spread  │ workarounds acceptable short-term  │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Moderate │ Non-critical function│ Scheduled: fix within sprint,      │
│          │ affected, contained  │ prioritize against other work      │
├──────────┼──────────────────────┼────────────────────────────────────┤
│ Minor    │ Cosmetic or edge     │ Backlog: fix when convenient,      │
│          │ case, no user impact │ may self-resolve                   │
└──────────┴──────────────────────┴────────────────────────────────────┘
```

3. 排修復順序：
   - 先 Critical（止血）
   - 後 Serious（恢復重要功能）
   - Moderate 與 Minor 可待排程修復
4. 察傷口交互：
   - 任傷口是否相互放大？（A 因 B 也壞而更壞）
   - 修一傷是否自動修他者？（共根因）
   - 修一傷是否使他者更壞？（修策相競）

**預期：** 按嚴重度分類之完整傷口清冊，含考慮傷口交互之優先修復順序。

**失敗時：** 若分流過久（系統正退化），略詳細分類，聚焦：「最急須穩定者為何？」先修之，再回完整分流。

### 步驟二：緊急穩定

於始修復前止傷之擴散。

1. 控傷口：
   - 隔受損組件（斷路器、網路分段、流量重導）
   - 防連鎖：停依賴受損組件之非必要功能
   - 保證據：取快照、存日誌、於任何變更前捕當前狀態
2. 施緊急修補：
   - 此非永修——乃止血帶
   - 可接受之緊急措施：
     - 重導流量至健康複本
     - 全停受損功能
     - 自備份施已知可用之配置
     - 擴展健康組件以承重導之負載
   - 不可接受之緊急措施：
     - 未測試而改代碼（生新傷）
     - 刪資料以「重置」問題（毀復原選項）
     - 隱傷損（停警報、抑錯誤）
3. 驗穩定：
   - 傷損仍擴散？若是，控失敗——試更廣之隔離
   - 系統可運作（恐退化）？若是，續修復
   - 緊急修補有效？若是，有時作仔細修復

**預期：** 系統穩定（不在退化）即便已退化。傷損已控不擴。證據已保供根因分析。

**失敗時：** 若穩定失敗（傷損即便已控仍擴），升至全系統回退：啟災難復原、轉備份系統、或優雅退化至最小可行運作。穩定過久則化為災難。

### 步驟三：建修復支架

建支援修復流程之臨時結構。

1. 設修復環境：
   - 為修復工作分支或複製受損系統
   - 確修復變更於施於生產前可測
   - 為每修復步建回滾計畫
2. 建診斷基礎建置：
   - 對受損區強化監控（立察迴歸）
   - 捕修復過程之日誌（何變、何時、何故）
   - 比對工具：傷前狀態 vs. 當前 vs. 修後
3. 設計修復序列：
   - 對每傷口（按分流之優先序）：
     a. 識根因（為何破？）
     b. 修法（修因，非僅修症）
     c. 驗法（如何確認修復有效）
     d. 迴歸檢（修是否破他事？）
4. 識疤痕組織風險：
   - 壓力下之修復每每引疤痕（變通、特例、技術債）
   - 自始計畫疤痕管理（步驟五）

**預期：** 含診斷能力之修復環境、序列化之修復計畫、對疤痕風險之覺察。

**失敗時：** 若設立適當修復環境太慢（系統急須立即生產變更），直接施變但極度紀律：一次一變、以可得之法測之、無助則回滾。

### 步驟四：執漸進重建

系統化修復傷損，每修驗後再續。

1. 對每傷口（按分流優先序）：
   a. 識根因：
      - 此為代碼錯？配置錯？資料毀？依賴敗？
      - 此為更深結構問題之症？
      - 修根因是否亦解他傷？
   b. 施修復：
      - 修根因，非僅修症
      - 若根因不可立即修，刻意施變通並文之
      - 修宜小——修破者，勿重構鄰里
   c. 驗修復：
      - 該特定受損功能現是否運作正確？
      - 修復是否通過自動化測試？
      - 系統整體健康是否改善或至少未變？
   d. 檢迴歸：
      - 此修是否破他事？
      - 步驟二之緊急修補是否仍需，抑或可移之？
2. 所有 Critical 與 Serious 傷口修畢後：
   - 移不再需之緊急修補
   - 復禁用之功能
   - 將流量返至常態路由
3. 排 Moderate 與 Minor 之修復：
   - 此入常開發工作流
   - 追之至完成（勿令成「接受」之傷）

**預期：** Critical 與 Serious 傷口已以驗證之修復修畢。緊急修補已移。系統復至運作狀態。

**失敗時：** 若修復嘗試失敗或致迴歸，回滾至前態並重評。若同傷口屢次修復皆敗，傷恐過深難局部修——考慮該受損組件是否需全替換而非修復（見 `dissolve-form`）。

### 步驟五：管疤痕組織並強化

處置緊急修復中所引之變通與捷徑，並強化以防復發。

1. 編疤痕組織清冊：
   - 化為永久之緊急修補
   - 從未以正修取代之變通
   - 為傷損相關邊例所加之特例
   - 從未復啟之禁用功能
2. 對每疤痕組織決：
   - **移**：變通不再需（傷損已全修）
   - **替**：變通解實需但宜以正法實現
   - **受**：變通乃最實際之長期方案（少見，文以何故）
3. 強化以防復發：
   - 根因分析：為何此傷損？
   - 預防：何能阻之？（監控、測試、架構變更）
   - 偵測：下次如何更速察之？（警報、健康檢查）
   - 復原：如何更速復？（運維手冊、備份程序、自動化）
4. 更新免疫記憶：
   - 將事件模式加入監控與警報（見 `defend-colony` 之免疫記憶）
   - 以可用之修復程序更新運維手冊
   - 跨團隊／組織分享所學

**預期：** 疤痕組織已管（移、替或受並文之）。系統不僅修復且較傷前更具韌性。所學已捕供未來事件。

**失敗時：** 若疤痕管理被降優（「可用，勿動」），明確排程之。未管之疤痕累積，終致下次事件。若根因不可識，強化偵測與復原速度作補償控制。

## 驗證

- [ ] 所有傷損已編冊並按嚴重度分類
- [ ] 緊急穩定已止傷之擴散
- [ ] 證據已保供根因分析
- [ ] Critical 與 Serious 傷已以驗證之修復修畢
- [ ] 緊急修補於正修後已移
- [ ] 疤痕組織已編冊並管（移、替或文）
- [ ] 根因分析已識預防與偵測之改善
- [ ] 系統韌性較傷前已改善

## 常見陷阱

- **未穩即修**：嘗於系統正出血時修根因。先穩，後修。手術前止血帶
- **永久之緊急修補**：化為永久方案之緊急措施生複合技術債。務以正修跟進
- **根因之假設**：未察即假設根因已知。許多「明顯」之因為更深問題之症。承諾修策前先察
- **修復致傷**：未測即匆修生新傷。每迭代一驗證之修——切勿批未測之變
- **忽疤痕組織**：「現可用」異於「健康」。匆修之疤乃下次事件之種

## 相關技能

- `assess-form` — 傷損評估與形態評估共方法論
- `adapt-architecture` — 傷損揭結構弱時恐需架構適應
- `dissolve-form` — 對傷過深無從修者；解之並重建
- `defend-colony` — 防禦觸修復；事後復原回饋至防禦
- `shift-camouflage` — 表面適應可於修復進行時掩傷（謹慎）
- `conduct-post-mortem` — 結構化事後分析輔根因識別
- `write-incident-runbook` — 修復程序宜捕為運維手冊以供未來事件
