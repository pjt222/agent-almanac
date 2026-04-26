---
name: polish-claw-project
locale: wenyan-lite
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

# 打磨 Claw 專案

為 OpenClaw 生態之專案貢獻而設之結構化工作流程。其新穎價值集中於步驟 5-7：平行稽核、防誤報、將發現對照公開議題以擇高影響力之貢獻。機械性步驟（fork、PR 建立）委由既有技能。

## 適用時機

- 為 NVIDIA/OpenClaw、NVIDIA/NemoClaw、NVIDIA/NanoClaw 或類似 Claw 生態之倉庫貢獻
- 對含安全敏感架構之開源專案首次貢獻
- 欲行可重複、可稽核之貢獻流程，而非臨時修補
- 確認某 Claw 專案接受外部貢獻後（檢 CONTRIBUTING.md）

## 輸入

- **必要**：`repo_url` —— 目標 Claw 專案之 GitHub URL（如 `https://github.com/NVIDIA/NemoClaw`）
- **選擇性**：
  - `contribution_count` —— 目標貢獻數（預設：1-3）
  - `focus` —— 偏好之貢獻類型：`security`、`tests`、`docs`、`bugs`、`any`（預設：`any`）
  - `fork_org` —— fork 至之 GitHub org/user（預設：認證使用者）

## 步驟

### 步驟一：辨識並驗證目標

確認專案接受外部貢獻且積極維護中。

1. 開啟倉庫 URL 並讀 `CONTRIBUTING.md`、`CODE_OF_CONDUCT.md` 與 `LICENSE`
2. 檢視近期提交活動（過去 30 日）與公開 PR 之合併率
3. 驗證專案採用寬鬆或對貢獻友善之授權
4. 若有 `SECURITY.md` 或安全政策，閱之——留意負責揭露規則
5. 辨識主要語言、測試框架與 CI 系統

**預期：** CONTRIBUTING.md 存在，30 日內有提交，貢獻指引清晰。

**失敗時：** 若無 CONTRIBUTING.md 或近期無活動，記錄理由並止步——停滯之專案少接受外部 PR。

### 步驟二：Fork 並 Clone

建立倉庫之工作副本。

1. Fork：`gh repo fork <repo_url> --clone`
2. 設上游遠端：`git remote add upstream <repo_url>`
3. 驗證：`git remote -v` 顯示 `origin`（fork）與 `upstream`
4. 同步：`git fetch upstream && git checkout main && git merge upstream/main`

**預期：** 本地副本已配置雙遠端且為最新。

**失敗時：** 若 fork 失敗，檢視 GitHub 認證（`gh auth status`）。若 clone 過慢，初探可用 `--depth=1`。

### 步驟三：探索程式碼

對專案架構建立心智模型。

1. 讀 `README.md` 以了解架構概觀與專案目標
2. 辨識入口點、核心模組與公開 API 表面
3. 繪測試結構：測試所在、所用框架、覆蓋率
4. 留意程式風格慣例：linter 設定、命名模式、import 風格
5. 檢查 Docker／容器設置、CI 設定與部署模式

**預期：** 對專案結構、慣例與貢獻適配處有清晰理解。

**失敗時：** 若架構不明，聚焦於某子系統而非整個專案。

### 步驟四：閱讀公開議題

掃視既有議題以了解專案需求並避免重工。

1. 列出公開議題：`gh issue list --state open --limit 50`
2. 依類分類：bug、功能、文件、安全、good-first-issue
3. 留意標籤為 `help wanted`、`good first issue` 或 `hacktoberfest` 之議題
4. 檢查停滯議題（>90 日無動作）——可能已被棄置
5. 讀任何相關 PR，了解曾嘗試之解法

**預期：** 一份分類之未認領議題清單。

**失敗時：** 若無公開議題，進入步驟五——稽核可能揭出未列之改進。

### 步驟五：平行稽核

平行執行安全與程式品質之稽核。新穎發現於此浮現。

1. 對專案根目錄執行 `security-audit-codebase` 技能
2. 同時執行 `review-codebase` 技能，範圍為 `quality`
3. **關鍵：將每項發現對照專案之威脅模型與架構加以驗證**
   - 沙箱啟動腳本中之「硬編碼密鑰」並非漏洞
   - 僅供內部使用之函式之輸入驗證缺失，嚴重度低
   - 標為易受攻擊之相依，恐已被專案架構所緩解
4. 將已驗發現分等：CRITICAL、HIGH、MEDIUM、LOW
5. 將誤報及其理由記錄之——可入未來之常見陷阱

