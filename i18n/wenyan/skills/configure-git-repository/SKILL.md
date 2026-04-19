---
name: configure-git-repository
locale: wenyan
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

# 設 Git 庫

設 Git 庫附合項類之設。

## 用時

- 新項目之版控初
- 為特語/框加 `.gitignore`
- 設枝護與規
- 設提鉤

## 入

- **必**：項目之目
- **必**：項類（R 包、Node.js、Python、通）
- **可選**：遠庫之 URL
- **可選**：枝之策（主幹、Git Flow）
- **可選**：提訊之規

## 法

### 第一步：初庫

```bash
cd /path/to/project
git init
git branch -M main
```

**得：** `.git/` 目已建。默枝名 `main`。

**敗則：** 若 `git init` 敗，確 Git 已裝（`git --version`）。若目已有 `.git/`，庫已初——略此步。

### 第二步：建 .gitignore

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

**得：** `.gitignore` 檔建附合項類之條。敏檔（`.Renviron`、`.env`）與生品皆排。

**敗則：** 若不確含何條，用 `gitignore.io` 或 GitHub 之 `.gitignore` 範為始而自改。

### 第三步：建初提

```bash
git add .gitignore
git add .  # Review what's being added first with git status
git commit -m "Initial project setup"
```

**得：** 初提已建含 `.gitignore` 與初項檔。`git log` 示一提。

**敗則：** 若 `git commit` 敗以「nothing to commit」，確檔已以 `git add` 階。若以作者識誤敗，設 `git config user.name` 與 `git config user.email`。

### 第四步：連遠

```bash
# Add remote
git remote add origin git@github.com:username/repo.git

# Push
git push -u origin main
```

**得：** 遠 `origin` 已設。`git remote -v` 示取與推 URL。初提已推於遠。

**敗則：** 若推敗以「Permission denied (publickey)」，設 SSH 符（見 `setup-wsl-dev-environment`）。若遠已存，以 `git remote set-url origin <url>` 更之。

### 第五步：設枝規

**主幹（小團宜）**：

- `main`：可產之碼
- 功枝：`feature/description`
- 修枝：`fix/description`

```bash
# Create feature branch
git checkout -b feature/add-authentication

# After work is done, merge or create PR
git checkout main
git merge feature/add-authentication
```

**得：** 枝名之規已立且書。團員知各類作用何前綴。

**敗則：** 若枝已不一名，以 `git branch -m old-name new-name` 易名而更開之 PR。

### 第六步：設提規

Conventional Commits 式：

```
type(scope): description

feat: add user authentication
fix: correct calculation in weighted_mean
docs: update README installation section
test: add edge case tests for parser
refactor: extract helper function
chore: update dependencies
```

**得：** 提訊之規已書且團同。後提循 `type: description` 式。

**敗則：** 若團員不循，以提訊鉤執之（見第七步）。

### 第七步：設預提鉤（選）

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

**得：** 預提鉤於每 `git commit` 自行。查誤阻提至修。

**敗則：** 若鉤不行，驗 `core.hooksPath` 已設（`git config core.hooksPath`）且鉤檔可行（`chmod +x`）。

### 第八步：建 README

```bash
# Minimal README
echo "# Project Name" > README.md
echo "" >> README.md
echo "Brief description of the project." >> README.md
git add README.md
git commit -m "Add README"
```

**得：** `README.md` 已提於庫。項目於 GitHub 有簡而有資之落頁。

**敗則：** 若 `README.md` 已存，更之勿覆。R 項目用 `usethis::use_readme_md()` 生附徽之範。

## 驗

- [ ] `.gitignore` 排敏與生檔
- [ ] 無敏資（符、密）於追檔
- [ ] 遠庫已連且可訪
- [ ] 枝名規已書
- [ ] 初提清建

## 陷

- **`.gitignore` 前之提**：先加 `.gitignore`。已追之檔不受後條影。
- **史中之敏**：若秘已提，雖刪仍於史。用 `git filter-repo` 或 BFG 清。
- **大二進檔**：勿提大二。逾 1MB 用 Git LFS。
- **行末**：Windows/WSL 設 `core.autocrlf=input` 免 CRLF/LF 問。

## 參

- `commit-changes` - 階與提之流
- `manage-git-branches` - 枝建與規
- `create-r-package` - Git 設為 R 包建之一部
- `setup-wsl-dev-environment` - Git 裝與 SSH 符
- `create-github-release` - 自庫建發
- `security-audit-codebase` - 察已提之秘
