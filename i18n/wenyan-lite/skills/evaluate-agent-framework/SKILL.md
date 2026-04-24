---
name: evaluate-agent-framework
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Assess an open-source agent framework for investment readiness by evaluating
  community health, supersession risk, architecture alignment, and governance
  sustainability. Produces a four-tier classification (INVEST / EVALUATE-FURTHER /
  CONTRIBUTE-CAUTIOUSLY / AVOID) to guide resource allocation decisions before
  committing engineering effort.
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, framework-evaluation, risk-assessment, community-health, supersession, investment
---

# 評代理框架

結構化評估開源代理框架之投資準備度。新值在於步驟二三：以貢獻存活率量化社群健康，以量度取代風險——外部工程之力最常浪之因。終之分級（INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID）於投入開發週期前校準資源配置。

## 適用時機

- 評是否納代理框架於生產
- 察項目所倚框架之依賴風險
- 定是否投工程於外部項目
- 為自建-採納之決而比競爭框架
- 於重大發布、治理變更或併購後再評框架

## 輸入

- **必要**：`framework_url` — 框架倉庫之 GitHub URL
- **選擇性**：
  - `comparison_frameworks` — 可參照之其他框架 URL 清單
  - `use_case` — 供架構對齊評估之預定用例（如「multi-agent orchestration」、「tool-use pipelines」）
  - `contribution_budget` — 預定工程時數，供校準投資等級

## 步驟

### 步驟一：採集框架普查

於深度分析前集項目規模、活動與所處之態之基礎數據。

1. 取讀 `README.md`、`CONTRIBUTING.md`、`LICENSE` 及任何架構文檔（`docs/`、`ARCHITECTURE.md`）
2. 採定量指標：
   - Star、fork、open issue、open PR：`gh repo view <repo> --json stargazerCount,forkCount,issues,pullRequests`
   - 依賴之倉庫：查 GitHub 「Used by」計或 `gh api repos/<owner>/<repo>/dependents`
   - 發布節律：`gh release list --limit 10` — 記頻率及發布是否循 semver
3. 算 bus factor：識過去 12 月按 commit 數前 5 之貢獻者。若首貢獻者占 >60% 之 commit，則 bus factor 極低
4. 圖景位置：
   - **Pioneer**（先驅）：首動者，定此類（高影響，對追隨者之高取代風險）
   - **Fast-follower**（快追）：於先驅之 6 月內啟，迭進其概念
   - **Late entrant**（晚入）：類穩後至，競於特性或治理
5. 若予 `comparison_frameworks`，為各替代採同指標

**預期：** 普查表含 star、fork、dependent、發布節律、bus factor、圖景位置（含對比若予）。

**失敗時：** 若倉庫為私或 API 受限，回於手動 README 分析。若指標不可得（如自託 GitLab），記其缺並以定性評估行之。

### 步驟二：評社群健康

量項目是否歡迎、支援並留外部貢獻者。

1. 算**外部貢獻存活率**：
   - 取最後 50 已閉 PR：`gh pr list --state closed --limit 50 --json author,mergedAt,closedAt,labels`
   - 分各 PR 作者為內（組員）或外
   - 算：`survival_rate = merged_external_PRs / total_external_PRs`
   - 健康閾：>50% 存活率；憂：<30%
2. 量響應性：
   - **Issue 首應時**：自 issue 建至首維護者留言之中位時
   - **PR 合併延**：外部 PR 自開至合之中位時
   - 健康：首應 <7 日，合 <30 日；憂：首應 >30 日
3. 評貢獻者多樣：
   - 過去 6 月之外/內貢獻者比
   - 合併 PR >=2 之獨立外部貢獻者數（重複貢獻者為健康生態之兆）
4. 察治理產物：
   - `CONTRIBUTING.md` 存且可行（非僅「提交 PR」）
   - `CODE_OF_CONDUCT.md` 存
   - 治理文檔述決策過程
   - Issue/PR 模板導貢獻者

**預期：** 社群健康記分卡含存活率、應時、多樣比、治理產物清單。

**失敗時：** 若 PR 數據不足（新項目 <20 已閉 PR），記樣本之限並重他兆。若項目用非 GitHub 平台，調查詢以合該平台 API。

