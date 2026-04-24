---
name: evaluate-agent-framework
locale: wenyan-ultra
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

# 估 Agent 框

結構估開源 agent 框之投資備度。新值在二、三步：以貢獻存活率量社群健，並量取代險——工敗最常因。末分類（INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID）定資之分配於投開發週期前。

## 用

- 估是否採 agent 框為生產用
- 估項目所依框之險
- 決是否投工於外項
- 較競框以定建對採
- 大布、治變、收購後重估框

## 入

- **必**：`framework_url` — 框庫之 GitHub URL
- **可**：
  - `comparison_frameworks` — 以基較之它框 URL 列
  - `use_case` — 架合估之意用（如「多 agent 協」「工具用管」）
  - `contribution_budget` — 計工時，以校投級

## 行

### 一：集框普查

深析前，集項目之大、動、域位之基數。

1. 取讀 `README.md`、`CONTRIBUTING.md`、`LICENSE`、諸架文（`docs/`、`ARCHITECTURE.md`）
2. 集量指：
   - 星、叉、開議、開 PR：`gh repo view <repo> --json stargazerCount,forkCount,issues,pullRequests`
   - 依庫：察 GitHub「Used by」或 `gh api repos/<owner>/<repo>/dependents`
   - 發頻：`gh release list --limit 10` — 察頻與是否循 semver
3. 算 bus factor：識末 12 月 commit 數前 5 者。若首者佔 >60%，bus factor 危低
4. 映域位：
   - **Pioneer**：先動者，定類（高響、於從者高取代險）
   - **Fast-follower**：於先 6 月內起，迭其念
   - **Late entrant**：於類穩後至，競於特或治
5. 若 `comparison_frameworks` 予→為各替集同指

得：普查表載星、叉、依、發頻、bus factor、域位（含較者若予）。

敗：庫私或 API 限→退於人 README 析。指無（如自托 GitLab）→記缺而以質估續行。

### 二：估社群健

量項目是否迎、持、留外貢。

1. 算**外貢存活率**：
   - 取末 50 閉 PR：`gh pr list --state closed --limit 50 --json author,mergedAt,closedAt,labels`
   - 各 PR 作者分為內（組員）或外
   - 計：`survival_rate = merged_external_PRs / total_external_PRs`
   - 健門：>50%；憂：<30%
2. 量回應：
   - **議首應時**：議建至首維者評之中位
   - **PR 合延**：外 PR 自開至合之中位
   - 健：<7 日首應、<30 日合；憂：>30 日首應
3. 估貢多樣：
   - 末 6 月之外/內貢比
   - 有 >=2 合 PR 之獨外貢者數（重複貢顯健生態）
4. 察治遺物：
   - `CONTRIBUTING.md` 存且可行（非僅「submit a PR」）
   - `CODE_OF_CONDUCT.md` 存
   - 治文述決策程
   - 議/PR 模引貢者

得：社群健記分表，含存活率、應時、多樣比、治遺物單。

敗：PR 數不足（新項 <20 閉 PR）→記樣限並重他信。項用非 GitHub→適其 API 之詢。

### 三：算取代險

定外貢被內發淘汰之機——框採者與貢者之最大險。

1. 取末 50-100 合外 PR（不足則全）
2. 各合外 PR 察其碼後是否：
   - **Reverted**：明 revert commit 引 PR
   - **Rewritten**：同文/模於 90 日內由內者大改
   - **Obsoleted**：特於後發中去或代
3. 計：`supersession_rate = (reverted + rewritten + obsoleted) / total_merged_external`
4. 映已布路圖（若予）與外貢活區：
   - 高重 = 高取代險（內將建於外工）
   - 低重 = 低取代險（外填內不填）
5. 察「貢陷」：似貢友而排為內重寫之區
6. 基：NemoClaw 析顯 71% 外 PR 於 6 月內被代 — 校點

得：取代率為百分，按類分（reverted/rewritten/obsoleted）。路重估。

敗：commit 史淺或 squash 合（失歸屬）→以外 PR 文徑較後發所改文估。記估信減。

### 四：估架合

估框架是否合用而不過鎖。

1. 映擴點：
   - 插/擴 API：框露文插介否？
   - 組態面：行可不叉而定否？
   - 鈎/回呼：可於要點截改否？
2. 估鎖險：
   - **遷費**：估離之工（日/週/月）
   - **數攜**：數/態可以標式出否？
   - **標遵**：框用開標（agentskills.io、MCP、A2A）或專協？
3. 估 API 穩：
   - 計每大發之破變（CHANGELOG、遷指）
   - 察棄策（去前先警）
   - 估 semver 遵（破變僅於大版）
4. 察合特用：
   - 若 `use_case` 予→估框架是否自然持之
   - 識須繞之架錯
