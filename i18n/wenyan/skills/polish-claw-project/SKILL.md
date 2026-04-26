---
name: polish-claw-project
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  以結構化九步流程貢獻於 OpenClaw 生態項目（OpenClaw, NemoClaw, NanoClaw）：
  目標驗、代碼庫探、並行審計、發現對照、立拉取請求。重在防偽陽性與
  守項目慣例。
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

# 磨爪項目

貢獻於 OpenClaw 生態項目之結構流程。新值在第 5-7 步：並行審計、防偽陽性、與開放議題對照以擇高影響之貢獻。機械步（fork、PR 立）委於既有技能。

## 用時

- 貢獻於 NVIDIA/OpenClaw、NVIDIA/NemoClaw、NVIDIA/NanoClaw 或類似 Claw 生態庫
- 首次貢獻於不熟之安全敏感架構之開源項
- 欲可重複可審之貢獻流程而非隨手修
- 已識受外貢之 Claw 項（察 CONTRIBUTING.md）後

## 入

- **必要**：`repo_url` — 目標 Claw 項之 GitHub URL（如 `https://github.com/NVIDIA/NemoClaw`）
- **可選**：
  - `contribution_count` — 欲行貢獻之數（默 1-3）
  - `focus` — 偏型：`security`、`tests`、`docs`、`bugs`、`any`（默 `any`）
  - `fork_org` — 分叉之 GitHub 組/用戶（默 認證之用戶）

## 法

### 第一步：識並驗目標

確項受外貢且活維。

1. 開庫 URL 並讀 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`、`LICENSE`
2. 察近提交活（末 30 日）與開放 PR 合併率
3. 驗項用寬鬆或貢友善之許可
4. 讀 `SECURITY.md` 或安全策若有——記負責披露之規
5. 識主語、試框、CI 系

得：CONTRIBUTING.md 在、末 30 日內有提交、貢指清晰。

敗則：若無 CONTRIBUTING.md 或近無活，記因而止——陳項罕合外 PR。

### 第二步：分叉並克隆

立庫之工作副本。

1. 分叉：`gh repo fork <repo_url> --clone`
2. 設上游：`git remote add upstream <repo_url>`
3. 驗：`git remote -v` 示 `origin`（叉）與 `upstream` 二者
4. 同步：`git fetch upstream && git checkout main && git merge upstream/main`

得：本地克隆，二遠程已配且最新。

敗則：若分叉敗，察 GitHub 認證（`gh auth status`）。若克隆緩，初探試 `--depth=1`。

### 第三步：探代碼庫

立項架構之心模。

1. 讀 `README.md` 觀架構與項目標
2. 識入點、核模、公 API 面
3. 圖試結構：試何處、何框、覆度
4. 注代碼風格慣：linter 配、命名、入式
5. 察 Docker/容器設、CI 配、部署模

得：清明項結構、慣、貢宜處。

敗則：若架構不明，焦於某子系而非全項。

### 第四步：讀開放議題

察既議以明項所需並避重作。

1. 列開放議：`gh issue list --state open --limit 50`
2. 依型分類：bug、功能、文、安全、good-first-issue
3. 注標 `help wanted`、`good first issue`、`hacktoberfest` 之議
4. 察陳議（>90 日開、近無評）——或已棄
5. 讀任連 PR 知所試之解

得：未認領議分類列附型標。

敗則：若無開放議，赴第五步——審計或揭未列之改善。

### 第五步：並行審計

並行行安全與代碼質審計。新發現於此現。

1. 對項根行 `security-audit-codebase` 技能
2. 同行 `review-codebase` 技能附範圍 `quality`
3. **要：對項威脅模與架構驗各發現**
   - 沙盒引導腳本中之「硬編祕」非漏
   - 內用函數無入驗低嚴重
   - 標漏之依或已被項架構緩解
4. 評驗之發現：CRITICAL、HIGH、MEDIUM、LOW
5. 記偽陽性附理——其告未來行之 Common Pitfalls

得：附嚴重評與偽陽性注之驗發現列。

敗則：若無發現浮現，移焦至試覆缺、文改、開發者體驗增。

### 第六步：對照發現

映驗審計發現至開放議——核判之步。

1. 對各驗之發現，搜開放議相關之論
2. 各發現分類為：
   - **合開放議** — 連發現於議
   - **新發現** — 無既議覆
   - **已修於 PR** — 察開放 PR 進行中之修
3. 優符既議者（最高合併率）
4. 新發現者，依項優先評維護者是否願受修

得：附發現至議映與合併率評之優先列。

敗則：若諸發現皆已處，返第四步覓文、試、開發者體驗之貢。

### 第七步：擇貢

依影響、力、專長擇 1-3 貢。

1. 各候之分：
   - **影響**：此進項多少？（安全 > bug > 試 > 文）
   - **力**：可於焦會中善為之乎？（取小完之 PR）
   - **專長**：貢者有此修之域知乎？
   - **合併率**：合所示項優先乎？
2. 擇頂候（默 1-3）
3. 各定：分支名、範圍界、接受之準、試謀

得：1-3 擇貢附明範圍與接受之準。

敗則：若無貢分高，考立善寫議而非 PR。

### 第八步：實作

各貢立分支並實修。

1. 各貢：`git checkout -b fix/<description>`
2. 嚴守項慣（linter、命名、入式）
3. 加或更涵改之試
4. 行項試套：驗諸試過
5. 行項 linter：驗無新警
6. 各 PR 焦——一邏輯變一分支

得：清實作，附過試與無 linter 警。

敗則：若試敗於既有問題，記之並確 PR 不引新敗。

### 第九步：立拉取請求

依項之 CONTRIBUTING.md 提交貢。

1. 推分支：`git push origin fix/<description>`
2. 用 `create-pull-request` 技能立 PR
3. 於 PR 體參相關議（如 "Fixes #123"）
4. 守項 PR 模板若有
5. 對審者反饋速應——快迭

得：諸 PR 已立、連於議、守項慣。

敗則：若 PR 立敗，察分支保護規與貢者許可協議。

## 驗

1. 諸擇貢已實作並提交為 PR
2. 各 PR 參相關議（若有）
3. 諸項試於各 PR 分支過
4. 無偽陽性發現提交為實議
5. PR 述守項 CONTRIBUTING.md 模板

## 陷

- **偽陽性過聲**：Claw 項用沙盒架構——沙盒環境內之「漏」或為設計使然。報前常對項威脅模驗。
- **摘要/簽名鏈擾**：Claw 項常用驗鏈為模型完整。變必保此鏈，否則 PR 拒。
- **慣不合**：Claw 項嚴執風格。行項自之 linter，非通用者。嚴配入序、文檔字符串格、試模。
- **範圍蔓延**：3 焦 PR 合併速於 1 蔓延 PR。各貢原子。
- **陳分叉**：始作前常與上游同步（`git fetch upstream && git merge upstream/main`）。

## 參

- [security-audit-codebase](../security-audit-codebase/SKILL.md) — 第五步用於安全發現
- [review-codebase](../review-codebase/SKILL.md) — 第五步用於代碼質審
- [create-pull-request](../create-pull-request/SKILL.md) — 第九步用於 PR 立
- [create-github-issues](../create-github-issues/SKILL.md) — 為未為 PR 處之發現立議
- [manage-git-branches](../manage-git-branches/SKILL.md) — 實作中之分支管
- [commit-changes](../commit-changes/SKILL.md) — 提交流程