### 步驟三：算取代風險

定外部貢獻遭內部開發淘汰之機率——框架採納者與貢獻者之最大風險。

1. 採最後 50-100 已合外部 PR（若少則皆採）
2. 對各已合外部 PR，察所獻之代碼是否後遭：
   - **Reverted**（回退）：明有回退 commit 引該 PR
   - **Rewritten**（重寫）：同文件/模組於 90 日內被內部貢獻者大幅改
   - **Obsoleted**（棄）：後續發布中特性刪或替
3. 算：`supersession_rate = (reverted + rewritten + obsoleted) / total_merged_external`
4. 對已發布之 roadmap（若可得）與外部貢獻者活躍之域：
   - 高重疊 = 高取代風險（內部將覆外部之工）
   - 低重疊 = 低取代風險（外部填內部所不為）
5. 察「貢獻陷阱」：看似友善於貢獻但已定內部重寫之域
6. 參考基準：NemoClaw 分析示 71% 外部 PR 於 6 月內遭取代——以為校準點

**預期：** 取代率為百分比，附按類之分解（reverted/rewritten/obsoleted）。Roadmap 重疊評估。

**失敗時：** 若 commit 歷史淺或 squash-merge（失歸屬），以外部 PR 文件路徑對後續發布所改之文件估取代。記估之信心降。

### 步驟四：評架構對齊

察框架之架構是否支爾用例而無過多鎖定。

1. 映擴展點：
   - 插件/擴展 API：框架是否露已文檔之插件介面？
   - 配置面：行為是否可不分叉而定制？
   - Hook/callback 系統：是否可於關鍵點截並改框架行為？
2. 評鎖定風險：
   - **重寫成本**：估遷離之工程力（日/週/月）
   - **數據可攜**：數據/狀態是否可以標準格式導出？
   - **標準合規**：框架用開放標準（agentskills.io、MCP、A2A）或專有協議？
3. 評 API 穩定：
   - 算每主版之破壞性變更數（CHANGELOG、遷移指南）
   - 察棄用政策（移前之提前警告）
   - 評 semver 遵循（破壞性變更唯於主版）
4. 察對爾特定用例之對齊：
   - 若予 `use_case`，評框架架構是否自然支之
   - 識任何架構不配而需變通之處
5. 評互通性：
   - agentskills.io 相容（skill 模型對齊）
   - MCP 支援（工具整合）
   - A2A 協議支援（代理對代理通訊）

**預期：** 架構對齊報告含擴展點清單、鎖定風險評估（低/中/高）、API 穩定分、用例配合度評估。

**失敗時：** 若架構文檔稀，自代碼結構與公 API 面導評估。若框架過新無穩定歷史，記之並重治理兆。

### 步驟五：評治理與可持續

評項目治理模型是否支長期可行與外部貢獻者之公平待遇。

1. 分治理模型：
   - **BDFL**（仁慈終身獨裁者）：單一決策者——決快，bus factor 險
   - **委員會/核心組**：分散決策——慢而更韌
   - **基金會支持**：正式治理（Apache、Linux Foundation、CNCF）——最可持續
   - **公司控**：單公司主導開發——防撤離風險
2. 評資金與可持續：
   - 資金源：VC 支、公司贊、資助、社群集資、無資金
   - 全職維護者數：>=2 為健康；0 乃危兆
   - 營收模式（若有）：項目何以自養？
3. 評貢獻者保護：
   - 授權類型：寬鬆（MIT、Apache-2.0）vs copyleft（GPL）vs 自訂
   - CLA 要求：簽 CLA 是否轉權而不利於貢獻者？
   - 貢獻者致謝：外部貢獻者是否於發布、changelog、文檔中見錄？
4. 察安全姿態：
   - 安全披露政策（`SECURITY.md` 或同等物）
   - 自 CVE 披露至補丁發布之中位時
   - 依賴更新實踐（Dependabot、Renovate、手動）
5. 評軌跡：
   - 治理模型是否在演（如趨基金會）？
   - 近期是否有領導變更、併購或重新授權？
   - 維護者與貢獻者間是否有公開衝突？

**預期：** 治理評估含模型分類、可持續評級（可持續/有險/危）、貢獻者保護評估、安全姿態摘要。

