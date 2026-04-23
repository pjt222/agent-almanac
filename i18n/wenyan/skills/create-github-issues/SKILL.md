---
name: create-github-issues
locale: wenyan
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Structured GitHub issue creation from review findings or task breakdowns.
  Groups related findings into logical issues, applies labels, and produces
  issues with standard templates including summary, findings, and acceptance
  criteria. Designed to consume output from review-codebase or similar review
  skills.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, github, project-management, issues, review, automation
---

# 建 GitHub 議題

由審察所發或任務之分以結構化建 GitHub 議題。將（由 `review-codebase`、`security-audit-codebase` 或手析之）發之列轉為正式議題，含標、驗收、交叉參。

## 用時

- 碼庫審生表後需追蹤
- 規劃會識工項宜成議題後
- 將 TODO 或積轉為可追之 GitHub 議題
- 批建相關議題需一致格與標者

## 入

- **必要**：`findings` — 項之列，每項至少含題與述。宜含：嚴重、影響之文件、建議標
- **可選**：
  - `group_by` — 如何合發為議題：`severity`、`file`、`theme`（默 `theme`）
  - `label_prefix` — 自建標之前綴（默無）
  - `create_labels` — 是否建缺標（默 `true`）
  - `dry_run` — 預覽議題而不建（默 `false`）

## 法

### 第一步：備標

確諸需標存於庫。

1. 列現標：`gh label list --limit 100`
2. 識發所需標（由嚴重、階段、明確標域）
3. 若未映，映嚴重至標：`critical`、`high-priority`、`medium-priority`、`low-priority`
4. 映階段／主題至標：`security`、`architecture`、`code-quality`、`accessibility`、`testing`、`performance`
5. 若 `create_labels` 為真，建缺標：`gh label create "name" --color "hex" --description "desc"`
6. 色宜一致：紅為危／安，橙為高，黃為中，藍為構，綠為試

**得：** 發所引諸標皆存於庫。無重標建。

**敗則：** 若 `gh` CLI 未認證，令用者運 `gh auth login`。若標建被拒（權不足），無標而繼並記缺之標。

### 第二步：合發

合相關之發為議題以免議題蔓延。

1. 若 `group_by` 為 `theme`：按階段或類合（諸安發 → 1-2 議題，諸 a11y → 1 議題）
2. 若 `group_by` 為 `severity`：按嚴重合（諸 CRITICAL → 1 議題，諸 HIGH → 1 議題）
3. 若 `group_by` 為 `file`：按主影響文件合
4. 每組內，按嚴重排（CRITICAL 先）
5. 若組過八發，按子主題再分
6. 每組成一 GitHub 議題

**得：** 議題組集，每組含 1-8 相關之發。議題總數宜可管（全庫審常 5-15）。

**敗則：** 若發無合元資料，退為每發一議題。小發集（<10）可，大集則生議題過多。

### 第三步：構議題

以標準樣建各議題。

1. **題**：`[Severity] Theme: Brief description` — 如 `[HIGH] Security: Eliminate innerHTML injection in panel.js`
2. **體**構：
   ```
   ## Summary
   One-paragraph overview of what this issue addresses and why it matters.

   ## Findings
   1. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation
   2. **[SEVERITY]** Finding description (`file.js:line`) — brief explanation

   ## Acceptance Criteria
   - [ ] Criterion derived from finding 1
   - [ ] Criterion derived from finding 2
   - [ ] All changes pass existing tests

   ## Context
   Generated from codebase review on YYYY-MM-DD.
   Related: #issue_numbers (if applicable)
   ```
3. 施標：嚴重標 + 主題標 + 任何自訂標
4. 若發引特文件，於體中提（非作為指派者）

**得：** 每議題有清題、有嚴重徽之號發、勾驗收、合宜之標。

**敗則：** 若體逾 GitHub 議題尺限（65536 字），分議題並交叉參。

### 第四步：建議題

以 `gh` CLI 建議題並報結果。

1. 若 `dry_run` 為真，印每議題之題與體而不建，即止
2. 每構成議題，建之：
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. 記每建議題之 URL
4. 諸議題建後，印概表：`#number | Title | Labels | Findings count`
5. 若議題宜有序，增交叉參：編第一議題以言「Blocked by #X」或「See also #Y」

**得：** 諸議題皆建成。概表含議題號與 URL 已印。

**敗則：** 若個別議題建敗，記誤而繼。終報諸敗。常見敗：認證過期、標不存（若 `create_labels` 為假）、網超時。

## 驗

- [ ] 諸發至少現於一議題
- [ ] 每議題有至少一標
- [ ] 每議題有勾驗收
- [ ] 無重議題建（題與現開議題較）
- [ ] 議題數合發數（大集非 1:1）
- [ ] 概表已印含諸議題 URL

## 陷

- **議題蔓延**：每發一議題則有 20+ 議題難管。宜積極合——全審 5-10 議題為宜
- **缺驗收**：無勾之議題無從驗畢。每發宜映至少一勾
- **標混**：標過多則濾無用。守嚴重 + 主題，勿每發一標
- **陳引**：由舊審建議題時，建前驗發猶適。碼或已變
- **忘 dry_run**：大發集前宜 `dry_run: true` 預覽。改劃易於閉 15 錯議題

## 參

- `review-codebase` — 生此技所耗之發表
- `review-pull-request` — 生 PR 範圍之發亦可轉為議題
- `manage-backlog` — 建後將議題組入衝與優先
- `create-pull-request` — 建 PR 引並閉議題
- `commit-changes` — 提交解議題之修
