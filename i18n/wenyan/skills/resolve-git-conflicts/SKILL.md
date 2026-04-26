---
name: resolve-git-conflicts
locale: wenyan
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

# 解 Git 之衝

識、解、復合與變基之衝。

## 用時

- `git merge` 或 `git rebase` 報衝乃用
- `git cherry-pick` 不能淨施乃用
- `git pull` 致衝之變乃用
- `git stash pop` 與當工作樹衝乃用

## 入

- **必要**：含活衝之庫
- **可選**：宜之解策（ours、theirs、手）
- **可選**：何變宜先之境

## 法

### 第一步：識衝之源

定何操致衝：

```bash
# Check current status
git status

# Look for indicators:
# "You have unmerged paths" — merge conflict
# "rebase in progress" — rebase conflict
# "cherry-pick in progress" — cherry-pick conflict
```

狀之出告何文有衝、何操進中。

得：`git status` 示「Unmerged paths」之文與進中之操。

敗則：若 `git status` 示淨樹而期衝，操或已畢或已棄。察 `git log` 之近活。

### 第二步：讀衝之標

開各衝文而定衝之標：

```
<<<<<<< HEAD
// Your current branch's version
const result = calculateWeightedMean(data, weights);
=======
// Incoming branch's version
const result = computeWeightedAverage(data, weights);
>>>>>>> feature/rename-functions
```

- `<<<<<<< HEAD` 至 `=======`：當枝（或正變基至之枝）
- `=======` 至 `>>>>>>>`：來變（合之枝或施之提交）

得：各衝文含一或數塊附 `<<<<<<<`、`=======`、`>>>>>>>` 之標。

敗則：若無標而文示為衝，衝或為二進制文或刪對改之衝。察 `git diff --name-only --diff-filter=U` 為全列。

### 第三步：擇解策

**手合**（最常）：編文以邏輯合二變，後除諸衝標。

**受 ours**（留當枝之版）：

```bash
# For a single file
git checkout --ours path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --ours .
git add -A
```

**受 theirs**（留來枝之版）：

```bash
# For a single file
git checkout --theirs path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --theirs .
git add -A
```

得：解後文含正合之內，無餘衝標。

敗則：若擇誤側，再讀自合基之衝版。合間，`git checkout -m path/to/file` 重立衝標以再試。

### 第四步：標文為已解

各衝文編後：

```bash
# Stage the resolved file
git add path/to/resolved-file.R

# Check remaining conflicts
git status
```

「Unmerged paths」之諸文皆然。

得：諸文自「Unmerged paths」移至「Changes to be committed」。無文留衝標。

敗則：若 `git add` 敗或標留，再開文而確諸 `<<<<<<<`、`=======`、`>>>>>>>` 行皆除。

### 第五步：續其操

諸衝既解：

**為合**：

```bash
git commit
# Git auto-populates the merge commit message
```

**為變基**：

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

得：操畢。`git status` 示淨工作樹（或變基時移至次提交）。

敗則：若續命敗，察 `git status` 之未解文。諸衝必解後方可續。

### 第六步：若需，棄之

若解過繁或擇誤徑，安棄之：

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort

# Abort cherry-pick
git cherry-pick --abort
```

得：庫返操始前之態。無數失。

敗則：若棄敗（罕），察 `git reflog` 尋操前提交而以 `git reset --hard <commit>` 復之。慎用——其棄未提之變。

### 第七步：驗解

操畢後：

```bash
# Verify clean working tree
git status

# Check that the merge/rebase result is correct
git log --oneline -5
git diff HEAD~1

# Run tests to confirm nothing is broken
# (language-specific: devtools::test(), npm test, cargo test, etc.)
```

得：淨工作樹、正合史、試過。

敗則：若解後試敗，合或致邏輯誤雖法衝已解。詳審差而修。

## 驗

- [ ] 無衝標（`<<<<<<<`、`=======`、`>>>>>>>`）留於任何文
- [ ] `git status` 示淨工作樹
- [ ] `git log` 中合/變基之史正
- [ ] 解衝後試過
- [ ] 無誤之變引

## 陷

- **盲受一側**：`--ours` 或 `--theirs` 全棄他側。獨於確一版全正時用之
- **碼中留衝標**：編後必尋全文之餘標。部分解破其碼
- **變基中 amend**：互動變基時，勿 `--amend` 除非變基步明請。代以 `git rebase --continue`
- **棄時失勞**：`git rebase --abort` 與 `git merge --abort` 棄諸解之勞。獨於欲重始時棄之
- **解後不試**：法淨之合仍可邏輯誤。必行試
- **變基後強推**：共枝變基後，強推前協於同工，蓋其重寫史

## 參

- `commit-changes` — 解衝後之提交
- `manage-git-branches` — 致衝之枝流
- `configure-git-repository` — 庫之設與合策
