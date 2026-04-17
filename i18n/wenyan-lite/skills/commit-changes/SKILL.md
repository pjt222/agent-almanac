---
name: commit-changes
description: >
  Stage, commit, and amend changes with conventional commit messages.
  Covers reviewing changes, selective staging, writing descriptive
  commit messages using HEREDOC format, and verifying commit history. Use
  when saving a logical unit of work to version control, creating a commit
  with a conventional message, amending the most recent commit, or
  reviewing staged changes before committing.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, commit, staging, conventional-commits, version-control
  locale: wenyan-lite
  source_locale: en
  source_commit: 1861e6a6
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-04-17"
---

# 提交變更

選擇性暫存文件、撰寫清晰的提交訊息，並驗證提交歷史。

## 適用時機

- 將一個邏輯工作單元保存至版本控制
- 以描述性、符合慣例的訊息建立提交
- 修訂最近一次提交（訊息或內容）
- 提交前審查將納入提交的變更

## 輸入

- **必要**：一個或多個待提交的變更文件
- **選擇性**：提交訊息（若未提供則代為擬定）
- **選擇性**：是否修訂前次提交
- **選擇性**：共同作者標註

## 步驟

### 步驟一：審查當前變更

檢查工作樹狀態並察看差異：

```bash
# See which files are modified, staged, or untracked
git status

# See unstaged changes
git diff

# See staged changes
git diff --staged
```

**預期：** 清晰呈現所有已修改、已暫存與未追蹤的文件。

**失敗時：** 若 `git status` 失敗，驗證當前是否位於 git 倉庫內（`git rev-parse --is-inside-work-tree`）。

### 步驟二：選擇性暫存文件

以具名方式暫存特定文件，避免使用 `git add .` 或 `git add -A`，以免意外納入敏感文件或無關變更：

```bash
# Stage specific files by name
git add src/feature.R tests/test-feature.R

# Stage all changes in a specific directory
git add src/

# Stage parts of a file interactively (not supported in non-interactive contexts)
# git add -p filename
```

提交前審查已暫存內容：

```bash
git diff --staged
```

**預期：** 僅有預期的文件與變更被暫存。無 `.env`、憑證或大型二進制文件。

**失敗時：** 以 `git reset HEAD <file>` 取消暫存誤加的文件。若敏感資料已暫存，提交前立即取消暫存。

### 步驟三：撰寫提交訊息

採用慣例式提交格式。務必透過 HEREDOC 傳入訊息以確保格式正確：

```bash
git commit -m "$(cat <<'EOF'
feat: add weighted mean calculation

Implements weighted_mean() with support for NA handling and
zero-weight filtering. Includes input validation for mismatched
vector lengths.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

慣例式提交類型：

| 類型 | 使用時機 |
|------|----------|
| `feat` | 新功能 |
| `fix` | 錯誤修復 |
| `docs` | 僅文件 |
| `test` | 新增或更新測試 |
| `refactor` | 既不修復亦不新增功能之代碼變更 |
| `chore` | 構建、CI、依賴更新 |
| `style` | 格式、空白（無邏輯變更） |

**預期：** 提交已建立，訊息具描述性，說明*為何*而非僅*何事*。

**失敗時：** 若 pre-commit 鉤子失敗，修復問題，以 `git add` 重新暫存，並建立**新**提交（勿用 `--amend`，因失敗的提交從未建立）。

### 步驟四：修訂最後一次提交（選擇性）

僅在提交**尚未**推送至共享遠端時修訂：

```bash
# Amend message only
git commit --amend -m "$(cat <<'EOF'
fix: correct weighted mean edge case for empty vectors

EOF
)"

# Amend with additional staged changes
git add forgotten-file.R
git commit --amend --no-edit
```

**預期：** 前次提交已就地更新。`git log -1` 顯示修訂後的內容。

**失敗時：** 若提交已推送，勿修訂。改建新提交。對共享分支強制推送已修訂提交會造成歷史分歧。

### 步驟五：驗證提交

```bash
# View the last commit
git log -1 --stat

# View recent commit history
git log --oneline -5

# Verify the commit content
git show HEAD
```

**預期：** 提交以正確的訊息、作者與文件變更出現於歷史中。

**失敗時：** 若提交包含錯誤文件，用 `git reset --soft HEAD~1` 撤銷提交同時保留暫存變更，再重新正確提交。

## 驗證

- [ ] 僅預期文件納入提交
- [ ] 無敏感資料（權杖、密碼、`.env` 文件）被提交
- [ ] 提交訊息遵循慣例式提交格式
- [ ] 訊息主體說明變更之*因由*
- [ ] `git log` 顯示提交具正確元資料
- [ ] Pre-commit 鉤子（如有）已通過

## 常見陷阱

- **一次提交過多**：每次提交應代表一個邏輯變更。將無關變更拆分為獨立提交。
- **盲目使用 `git add .`**：務必先審查 `git status`。優先以具名方式暫存特定文件。
- **修訂已推送提交**：切勿修訂已推送至共享分支的提交。此舉改寫歷史，為協作者帶來困擾。
- **模糊的提交訊息**：「修復錯誤」或「更新」毫無訊息量。描述變更了什麼及為何。
- **內容修訂時遺漏 `--no-edit`**：將遺漏文件加入最後一次提交時，用 `--no-edit` 保留既有訊息。
- **鉤子失敗後使用 `--amend`**：當 pre-commit 鉤子失敗，提交從未建立。使用 `--amend` 將修改*前次*提交。修復鉤子問題後應建立新提交。

## 相關技能

- `manage-git-branches` — 提交前的分支工作流程
- `create-pull-request` — 提交後的下一步
- `resolve-git-conflicts` — 處理合併或 rebase 時的衝突
- `configure-git-repository` — 倉庫設置與慣例
