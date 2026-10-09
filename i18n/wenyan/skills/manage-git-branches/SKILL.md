---
name: manage-git-branches
locale: wenyan
source_locale: en
source_commit: aa73494d
fence_basis_commit: aa73494d
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-24"
description: >
  Create, track, switch, sync, and clean up Git branches. Covers
  naming conventions, safe branch switching with stash, upstream
  synchronization, and pruning merged branches. Use when starting work
  on a new feature or bug fix, switching between tasks on different
  branches, keeping a feature branch up to date with main, or cleaning
  up branches after merging pull requests.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.1"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, branches, branching-strategy, stash, remote-tracking
---

# 管 Git 枝

以一致命名建、換、同、清諸枝。

## 用時

- 啟新特性或修疵之工
- 於異枝之任間換
- 保特性枝於 main 為新
- 合併 pull request 後清枝
- 列並察諸枝

## 入

- **必要**：至少一提交之倉
- **可選**：枝之命名慣（預設：`type/description`）
- **可選**：新枝之基（預設：`main`）
- **可選**：遠端之名（預設：`origin`）

## 法

### 第一步：建特性之枝

用一致之命名慣：

| 頭 | 旨 | 例 |
|---|---|---|
| `feature/` | 新功 | `feature/add-weighted-mean` |
| `fix/` | 修疵 | `fix/null-pointer-in-parser` |
| `docs/` | 文件 | `docs/update-api-reference` |
| `refactor/` | 碼重構 | `refactor/extract-validation` |
| `chore/` | 維 | `chore/update-dependencies` |
| `test/` | 試加 | `test/add-edge-case-coverage` |

```bash
# Create and switch to a new branch from main
git checkout -b feature/add-weighted-mean main

# Or using the newer switch command
git switch -c feature/add-weighted-mean main
```

**得：**新枝已建並換。`git branch` 現新枝於星旁。

**敗則：**若基枝本地無，先取之：`git fetch origin main && git checkout -b feature/name origin/main`。

### 第二步：追遠端之枝

首推新枝時立追：

```bash
# Push and set upstream tracking
git push -u origin feature/add-weighted-mean

# Check tracking relationship
git branch -vv
```

取他人所建之遠端枝：

```bash
git fetch origin
git checkout feature/their-branch
# Git auto-creates a local tracking branch
```

**得：**本地枝追對應遠端枝。`git branch -vv` 現上游。

**敗則：**若自動追敗，手設之：`git branch --set-upstream-to=origin/feature/name feature/name`。

### 第三步：安換枝

換前，確工作樹淨：

```bash
# Check for uncommitted changes
git status
```

**若有變**，或提交或暫存：

```bash
# Option 1: Commit work in progress
git add <files>
git commit -m "wip: save progress on validation logic"

# Option 2: Stash changes temporarily
git stash push -m "validation work in progress"

# Switch branches
git checkout main

# Later, restore stashed changes
git checkout feature/add-weighted-mean
git stash pop
```

列並管暫存：

```bash
# List all stashes
git stash list

# Apply a specific stash (without removing it)
git stash apply stash@{1}

# Drop a stash
git stash drop stash@{0}
```

**得：**換枝成。工作樹反目標枝之態。暫存之變可復。

**敗則：**若未提交之變將被蓋而阻換，先暫存或提交。`git stash` 不暫未追之檔，除非用 `git stash push -u`。

### 第四步：與上游同

保特性枝於基枝為新：

```bash
# Fetch latest changes
git fetch origin

# Rebase onto latest main (preferred — keeps linear history)
git rebase origin/main

# Or merge main into your branch (creates merge commit)
git merge origin/main
```

**得：**枝今含 main 之新變。無衝突，或衝突已解（見 `resolve-git-conflicts`）。

**敗則：**若 rebase 致衝突，解之並 `git rebase --continue`。若衝突過複雜，以 `git rebase --abort` 止之並改用 `git merge origin/main`。

### 第五步：清已合之枝

PR 合後，除陳枝。先驗每枝之工已入 `main`，蓋 `git branch -d` 不答此問（見下敗則）。二者須並立。其一，託管之台須報 PR 已合入 `main`：`gh pr view <n> --json state,baseRefName,headRefOid,mergeCommit` 現 `MERGED` 與 `main`。其二，本地枝不得含 PR 所無者：`git merge-base --is-ancestor <branch> <headRefOid>` 退碼為 0。`headRefOid` 乃台所合之 PR 頭，故此一驗於 merge commit、squash merge、rebase merge 皆通。獨恃 PR 之態不足，因其不見 PR 未嘗有之本地提交。

