---
name: create-github-issues
locale: wenyan-ultra
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

自評見或任分結構建 GitHub 議題。化見列（自 `review-codebase`、`security-audit-codebase` 或手析）為含標、驗準、交引之正議題。

## 用

- 碼評生須跟之見列後
- 謀議識須為議之工項後
- 轉 TODO 或備為可跟 GitHub 議
- 批建須一致式與標之關議

## 入

- **必**：`findings` — 項列，各至少含標與述。理亦含：嚴、影檔、建標
- **可**：
  - `group_by` — 如何批見為議：`severity`、`file`、`theme`（默：`theme`）
  - `label_prefix` — 自建標前綴（默：無）
  - `create_labels` — 是否建缺標（默：`true`）
  - `dry_run` — 不建僅預（默：`false`）

## 行

### 一：備標

保諸需標存於庫。

1. 列存標：`gh label list --limit 100`
2. 識見所需標（自嚴、階、或顯標欄）
3. 未映則映嚴至標：`critical`、`high-priority`、`medium-priority`、`low-priority`
4. 映階/題至標：`security`、`architecture`、`code-quality`、`accessibility`、`testing`、`performance`
5. `create_labels` 為 true→建缺標：`gh label create "name" --color "hex" --description "desc"`
6. 用一致色：紅為 critical/security、橙為 high、黃為 medium、藍為 architecture、綠為 testing

**得：** 見引之諸標存於庫。無重建標。

**敗：** `gh` CLI 未證→告用行 `gh auth login`。標建拒（權不足）→不建而記何標缺。

### 二：組見

批關見為議以避議蔓。

1. `group_by` 為 `theme`→按階或類組見（諸 security→1-2 議、諸 a11y→1 議）
2. `group_by` 為 `severity`→按嚴組（諸 CRITICAL→1 議、諸 HIGH→1 議）
3. `group_by` 為 `file`→按主影檔組
4. 組內按嚴序（CRITICAL 先）
5. 組過 8 見→按子題分子組
6. 各組為一 GitHub 議

**得：** 議組集、各含 1-8 關見。議總數可理（全碼評典型 5-15）。

**敗：** 見無組備→退為一見一議。小集（< 10）可、大集則生過多議。

### 三：組議

以標模築各議。

1. **Title**：`[Severity] Theme: Brief description` — 如 `[HIGH] Security: Eliminate innerHTML injection in panel.js`
2. **Body** 構：
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
3. 施標：嚴標+題標+任自定標
4. 見引具檔→於體提之（非為指派）

**得：** 各議含明標、含嚴徽之編見、驗準勾、合標。

**敗：** 體過 GitHub 議寸限（65536 字符）→分議為部、交引之。

### 四：建議

以 `gh` CLI 建議並報果。

1. `dry_run` 為 true→印各議標與體而不建，止
2. 各組議建之：
   ```bash
   gh issue create --title "title" --body "$(cat <<'EOF'
   body content
   EOF
   )" --label "label1,label2"
   ```
3. 記各建議之 URL
4. 諸議建後印結表：`#number | Title | Labels | Findings count`
5. 議須序→加交引：編首議提「Blocked by #X」或「See also #Y」

**得：** 諸議建成。結表含議號與 URL 印。

**敗：** 單議建敗→誌誤續。終報敗。常敗：證逾、標缺（`create_labels` 為 false）、網超時。

## 驗

- [ ] 諸見現於至少一議
- [ ] 各議含至少一標
- [ ] 各議含驗準勾
- [ ] 無重議（察標與存開議）
- [ ] 議數合見數（大集非 1:1）
- [ ] 結表含諸議 URL 印

## 忌

- **議蔓**：一見一議生 20+ 議難理。積極組——全評 5-10 議為理想
- **缺驗準**：議無勾不可驗畢。各見當映至少一勾
- **標亂**：過多標濾無用。限於嚴+題、非一見一標
- **陳引**：自舊評建議→建前驗見仍適。碼或變
- **忘試行**：大見集→必先以 `dry_run: true` 預。編謀易於閉 15 誤議

## 參

- `review-codebase` — 生此技消之見列
- `review-pull-request` — 生 PR 範見亦可化為議
- `manage-backlog` — 建後組議為 sprints 與優先
- `create-pull-request` — 建引並閉議之 PR
- `commit-changes` — 承解議之修