**預期：** 一份附嚴重度之已驗發現清單，並標註誤報。

**失敗時：** 若無發現浮現，轉聚焦於測試覆蓋缺口、文件改進或開發者體驗加強。

### 步驟六：交叉參照發現

將已驗稽核發現對照公開議題——核心之判斷步驟。

1. 對每項已驗發現，於公開議題中搜相關討論
2. 將每項發現歸類為：
   - **與公開議題吻合** —— 將發現連結至該議題
   - **新發現** —— 既有議題未涵蓋
   - **公開 PR 中已修** —— 檢視進行中之 PR
3. 優先處理與既有議題吻合者（合併機率最高）
4. 對新發現，依專案優先順序評估維護者是否歡迎此修

**預期：** 一份排序清單，含發現對議題之對應與合併機率評估。

**失敗時：** 若所有發現皆已被處理，回到步驟四，找文件、測試或開發者體驗之貢獻。

### 步驟七：擇定貢獻

依影響力、付出與專長擇 1-3 件貢獻。

1. 為每候選打分：
   - **影響力**：對專案之改善程度（安全 > bug > 測試 > 文件）
   - **付出**：能否於聚焦之單次工作完成？（小而完整之 PR 為佳）
   - **專長**：貢獻者是否具修補所需之領域知識？
   - **合併機率**：是否與專案宣告之優先順序相符？
2. 擇得分最高者（預設：1-3 件）
3. 為每件界定：分支名、範圍邊界、驗收準則、測試計畫

**預期：** 1-3 件已擇貢獻，附明確範圍與驗收準則。

**失敗時：** 若無候選得分良好，考慮以撰寫良好之議題提交，而非 PR。

### 步驟八：實作

每件貢獻建一分支並實作之。

1. 對每件：`git checkout -b fix/<description>`
2. 嚴格遵循專案慣例（linter、命名、import 風格）
3. 為變更新增或更新測試
4. 執行專案測試套件：驗證全部通過
5. 執行專案 linter：驗證無新警告
6. 每 PR 聚焦——每分支一個邏輯變更

**預期：** 乾淨之實作，測試通過、linter 無警告。

**失敗時：** 若測試因既有問題失敗，記錄之並確保 PR 未引入新失敗。

### 步驟九：建立 Pull Request

依專案 CONTRIBUTING.md 提交貢獻。

1. 推送分支：`git push origin fix/<description>`
2. 以 `create-pull-request` 技能建立 PR
3. PR 內容中參照相關議題（如「Fixes #123」）
4. 若有 PR 模板，依之
5. 對審查者回饋積極回應——快速迭代

**預期：** PR 已建立、已連結議題、合於專案慣例。

**失敗時：** 若 PR 建立失敗，檢視分支保護規則與貢獻者授權協議。

## 驗證

1. 所有所擇貢獻皆已實作並提交為 PR
2. 各 PR 皆參照相關議題（若存在）
3. 各 PR 分支之全部專案測試通過
4. 無誤報之發現被以實際議題提交
5. PR 描述合於專案 CONTRIBUTING.md 之模板

## 常見陷阱

- **誤報過稱**：Claw 專案採沙箱架構——沙箱內之「漏洞」可能為設計使然。回報前務必對照專案威脅模型驗證。
- **摘要／簽章鏈中斷**：Claw 專案常用驗證鏈以保模型完整。變更須保此鏈，否則 PR 將被拒。
- **慣例不合**：Claw 專案執行嚴格之風格。執行專案自身之 linter，而非通用者。import 順序、docstring 格式與測試模式皆應一致。
- **範圍蔓延**：3 個聚焦之 PR 比 1 個拖長之 PR 合併更快。每件貢獻保持原子化。
- **過時 fork**：開工前務必與上游同步（`git fetch upstream && git merge upstream/main`）。

## 相關技能

- [security-audit-codebase](../security-audit-codebase/SKILL.md) —— 步驟五用於安全發現
- [review-codebase](../review-codebase/SKILL.md) —— 步驟五用於程式品質審查
- [create-pull-request](../create-pull-request/SKILL.md) —— 步驟九用於建立 PR
- [create-github-issues](../create-github-issues/SKILL.md) —— 對未以 PR 處理之發現提交議題
- [manage-git-branches](../manage-git-branches/SKILL.md) —— 實作期間之分支管理
- [commit-changes](../commit-changes/SKILL.md) —— 提交流程
