---
name: create-github-issues
locale: wenyan-lite
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

# 造 GitHub 議題

自審查發現或任務分解結構化造 GitHub 議題。將發現清單（自 `review-codebase`、`security-audit-codebase` 或手動分析）轉為合格之 GitHub 議題，含標籤、接受標準、交叉引用。

## 適用時機

- 程式庫審查產待追之發現表後
- 規劃會議辨出應成議題之工作項後
- 將 TODO 清單或積壓轉為可追之 GitHub 議題時
- 批次造相關議題，需一致之格式與標籤時

## 輸入

- **必要**：`findings` — 一項目清單，至少含標題與描述。理想亦含：嚴重度、涉及檔、建議標籤
- **選擇性**：
  - `group_by` — 如何將發現批入議題：`severity`、`file`、`theme`（預設：`theme`）
  - `label_prefix` — 自動造之標籤前綴（預設：無）
  - `create_labels` — 是否造缺之標籤（預設：`true`）
  - `dry_run` — 預覽議題而不造之（預設：`false`）

## 步驟

### 步驟一：備標籤

確保倉中有所需標籤。

1. 列既存標籤：`gh label list --limit 100`
2. 辨發現所需標籤（自嚴重度、階段、或明列之標籤欄）
3. 若未映射嚴重度於標籤，映之：`critical`、`high-priority`、`medium-priority`、`low-priority`
4. 映階段/主題於標籤：`security`、`architecture`、`code-quality`、`accessibility`、`testing`、`performance`
5. 若 `create_labels` 為真，造缺之標籤：`gh label create "name" --color "hex" --description "desc"`
6. 用一致色：危急/安全用紅、高用橘、中用黃、架構用藍、測試用綠

**預期：** 發現所引之標籤皆存於倉。無重複標籤造出。

**失敗時：** 若 `gh` CLI 未認證，令用戶行 `gh auth login`。若標籤造被拒（權限不足），不造標籤而續，記缺之標籤。

### 步驟二：組發現

批相關發現入合邏輯之議題以避議題蔓延。

1. 若 `group_by` 為 `theme`：按階段或類別組之（所有安全發現 → 1-2 議題、所有 a11y → 1 議題）
2. 若 `group_by` 為 `severity`：按嚴重度組之（所有 CRITICAL → 1 議題、所有 HIGH → 1 議題）
3. 若 `group_by` 為 `file`：按主要涉及檔組之
4. 各組內按嚴重度序（CRITICAL 先）
5. 若一組過 8 發現，按子主題分為子組
6. 各組為一 GitHub 議題

**預期：** 一組議題群，各含 1-8 相關發現。議題總數當可管（全庫審查典型為 5-15）。

**失敗時：** 若發現無組織元資料，回退為每發現一議題。此於少發現（< 10）可接受，於多發現則生過多議題。

### 步驟三：造議題

以標準範本建各議題。

1. **標題**：`[Severity] Theme: Brief description` —— 如 `[HIGH] Security: Eliminate innerHTML injection in panel.js`
2. **正文**結構：
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
3. 施標籤：嚴重度標籤 + 主題標籤 + 任何自訂標籤
4. 若發現指特定檔，於正文述之（非為指派人）

**預期：** 各議題有明標題、帶嚴重度標之編號發現、可勾之接受標準、當之標籤。

**失敗時：** 若正文過 GitHub 議題大小限（65536 字），分議題為部並交叉引用之。

### 步驟四：造議題

以 `gh` CLI 造議題並報結果。

1. 若 `dry_run` 為真，列各議題標題與正文而不造，止
2. 各組成之議題，造之：
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. 記各已造議題之 URL
4. 所有議題造成後，印摘要表：`#number | Title | Labels | Findings count`
5. 若議題當有序，加交叉引用：編第一議題以述「Blocked by #X」或「See also #Y」

**預期：** 所有議題成造。印含議題編號與 URL 之摘要表。

**失敗時：** 若某議題造敗，記誤而續他議題。於末報敗。常見敗：認證過期、標籤不存（若 `create_labels` 為假）、網路逾時。

## 驗證

- [ ] 所有發現皆現於至少一議題
- [ ] 各議題有至少一標籤
- [ ] 各議題有勾選式接受標準
- [ ] 無造重複議題（察標題與既開議題）
- [ ] 議題數合發現數（多發現時非 1:1）
- [ ] 已印含所有議題 URL 之摘要表

## 常見陷阱

- **議題蔓延**：每發現造一議題生 20+ 議題，難管。宜積極組之——全審查 5-10 議題為佳
- **缺接受標準**：無勾選框之議題無法驗為完。各發現當映至少一勾選框
- **標籤之亂**：造過多標籤令過濾無用。守嚴重度 + 主題，勿逐發現之標籤
- **陳舊之引**：若自舊審查造議題，造前驗發現仍適用。程式或已改
- **忘 dry run**：大發現集恒先以 `dry_run: true` 預覽。改計畫易於關 15 誤議題

## 相關技能

- `review-codebase` —— 產此技能所消之發現表
- `review-pull-request` —— 產 PR 範圍之發現，亦可轉為議題
- `manage-backlog` —— 造議題後組之為衝刺與優先級
- `create-pull-request` —— 造 PR 以引用並關議題
- `commit-changes` —— 提交解議題之修正
