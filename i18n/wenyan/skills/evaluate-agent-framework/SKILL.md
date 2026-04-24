---
name: evaluate-agent-framework
locale: wenyan
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

# 評員框

結構化評開源員框之投資備。新價於第二三步：以貢獻存率量社群之健，並量超越險——外部工作廢之首因。末之分級（INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID）於投開發之前校資源分配。

## 用時

- 評是否採員框於產
- 評所賴框之依險
- 定是否貢工力於外項
- 較諸框以決自建或採之
- 大發布、治易或收購後再評

## 入

- **必要**：`framework_url` — 框之 GitHub URL
- **可選**：
  - `comparison_frameworks` — 替代框 URL 之列供較
  - `use_case` — 架構合度評之用例（如「多員編排」「工具用流」）
  - `contribution_budget` — 擬工時，以校投資級

## 法

### 第一步：集框普

於深析前，集項之大、活、景位之基數。

1. 取並讀 `README.md`、`CONTRIBUTING.md`、`LICENSE`、諸架構文檔（`docs/`、`ARCHITECTURE.md`）
2. 集量之指：
   - 星、叉、開事、開 PR：`gh repo view <repo> --json stargazerCount,forkCount,issues,pullRequests`
   - 依此之庫：察 GitHub「Used by」數或 `gh api repos/<owner>/<repo>/dependents`
   - 發布節奏：`gh release list --limit 10` — 察頻及是否循 semver
3. 算車禍因子：末 12 月提交計首 5 貢。若首貢逾 60%，車禍因子極低
4. 映景位：
   - **Pioneer**（先驅）：首動者，定類（高影、對追者高超越險）
   - **Fast-follower**（速隨）：先驅後六月內立，迭其概
   - **Late entrant**（晚入）：類穩後至，以功或治競
5. 若 `comparison_frameworks` 供，集同指於各替

**得：** 普表含星、叉、依、節、車禍、景位（及較者若供）。

**敗則：** 若庫私或 API 限速，退而用手析 README。若指不可得（如自託 GitLab），記缺口而以質評續。

### 第二步：評社群之健

量項是否迎、援、留外貢者。

1. 算**外貢存率**：
   - 取末 50 閉 PR：`gh pr list --state closed --limit 50 --json author,mergedAt,closedAt,labels`
   - 各 PR 作者類為內（組員）或外
   - 算：`survival_rate = merged_external_PRs / total_external_PRs`
   - 健閾：>50%；憂：<30%
2. 量應速：
   - **事首應時**：自事創至首維者評之中位
   - **PR 合延**：外 PR 自開至合之中位
   - 健：首應 <7 日，合 <30 日；憂：首應 >30 日
3. 評貢之多樣：
   - 末 6 月外/內貢比
   - 合 PR >=2 之獨外貢者數（重複貢示健生態）
4. 察治之物：
   - `CONTRIBUTING.md` 存且可行（非僅「提 PR」）
   - `CODE_OF_CONDUCT.md` 存
   - 治文檔述決之程
   - 事/PR 模板導貢者

**得：** 社群健之計分表含存率、應時、多樣比、治物清單。

**敗則：** 若 PR 數不足（新項 <20 閉 PR），記樣限而重他信。若項用非 GitHub 平台，調查於彼 API。

### 第三步：算超越險

定外貢被內發廢之概——採者與貢者之最大險。

1. 樣末 50-100 合之外 PR（少則全取）
2. 於各合外 PR，察貢碼後是否：
   - **Reverted**：明撤之提交引 PR
   - **Rewritten**：90 日內同文/模被內貢者實質改
   - **Obsoleted**：功於後發布去或替
3. 算：`supersession_rate = (reverted + rewritten + obsoleted) / total_merged_external`
4. 若公路線圖可得，映之於外貢活躍之域：
   - 高重 = 高超越險（內將建於外之上）
   - 低重 = 低超越險（外填內所不補）
5. 察「貢陷」：看似迎外而實將內重寫之域
6. 參基準：NemoClaw 析示 71% 外 PR 於六月內被超越——以此校

**得：** 超越率（百分比）附分類（撤/重寫/廢）。路線圖重度評。

**敗則：** 若提交史淺或合併壓平（失歸），以較外 PR 路與後發布改文估之。記估信心減。

### 第四步：評架構合

評框架構是否援汝用例而不過鎖。

1. 映擴點：
   - 插件/擴 API：框開文檔之插件面乎？
   - 配面：行為可無叉自訂乎？
   - 鉤/回呼系：可於要點攔改框行為乎？
2. 評鎖險：
   - **重寫費**：估遷離之工（日/週/月）
   - **數可攜**：數/態可以標式出乎？
   - **標合規**：框用開標（agentskills.io、MCP、A2A）或專協議？
3. 評 API 穩：
   - 每大發破變計（CHANGELOG、遷指）
   - 察廢策（去前先警）
   - 評 semver 合（破變僅於大版）
4. 察與汝具體用例合：
   - 若 `use_case` 供，評框架構是否自然援之
   - 識須繞行之架構錯配
