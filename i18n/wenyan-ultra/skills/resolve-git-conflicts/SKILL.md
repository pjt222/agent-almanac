---
name: resolve-git-conflicts
locale: wenyan-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Resolve merge and rebase conflicts with safe recovery strategies.
  Covers identifying conflict sources, reading conflict markers,
  choosing resolution strategies, and continuing or aborting operations
  safely. Use when a git merge, rebase, cherry-pick, or stash pop reports
  conflicts, when a git pull results in conflicting changes, or when you
  need to safely abort and restart a failed merge or rebase operation.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: git, merge-conflicts, rebase, conflict-resolution, version-control
---

# 解 Git 衝

識、解、復合與基衝。

## 用

- `git merge` 或 `git rebase` 報衝
- `git cherry-pick` 不能潔施
- `git pull` 致衝變
- `git stash pop` 與工樹衝

## 入

- **必**：庫有活衝
- **可**：偏解策（ours、theirs、手）
- **可**：何變優之脈

## 行

### 一：識衝源

定何業致衝：

```bash
# Check current status
git status

# Look for indicators:
# "You have unmerged paths" — merge conflict
# "rebase in progress" — rebase conflict
# "cherry-pick in progress" — cherry-pick conflict
```

態出告何檔有衝、何業進行。

得：`git status` 示檔列於「Unmerged paths」並指活業。

敗：`git status` 示潔樹而期衝→業或已畢或棄。察 `git log` 為近活。

### 二：讀衝標

開各衝檔尋衝標：

```
<<<<<<< HEAD
// Your current branch's version
const result = calculateWeightedMean(data, weights);
=======
// Incoming branch's version
const result = computeWeightedAverage(data, weights);
>>>>>>> feature/rename-functions
```

- `<<<<<<< HEAD` 至 `=======`：今枝（或汝改基所至枝）
- `=======` 至 `>>>>>>>`：來變（合枝或施提交）

得：各衝檔含一或多塊有 `<<<<<<<`、`=======`、`>>>>>>>` 標。

敗：無標而檔示衝→衝或為二進檔或刪對改之衝。察 `git diff --name-only --diff-filter=U` 為全列。

### 三：擇解策

**手合**（最常）：編檔合二變、後除諸衝標。

**受我**（留今枝版）：

```bash
# For a single file
git checkout --ours path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --ours .
git add -A
```

**受彼**（留來枝版）：

```bash
# For a single file
git checkout --theirs path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --theirs .
git add -A
```

得：解後、檔含正合容、無餘衝標。

敗：擇誤側→自合基重讀衝版。合中、`git checkout -m path/to/file` 重建衝標以再試。

### 四：標檔已解

各衝檔編後：

```bash
# Stage the resolved file
git add path/to/resolved-file.R

# Check remaining conflicts
git status
```

「Unmerged paths」下諸檔皆復。

得：諸檔自「Unmerged paths」移至「Changes to be committed」。任檔無餘衝標。

敗：`git add` 敗或標餘→重開檔、確 `<<<<<<<`、`=======`、`>>>>>>>` 諸行皆除。

### 五：續業

諸衝既解：

**為合**：

```bash
git commit
# Git auto-populates the merge commit message
```

**為改基**：

```bash
git rebase --continue
# May encounter more conflicts on subsequent commits — repeat steps 2-4
```

**為 cherry-pick**：

```bash
git cherry-pick --continue
```

**為 stash pop**：

```bash
# Stash pop conflicts don't need a continue — just commit or reset
git add .
git commit -m "Apply stashed changes with conflict resolution"
```

得：業畢。`git status` 示潔工樹（或改基中移至次提交）。

敗：續命敗→察 `git status` 為餘未解檔。諸衝必解乃可續。

### 六：需則棄

解過複或法誤→安棄：

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort

# Abort cherry-pick
git cherry-pick --abort
```

得：庫返業始前態。無數失。

敗：棄敗（罕）→察 `git reflog` 尋業前提交、`git reset --hard <commit>` 復之。慎用——此棄未提交變。

### 七：驗解

業畢後：

```bash
# Verify clean working tree
git status

# Check that the merge/rebase result is correct
git log --oneline -5
git diff HEAD~1

# Run tests to confirm nothing is broken
# (language-specific: devtools::test(), npm test, cargo test, etc.)
```

得：潔工樹、正合史、測過。

敗：解後測敗→合或引邏輯錯雖語衝解。慎審 diff 乃修。

## 驗

- [ ] 諸檔無衝標（`<<<<<<<`、`=======`、`>>>>>>>`）餘
- [ ] `git status` 示潔工樹
- [ ] 合/改基史於 `git log` 正
- [ ] 衝解後測過
- [ ] 無誤變引

## 忌

- **盲受一側**：`--ours` 或 `--theirs` 棄他側全。唯確一版全正乃用
- **碼留衝標**：常編後尋全檔餘標。部解破碼
- **改基中 amend**：互動改基中、勿 `--amend` 除非該步明命。用 `git rebase --continue` 代
- **棄失工**：`git rebase --abort` 與 `git merge --abort` 棄諸解工。唯欲重始乃棄
- **解後不測**：語潔合可邏輯誤。常行測
- **改基後強推**：改共枝基後、強推前協於同作、以其重寫史

## 參

- `commit-changes` - 衝解後提交
- `manage-git-branches` - 致衝之枝流
- `configure-git-repository` - 庫設與合策