5. 估互通：
   - agentskills.io 容（技模合）
   - MCP 持（工入）
   - A2A 協持（agent 間通）

得：架合報，含擴點清、鎖險（低/中/高）、API 穩分、用合估。

敗：架文稀→由碼構與公 API 面推之。框過新無穩史→記而重治信。

### 五：估治與續

估項目之治模是否持久可維且公對外貢。

1. 分治模：
   - **BDFL**：單決——快而 bus factor 險
   - **Committee/Core team**：分決——慢而韌
   - **Foundation-backed**：正式治（Apache、Linux Foundation、CNCF）——最續
   - **Corporate-controlled**：單司驅——察抽毯險
2. 估資與續：
   - 資源：VC 支、司贊、補、社群籌、無資
   - 全職維者：>=2 健；0 紅旗
   - 入模（若有）：項目自維何法？
3. 估貢保：
   - 證類：寬（MIT、Apache-2.0）對左（GPL）對定
   - CLA 求：簽 CLA 轉權使貢不利否？
   - 貢認：外貢於發、changelog、文中得記否？
4. 察安態：
   - 安披露策（`SECURITY.md` 或等）
   - 自 CVE 披至補之中位時
   - 依更踐（Dependabot、Renovate、人）
5. 估軌：
   - 治模漸進（如向基會移）？
   - 近有領換、收、重證？
   - 維與貢間有公爭？

得：治估，含模分、續率（續/險/危）、貢保估、安態摘。

敗：治信無文→無即黃旗。察誰合 PR、誰閉議、誰決發以推隱治。

### 六：分投備度

綜諸見入四級分類與特理由及可行建。

1. 各維計分（1-5）：
   - **社群健**：存活率、回應、多樣
   - **取代險**：率、路重、貢陷（反：低佳）
   - **架合**：擴點、鎖、穩、用合
   - **治續**：模、資、保、安
2. 施分類門：
   - **INVEST**（諸維 >=4）：健社群、低取代（<20%）、合架、續治。安採而投工
   - **EVALUATE-FURTHER**（雜，無維 <2）：雜信須特隨察。記待清事並設重估日
   - **CONTRIBUTE-CAUTIOUSLY**（任維 2，無 <2）：高取代（>40%）或治憂。貢限於明求工、維准範、與核耦之插/擴
   - **AVOID**（任維 1）：要紅旗——棄項、敵外（存活 <15%）、不容證、或將抽毯兆。勿投工
3. 書分類報：
   - 首列級與一句理
   - 各維分以關證摘
   - 若 `contribution_budget` 予→建依級分配
   - EVALUATE-FURTHER：列待答特問並提時
   - CONTRIBUTE-CAUTIOUSLY：定何貢安（插、文、試）對險（核特）
4. 若 `comparison_frameworks` 估→生較矩排諸框

得：分類報載級、各維分、證摘、依投境之可行建。

敗：數缺阻信分類→默 EVALUATE-FURTHER 並明錄何缺何取。不確時永勿默 INVEST。

## 驗

- [ ] 普查數集：星、叉、依、發頻、bus factor、域位
- [ ] 社群健已量：存活率、應時、多樣、治遺物
- [ ] 取代險已算並按類分（reverted/rewritten/obsoleted）
- [ ] 架合已估：擴點、鎖險、API 穩、用合
- [ ] 治已估：模、資、貢保、安態
- [ ] 分類已生：INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID 之一
- [ ] 各維分以析中特證理
- [ ] 建可行並校於貢預（若予）
- [ ] 數缺與信限已明錄

## 忌

- **混名於健**：高星而貢多樣低→單敗點。5 萬星單維項較 2 千星 15 活貢項弱
- **忽取代險**：外貢敗最常因。迎社群於內發常覆外工則空
- **重架而不察治**：美設框若治不續或敵外仍敗
- **視 EVALUATE-FURTHER 為 AVOID**：雜信須查，非拒。設具重估日並列待答問
- **快照偏**：諸指為時點。降項今指佳劣於升項今指平。察 6-12 月軌向
- **CLA 大意**：有 CLA 轉版權與項主，貢成其專產。讀 CLA 文，勿僅勾
- **單框定錨**：無較框則任項皆顯極佳或極劣。必基至少一替，縱非正式

## 參

- [polish-claw-project](../polish-claw-project/SKILL.md) — 此估啟之貢流
- [review-software-architecture](../review-software-architecture/SKILL.md) — 四步架估所用
- [forage-solutions](../forage-solutions/SKILL.md) — 較用替框發現
- [search-prior-art](../search-prior-art/SKILL.md) — 域映與先工析
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — 五步安態估所引
- [assess-ip-landscape](../assess-ip-landscape/SKILL.md) — 證與 IP 險析