5. 評互操：
   - agentskills.io 兼容（技模合）
   - MCP 援（工具接）
   - A2A 協議援（員間通）

**得：** 架構合報含擴點清單、鎖險評（低/中/高）、API 穩分、用例合評。

**敗則：** 若架構文檔稀，自碼構與公 API 面推評。若框過幼無穩史，記之而重治信。

### 第五步：評治與永續

評項治模是否援久可與公待外貢。

1. 類治模：
   - **BDFL**（仁獨）：一決者——速決，車禍險
   - **Committee/Core team**（團/核）：分決——緩而韌
   - **Foundation-backed**（基金託）：正治（Apache、Linux Foundation、CNCF）——最永續
   - **Corporate-controlled**（司控）：一司主導——防撤毯險
2. 評資與永續：
   - 資源：VC、司贊、基金、眾、無
   - 全時維者數：>=2 為健；0 為警
   - 收入模（若有）：項何以自持？
3. 評貢者之護：
   - 許類：寬（MIT、Apache-2.0）、強版權（GPL）、自訂
   - CLA 求：簽 CLA 移權損貢者乎？
   - 貢者彰：外貢於發布、變更誌、文檔中署乎？
4. 察安全之態：
   - 安全披露策（`SECURITY.md` 或等）
   - 自 CVE 披至補發之中位
   - 依更之習（Dependabot、Renovate、手）
5. 評軌：
   - 治模在演乎（如向基金）？
   - 近有領導易、收購、重許乎？
   - 維者與貢者間有公衝乎？

**得：** 治評含模類、永續級（永續/險/危）、貢者護評、安全態摘。

**敗則：** 若治無文，缺本身為黃警。察隱治：誰合 PR、誰閉事、誰決發布。

### 第六步：類投資備

合諸察為四級類附具體據與可行薦。

1. 各維評（1-5 級）：
   - **社群健**：存率、應速、多樣
   - **超越險**：率、路線圖重、貢陷（倒：低為佳）
   - **架構合**：擴點、鎖、穩、用例合
   - **治永續**：模、資、護、安
2. 施類閾：
   - **INVEST**（諸維 >=4）：健社群、低超越（<20%）、合架構、永治。安採並貢
   - **EVALUATE-FURTHER**（雜，無維 <2）：雜信須具體隨。記須澄之，定再評日
   - **CONTRIBUTE-CAUTIOUSLY**（某維為 2，無 <2）：高超越（>40%）或治憂。限貢於明求之工、維認之範、或解耦之插件/擴
   - **AVOID**（某維為 1）：要警——棄項、敵外（存率 <15%）、不容許、或撤毯跡。勿投工
3. 書類報：
   - 首置級與一句理
   - 各維分附要據
   - 若 `contribution_budget` 供，依級薦時分
   - 於 EVALUATE-FURTHER，列須答之具體問並擬程
   - 於 CONTRIBUTE-CAUTIOUSLY，指何貢安（插件、文檔、試）、何險（核功）
4. 若 `comparison_frameworks` 已評，生較表排諸框

**得：** 類報含級、維分、據摘、合投資脈絡之可行薦。

**敗則：** 若數缺不能信類，默 EVALUATE-FURTHER 並明記缺數及取法。不確勿默 INVEST。

## 驗

- [ ] 普數集：星、叉、依、發布節、車禍、景位
- [ ] 社群健量：存率、應時、貢多樣、治物
- [ ] 超越險算附分類（撤/重寫/廢）
- [ ] 架構合評：擴點、鎖險、API 穩、用例合
- [ ] 治評：模、資、貢護、安
- [ ] 類出：INVEST / EVALUATE-FURTHER / CONTRIBUTE-CAUTIOUSLY / AVOID 之一
- [ ] 各維分附析之具體據
- [ ] 薦可行且校於貢預（若供）
- [ ] 數缺與信限明記

## 陷

- **混名於健**：高星低多樣意一點敗之虞。五萬星一維者之項不如二千星十五活貢者之項健
- **略超越險**：外貢敗之首因。迎之社群若內常覆外，無益
- **重架構略治**：美設之框若治不續或敵外，猶敗
- **視 EVALUATE-FURTHER 為 AVOID**：雜信須查，非拒。定再評日，列具體問
- **快照偏**：諸指皆時點。衰中現佳者劣於升中現平者。常察 6-12 月趨
- **CLA 懈**：有 CLA 移版權於項主，汝貢成彼私。讀 CLA 文，非僅勾
- **錨一框**：無較，諸項皆大好或大壞。必較至少一替，雖非正

## 參

- [polish-claw-project](../polish-claw-project/SKILL.md) — 此評所導之貢流
- [review-software-architecture](../review-software-architecture/SKILL.md) — 用於第四步架構評
- [forage-solutions](../forage-solutions/SKILL.md) — 替框之尋以供較
- [search-prior-art](../search-prior-art/SKILL.md) — 景映與前作析
- [security-audit-codebase](../security-audit-codebase/SKILL.md) — 第五步所引安全態評
- [assess-ip-landscape](../assess-ip-landscape/SKILL.md) — 許與 IP 險析
