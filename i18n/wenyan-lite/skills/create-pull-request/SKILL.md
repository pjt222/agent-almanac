---
name: create-pull-request
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Create and manage pull requests using GitHub CLI. Covers branch
  preparation, writing PR titles and descriptions, creating PRs,
  handling review feedback, and merge/cleanup workflows. Use when
  proposing changes from a feature or fix branch for review, merging
  completed work into the main branch, requesting code review from
  collaborators, or documenting the purpose and scope of a set of
  changes.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: github, pull-request, code-review, gh-cli, collaboration
---

# 造拉取請求

造 GitHub 拉取請求，含明標題、結構化描述、得宜之分支立。

## 適用時機

- 自功能或修正分支提改以供審
- 將已完工作併入主分支
- 請協作者行程式審查
- 記一組改動之目的與範圍

## 輸入

- **必要**：含已提交之改動之功能分支
- **必要**：合併至之基底分支（常為 `main`）
- **選擇性**：待請之審者
- **選擇性**：標籤或里程碑
- **選擇性**：草稿狀態

## 步驟

### 步驟一：確保分支已備

驗分支與基底分支同步且所有改動已提交：

```bash
# Check for uncommitted changes
git status

# Fetch latest from remote
git fetch origin

# Rebase on latest main (or merge)
git rebase origin/main
```

**預期：** 分支超前 `origin/main`，無未提交之改動且無衝突。

**失敗時：** 若 rebase 衝突，解之（見 `resolve-git-conflicts` 技能），繼以 `git rebase --continue`。若分支顯著分歧，考慮 `git merge origin/main` 代之。

### 步驟二：察分支上所有改動

察 PR 所含之全差異與提交歷史：

```bash
# See all commits on this branch (not on main)
git log origin/main..HEAD --oneline

# See the full diff against main
git diff origin/main...HEAD

# Check if branch tracks remote and is pushed
git status -sb
```

**預期：** 所有提交與 PR 相關。差異僅顯所欲之改動。

**失敗時：** 若有不相關之提交，考慮互動 rebase 以清歷史，再造 PR。

### 步驟三：推分支

```bash
# Push branch to remote (set upstream tracking)
git push -u origin HEAD
```

**預期：** 分支現於 GitHub 遠端。

**失敗時：** 若推被拒，先以 `git pull --rebase origin <branch>` 拉並解任何衝突。

### 步驟四：寫 PR 標題與描述

標題守於 70 字以內。用正文述細節：

```bash
gh pr create --title "Add weighted mean calculation" --body "$(cat <<'EOF'
## Summary
- Implement `weighted_mean()` with NA handling and zero-weight filtering
- Add input validation for mismatched vector lengths
- Include unit tests covering edge cases

## Test plan
- [ ] `devtools::test()` passes with no failures
- [ ] Manual verification with example data
- [ ] Edge cases: empty vectors, all-NA weights, zero-length input

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

草稿 PR：

```bash
gh pr create --title "WIP: Add authentication" --body "..." --draft
```

**預期：** PR 造於 GitHub 且返 URL。描述明述改動與測法。

**失敗時：** 若 `gh` 未認證，行 `gh auth login`。若基底分支誤，以 `--base main` 指定。

### 步驟五：處審查回饋

應審查意見並推更新：

```bash
# View PR comments
gh api repos/{owner}/{repo}/pulls/{number}/comments

# View PR review status
gh pr checks

# After making changes, commit and push
git add <files>
git commit -m "$(cat <<'EOF'
fix: address review feedback on input validation

EOF
)"
git push
```

**預期：** 新提交顯於 PR。審查意見已處。

**失敗時：** 若推後 CI 察敗，以 `gh pr checks` 察檢查輸出，修之再請重審。

### 步驟六：合併與清

核准後：

```bash
# Merge the PR (squash merge keeps history clean)
gh pr merge --squash --delete-branch

# Or merge with all commits preserved
gh pr merge --merge --delete-branch

# Or rebase merge (linear history)
gh pr merge --rebase --delete-branch
```

合併後更本地 main：

```bash
git checkout main
git pull origin main
```

**預期：** PR 已合、遠端分支已刪、本地 main 已更。

**失敗時：** 若合被失敗檢查或缺核准所阻，先處之。勿未解阻礙而強制合併。

## 驗證

- [ ] PR 標題簡（70 字內）且述性
- [ ] PR 正文含改動摘要與測計畫
- [ ] 分支上所有提交與 PR 相關
- [ ] CI 察皆通
- [ ] 分支與基底分支同步
- [ ] 審者已指（若倉設要求）
- [ ] 差異中無敏感資料

## 常見陷阱

- **PR 過大**：PR 守於單功能或修正。大 PR 難審且易生合併衝突
- **缺測計畫**：恒述改動可如何驗，即文件 PR 亦然
- **陳舊分支**：若基底分支顯著前行，造 PR 前 rebase 以減合併衝突
- **審中強制推**：避對有開放審查意見之分支強制推。推新提交令審者見漸進改動
- **不讀 CI 輸出**：請重審前察 `gh pr checks`。敗 CI 耗審者之時
- **忘刪分支**：合併時用 `--delete-branch` 以保遠端清

## 相關技能

- `commit-changes` - 為 PR 造提交
- `manage-git-branches` - 分支造與命名慣例
- `resolve-git-conflicts` - rebase/合併中之衝突處
- `create-github-release` - 合併後之發布