退碼 1 者，枝含此類提交（末推之後所作，或遠端枝因強推而失者）：留其枝。退碼 128 者，PR 頭不在本地，如枝刪之前他人嘗推於此 PR：以 `git fetch origin refs/pull/<n>/head` 取之（枝刪後 GitHub 仍存此參），再行此驗。若為 merge commit，以合併提交驗祖系（即同一 `gh` 所出之 `mergeCommit.oid`，先行 `git fetch origin main`），亦答同問。squash merge 與改寫提交之 rebase merge，於此合併提交之驗必敗，蓋其提交皆新，不含枝之提交；然仍過 `headRefOid` 之驗。唯 `MERGED` 與退碼 0 並得，乃許刪。下碼塊列諸刪法以備參。驗既過，`git branch -D` 乃安；其 `-d` 一行若拒，即敗則所述之況。

```bash
# Delete a local branch that has been merged
git branch -d feature/add-weighted-mean

# Delete a local branch (force, even if not merged)
git branch -D feature/abandoned-experiment

# Delete a remote branch
git push origin --delete feature/add-weighted-mean

# Prune remote-tracking references for deleted remote branches
git fetch --prune
```

**得：**已合之枝於本地與遠端皆除。`git branch` 僅現活枝。

**敗則：**`git branch -d` 非合併之驗（#865, #900）。據 `git help branch`，枝須全合於其上游，若未設上游則須全合於 HEAD；實測（git 2.43），上游現為 `gone` 者視同無，故查 HEAD。由是，以 `-u` 推（第二步）且已全推之枝，無論嘗入 `main` 與否皆過：`-d` 刪之，退碼 0，唯於 stderr 印一警（`deleting branch … that has been merged to 'refs/remotes/origin/…', but not yet merged to HEAD`）。若依序行上碼塊，遠端枝亦隨之刪，無一參存其工。無上游之枝，以命令所行之工作樹之 HEAD 查之，故 HEAD 為含之之疊枝（stacked branch）時，`-d` 刪之，stderr 無一字。反之，凡所查之參缺枝頂，`-d` 拒刪*已*合之枝：遠端枝刪而上游既去，則所查乃 HEAD（如未更之本地 `main`）；或上游落後於枝頂，因枝頂自他處複本推出而本地未取。若枝頂先於上游，乃因有提交未嘗推，則非此況：其提交不在任何 PR，拒之乃正。squash 合併之枝，唯所查之參缺枝頂乃拒，如上游既去而查 HEAD；其自推之上游尚存，則 `-d` 刪之。二向之應皆同：行本步首之驗，唯驗過乃以 `git branch -D` 刪。

### 第六步：列並察枝

```bash
# List local branches
git branch

# List all branches (local and remote)
git branch -a

# List branches with last commit info
git branch -v

# List branches merged into main
git branch --merged main

# List branches NOT yet merged
git branch --no-merged main

# See which remote branch each local branch tracks
git branch -vv
```

**得：**諸枝、其態、與追關係皆明。

**敗則：**若遠端枝似陳，行 `git fetch --prune` 以清已刪遠端枝之參。

## 驗

- [ ] 枝名循所議命名慣
- [ ] 特性枝自正基枝所建
- [ ] 本地枝追其遠端對應
- [ ] 已合之枝已清（本地與遠端）
- [ ] 換枝前工作樹淨
- [ ] 暫存之變不遺孤

## 陷

- **直於 main 上工**：恆建特性枝。直提 main 致難建 PR 與協
- **枝前忘取**：自陳本地 main 建枝意自始已落。恆先 `git fetch origin`
- **長壽枝**：特性枝歷週積合併衝突。常同並保枝短壽
- **孤之暫存**：`git stash` 乃暫存。勿依之為長工。提交或建枝
- **刪未合之工**：二刪旗皆不可獨恃。`git branch -D` 不問合否皆刪；`git branch -d` 亦刪已全推於其上游之未合枝，或無上游時，當前 HEAD 所含而 `main` 不含之枝（且無警）。用其一之前，先行第五步首之驗：PR 已 `MERGED` 入 `main`，且 `git merge-base --is-ancestor <branch> <headRefOid>` 退碼為 0
- **不剪**：於 GitHub 刪之遠端枝本地仍現，至 `git fetch --prune` 乃清

## 參

- `commit-changes` — 於枝提交工
- `create-pull-request` — 自特性枝開 PR
- `resolve-git-conflicts` — 同步中處衝突
- `configure-git-repository` — 倉之設與枝之略
