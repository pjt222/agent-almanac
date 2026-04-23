---
name: create-pull-request
locale: wenyan
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

# 建拉請

建 GitHub 拉請，含清題、結構述、正分支設。

## 用時

- 由功或修分支提出變以審
- 將畢之工合入主分支
- 請協作者審碼
- 文記某變集之志與範

## 入

- **必要**：已提交變之功分支
- **必要**：合入之基分支（常為 `main`）
- **可選**：欲請之審者
- **可選**：標或里程碑
- **可選**：草稿狀

## 法

### 第一步：確分支已備

驗分支與基分支同步而諸變皆已提交：

```bash
# Check for uncommitted changes
git status

# Fetch latest from remote
git fetch origin

# Rebase on latest main (or merge)
git rebase origin/main
```

**得：** 分支於 `origin/main` 之前，無未提之變，無衝突。

**敗則：** 若 rebase 生衝突，解之（參 `resolve-git-conflicts` 技），再 `git rebase --continue`。若分支偏離甚，考 `git merge origin/main` 代。

### 第二步：察分支諸變

察將入 PR 之全差與提交史：

```bash
# See all commits on this branch (not on main)
git log origin/main..HEAD --oneline

# See the full diff against main
git diff origin/main...HEAD

# Check if branch tracks remote and is pushed
git status -sb
```

**得：** 諸提交皆與 PR 相關。差唯顯意圖之變。

**敗則：** 若有無關提交，考互動 rebase 清史後再建 PR。

### 第三步：推分支

```bash
# Push branch to remote (set upstream tracking)
git push -u origin HEAD
```

**得：** 分支現於 GitHub 遠。

**敗則：** 若推拒，先以 `git pull --rebase origin <branch>` 拉解衝。

### 第四步：書 PR 題與述

題守七十字以內。詳於體：

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

**得：** PR 建於 GitHub 返 URL。述清傳何變與何以試。

**敗則：** 若 `gh` 未認證，運 `gh auth login`。若基分支誤，以 `--base main` 明之。

### 第五步：處審饋

應審評而推更：

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

**得：** 新提交現於 PR。審評已應。

**敗則：** 若推後 CI 敗，以 `gh pr checks` 察出而修再請重審。

### 第六步：合而清

獲准後：

```bash
# Merge the PR (squash merge keeps history clean)
gh pr merge --squash --delete-branch

# Or merge with all commits preserved
gh pr merge --merge --delete-branch

# Or rebase merge (linear history)
gh pr merge --rebase --delete-branch
```

合後更本地 main：

```bash
git checkout main
git pull origin main
```

**得：** PR 已合，遠分支已刪，本地 main 已更。

**敗則：** 若合被敗檢或缺准所阻，先解之。勿強合於未解之阻。

## 驗

- [ ] PR 題簡（七十字以內）而具述
- [ ] PR 體含變概與試劃
- [ ] 分支諸提交皆與 PR 相關
- [ ] CI 檢過
- [ ] 分支與基分支同步
- [ ] 已指審者（若庫設需）
- [ ] 差無敏數

## 陷

- **PR 過大**：PR 宜專於一功或修。大 PR 難審易衝。
- **缺試劃**：皆述如何驗變，文件 PR 亦然。
- **陳分支**：若基分支已甚前行，建 PR 前先 rebase 以減衝。
- **審中強推**：有開審評之分支避強推。推新提交以令審者見漸變。
- **不讀 CI 出**：請重審前察 `gh pr checks`。敗 CI 費審者之時。
- **忘刪分支**：合用 `--delete-branch` 以保遠清。

## 參

- `commit-changes` — 為 PR 建提交
- `manage-git-branches` — 分支建與名慣
- `resolve-git-conflicts` — rebase／合之衝處
- `create-github-release` — 合後發布
