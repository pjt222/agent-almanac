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
  locale: wenyan
  source_locale: en
  source_commit: 1861e6a6
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-04-17"
---

# 提交變更

擇文件入列，書簡明之辭以提交，驗其錄之可徵。

## 用時

- 納一完整之勞於版控乃用
- 以合範之辭立提交乃用
- 修最近之提交（辭或其內）乃用
- 提交之前察已入列者乃用

## 入

- **必要**：一或數已變之文件
- **可選**：提交之辭（若闕則代擬之）
- **可選**：是否修前提交
- **可選**：合著者之署

## 法

### 第一步：察當前之變

察工作樹之狀、閱其差異。

```bash
# See which files are modified, staged, or untracked
git status

# See unstaged changes
git diff

# See staged changes
git diff --staged
```

得：凡已改、已列、未錄之文件皆了然。

敗則：若 `git status` 敗，驗所處是否為 git 庫內（`git rev-parse --is-inside-work-tree`）。

### 第二步：擇文件入列

宜擇名而入之，勿濫用 `git add .` 或 `git add -A`，以防誤納密物或無關之變。

```bash
# Stage specific files by name
git add src/feature.R tests/test-feature.R

# Stage all changes in a specific directory
git add src/

# Stage parts of a file interactively (not supported in non-interactive contexts)
# git add -p filename
```

提交之前，察已入列者。

```bash
git diff --staged
```

得：所入者唯所欲之文件與變，無 `.env`、無憑據、無巨檔。

敗則：若誤入者，以 `git reset HEAD <file>` 出之。若密物已列，立時出之，勿提交。

### 第三步：書提交之辭

依合範之式書之。辭必以 HEREDOC 傳，以全其格。

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

合範之類：

| 類 | 用時 |
|------|-------------|
| `feat` | 新功 |
| `fix` | 修訛 |
| `docs` | 獨書文檔 |
| `test` | 增或更試 |
| `refactor` | 變碼而不修不增 |
| `chore` | 建構、CI、依賴之更 |
| `style` | 修其形、空白（無邏輯之變） |

得：提交已立，辭敘*其故*，不徒述*其形*。

敗則：若提交前掛鈎敗，修其因，以 `git add` 再入列，立**新**提交（勿用 `--amend`，蓋敗之提交未嘗立也）。

### 第四步：修前提交（可選）

唯前提交**未**推至共有之遠端，方可修之。

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

得：前提交原地已更。`git log -1` 示其修後之容。

敗則：若提交已推，勿修之。代之以新提交。強推已修之提交於共有之枝，致史分歧。

### 第五步：驗其提交

```bash
# View the last commit
git log -1 --stat

# View recent commit history
git log --oneline -5

# Verify the commit content
git show HEAD
```

得：提交現於史中，辭正、著者正、文件之變亦正。

敗則：若提交所含之文件有誤，以 `git reset --soft HEAD~1` 撤之而留其變於列，再正而提之。

## 驗

- [ ] 所納之文件唯所欲者
- [ ] 無密物（令牌、密碼、`.env`）入庫
- [ ] 提交之辭合範
- [ ] 辭之本文敘變之*故*
- [ ] `git log` 示提交附正確之屬
- [ ] 提交前掛鈎（若有）皆過

## 陷

- **一提而納過繁**：每一提交宜為一邏輯之變。無關之變宜分提之。
- **盲用 `git add .`**：必先察 `git status`。宜擇名而入之。
- **修已推之提交**：已推至共枝者，勿修之。此重寫其史，貽害於同工者。
- **辭之空泛**：「修訛」「更之」無所言也。宜述何變、何故。
- **內容修而忘 `--no-edit`**：補遺檔於前提交，宜用 `--no-edit` 以存舊辭。
- **掛鈎敗而用 `--amend`**：掛鈎敗則提交未立。用 `--amend` 反改*前*提交。掛鈎修後，必立新提交。

## 參

- `manage-git-branches` — 提交前之枝務
- `create-pull-request` — 提交後之下步
- `resolve-git-conflicts` — 合併或變基時解其衝突
- `configure-git-repository` — 庫之設與其範