**失敗時：** 若治理信息未文檔，視其缺為黃兆。察誰合 PR、誰閉 issue、誰定發布之決以識隱式治理。

### 步驟六：分級投資準備度

合所有發現為四級分類，附具體理由與可行建議。

1. 評各維度（1-5 分）：
   - **社群健康**：存活率、響應性、多樣
   - **取代風險**：率、roadmap 重疊、貢獻陷阱（反：低者優）
   - **架構對齊**：擴展點、鎖定、穩定、用例配合
   - **治理可持續**：模型、資金、保護、安全
2. 施分類閾：
   - **INVEST**（諸維 >=4）：健康社群、低取代（<20%）、對齊架構、可持續治理。可安全納並投工程。
   - **EVALUATE-FURTHER**（混合，無維 <2）：混合兆需具體後續。文檔待釐之項並定再評期。
   - **CONTRIBUTE-CAUTIOUSLY**（任維 2，無 <2）：高取代（>40%）或治理之慮。限貢獻於明所請之工、維護者許之範圍或與核解耦之插件/擴展。
   - **AVOID**（任維 1）：嚴重紅兆——棄項目、敵視外部（存活率 <15%）、不相容授權或即將撤離之兆。勿投工程之力。
3. 書分類報告：
   - 首示級別與一句理由
   - 摘各維度分與關鍵證據
   - 若予 `contribution_budget`，依級別建議時數之配
   - 於 EVALUATE-FURTHER，列需答之具體問題並提時程
   - 於 CONTRIBUTE-CAUTIOUSLY，指何類貢獻安全（插件、文檔、測試）vs 有險（核心特性）
4. 若已評 `comparison_frameworks`，出一對比矩陣排諸框架

**預期：** 分類報告含級別、維度分、證據摘要及依投資語境定之可行建議。

**失敗時：** 若數據缺致不能自信分類，預設 EVALUATE-FURTHER 並明文檔何數據缺並如何取得。勿於不定時預設 INVEST。

## 驗證

- [ ] 普查數據已採：star、fork、dependent、發布節律、bus factor、圖景位置
- [ ] 社群健康已量：存活率、應時、貢獻者多樣、治理產物
- [ ] 取代風險已算，附按類之分解（reverted/rewritten/obsoleted）
- [ ] 架構對齊已評：擴展點、鎖定風險、API 穩定、用例配合
- [ ] 治理已評：模型、資金、貢獻者保護、安全姿態
- [ ] 分類已出：INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID 之一
- [ ] 各維度分附自分析之具體證據
- [ ] 建議可行且依貢獻預算（若予）校準
- [ ] 數據缺與信心限明示文檔

## 常見陷阱

- **以人氣混健康**：高 star 而低貢獻者多樣意味單點故障。一個 50k star 而一維護者之項目較 2k star 而 15 活躍貢獻者之項目為不健康。
- **忽取代風險**：外部貢獻失敗最常之因。歡迎之社群若內部開發恒覆外部之工，則毫無意義。
- **重架構而忽治理**：美設計之框架若治理不可持續或敵外仍可敗。
- **以 EVALUATE-FURTHER 為 AVOID**：混合兆需查而非拒。定具體再評期並列待答之具體問題。
- **快照偏**：所有指標皆為時點。當下指標佳之衰退項目較當下指標平之進步項目為劣。恒察 6-12 月之趨向。
- **CLA 自滿**：某 CLA 轉版權予項目擁有者，意爾貢獻成其專有資產。讀 CLA 文，非僅勾選框。
- **錨於單一框架**：無對比框架，任何項目看似極佳或極差。恒對至少一替代做基準測試，縱為非正式。

## 相關技能

- [polish-claw-project](../polish-claw-project/SKILL.md) — 此評估所依之貢獻工作流
- [review-software-architecture](../review-software-architecture/SKILL.md) — 步驟四之架構評估所用
- [forage-solutions](../forage-solutions/SKILL.md) — 對比用之替代框架發現
- [search-prior-art](../search-prior-art/SKILL.md) — 圖景映射與先前工作之分析
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — 步驟五所引之安全姿態評估
- [assess-ip-landscape](../assess-ip-landscape/SKILL.md) — 授權與 IP 風險分析
