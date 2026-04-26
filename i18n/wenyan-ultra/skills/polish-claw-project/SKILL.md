---
name: polish-claw-project
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Contribute to OpenClaw ecosystem projects (OpenClaw, NemoClaw, NanoClaw)
  through a structured 9-step workflow: target verification, codebase
  exploration, parallel audit, finding cross-reference, and pull request
  creation. Emphasizes false positive prevention and project convention
  adherence.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: open-source
  complexity: advanced
  language: multi
  tags: open-source, contribution, security, code-review, pull-request, claw, nvidia
---

# 磨爪案

九步構獻 OpenClaw 生案：標驗、碼探、並審、果交對、PR 立。新值在步五至七。機械步（叉、PR 立）委於現技。

## 用

- 獻 NVIDIA/OpenClaw、NVIDIA/NemoClaw、NVIDIA/NanoClaw 或類爪生庫→用
- 首獻陌生安敏架之開源→用
- 求可重審之獻程非隨修→用
- 已識爪案受外獻（察 CONTRIBUTING.md）→用

## 入

- **必**：`repo_url` — 標爪案 GitHub URL（如 `https://github.com/NVIDIA/NemoClaw`）
- **可**：
  - `contribution_count` — 目獻數（默 1-3）
  - `focus` — 偏獻型：`security`、`tests`、`docs`、`bugs`、`any`（默 `any`）
  - `fork_org` — 叉入 GitHub 組/用（默認證用）

## 行

### 一：識驗標

確案受外獻、活養。

1. 開庫 URL 讀 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`LICENSE`
2. 察近提（末 30 日）與開 PR 合率
3. 驗案用寬或獻友證
4. 讀 `SECURITY.md` 或安策若有——注責披則
5. 識主語、試框、CI 系

得：CONTRIBUTING.md 在、提於末 30 日、明獻引。

敗：無 CONTRIBUTING.md 或近活→記由止——陳案少合外 PR。

### 二：叉並複

立庫工本。

1. 叉：`gh repo fork <repo_url> --clone`
2. 設上游：`git remote add upstream <repo_url>`
3. 驗：`git remote -v` 示 `origin`（叉）與 `upstream`
4. 同：`git fetch upstream && git checkout main && git merge upstream/main`

得：地複含二遠設且新。

敗：叉敗→察 GitHub 認（`gh auth status`）。複緩→試 `--depth=1` 為初探。

### 三：探碼

建案構心模。

1. 讀 `README.md` 為架覽與案標
2. 識入點、核模、公 API 面
3. 映試構：試在何、用何框、覆級
4. 注碼風俗：linter 配、命名式、入順
5. 察 Docker/容器、CI 配、布式

得：明案構、俗、獻何處可入。

敗：架不明→聚於某子系非全案。

### 四：讀開事

察現事以解案需、避重工。

1. 列開事：`gh issue list --state open --limit 50`
2. 按型別：錯、功、文、安、good-first-issue
3. 注標 `help wanted`、`good first issue`、`hacktoberfest` 之事
4. 察陳事（>90 日開、無近註）——恐已棄
5. 讀連 PR 以解嘗試

得：分類未領事列含型標。

敗：無開事→赴步五——審恐發未列改。

### 五：並審

並行安與碼質審。新發於此。

1. 對案根行 `security-audit-codebase` 技
2. 同行 `review-codebase` 技範 `quality`
3. **要：對案威脅模與架驗各發**
   - 沙箱啟引中之「硬編密」非漏
   - 內函缺入驗為低重
   - 標漏依恐已為案架緩
4. 評驗發：CRITICAL、HIGH、MEDIUM、LOW
5. 假陽含理由記——其入未來 Common Pitfalls

得：驗發列含重評與假陽注。

敗：無發→轉聚於試覆缺、文改、開驗增。

### 六：交對發

映驗審發於開事——核斷步。

1. 各驗發、搜開事為相討
2. 各發歸：
   - **配開事**——連發於事
   - **新發**——無現事覆
   - **已修於 PR**——察開 PR 為進中修
3. 序配現事之發（合率最高）
4. 新發：按案先察養者受否

得：序列含發-事映與合率評。

敗：諸發皆已處→返步四覓文、試、開驗獻。

### 七：擇獻

按效、力、專擇 1-3 獻。

1. 各候評於：
   - **效**：此進案幾何？（安 > 錯 > 試 > 文）
   - **力**：聚會內可善成乎？（宜小完 PR）
   - **專**：獻者有此修域知乎？
   - **合率**：合案述先乎？
2. 擇高者（默 1-3）
3. 各定：枝名、範界、受則、試計

得：1-3 擇獻含明範與受則。

敗：無獻評高→計提善書事代 PR。

### 八：實

各獻立枝、實修。

1. 各獻：`git checkout -b fix/<description>`
2. 嚴遵案俗（linter、命名、入順）
3. 加更涵變之試
4. 行案試套：諸試過
5. 行案 linter：無新警
6. 各 PR 聚——一邏變一枝

得：清實含過試、無 linter 警。

敗：試於先存事敗→記之、確 PR 不引新敗。

### 九：立 PR

按案 CONTRIBUTING.md 提獻。

1. 推枝：`git push origin fix/<description>`
2. 用 `create-pull-request` 技立 PR
3. PR 體引相事（如「Fixes #123」）
4. 遵案 PR 模若有
5. 速應審饋——速迭

得：PR 立、連事、遵案俗。

敗：PR 立敗→察枝護則與獻者證約。

## 驗

1. 諸擇獻已實提為 PR
2. 各 PR 引相事（若有）
3. 諸案試於各 PR 枝過
4. 無假陽提為實事
5. PR 述遵案 CONTRIBUTING.md 模

## 忌

- **假陽過稱**：爪案用沙箱架——沙箱內「漏」恐為設。報前必對案威脅模驗
- **摘要/簽鏈擾**：爪案常用驗鏈為模整。變必保此鏈否則 PR 拒
- **俗錯**：爪案嚴行風。行案自身 linter、非通。配入順、文串式、試式精確
- **範蔓**：3 聚 PR 速合於 1 蔓 PR。各獻原子
- **陳叉**：始工前必同上游（`git fetch upstream && git merge upstream/main`）

## 參

- [security-audit-codebase](../security-audit-codebase/SKILL.md) — 步五安發
- [review-codebase](../review-codebase/SKILL.md) — 步五碼質察
- [create-pull-request](../create-pull-request/SKILL.md) — 步九 PR 立
- [create-github-issues](../create-github-issues/SKILL.md) — 為非 PR 處之發提事
- [manage-git-branches](../manage-git-branches/SKILL.md) — 實時枝管
- [commit-changes](../commit-changes/SKILL.md) — 提程
