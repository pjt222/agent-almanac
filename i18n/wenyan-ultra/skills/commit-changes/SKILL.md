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
  locale: wenyan-ultra
  source_locale: en
  source_commit: 1861e6a6
  translator: "Julius Brussee homage — caveman"
  translation_date: "2026-04-17"
---

# 提交

擇檔、書訊、驗史也。

## 用

- 存工於控→用
- 書規範訊→用
- 改末提交→用
- 提前覆察→用

## 入

- **必**：變檔若干
- **可**：提交訊（未給則代擬）
- **可**：改前乎
- **可**：共作屬

## 行

### 一：察變

查樹態、視差也：

```bash
# See which files are modified, staged, or untracked
git status

# See unstaged changes
git diff

# See staged changes
git diff --staged
```

得：諸變、擇、未追之檔皆明。

敗：`git status` 敗→驗於庫內（`git rev-parse --is-inside-work-tree`）。

### 二：擇檔

勿用 `git add .` 或 `git add -A`，擇檔以免誤入密檔或雜變：

```bash
# Stage specific files by name
git add src/feature.R tests/test-feature.R

# Stage all changes in a specific directory
git add src/

# Stage parts of a file interactively (not supported in non-interactive contexts)
# git add -p filename
```

提前察擇：

```bash
git diff --staged
```

得：唯意之檔與變入擇。無 `.env`、密、巨檔也。

敗：誤入→ `git reset HEAD <file>` 撤。密入→立撤乃提。

### 三：書訊

用規範提交式。必以 HEREDOC 傳訊以正格：

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

規範類型：

| Type | When to use |
|------|-------------|
| `feat` | 新功 |
| `fix` | 除錯 |
| `docs` | 僅文 |
| `test` | 增更驗 |
| `refactor` | 重構無增減 |
| `chore` | 建、CI、依更 |
| `style` | 排版空白（無邏輯變） |

得：提交成，訊述「何以」，非僅「何」也。

敗：預提鉤敗→修、重 `git add`、建**新**提交（勿 `--amend`，敗提未生也）。

### 四：改末提交（可）

未推共遠方可改：

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

得：前提交就地更。`git log -1` 示改後容。

敗：已推→勿改。建新提交代之。強推改提→史分歧。

### 五：驗提交

```bash
# View the last commit
git log -1 --stat

# View recent commit history
git log --oneline -5

# Verify the commit content
git show HEAD
```

得：提交顯於史，訊、作者、檔變皆正。

敗：檔誤→ `git reset --soft HEAD~1` 撤而留擇、乃重提正。

## 驗

- [ ] 唯意之檔入提交
- [ ] 無密（令牌、密碼、`.env`）入
- [ ] 訊合規範式
- [ ] 訊體述「何以」
- [ ] `git log` 示正元
- [ ] 預提鉤（若存）皆過

## 忌

- **一提過多**：一提一邏變。無關者分之
- **盲用 `git add .`**：必先察 `git status`。宜按名擇
- **改已推**：永勿改推共枝。重寫史害同作
- **訊含糊**：「修錯」「更新」無益。述何變、何以
- **忘 `--no-edit`**：補忘檔入末提→用 `--no-edit` 存舊訊
- **鉤敗而 `--amend`**：鉤敗則提未生。`--amend` 改**前**提。修鉤後必建新提

## 參

- `manage-git-branches` - 提前枝工
- `create-pull-request` - 提後下步
- `resolve-git-conflicts` - 合併/改基衝突
- `configure-git-repository` - 庫設與規
