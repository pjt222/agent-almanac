---
name: create-pull-request
locale: wenyan-ultra
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

# 造拉請

建含明標、結述、正枝設之 GitHub 拉請。

## 用

- 自能或修枝提變以評
- 併畢工於主枝
- 求合作碼評
- 備一組變之目與範

## 入

- **必**：含承變之能枝
- **必**：併入基枝（常 `main`）
- **可**：求評者
- **可**：標或里程
- **可**：草態

## 行

### 一：保枝備

驗枝與基枝同且諸變已承：

```bash
# Check for uncommitted changes
git status

# Fetch latest from remote
git fetch origin

# Rebase on latest main (or merge)
git rebase origin/main
```

**得：** 枝先於 `origin/main` 無未承變且無衝。

**敗：** Rebase 衝→解（見 `resolve-git-conflicts`）、續 `git rebase --continue`。枝大漂→考 `git merge origin/main`。

### 二：評枝上諸變

察 PR 中將含之全差與承：

```bash
# See all commits on this branch (not on main)
git log origin/main..HEAD --oneline

# See the full diff against main
git diff origin/main...HEAD

# Check if branch tracks remote and is pushed
git status -sb
```

**得：** 諸承皆合 PR。差僅顯意變。

**敗：** 含無關承→考互動 rebase 清史後建 PR。

### 三：推枝

```bash
# Push branch to remote (set upstream tracking)
git push -u origin HEAD
```

**得：** 枝現於 GitHub 遠。

**敗：** 推拒→先 `git pull --rebase origin <branch>` 解衝。

### 四：書 PR 標與述

標 70 字符內。體為細：

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

草 PR：

```bash
gh pr create --title "WIP: Add authentication" --body "..." --draft
```

**得：** PR 於 GitHub 建、返 URL。述明達何變與試法。

**敗：** `gh` 未證→行 `gh auth login`。基枝誤→以 `--base main` 指。

### 五：理評回

應評論、推更：

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

**得：** 新承現於 PR。評論已應。

**敗：** 推後 CI 敗→以 `gh pr checks` 讀出、修問再求重評。

### 六：併與清

通過後：

```bash
# Merge the PR (squash merge keeps history clean)
gh pr merge --squash --delete-branch

# Or merge with all commits preserved
gh pr merge --merge --delete-branch

# Or rebase merge (linear history)
gh pr merge --rebase --delete-branch
```

併後更地 main：

```bash
git checkout main
git pull origin main
```

**得：** PR 已併、遠枝刪、地 main 更。

**敗：** 併為敗察或缺核阻→先治。勿強併跨阻。

## 驗

- [ ] PR 標簡（70 字符內）且述
- [ ] PR 體含變結與試謀
- [ ] 枝上諸承皆關 PR
- [ ] CI 察通
- [ ] 枝與基枝同
- [ ] 評者已指（若庫設需）
- [ ] 差無敏感

## 忌

- **PR 過大**：PR 當專於單能或修。大 PR 難評而易衝
- **缺試謀**：恆述如何驗變、備 PR 亦然
- **陳枝**：基枝大前→建 PR 前 rebase 以減衝
- **評中強推**：避強推於含開評之枝。推新承使評者見漸變
- **不讀 CI 出**：求重評前察 `gh pr checks`。敗 CI 費評者時
- **忘刪枝**：併用 `--delete-branch` 保遠潔

## 參

- `commit-changes` - 為 PR 建承
- `manage-git-branches` - 枝建與命規
- `resolve-git-conflicts` - rebase/merge 中衝
- `create-github-release` - 併後發
