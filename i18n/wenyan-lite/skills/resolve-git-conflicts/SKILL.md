---
name: resolve-git-conflicts
locale: wenyan-lite
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

# 解 Git 衝突

識、解並自合併與 rebase 衝突中復原。

## 適用時機

- `git merge` 或 `git rebase` 報衝突
- `git cherry-pick` 無法乾淨應用
- `git pull` 致衝突變更
- `git stash pop` 與當前工作樹衝突

## 輸入

- **必要**：含活動衝突之倉庫
- **選擇性**：偏好之解策（ours、theirs、手動）
- **選擇性**：何變更應優先之上下文

## 步驟

### 步驟一：識衝突源

定何操作致衝突：

```bash
# Check current status
git status

# Look for indicators:
# "You have unmerged paths" — merge conflict
# "rebase in progress" — rebase conflict
# "cherry-pick in progress" — cherry-pick conflict
```

狀態輸出告知何文件有衝突且何操作進行中。

**預期：** `git status` 顯示「Unmerged paths」之下之文件並指明活動操作。

**失敗時：** 若 `git status` 顯潔淨樹但本期望衝突，操作恐已完成或中止。檢 `git log` 之近期活動。

### 步驟二：讀衝突標記

開每衝突文件並定衝突標記：

```
<<<<<<< HEAD
// Your current branch's version
const result = calculateWeightedMean(data, weights);
=======
// Incoming branch's version
const result = computeWeightedAverage(data, weights);
>>>>>>> feature/rename-functions
```

- `<<<<<<< HEAD` 至 `=======`：當前分支（或正 rebase 至之分支）
- `=======` 至 `>>>>>>>`：來入變更（正合併之分支或正應用之提交）

**預期：** 每衝突文件含一個或多個含 `<<<<<<<`、`=======`、`>>>>>>>` 標記之塊。

**失敗時：** 若無標記但文件顯為衝突，衝突恐為二進位文件或刪vs改之衝突。檢 `git diff --name-only --diff-filter=U` 以見完整清單。

### 步驟三：擇解策

**手動合併**（最常）：編文件以邏輯合併兩變，繼移所有衝突標記。

**接受 ours**（保當前分支版本）：

```bash
# For a single file
git checkout --ours path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --ours .
git add -A
```

**接受 theirs**（保來入分支版本）：

```bash
# For a single file
git checkout --theirs path/to/file.R
git add path/to/file.R

# For all conflicts
git checkout --theirs .
git add -A
```

**預期：** 解後文件含正確合併內容，無餘衝突標記。

**失敗時：** 若擇錯側，自合併基重讀衝突版。合併中 `git checkout -m path/to/file` 重建衝突標記以再試。

### 步驟四：標文件為已解

編每衝突文件後：

```bash
# Stage the resolved file
git add path/to/resolved-file.R

# Check remaining conflicts
git status
```

對「Unmerged paths」之每文件重複之。

**預期：** 所有文件自「Unmerged paths」移至「Changes to be committed」。任何文件中無餘衝突標記。

**失敗時：** 若 `git add` 失敗或標記留存，重開文件並確 `<<<<<<<`、`=======`、`>>>>>>>` 行皆移除。

### 步驟五：續操作

所有衝突已解後：

**合併**：

```bash
git commit
# Git auto-populates the merge commit message
```

**rebase**：

```bash
git rebase --continue
# May encounter more conflicts on subsequent commits — repeat steps 2-4
```

**cherry-pick**：

```bash
git cherry-pick --continue
```

**stash pop**：

```bash
# Stash pop conflicts don't need a continue — just commit or reset
git add .
git commit -m "Apply stashed changes with conflict resolution"
```

**預期：** 操作完成。`git status` 顯潔淨工作樹（或 rebase 中移至下一提交）。

**失敗時：** 若續命令失敗，檢 `git status` 之餘未解文件。所有衝突須解後方續。

### 步驟六：需則中止

若解過繁或擇錯法，安全中止：

```bash
# Abort merge
git merge --abort

# Abort rebase
git rebase --abort

# Abort cherry-pick
git cherry-pick --abort
```

**預期：** 倉庫返至操作前態。無資料喪失。

**失敗時：** 若中止失敗（罕），檢 `git reflog` 以尋操作前之提交並 `git reset --hard <commit>` 復之。慎用——此棄未提交之變更。

### 步驟七：驗解

操作完成後：

```bash
# Verify clean working tree
git status

# Check that the merge/rebase result is correct
git log --oneline -5
git diff HEAD~1

# Run tests to confirm nothing is broken
# (language-specific: devtools::test(), npm test, cargo test, etc.)
```

**預期：** 潔淨工作樹、正確之合併歷史、測試通過。

**失敗時：** 若解後測試失敗，合併雖語法衝突已解，仍恐引邏輯錯。詳檢 diff 並修。

## 驗證

- [ ] 任何文件中無餘衝突標記（`<<<<<<<`、`=======`、`>>>>>>>`）
- [ ] `git status` 顯潔淨工作樹
- [ ] `git log` 中合併／rebase 歷史正確
- [ ] 衝突解後測試通過
- [ ] 無意外變更被引

## 常見陷阱

- **盲接一側**：`--ours` 或 `--theirs` 全棄他側。唯確一版完正時方用
- **代碼留衝突標記**：編後務搜整個文件之餘標記。部分解破壞代碼
- **rebase 中 amend**：互動式 rebase 中，除非 rebase 步具體要求，勿 `--amend`。改用 `git rebase --continue`
- **中止失工作**：`git rebase --abort` 與 `git merge --abort` 棄所有解工作。唯欲重始時方中止
- **解後不測**：語法潔淨之合併仍恐邏輯誤。務跑測試
- **rebase 後強推**：rebase 共享分支後，強推前與協作者協調，因其改寫歷史

## 相關技能

- `commit-changes` — 衝突解後之提交
- `manage-git-branches` — 致衝突之分支工作流
- `configure-git-repository` — 倉庫設置與合併策略
