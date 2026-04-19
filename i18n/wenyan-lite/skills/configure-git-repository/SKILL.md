---
name: configure-git-repository
locale: wenyan-lite
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Configure a Git repository with proper .gitignore, branch strategy,
  commit conventions, hooks, and remote setup. Covers initial setup
  and common patterns for R, Node.js, and Python projects. Use when
  initializing version control for a new project, adding a .gitignore
  for a specific language or framework, setting up branch protection and
  conventions, or configuring commit hooks.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: git
  complexity: basic
  language: multi
  tags: git, version-control, gitignore, hooks, branching
---

# 配置 Git 倉庫

依項目類型以合適配置設 Git 倉庫。

## 適用時機

- 新項目之版本控制之始
- 為特定語言/框架加 `.gitignore`
- 設分支保護與慣例
- 配提交鉤子

## 輸入

- **必要**：項目目錄
- **必要**：項目類型（R 包、Node.js、Python、通用）
- **選擇性**：遠端倉庫 URL
- **選擇性**：分支策（基於主幹、Git Flow）
- **選擇性**：提交訊息慣例

## 步驟

### 步驟一：初始化倉庫

```bash
cd /path/to/project
git init
git branch -M main
```

**預期：** `.git/` 目錄已建。預設分支名為 `main`。

**失敗時：** 若 `git init` 敗，確 Git 已裝（`git --version`）。若目錄已有 `.git/`，倉庫已初始化——略此步。

### 步驟二：建 .gitignore

**R 包**：

```gitignore
# R artifacts
.Rhistory
.RData
.Rproj.user/
*.Rproj

# Environment (sensitive)
.Renviron

# renv library (machine-specific)
renv/library/
renv/staging/
renv/cache/

# Build artifacts
*.tar.gz
src/*.o
src/*.so
src/*.dll

# Documentation build
docs/
inst/doc/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

**Node.js/TypeScript**：

```gitignore
node_modules/
dist/
build/
.next/
.env
.env.local
.env.*.local
*.log
npm-debug.log*
.DS_Store
Thumbs.db
.vscode/
.idea/
coverage/
```

**Python**：

```gitignore
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.eggs/
.venv/
venv/
.env
*.log
.mypy_cache/
.pytest_cache/
htmlcov/
.coverage
.DS_Store
.idea/
.vscode/
```

**預期：** `.gitignore` 已建，含項目類型合適之條目。敏感檔（`.Renviron`、`.env`）與生成產物已排除。

**失敗時：** 若不確該含何條目，用 `gitignore.io` 或 GitHub 之 `.gitignore` 模板為起點並依項目調。

### 步驟三：建首次提交

```bash
git add .gitignore
git add .  # Review what's being added first with git status
git commit -m "Initial project setup"
```

**預期：** 首次提交已建，含 `.gitignore` 與初始項目檔。`git log` 顯一提交。

**失敗時：** 若 `git commit` 敗報「nothing to commit」，確檔已以 `git add` 暫存。若敗報作者身分錯，設 `git config user.name` 與 `git config user.email`。

### 步驟四：連遠端

```bash
# Add remote
git remote add origin git@github.com:username/repo.git

# Push
git push -u origin main
```

**預期：** 遠端 `origin` 已配。`git remote -v` 顯 fetch 與 push URL。首提交已推至遠端。

**失敗時：** 若推敗報「Permission denied (publickey)」，配 SSH 金鑰（見 `setup-wsl-dev-environment`）。若遠端已存，以 `git remote set-url origin <url>` 更。

### 步驟五：設分支慣例

**基於主幹（小團隊推薦）**：

- `main`：生產可用代碼
- 功能分支：`feature/description`
- 錯誤修復：`fix/description`

```bash
# Create feature branch
git checkout -b feature/add-authentication

# After work is done, merge or create PR
git checkout main
git merge feature/add-authentication
```

**預期：** 分支命名慣例已立且已記。團隊成員知每類工作之前綴。

**失敗時：** 若分支已以不一致之名，以 `git branch -m old-name new-name` 重命並更任何未結之 PR。

### 步驟六：配提交慣例

Conventional Commits 格式：

```
type(scope): description

feat: add user authentication
fix: correct calculation in weighted_mean
docs: update README installation section
test: add edge case tests for parser
refactor: extract helper function
chore: update dependencies
```

**預期：** 提交訊息慣例已記且團隊已同意。未來提交循 `type: description` 格式。

**失敗時：** 若團隊成員未循慣例，以驗格式之 commit-msg 鉤子強行（見步驟七）。

### 步驟七：設預提交鉤子（選擇性）

建 `.githooks/pre-commit`：

```bash
#!/bin/bash
# Run linter before commit

# For R packages
if [ -f "DESCRIPTION" ]; then
  Rscript -e "lintr::lint_package()" || exit 1
fi

# For Node.js
if [ -f "package.json" ]; then
  npm run lint || exit 1
fi
```

```bash
chmod +x .githooks/pre-commit
git config core.hooksPath .githooks
```

**預期：** 預提交鉤子於每 `git commit` 自動行。Lint 錯阻提交直至修。

**失敗時：** 若鉤子不行，驗 `core.hooksPath` 已設（`git config core.hooksPath`）且鉤子檔可執行（`chmod +x`）。

### 步驟八：建 README

```bash
# Minimal README
echo "# Project Name" > README.md
echo "" >> README.md
echo "Brief description of the project." >> README.md
git add README.md
git commit -m "Add README"
```

**預期：** `README.md` 已提至倉庫。項目於 GitHub 上有簡約而有資之落地頁。

**失敗時：** 若 `README.md` 已存，更之勿覆。R 項目用 `usethis::use_readme_md()` 取含徽章之模板。

## 驗證

- [ ] `.gitignore` 排敏感與生成檔
- [ ] 追蹤檔中無敏感數據（令牌、密碼）
- [ ] 遠端倉庫已連且可達
- [ ] 分支命名慣例已記
- [ ] 首次提交已淨建

## 常見陷阱

- **先提交後 `.gitignore`**：先加 `.gitignore`。已追之檔不受後加條目影響
- **史中之敏感數據**：若密碼已提，刪後仍於史。以 `git filter-repo` 或 BFG 清
- **大二進制檔**：勿提大二進制。>1MB 之檔用 Git LFS
- **行尾**：Windows/WSL 設 `core.autocrlf=input` 以防 CRLF/LF 問題

## 相關技能

- `commit-changes` - 暫存與提交之工作流
- `manage-git-branches` - 分支建與慣例
- `create-r-package` - R 包建時之 Git 設
- `setup-wsl-dev-environment` - Git 裝與 SSH 金鑰
- `create-github-release` - 自倉庫建發行版
- `security-audit-codebase` - 查已提之秘密
